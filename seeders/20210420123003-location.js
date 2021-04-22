'use strict';

const moment = require('moment');

module.exports = {
    up: async (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('Locations', [{
        latitude: 51.888529,
        longtitude: 5.605207,
        updatedAt: moment.utc().format('YYYY-MM-DD HH:mm:ss')
      }, {
        latitude: 51.888321,
        longtitude: 5.605965,
        updatedAt: moment.utc().format('YYYY-MM-DD HH:mm:ss')
      }],
      )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Locations', null,{});
  }
};
