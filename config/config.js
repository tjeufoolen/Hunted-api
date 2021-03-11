const fs = require('fs');

module.exports = {
  development: {
    username: 'developer',
    password: 'developer',
    database: 'hunted_api_db',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql'
  }
};