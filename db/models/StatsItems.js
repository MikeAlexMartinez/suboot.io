'use strict';

const Sequelize = require('sequelize');

const statItem = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stat_item_name: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  stat_item_is_general: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  stat_item_type: {
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

module.exports = statItem;
