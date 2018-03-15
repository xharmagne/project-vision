import { Contract as ContractInterface } from 'node-ethers';
import { getContracts } from './contracts';
import { getLogs, blockNumber as getBlockNumber } from './ethersjs';
import { score } from './aiService';

let deployedContracts;

let state = {
  blockNumber: 0,
  transactions: [],
};

export async function getTransactions() {
  await getLatestEvents();
  return state.transactions;
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

    let scoredTransactions = [];

    var amountFormat = new Intl.NumberFormat('en-AU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    for (let i = 0; i < latestTransactions.length; i++) {
      let {
        id,
        from,
        to,
        amount,
        currency,
        description,
        date,
      } = latestTransactions[i].args;
      let tx = {
        id,
        from,
        to,
        amount: `${amountFormat.format(amount.toNumber() / 100)}`,
        currency,
        description,
        date: new Date(date.toNumber()).toJSON(),
      };
      tx.score = score(tx);
      scoredTransactions.push(tx);
      if (tx.score) {
        console.log('SUSPICIOUS TRANSACTION!!!');
        console.log(tx);
        console.log('-------------------------');
      }
    }

    state = {
      blockNumber: latestBlock,
      transactions: [...presentState.transactions, ...scoredTransactions],
    };
  }

  console.log(state.transactions.length);
}
