/*jshint camelcase: false */
'use strict';

const Sequelize = require('sequelize');

const UpdateDetails = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  header_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  model: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  item_id: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  new_val: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  old_val: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  difference: {
    type: Sequelize.REAL,
    allowNull: true
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date()
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date()
  }
};

module.exports = UpdateDetails;
