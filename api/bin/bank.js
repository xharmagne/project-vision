import {
  Wallet,
  providers,
  Contract as ContractInterface,
  utils,
  Interface,
} from 'node-ethers';
import { argv } from 'yargs';
import config from '../config';
import { reportTransaction } from '../src/services/bankService';
import { waitForReceipt } from '../src/services/ethersjs';

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

async function main() {
  let wallet;
  if (argv.bank === 'a') {
    wallet = bankA;
  } else if (argv.bank === 'b') {
    wallet = bankB;
  }

  while (true) {
    const result = await reportTransaction(wallet, {
      from: '0123456789',
      to: '9876543210',
      amount: 1000,
      currency: 'AUD',
      description: 'Something dodgy',
    });

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
