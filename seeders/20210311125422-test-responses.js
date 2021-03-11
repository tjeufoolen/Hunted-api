'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('test_responses', [{
      text: "Hello, world!",
      price: 1.25
    },{
      text: "Kijk hoe mooi dit is",
      price: 10.50
    },{
      text: "Ik heb goed nieuws, u gaat dood",
      price: 0.69
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('test_responses', null, {});
  }
};
