'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TestResponses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };

  TestResponses.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2)
  }, {
    sequelize,
    timestamps: false,
    modelName: 'TestResponses',
    tableName: 'test_responses'
  });
  return TestResponses;
};