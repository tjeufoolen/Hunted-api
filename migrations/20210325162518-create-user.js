'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        require: true
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        require: true
      },
      isAdmin:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        require: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    }, {
      updatedAt: false
    }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};