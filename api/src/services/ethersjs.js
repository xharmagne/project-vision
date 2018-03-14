import {
  Wallet,
  providers,
  Contract as ContractInterface,
  utils,
  Interface,
} from 'node-ethers';
import { omit, find } from 'lodash';
import config from '../../config';
import { addHexPrefix } from './codec';
import { decrypt } from '../utils/crypto';
import models from '../models';
import { generateKeys } from './keys';
import { readCompiledContracts } from './contracts';

const { Key } = models;

const compiledContracts = readCompiledContracts();

export const provider = new providers.JsonRpcProvider(config.gethUrl, {
  chainId: 8995,
});

const WAIT_TIME = 30000;

export const transactionOptions = { gasLimit: config.gas };

export async function getWalletForAddress(address) {
  const key = await Key.findOne({
    where: {
      address: address,
    },
  });

  if (!key) {
    throw new Error(`Cannot find the key for address ${address}`);
  }

  const privateKey = addHexPrefix(decrypt(key.priv_enc));
  return new Wallet(privateKey, provider);
}

export async function sendRawTransaction(fromAddress, transaction) {
  const wallet = await getWalletForAddress(fromAddress);
  const constructedTransaction = Object.assign(
    {},
    transaction,
    transactionOptions
  );
  return await wallet.sendTransaction(constructedTransaction);
}

/** Wait for a receipt for a transaction of given hash. */
export async function waitForReceipt(hash) {
  const transaction = await provider.waitForTransaction(hash, WAIT_TIME);
  if (transaction) {
    const receipt = await provider.getTransactionReceipt(hash);

    if (receipt) {
      if (
        receipt.logs.length == 0 &&
        receipt.gasUsed.toNumber() === transaction.gasLimit.toNumber()
      ) {
        throw new Error(
          `Exception occurred in contract. Maximum gas used. ${hash}`
        );
      } else {
        return receipt;
      }
    } else {
      throw new Error(`Cannot get receipt of Tx ${hash}`);
    }
  } else {
    throw new Error(
      `Giving up after ${WAIT_TIME /
        1000} seconds waiting for mining of Tx ${hash}`
    );
  }
}

export async function getNonce(address) {
  const wallet = await getWalletForAddress(address);
  return wallet.getTransactionCount();
}

export async function getLogs(contract, eventName, fromBlock, toBlock) {
  const contractInstance = new ContractInterface(
    contract.address,
    contract.interface,
    provider
  );
  const Event = contractInstance.interface.events[eventName]();

  const logs = await provider.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address: contract.address,
    topics: Event.topics,
  });
  return logs.map(log =>
    Object.assign({}, omit(log, ['data', 'topics']), {
      args: Event.parse(log.topics, log.data),
    })
  );
}

export async function blockNumber() {
  return await provider.getBlockNumber();
}

export async function getBlock(blockNumber) {
  return await provider.getBlock(blockNumber);
}

export async function getBalance(address) {
  const balance = await provider.getBalance(address);
  return Number(utils.formatEther(balance));
}

export async function addEther(toAccount, amount) {
  const wallet = await getWalletForAddress(config.gethAccount);
  const ethers = utils.parseEther(String(amount));
  const transaction = await wallet.send(toAccount, ethers);
  await waitForReceipt(transaction.hash);
}

export async function createAccount() {
  const newAccount = await generateKeys();
  await addEther(newAccount.address, config.etherTopup);
  return newAccount;
}

export function decodeLogs(transactionReceipt) {
  let decodedLogs = [];
  transactionReceipt.logs.forEach(log => {
    const functionAbi = findAbiForSignature(compiledContracts, log.topics[0]);
    if (functionAbi) {
      const decoded = decode(functionAbi, log);
      Object.keys(decoded.args).forEach(argKey => {
        decoded.args[argKey] = parseBigNumber(decoded.args[argKey]);
      });
      decodedLogs.push(decoded);
    }
  });
  return decodedLogs;
}

function findAbiForSignature(abi, signature) {
  var functionAbi = {};

  const contractKeys = Object.keys(abi.contracts);

  for (let i = 0; i < contractKeys.length; i++) {
    const contract = abi.contracts[contractKeys[i]];
    functionAbi = find(contract.interface, function(obj) {
      return obj.functionSig === signature;
    });
    if (functionAbi) {
      break;
    }
  }
  return functionAbi;
}

function decode(functionAbi, log) {
  const argTopics = log.anonymous ? log.topics : log.topics.slice(1);
  const indexedData = addHexPrefix(
    argTopics.map(topics => topics.slice(2)).join('')
  );
  const notIndexedData = log.data;

  const indexedDataAbi = Object.assign(
    {},
    functionAbi,
    getAbiBasedOnIndex(functionAbi, true)
  );
  const notIndexedDataAbi = Object.assign(
    {},
    functionAbi,
    getAbiBasedOnIndex(functionAbi, false)
  );

  const indexedDecodedLogs = decodeParameters(indexedDataAbi, indexedData);
  const notIndexedDecodedLogs = decodeParameters(
    notIndexedDataAbi,
    notIndexedData
  );

  const decodedLogs = indexedDecodedLogs.concat(notIndexedDecodedLogs);

  const args = {};
  decodedLogs.forEach(decodedLog => {
    args[decodedLog.name] = decodedLog.value;
  });

  return Object.assign({}, { args: args, event: functionAbi.name });
}

function getAbiBasedOnIndex(abi, index) {
  return { inputs: abi.inputs.filter(input => input.indexed === index) };
}

function decodeParameters(abi, input) {
  const paramsTypes = abi.inputs.map(obj => obj.type);
  const decodedParams = decodeParams(paramsTypes, input).map((param, index) => {
    param = parseBigNumber(param);
    return Object.assign({}, abi.inputs[index], { value: param });
  });
  return decodedParams;
}

function decodeParams(types, data) {
  return Interface.decodeParams(types, data);
}

function parseBigNumber(number) {
  if (utils.isBigNumber(number)) {
    return number.toNumber();
  } else if (Array.isArray(number)) {
    return number.map(x => {
      return utils.isBigNumber(x) ? x.toNumber() : x;
    });
  } else {
    return number;
  }
}
