'use strict';

// third party
require('dotenv').config();
const Sequelize = require('sequelize');

const {DB_PORT, DB_USER, DB_PWD} = process.env;

const sequelize = new Sequelize('subootio',
  DB_USER, DB_PWD,
  {
    host: 'localhost',
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 500,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
