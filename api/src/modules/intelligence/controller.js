import models from '../../models';
import * as faker from 'faker';

const allAccounts = [];
for (let i = 0; i < 100; i++) {
  allAccounts.push({
    accountNumber: faker.finance.account(),
    name: faker.name.findName(),
  });
}

const allTransactions = [];
for (let i = 0; i < 1000; i++) {
  allTransactions.push({
    from: allAccounts[Math.floor(Math.random() * allAccounts.length)].accountNumber,
    to: allAccounts[Math.floor(Math.random() * allAccounts.length)].accountNumber,
    amount: faker.finance.amount(),
    description: faker.lorem.words(3),
  });
}

export async function calculateScore(ctx) {
  ctx.status = 200;
  ctx.body = { confidence: Math.random() };
}

export async function getRelationships(ctx) {
  const transactions = allTransactions.slice(0, 10);
  const accounts = allAccounts.filter((a) => transactions.some((t) => t.from === a.accountNumber || t.to === a.accountNumber));
  console.log(transactions.length);
  ctx.status = 200;
  ctx.body = {
    transaction: {
      id: ctx.params.transactionId,
      description: 'Transfer to mum',
      date: '2018-03-02',
    },
    accounts: accounts,
    transactions: transactions,
  };
}
