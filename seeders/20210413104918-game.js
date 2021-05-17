'use strict';

const moment = require('moment');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Games', [{
      userId: 1,
      startAt: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      minutes: 60,
      layoutTemplateId: 0,
      interval: 3
    }, {
      userId: 1,
      startAt: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      minutes: 90,
      layoutTemplateId: 0,
      interval: 2
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Games', null, {});
  }
};
