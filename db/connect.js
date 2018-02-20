'use strict';

const Sequelize = require('sequelize');

const sequelize = new Sequelize('subootio', 'postgres', 'fJidCNPA1A', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 500,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
