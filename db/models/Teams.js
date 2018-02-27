'use strict';

const Sequelize = require('sequelize');

const Team = {
  code: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  id: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  current_event_fixture: {
    type: Sequelize.ARRAY(Sequelize.SMALLINT),
    allowNull: true,
  },
  name: {
    type: Sequelize.STRING(35),
    allowNull: false,
  },
  next_event_fixture: {
    type: Sequelize.ARRAY(Sequelize.SMALLINT),
    allowNull: true,
  },
  short_name: {
    type: Sequelize.STRING(3),
    allowNull: false,
  },
  strength: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  strength_attack_away: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  strength_attack_home: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  strength_defence_away: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  strength_defence_home: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  strength_overall_away: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  strength_overall_home: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_division: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  unavailable: {
    type: Sequelize.BOOLEAN,
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
  position: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  played: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  win: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  loss: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  draw: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  points: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  form: {
    type: Sequelize.SMALLINT,
    allowNull: true,
  },
  link_url: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
};

module.exports = Team;
