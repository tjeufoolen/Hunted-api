'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GameLocation.belongsTo(models.LocationType,{
        as: 'LocationType'
      });
      GameLocation.hasOne(models.Location, {
        as: 'location',
        foreignKey: 'locationId'
      });
      GameLocation.belongsTo(models.Game, {
        as: 'gameLocation'
      });
    }
  };
  GameLocation.init({
    id:{
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    locationId: {
      type: DataTypes.INTEGER,
      references:
      {
        model: "Locations",
        key: 'id'
      }
    },
    name: {
      type:  DataTypes.STRING,
      require: true,
    },
    locationTypeId: {
      type:  DataTypes.INTEGER,
      references:
      {
        model: "LocationType",
        key: 'id'
      }
    },
    gameId:
    {
      type: DataTypes.INTEGER,
      references:
      {
        model: "Game",
        key: 'id'
      }
    },
    isPickedUp: {
      type: DataTypes.BOOLEAN,
      default: false,
    }
  }, {
    sequelize,
    updatedAt: false,
    createdAt: false,
    modelName: 'GameLocation',
  });
  return GameLocation;
};