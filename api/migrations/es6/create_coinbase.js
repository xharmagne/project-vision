import models from '../../src/models';
import config from '../../config';

const { Key } = models;

module.exports = {
  up: async function(queryInterface, Sequelize) {
    return await Key.create({
      address: config.gethAccount,
      priv_enc: config.gethPrivate,
    });
  },

  down: function(queryInterface, Sequelize) {
    Key.destroy({
      where: {
        address: config.gethAccount,
      },
    });
  },
};
