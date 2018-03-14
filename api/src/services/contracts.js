import config from '../../config';
import models from '../../src/models';
import { fromPairs, map, mapKeys, mapValues } from 'lodash';
import cache from 'memory-cache';
import { addHexPrefix } from './codec';
import { utils as ethersJsUtils } from 'node-ethers';

const { Contract } = models;

var compiled;

export function readCompiledContracts() {
  if (compiled) {
    return compiled;
  }

  const newCompiled = require('../../build/contracts.compiled.json');
  for (let key in newCompiled.contracts) {
    const newKey = key.replace(':', '');
    newCompiled.contracts[newKey] = newCompiled.contracts[key];
    newCompiled.contracts[newKey].interface =
      typeof newCompiled.contracts[key].interface != 'object'
        ? JSON.parse(newCompiled.contracts[key].interface)
        : newCompiled.contracts[key].interface;
    if (newCompiled.contracts[newKey].interface.length) {
      const interfaceWithSignature = newCompiled.contracts[
        newKey
      ].interface.map(abi => {
        const functionParams = abi.inputs.map(obj => obj.type).join(',');
        var functionSig = ethersJsUtils.id(`${abi.name}(${functionParams})`);
        if (abi.type === 'function') {
          functionSig = functionSig.slice(0, 10);
        }
        abi.functionSig = functionSig;
        return abi;
      });
      newCompiled.contracts[newKey].interface = interfaceWithSignature;
    }
    delete newCompiled.contracts[key];
  }
  compiled = newCompiled;
  return compiled;
}

export function flush() {
  compiled = null;
  cache.clear();
}

export async function getContracts() {
  const CacheKey = 'contractsAddress';

  var contracts = cache.get(CacheKey);

  if (contracts) {
    console.log('Retrieved deployed contracts addresses from cache');
    return contracts;
  }

  const data = await Contract.findAll();

  const compiled = readCompiledContracts();

  let deployedContracts = {};

  if (!data.length) {
    console.warn('No deployed smart contracts were found!');
    return;
  }

  data.map(e => {
    deployedContracts[e.name] = {
      name: e.name,
      address: e.address,
      interface: compiled.contracts[e.name].interface,
    };
  });

  console.log('Retrieved deployed contracts successfully.');

  contracts = deployedContracts;

  cache.put(CacheKey, contracts, 5 * 60 * 1000);
  return contracts;
}
