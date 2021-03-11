'use strict';

const { sequelize } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_responses',{
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      text: Sequelize.DataTypes.STRING,
      price: Sequelize.DataTypes.DECIMAL(10,2)
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("test_responses")
  }
};
