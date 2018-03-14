import fs from 'fs';
import path from 'path';
import toml from 'toml';
import axios from 'axios';
import superagent from 'superagent';
import moment from 'moment';
import invariant from 'invariant';
import { blue, green, red } from 'chalk';
import { apply, asyncify, series } from 'async';
import { roles } from '../src/models/user';
import config from '../config';

const status = message => process.stdout.write(blue(message));
const success = message => console.log(green(message));
const fail = message => console.log(red(message));
const fatal = (message, err) => {
  console.error(red('FATAL:'), message);

  if (err) {
    console.error(err);
  }

  process.exit(1);
};
const usersList = {};

// User -> User
export const createUser = async user => {
  const response = await axios.post(`${process.env.API_URL}/users`, user);

  return response.data;
};

// User -> User
export const registerUser = async user => {
  invariant(
    !!user.invitationCode,
    'Invitation code must be present when registering user.'
  );

  const response = await axios.post(
    `${process.env.API_URL}/auth/invite/${user.invitationCode}`,
    user
  );

  return response.data;
};

// User -> User
export const createAndRegisterUser = async user => {
  user = Object.assign({}, user, await createUser(user));
  return registerUser(user);
};

// User -> User
const importUser = async user => {
  try {
    status(`Creating user ${user.username}... `);
    user = await createAndRegisterUser(user);
    success('OK');
    return user;
  } catch (err) {
    fail('FAILED');
    fatal(err.message, err);
  }
};

export async function action(path) {
  try {
    const schema = toml.parse(fs.readFileSync(path));
    const { users } = schema;

    for (const id of Object.keys(users || {})) {
      let user = users[id];
      user = Object.assign({}, user, await importUser(user));
      usersList[user.username] = user.user;
    }

  } catch (err) {
    fatal(err.message, err);
  }
}

// Import files in order of occurence.
series(
  process.argv.slice(2).map(filepath => asyncify(apply(action, filepath)))
);
