/*jshint camelcase: false */
'use strict';

const Sequelize = require('sequelize');

const playerType = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  plural_name: {
    type: Sequelize.STRING(25),
    unique: true,
    allowNull: false,
  },
  plural_name_short: {
    type: Sequelize.STRING(3),
    unique: true,
    allowNull: false,
  },
  singular_name: {
    type: Sequelize.STRING(25),
    unique: true,
    allowNull: false,
  },
  singular_name_short: {
    type: Sequelize.STRING(3),
    unique: true,
    allowNull: false,
  }
};

module.exports = playerType;
