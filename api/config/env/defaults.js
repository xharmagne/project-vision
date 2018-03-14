module.exports = {
  port: 5000,

  database: {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres',

    username: 'postgres',
    password: 'postgres',
    database: 'postgres',
  },

  token: 'secret-jwt-token',
  gethUrl: 'http://localhost:8545/',
  gethAccount: '0x61a030e24f3105e4df1c322b4fd23b9ea2490165',
  gethPrivate:
    '611641b74089ec1b579e0cfb$c9b949d692d8646c7feb85b9e23a75273bdf9acd13de5edb631319a95fb8af873e0361ffe2939f68b295095c5ea2524f2328a0857729db1c71b0dccfa099dae5$82818fb008cac96f8c7f94e01b22c081',
  coinbaseSecret: 'P@ssw0rd!',
  gethSecret:
    '418fa1c23e15ba8f8566eaac48425794d8f06e9dfc08b4053b278483a92d141c',

  etherTopup: 20,
  redeployContracts: false,
  corsOriginRegex:
    '^http(s)?://(localhost|127.0.0.1|(.+.)?commbanklabs.com.au).*$',
  tokenDuration: 60 * 60 * 2 /* 2 hours */,
  gas: 243597000,
  eventsInterval: 500,
  usersPassword: 'C@nch@in!',
};
