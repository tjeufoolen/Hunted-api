'use strict';

const { GameLocationTypes } = require('../enums/GameLocationTypes');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('GameLocations', [{
      locationId: 1,
      name: "Politie hoofdkantoor",
      type: GameLocationTypes.POLICE_STATION.value,
      gameId: 1,
    }, {
      locationId: 2,
      name: "Juweel",
      type: GameLocationTypes.TREASURE.value,
      gameId: 1,
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('GameLocations', null, {});
  }
};
