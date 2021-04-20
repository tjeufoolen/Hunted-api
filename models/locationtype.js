'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LocationType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LocationType.hasMany(models.GameLocation,{
        as: 'locationType',
        onDelete: 'cascade'
      });
    }
  };
  LocationType.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name:{
      type: DataTypes.STRING,
      unique: true,
    } 
  }, {
    sequelize,
    updatedAt: false,
    createdAt: false,
    modelName: 'LocationType',
  });
  return LocationType;
};