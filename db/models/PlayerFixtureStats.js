'use strict';

const Sequelize = require('sequelize');

const playerFixtureStats = {
  id: {
    type: Sequelize.STRING(50),
    primaryKey: true,
  },
  fixture_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  home_team_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  away_team_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  player_team_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  was_home: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  player_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  stat_item_id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  stat_item_name: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  stat_item_value: {
    type: Sequelize.INTEGER,
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

module.exports = playerFixtureStats;
