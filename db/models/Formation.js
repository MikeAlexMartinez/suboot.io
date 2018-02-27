'use strict';

const Sequelize = require('sequelize');

const formations = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING(7),
    unique: true,
    allowNull: false,
  },
  formation: {
    type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.SMALLINT)),
    unique: true,
    allowNull: false,
  },
  valid: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
};

module.exports = formations;
