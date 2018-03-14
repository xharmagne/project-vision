/** If present, remove '0x' from the start of a hex string. */
export const stripHexPrefix = x => (x.slice(0, 2) == '0x' ? x.slice(2) : x);

/** If not present, add '0x' from the start of a hex string. */
export const addHexPrefix = x => (x.slice(0, 2) == '0x' ? x : '0x' + x);

export function hexToBytes(addr) {
  return Uint8Array.from(
    addr.match(/../g).filter(x => x != '0x').map(x => parseInt(x, 16))
  );
}
