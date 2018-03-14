import { Contract as ContractInterface } from 'node-ethers';
import { getContracts } from './contracts';
import { getLogs, blockNumber as getBlockNumber } from './ethersjs';

let deployedContracts;

let state = {
  blockNumber: 0,
  transactions: [],
};

export async function getState() {
  await getLatestEvents();
  return state;
}

export async function getLatestEvents() {
  if (!deployedContracts) {
    deployedContracts = await getContracts();
  }

  const presentState = state;
  const fromBlock = presentState.blockNumber + 1;
  const latestBlock = parseInt(await getBlockNumber(), 10);

  if (fromBlock <= latestBlock) {
    const latestTransactions = await getLogs(
      deployedContracts.Transactions,
      'Transaction',
      fromBlock,
      latestBlock
    );
    state = {
      blockNumber: latestBlock,
      transactions: [...presentState.transactions, ...latestTransactions],
    };
  }

  console.log(state.transactions.length);
}
