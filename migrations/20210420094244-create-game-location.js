'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameLocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      locationId: {
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        require: true,
      },
      type: {
        type: Sequelize.INTEGER
      },
      gameId:
      {
        type: Sequelize.INTEGER
      },
      isPickedUp: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    },
      {
        updatedAt: false,
        createdAt: false
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameLocations');
  }
};