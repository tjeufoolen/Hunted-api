'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('Players', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			gameId: {
				type: Sequelize.INTEGER,
				references:
				{
					model: "Games",
					key: 'id'
				},
				allowNull: false,
				primaryKey: true,
				onDelete: 'cascade'
			},
			code: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true
			},
			playerRole: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			outOfTheGame: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			locationId: {
				type: Sequelize.INTEGER,
				references:
				{
					model: "Locations",
					key: 'id'
				},
				allowNull: true,
				default: 0
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('now')
			}
		}, {
			updatedAt: false
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('Players');
	}
};