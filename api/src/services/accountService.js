import allAccounts from '../../data/accounts.json';

const accounts = {};

for (let i = 0; i < allAccounts.length; i++) {
  let account = allAccounts[i];
  accounts[account.accountNumber] = account;
}

export function getAccounts() {
  return allAccounts;
}

export function getAccount(accountNumber) {
  return accounts[accountNumber];
}
