import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '../../config';

const { database } = config;
const options = {
  host: database.host,
  port: database.port || 5432,
  dialect: database.dialect,
};

if (process.env.NODE_ENV !== 'development') {
  options.logging = function() {};
}

const sequelize = new Sequelize(
  database.database,
  database.username,
  database.password,
  options
);
const db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return file.indexOf('.') !== 0 && file !== 'index.js';
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
