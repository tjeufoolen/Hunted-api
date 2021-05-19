'use strict';

const moment = require('moment');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Locations', [{
      id: 1,
      latitude: 51.888529,
      longitude: 5.605207,
    }, {
      id: 2,
      latitude: 51.888321,
      longitude: 5.605965,
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Locations', null, {});
  }
};
