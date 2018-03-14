import uuid from 'node-uuid';
import { addHexPrefix, stripHexPrefix } from '../services/codec';
import { utils } from 'node-ethers';

export function generateHexUUID() {
  return addHexPrefix(uuid.v4(null, new Buffer(16)).toString('hex'));
}

export function parseHexUUID(input) {
  return addHexPrefix(new Buffer(uuid.parse(input)).toString('hex'));
}

export function unParseHexUUID(hexData) {
  return uuid.unparse(Buffer.from(stripHexPrefix(hexData), 'hex'));
}
