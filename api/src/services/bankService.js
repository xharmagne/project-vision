import { Contract as ContractInterface } from 'node-ethers';
import { getContracts } from './contracts';
import { transactionOptions } from './ethersjs';

let deployedContracts;

export async function reportTransaction(wallet, tx) {
  if (!deployedContracts) {
    deployedContracts = await getContracts();
  }

  const contract = new ContractInterface(
    deployedContracts.Transactions.address,
    deployedContracts.Transactions.interface,
    wallet
  );

  const transaction = await contract.report(
    tx.id,
    tx.from,
    tx.to,
    tx.amount,
    tx.currency,
    tx.description,
    transactionOptions
  );

  return transaction.hash;
}
