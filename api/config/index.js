const _ = require('lodash');
const config = require('./env/defaults');

const env = process.env.NODE_ENV || 'development';
const overrides = require(`./env/${env}`);

_.merge(config, overrides);

module.exports = config;
