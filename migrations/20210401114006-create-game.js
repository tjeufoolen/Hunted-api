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
      },
      startAt: {
        type: Sequelize.DATE,
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
    },
    {
      updatedAt: false
    });

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Games');
  }
};