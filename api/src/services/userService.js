import { Contract as ContractInterface } from 'node-ethers';
import config from '../../config';
import { getContracts } from './contracts';
import { getWalletForAddress, transactionOptions } from './ethersjs';

let deployedContracts;

getContracts()
  .then(c => {
    deployedContracts = c;
  })
  .catch(err => {
    console.error(err);
  });

export async function registerRole(userAddress, role) {
  const wallet = await getWalletForAddress(config.gethAccount);
  const contract = new ContractInterface(
    deployedContracts.Roles.address,
    deployedContracts.Roles.interface,
    wallet
  );
  const transaction = await contract.registerRole(
    userAddress,
    role,
    transactionOptions
  );
  return transaction.hash;
}
