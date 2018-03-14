import { Wallet } from 'node-ethers';
import { encrypt } from '../utils/crypto';

var generateKeys = async function generateKeys() {
  try {
    var wallet = Wallet.createRandom();
    var keyObject = {
      address: wallet.address,
      priv_enc: encrypt(wallet.privateKey),
    };
    return keyObject;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports.generateKeys = generateKeys;
