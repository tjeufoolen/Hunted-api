'use strict';
const passwordHash  = require('password-hash');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: "admin@info.nl",
      password: passwordHash.generate("123456"),
      is_admin: true
    },{
      email: "test@info.nl",
      password: passwordHash.generate("123456"),
      is_admin: false
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
