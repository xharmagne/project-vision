require('babel-core/register')();
require('babel-polyfill');

// Generic ES6 script to generate a table for given model and table name
module.exports = require('./es6/create_table_for')('Contract', 'contracts');
