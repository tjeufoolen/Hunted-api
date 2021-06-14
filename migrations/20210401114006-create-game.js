'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Games', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references:
        {
          model: "Users",
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
      },
      startAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isStarted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      minutes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      layoutTemplateId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      gameAreaLatitude: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      gameAreaLongitude: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      gameAreaRadius: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      distanceThiefPolice:
      {
        type: Sequelize.Double,
        allowNull: false,
      }
    },
      {
        updatedAt: false
      });

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Games');
  }
};