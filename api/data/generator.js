import * as faker from 'faker';
import * as fs from 'fs';

const domesticAccounts = [];
for (let i = 0; i < 10000; i++) {
  domesticAccounts.push({
    accountNumber: faker.finance.account(),
    name: faker.name.findName(),
    score: Math.random() < 0.95 ? 0 : 1,
    country: 'AU',
  });
}

const internationalAccounts = [];
for (let i = 0; i < 100; i++) {
  domesticAccounts.push({
    accountNumber: faker.finance.account(),
    name: faker.name.findName(),
    score: Math.random() < 0.95 ? 0 : 1,
    country: 'US',
  });
}

const organisationAccounts = [];
for (let i = 0; i < 100; i++) {
  organisationAccounts.push({
    accountNumber: faker.finance.account(),
    name: faker.name.findName(),
    score: i < 10 ? 0 : 1,
    type: 'Organisation',
    country: 'AU',
  });
}

const localAccounts = domesticAccounts.concat(organisationAccounts);
const allAccounts = domesticAccounts
  .concat(internationalAccounts)
  .concat(organisationAccounts);

const allTransactions = [];
for (let i = 0; i < 20000; i++) {
  const fromAccount =
    localAccounts[Math.floor(Math.random() * localAccounts.length)];
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
fs.writeFileSync(
  'transactions.json',
  JSON.stringify(allTransactions, null, '  ')
);
