'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('GameLocations', [{
      locationId: 1,
      name: "Hoofdkantoor",
      locationTypeId: 1,
      gameId: 1,
    }, {
      locationId: 2,
      name: "Juweel",
      locationTypeId: 2,
      gameId: 1,
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('GameLocations', null, {});
  }
};
