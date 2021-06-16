'use strict';

const moment = require('moment');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Games', [{
      userId: 1,
      startAt: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      minutes: 60,
      layoutTemplateId: 0,
      gameAreaLatitude: 51.888529,
      gameAreaLongitude: 5.6,
      gameAreaRadius: 1000,
      interval: 3,
      distanceThiefPolice: 50,
      winner: null
    }, {
      userId: 1,
      startAt: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      minutes: 90,
      layoutTemplateId: 0,
      gameAreaLatitude: 51.888529,
      gameAreaLongitude: 5.6,
      gameAreaRadius: 1000,
      interval: 2,
      distanceThiefPolice: 20,
      winner: null
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Games', null, {});
  }
};
