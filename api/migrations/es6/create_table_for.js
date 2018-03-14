import models from '../../src/models';

module.exports = function(modelName, tableName) {
  const model = models[modelName];

  return {
    up: function(queryInterface, DataTypes) {
      return queryInterface.createTable(tableName, model.__schema);
    },

    down: function(queryInterface, DataTypes) {
      return queryInterface.dropTable(tableName);
    },
  };
};
