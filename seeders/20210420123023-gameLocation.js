'use strict';

const { LocationTypes } = require('../enums/LocationTypes');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('GameLocations', [{
      locationId: 1,
      name: "Politie hoofdkantoor",
      locationType: LocationTypes.POLICE_STATION.value,
      gameId: 1,
    }, {
      locationId: 2,
      name: "Juweel",
      locationType: LocationTypes.TREASURE.value,
      gameId: 1,
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('GameLocations', null, {});
  }
};
