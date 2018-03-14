import * as faker from 'faker';
import * as fs from 'fs';

const allAccounts = [];
for (let i = 0; i < 10000; i++) {
  allAccounts.push({
    accountNumber: faker.finance.account(),
    name: faker.name.findName(),
    score: Math.random() < 0.95 ? 0 : 1,
  });
}

const allTransactions = [];
for (let i = 0; i < 20000; i++) {
  const fromAccount = allAccounts[Math.floor(Math.random() * allAccounts.length)];
  const toAccount = allAccounts[Math.floor(Math.random() * allAccounts.length)];
  allTransactions.push({
    id: (200000 + i).toString(),
    from: fromAccount.accountNumber,
    to: toAccount.accountNumber,
    amount: faker.finance.amount(),
    description: faker.lorem.words(3, 2),
    score: fromAccount.score === 1 || toAccount.score === 1 ? 1 : 0,
  });
}

fs.writeFileSync('accounts.json', JSON.stringify(allAccounts, null, '  '));
fs.writeFileSync('transactions.json', JSON.stringify(allTransactions, null, '  '));
