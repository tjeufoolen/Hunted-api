'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('LocationTypes', [{
      name: 'Politiebureau'
    }, {
      name: 'Schat'
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('LocationTypes', null, {});
  }
};
