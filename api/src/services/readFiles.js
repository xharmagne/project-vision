import fs from 'fs';

export let sourceCode;

fs.readFile('build/contracts.concat.sol', 'utf8', (err, data) => {
  if (err) {
    throw new Error(err);
  }
  sourceCode = data;
});
