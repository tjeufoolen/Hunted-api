var sql = require("mysql")

var pool = module.exports = sql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    connectionLimit : process.env.CONNECTIONLIMIT
})

module.exports = pool;