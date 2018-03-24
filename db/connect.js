'use strict';

// third party
require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize('subootio',
  process.env.DB_USER, process.env.DB_PWD,
  {
    host: 'localhost',
    port: process.env.DB_PORT,
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
