'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Player extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Player.hasOne(models.Location, {
				as: 'location',
				foreignKey: 'locationId'
			});
			Player.belongsTo(models.Game, {
				as: 'game'
			});
		}
	};
	Player.init({
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		gameId: {
			type: DataTypes.INTEGER,
			references:
			{
				model: "Games",
				key: 'id'
			},
			allowNull: false
		},
		code: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true
		},
		playerRole: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		outOfTheGame: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: false
		},
		locationId: {
			type: DataTypes.INTEGER,
			references:
			{
				model: "Locations",
				key: 'id'
			},
			allowNull: true,
			default: null
		},
		createdAt: {
			allowNull: false,
			type: DataTypes.DATE,
			default: Date.now()
		}
	}, {
		sequelize,
		updatedAt: false,
		modelName: 'Player',
	});
	return Player;
};