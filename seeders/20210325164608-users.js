'use strict';
const passwordHash  = require('crypto');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: "admin@info.nl",
      password: passwordHash.createHash("sha256").update("123456").digest("hex"),
      isAdmin: true
    },{
      email: "test@info.nl",
      password: passwordHash.createHash("sha256").update("123456").digest("hex"),
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
