'use strict';

const Sequelize = require('sequelize');

const UpdateHeaders = {
  id: {
    type: Sequelize.STRING(100),
    primaryKey: true,
  },
  time_of_update: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  model: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  key_updated: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  occurences: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
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

module.exports = UpdateHeaders;
