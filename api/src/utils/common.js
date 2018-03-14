export function pack(bytes) {
  var chars = [];
  for (var i = 0, n = bytes.length; i < n; ) {
    chars.push((bytes[i++] & 0xff) << 8 | bytes[i++] & 0xff);
  }
  return String.fromCharCode.apply(null, chars);
}

export function unpack(str) {
  var bytes = [];
  Array.from(str).map((value, index) => {
    const char = str.charCodeAt(index);
    bytes.push(char >>> 8, char & 0xff);
  });
  return bytes;
}
