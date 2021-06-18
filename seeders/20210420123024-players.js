'use strict';

const InviteTokenController = require('../controllers/InviteTokenController');
const { PlayerRoles } = require('../enums/PlayerRoles');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Players', [
      {
        gameId: 1,
        code: await InviteTokenController.generate(1, 1),
        playerRole: PlayerRoles.POLICE.value,
        outOfTheGame: false,
        locationId: null
      },
      {
        gameId: 1,
        code: await InviteTokenController.generate(1, 2),
        playerRole: PlayerRoles.THIEF.value,
        outOfTheGame: false,
        locationId: null
      },
      {
        gameId: 1,
        code: await InviteTokenController.generate(1, 3),
        playerRole: PlayerRoles.THIEF.value,
        outOfTheGame: false,
        locationId: null
      },
      {
        gameId: 1,
        code: await InviteTokenController.generate(1, 4),
        playerRole: PlayerRoles.THIEF.value,
        outOfTheGame: false,
        locationId: null
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Players', null, {});
  }
};