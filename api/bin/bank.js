import * as faker from 'faker';
import {
  Wallet,
  providers,
  Contract as ContractInterface,
  utils,
  Interface,
} from 'node-ethers';
import { argv } from 'yargs';
import config from '../config';
import { getAccounts } from '../src/services/accountService';
import { reportTransaction } from '../src/services/bankService';
import { waitForReceipt } from '../src/services/ethersjs';
import { score } from '../src/services/aiService';

export const provider = new providers.JsonRpcProvider(config.gethUrl, {
  chainId: 8995,
});

const bankA = new Wallet(
  '0x31c974aba2c968b771756ddac0df236d605d4da369a43e03db91f8a95a8fe49b',
  provider
);

const bankB = new Wallet(
  '0xa0e83ea394dc50f675286fb7c4294231ae3d7ca23d8361f9ccc847e324194207',
  provider
);

export function sleep(t) {
  return new Promise((resolve, reject) => setTimeout(resolve, t));
}

const allAccounts = getAccounts();

const domesticAccounts = allAccounts.filter(
  a => a.country === 'AU' && a.type !== 'Organisation'
);
const internationalAccounts = allAccounts.filter(a => a.country !== 'AU');
const organisationAccounts = allAccounts.filter(a => a.type === 'Organisation');
const localAccounts = domesticAccounts.concat(organisationAccounts);

function generateRandomTx() {
  const fromAccount =
    localAccounts[Math.floor(Math.random() * localAccounts.length)];
  const toAccount = allAccounts[Math.floor(Math.random() * allAccounts.length)];
  return {
    id: faker.random.uuid(),
    date: new Date(),
    from: fromAccount.accountNumber,
    to: toAccount.accountNumber,
    amount: faker.random.number({ min: 100, max: 2000000 }),
    currency: 'AUD',
    description: faker.lorem.words(3, 2),
    score: fromAccount.score === 1 || toAccount.score === 1 ? 1 : 0,
  };
}

async function main() {
  let wallet;
  if (argv.bank === 'a') {
    wallet = bankA;
  } else if (argv.bank === 'b') {
    wallet = bankB;
  }

  while (true) {
    let tx = generateRandomTx();
    let result = await reportTransaction(wallet, tx);

    await waitForReceipt(result);

    await sleep(1000);
  }
}

main()
  .then(() => {
    console.log('\nExiting');
  })
  .catch(err => {
    console.error(err);
  });
