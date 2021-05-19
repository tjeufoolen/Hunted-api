'use strict';
const {
	Model
} = require('sequelize');

const moment = require('moment');

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
			});
			Game.hasMany(models.Player, {
				as: 'players',
				onDelete: 'cascade'
			});
			Game.hasMany(models.GameLocation, {
				as: 'gameLocations',
			});
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
			allowNull: false
		},
		startAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		isStarted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		minutes: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		endAt: {
			type: DataTypes.VIRTUAL,
			get() {
				return moment(this.get("startAt")).add(this.get("minutes"), "m")
			}
		},
		layoutTemplateId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			default: Date.now()
		},
		gameAreaLatitude: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		gameAreaLongitude: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		gameAreaRadius: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		interval: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
		}
	}, {
		sequelize,
		modelName: 'Game',
		updatedAt: false,
	});
	return Game;
};