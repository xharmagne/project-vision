import models from '../../models';
import allAccounts from '../../../data/accounts.json';
import allTransactions from '../../../data/transactions.json';

const MAX_RELATIONSHIP_DEPTH = 1;

export async function calculateScore(ctx) {
  ctx.status = 200;
  ctx.body = { confidence: Math.random() };
}

export async function getTransactions(ctx) {
  let transactions = allTransactions
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .reverse();

  transactions = transactions.slice(0, 100);

  if (ctx.query.mode === 'suspect') {
    transactions = transactions.filter(t => t.score === 1);
  }

  ctx.status = 200;
  ctx.body = transactions;
}

export async function getRelationships(ctx) {
  const transaction = allTransactions.filter(
    t => t.id === ctx.query.transaction
  )[0];

  if (!transaction) {
    ctx.status = 404;
    return;
  }

  const fromAccount = transaction.from;
  const toAccount = transaction.to;

  let transactions = [transaction];
  let accounts = allAccounts.filter(
    a => a.accountNumber === toAccount || a.accountNumber === fromAccount
  );
  const {
    accounts: toAccounts,
    transactions: toTransactions,
  } = getRelatedToAccountsAndTransactions(toAccount, 0);
  const {
    accounts: fromAccounts,
    transactions: fromTransactions,
  } = getRelatedFromAccountsAndTransactions(fromAccount, 0);

  accounts = accounts.concat(toAccounts).concat(fromAccounts);
  transactions = transactions.concat(toTransactions).concat(fromTransactions);

  ctx.status = 200;
  ctx.body = {
    transaction,
    accounts,
    transactions,
  };
}

function getSourceTransactions(accountNumber) {
  return allTransactions.filter(t => t.from === accountNumber);
}

function getTargetTransactions(accountNumber) {
  return allTransactions.filter(t => t.to === accountNumber);
}

function getRelatedToAccountsAndTransactions(accountNumber, depth) {
  let transactions = allTransactions.filter(t => t.from === accountNumber);
  console.log(
    `To account: ${accountNumber}, transactions ${transactions.length}`
  );
  let accounts = allAccounts
    .filter(a => a.accountNumber !== accountNumber)
    .filter(a => transactions.some(t => t.to === a.accountNumber));

  if (depth < MAX_RELATIONSHIP_DEPTH) {
    for (const account of accounts) {
      const children = getRelatedToAccountsAndTransactions(
        account.accountNumber,
        depth + 1
      );
      accounts = accounts.concat(children.accounts);
      transactions = transactions.concat(children.transactions);
    }
  }

  return {
    accounts,
    transactions,
  };
}

function getRelatedFromAccountsAndTransactions(accountNumber, depth) {
  let transactions = allTransactions.filter(t => t.to === accountNumber);
  let accounts = allAccounts
    .filter(a => a.accountNumber !== accountNumber)
    .filter(a => transactions.some(t => t.from === a.accountNumber));

  if (depth < MAX_RELATIONSHIP_DEPTH) {
    for (const account of accounts) {
      const children = getRelatedFromAccountsAndTransactions(
        account.accountNumber,
        depth + 1
      );
      accounts = accounts.concat(children.accounts);
      transactions = transactions.concat(children.transactions);
    }
  }

  return {
    accounts,
    transactions,
  };
}
