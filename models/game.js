'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Game.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'userId'
      })
    }
  };
  Game.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references:
      {
        model: "Users",
        key: 'id'
      },
      allowNull: false,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    layoutTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      default: Date.now()
    }
  }, {
    sequelize,
    modelName: 'Game',
    updatedAt: false,
  });
  return Game;
};