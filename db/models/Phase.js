/*jshint camelcase: false */
'use strict';

const Sequelize = require('sequelize');

const phase = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING(15),
    allowNull: false,
  },
  start_event: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  stop_event: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
};

module.exports = phase;
