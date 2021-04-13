'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Games', [{
      userId: 1,
      startAt: "2021-05-13",
      minutes: 60,
      layoutTemplateId: 0,
    },{
      userId: 1,
      startAt: "2021-06-13",
      minutes: 90,
      layoutTemplateId: 0,
    }],
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Games', null, {});
  }
};
