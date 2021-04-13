'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Location.belongsTo(models.Player,{
        as: 'player',
        foreignKey: 'locationId'
      })
    }
  };
  Location.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    latitude: {
      type: DataTypes.GEOMETRY
    },
    longtitude: {
      type: DataTypes.GEOMETRY
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      default: Date.now()
    }
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};