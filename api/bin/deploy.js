import { Contract as ContractInterface } from 'node-ethers';
import config from '../config';
import models from '../src/models';
import {
  readCompiledContracts,
  flush,
  getContracts,
} from '../src/services/contracts';
import { addHexPrefix } from '../src/services/codec';
import {
  sendRawTransaction,
  waitForReceipt,
  getWalletForAddress,
  transactionOptions,
} from '../src/services/ethersjs';

const { Contract, Key } = models;

async function deploy() {
  const args = Array.from(arguments);
  const name = args[0];
  const compiled = args[1];
  const rest = args.slice(2);

  console.log('Deploy: ' + name);

  const existing = await Contract.findOne({ where: { name: name } });
  if (existing && existing.address) {
    console.log(name + ': exists');
    return existing.address;
  } else {
    console.log(name + ": doesn't exist");

    const contractArgs = [
      addHexPrefix(compiled.bytecode),
      JSON.stringify(compiled.interface),
    ].concat(rest);

    const deployTransaction = ContractInterface.getDeployTransaction.apply(
      {},
      contractArgs
    );
    const transaction = await sendRawTransaction(
      config.gethAccount,
      deployTransaction
    );
    console.log(
      'Contract "' +
        name +
        '" transaction sent: TransactionHash: ' +
        transaction.hash +
        ' waiting to be mined...'
    );

    const transactionReceipt = await waitForReceipt(transaction.hash);
    const contractAddress = transactionReceipt.contractAddress;
    console.log(name + ' mined! Address: ' + contractAddress);

    try {
      const contractDoc = await Contract.create({
        name: name,
        address: contractAddress,
        blockNumber: transactionReceipt.blockNumber,
      });
      console.log('Saved contract');
      return contractAddress;
    } catch (e) {
      if (e.code === 11000) {
        const existing = await Contract.findOne({
          where: { name: name },
        });
        console.log(existing);
        return existing.address;
      } else {
        console.log(e);
        throw new Error(e);
      }
    }
  }
}
export async function deployContracts() {
  console.log(`Using Geth: ${config.gethUrl}`);

  const binaries = readCompiledContracts();

  console.log(`Redeploy contracts: ${config.redeployContracts}`);
  if (config.redeployContracts === true) {
    await Contract.truncate();
  }
  const RolesAddr = await deploy('Roles', binaries.contracts.Roles);

  console.log('------------------------------------');
  console.log('Roles Address: ' + RolesAddr);
  console.log('------------------------------------');


  const contracts = await getContracts();

  console.log('Existing');
  const existing = await Contract.findAll({ raw: true });
  console.log(existing);
  flush();
}

deployContracts()
  .then(() => {
    console.log('\nContracts deployed');
  })
  .catch(err => {
    console.error(err);
  });
