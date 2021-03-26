'use strict';
const passwordHash  = require('password-hash');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: "admin@info.nl",
      password: passwordHash.generate("123456"),
      isAdmin: true
    },{
      email: "test@info.nl",
      password: passwordHash.generate("123456"),
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
