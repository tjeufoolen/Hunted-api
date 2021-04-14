'use strict';

const BCrypt = require('bcryptjs');

async function hashPassword(password) {
	const salt = await BCrypt.genSalt(10);
	return await BCrypt.hash(password, salt);
}


module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert('Users', [{
			email: "admin@info.nl",
			password: await hashPassword("123456"),
			isAdmin: true
		}, {
			email: "test@info.nl",
			password: await hashPassword("123456"),
			isAdmin: false
		}],
			{
				individualHooks: true
			}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('Users', null, {});
	}
};
