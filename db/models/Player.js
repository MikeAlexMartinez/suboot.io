/*jshint camelcase: false */
'use strict';

const Sequelize = require('sequelize');

const Player = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  assists: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  bonus: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  bps: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  chance_of_playing_this_round: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  chance_of_playing_next_round: {
    type: Sequelize.SMALLINT,
    defaultValue: 0,
  },
  clean_sheets: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  code: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  cost_change_event: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  cost_change_event_fall: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  cost_change_start: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  cost_change_start_fall: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  creativity: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  dreamteam_count: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  ea_index: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  element_type: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  ep_next: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  ep_this: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  event_points: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  first_name: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  form: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  goals_conceded: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  goals_scored: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  ict_index: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  in_dreamteam: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  influence: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  loaned_in: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  loaned_out: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  loans_in: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  loans_out: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  minutes: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  news: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  news_added: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  now_cost: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  own_goals: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  penalties_missed: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  photo: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  points_per_game: {
    type: Sequelize.REAL,
    defaultValue: 0.0,
  },
  red_cards: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  saves: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  second_name: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  selected_by_percent: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  special: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  squad_number: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING(1),
    allowNull: false,
  },
  team: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  team_code: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  threat: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  total_points: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  transfers_in: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  transfers_in_event: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  transfers_out: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  transfers_out_event: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  value_form: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  value_season: {
    type: Sequelize.REAL,
    allowNull: false,
  },
  web_name: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  yellow_cards: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date()
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date()
  }
};

module.exports = Player;
