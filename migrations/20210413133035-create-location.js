'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      latitude: {
        type: Sequelize.GEOMETRY
      },
      longtitude: {
        type: Sequelize.GEOMETRY
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        default: Date.now()
      }
    },
    {
      createdAt: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Locations');
  }
};