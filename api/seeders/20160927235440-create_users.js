const _ = require('lodash');
const profiles = require('./constants/user_profiles');
module.exports = {
  up: function(queryInterface, Sequelize) {
    // Create fully verified issuers and investors.
    return queryInterface.bulkInsert(
      'users',
      _.concat(
        profiles.BANK_PROFILES,
      ),
      {}
    );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
