'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LocationTypes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        required: true
      }
    },{
      updatedAt:false,
      createdAt:false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LocationTypes');
  }
};