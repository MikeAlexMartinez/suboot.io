'use strict';

const Sequelize = require('sequelize');

const LeagueTable = {
  // example of id = '380-17-11-DEF'
  // AS 'fixtureId-teamforid-pointitemid-position'
  id: {
    type: Sequelize.STRING(13),
    primaryKey: true,
    allowNull: false,
  },
  fixture_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  kickoff_time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  focus: {
    type: Sequelize.STRING(1),
    allowNull: false,
  },
  team_for_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_for: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  team_against_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_against: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  point_item_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  point_item: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  scoring_item_type: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  position: {
    type: Sequelize.STRING(3),
    allowNull: false,
  },
  points: {
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
