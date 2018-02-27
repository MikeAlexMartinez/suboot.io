'use strict';

const Sequelize = require('sequelize');

const scoringSystem = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scoring_item: {
    type: Sequelize.STRING(35),
    allowNull: false,
  },
  display_name: {
    type: Sequelize.STRING(35),
    allowNull: false,
  },
  value: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  specific: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  position: {
    type: Sequelize.STRING(3),
    allowNull: false,
  },
};

module.exports = scoringSystem;
