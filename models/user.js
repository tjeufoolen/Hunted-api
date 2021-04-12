'use strict';

const { Model } = require('sequelize');
const BCrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		async isValidPassword(password) {
			return await BCrypt.compare(password, this.password);
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
		isAdmin: {
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
			users_api_return: {
				attributes: { exclude: ['password', 'createdAt'] }
			}
		},
		hooks: {
			beforeCreate: async (user, options) => {
				const salt = await BCrypt.genSalt(10);
				const hashPassword = await BCrypt.hash(user.password, salt);
				user.password = hashPassword;
			}
		}
	});
	return User;
};