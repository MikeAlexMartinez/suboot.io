/*jshint camelcase: false */
'use strict';

const Sequelize = require('sequelize');

const gameweek = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  average_entry_score: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  data_checked: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  deadline_time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  deadline_time_epoch: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  deadline_time_formatted: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  deadline_time_game_offset: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  finished: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  highest_score: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  highest_scoring_entry: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  is_current: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  is_next: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  is_previous: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING(12),
    allowNull: false,
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

module.exports = gameweek;