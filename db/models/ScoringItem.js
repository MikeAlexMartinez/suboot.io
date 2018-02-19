/*jshint camelcase: false */
'use strict';

const Sequelize = require('sequelize');

const scoringItem = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scoring_item_name: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  scoring_item_is_general: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  scoring_item_type: {
    type: Sequelize.STRING(6),
    allowNull: false,
  },
};

module.exports = scoringItem;