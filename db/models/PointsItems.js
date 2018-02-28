'use strict';

const Sequelize = require('sequelize');

const pointsItem = {
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
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  },
};

module.exports = pointsItem;
