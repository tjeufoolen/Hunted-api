'use strict';
const passwordHash  = require('password-hash');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     isValidPassword(password) {
      return passwordHash.verify(password, this.password);
    } 

    static associate(models) {
      // define association here
    }
  };
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isAdmin:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'User',
    updatedAt: false,
    scopes: {
      users: {
        attributes: { exclude: ['password','createdAt'] }
      }
    },
    hooks:{
      beforeCreate: (user, options) => {
        user.password = passwordHash.generate(user.password);
      }
    }
  });
  return User;
};