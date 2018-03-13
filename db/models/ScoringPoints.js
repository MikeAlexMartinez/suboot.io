'use strict';

const Sequelize = require('sequelize');

const scoringPointsItem = {
  id: {
    type: Sequelize.STRING(50),
    primaryKey: true,
  },
  gameweek_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  player_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  fixture_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  point_item_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  point_item: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  points: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  value: {
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

module.exports = scoringPointsItem;
