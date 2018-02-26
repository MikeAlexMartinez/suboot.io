'use strict';

const Sequelize = require('sequelize');

const Fixture = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  deadline_time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  deadline_time_formatted: {
    type: Sequelize.STRING(15),
    allowNull: false,
  },
  event: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  event_day: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  finished: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  finished_provisional: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  kickoff_time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  kickoff_time_provisional: {
    type: Sequelize.STRING(15),
    allowNull: false,
  },
  minutes: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  provisional_start_time: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  started: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  team_a: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_a_score: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_h: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_h_score: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  },
};

module.exports = Fixture;
