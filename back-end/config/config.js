require('dotenv').config();
module.exports = {
  "development": {
    "dialect": "sqlite",
    "storage": "./db.dev.sqlite",
    "logging": false
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "sqlite",
    "operatorsAliases": "0"
  },
  "production": {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: "mysql",
    operatorsAliases: "0"
  }
}
