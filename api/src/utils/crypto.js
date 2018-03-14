'use strict';

import crypto from 'crypto';
import config from '../../config';
import bcrypt from 'bcrypt';

const ALGORITHM = 'aes-256-gcm';
const KEY = new Buffer(config.gethSecret, 'hex'); //32 byte hex

export function encrypt(plain_text) {
  const IV = new Buffer(crypto.randomBytes(12)); // ensure that the IV (initialization vector) is random
  const encryptor = crypto.createCipheriv(ALGORITHM, KEY, IV);
  encryptor.setEncoding('hex');
  encryptor.write(plain_text);
  encryptor.end();
  const cipher_text = encryptor.read();
  const tag = encryptor.getAuthTag();
  return IV.toString('hex') + '$' + cipher_text + '$' + tag.toString('hex');
}

export function decrypt(cipher_text) {
  const cipher_blob = cipher_text.split('$');
  const IV = new Buffer(cipher_blob[0], 'hex');
  const ct = cipher_blob[1];
  const tag = new Buffer(cipher_blob[2], 'hex');
  const decryptor = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  decryptor.setAuthTag(tag);
  const decryptedText = decryptor.update(ct, 'hex', 'utf-8');
  return decryptedText + decryptor.final('utf-8');
}
