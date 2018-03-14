'use strict';

const Sequelize = require('sequelize');

const LeagueTable = {
  id: {
    type: Sequelize.STRING(7),
    primaryKey: true,
    allowNull: false,
  },
  team_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_name: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  focus: {
    type: Sequelize.STRING(1),
    allowNull: false,
  },
  played: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  won: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  drawn: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  lost: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  for: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  against: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  goal_difference: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  points: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  current_position: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  previous_position: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  gameweek_id: {
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

module.exports = LeagueTable;
