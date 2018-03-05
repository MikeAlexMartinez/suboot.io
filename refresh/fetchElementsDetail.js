'use strict';

// This file will retrieve player stats items.

// fetch all player ids from players table

// fetch fixture detail

// fetch stat_items

// iterate through each player
  // fetch player summary from https://fantasy.premierleague.com/drf/element-summary/${id}
  // use history property to determine player stats
  // process each week in player stats

  // for each entry in player.history add
  /**
   *  To determine fixture:
   *  Use gameweek id (round), opponent_team and was_home to find fixture.
   * - determine fixture_id & verify matches expectations
   *    (links with fixture id)
   * - home_team_id (from fixture)
   * - away_team_id (from fixtue info)
   * - player_team_id (if was_home then home_team_id else away_team_id)
   * - was_home -> from data
   * - player_id -> id
   * 
   * for each stat_item key,
   * - use data above,
   * - construct id with fixture_id, player_id and stat_item_id
   * - save.
   */

// Core Node Modules
const path = require('path');

// Third Party modules
const async = require('async');

// Models and DB
const db = require('../db/connect');
const {PlayerFixtureStats,
       Fixtures,
       StatsItems,
       Players} = require('../db/Models');
const playerFixtureStats = require('../db/models/PlayerFixtureStats');

// helpers
const {manageModelUpdate} = require('./helpers/modelUpdates');
const {printLogs} = require('./helpers/logs');
const {batchInsert} = require('./helpers/insert');

// API
const fetchFromAPI = require('./fetchFromAPI');
const elementUri = 'https://fantasy.premierleague.com/drf/element-summary/';

// Globals
const args = process.argv;

// if file called specifically run from within
if (path.parse(args[1]).name === 'fetchElementsDetail' ) {
  let target = args[2] || null;

  fetchElementsDetail(target)
    .then(() => {
      console.log('exitings...');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
// else functionality is exported to be used in the
// application scheduler
module.exports = {
  fetchElementsDetail: fetchElementsDetail,
};

/*
  ######################################
  #                                    #
  #     fetchEvents main sequence      #
  #                                    #
  ######################################
*/

/**
 * @param {number} target
 * @param {number} end
 * @return {promise}
 */
function fetchElementsDetail(target) {
  return new Promise((res, rej) => {
    // fetch all players or specific player if target provided
    console.log('run');
    fetchPlayers(target)
      .then((data) => {
        // fetch fixtures
        return fetchFixtures(data);
      })
      .then((data) => {
        return fetchStatsItems(data);
      })
      .then((data) => {
        console.log(data);

        res();
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * @param {number} player
 * @return {promise}
 */
function fetchPlayers(player) {
  console.log('fetchPlayers');
  return new Promise((res, rej) => {
    console.log('Fetching Players');
    let options = {
      attributes: ['id'],
    };

    if (player) {
      options.where = {id: player};
    }

    Players.findAll(options)
      .then((data) => {
        console.log(`${data.length} Player(s) Retrieved`);
        const players = data.map((dataItem) => {
          return dataItem.dataValues.id;
        });
        res({players: players});
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/**
 * @param {object} data
 * @return {promise}
 */
function fetchFixtures(data) {
  console.log('fetchFixtures');
  return new Promise((res, rej) => {
    Fixtures.findAll()
      .then((retrievedfixtures) => {
        console.log(`${retrievedfixtures.length} Fixture(s) Retrieved`);
        const fixtures = retrievedfixtures.map((dataItem) => {
          return dataItem.dataValues;
        });
        res({...data, fixtures});
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/**
 * @param {object} data
 * @return {promise}
 */
function fetchStatsItems(data) {
  console.log('fetchFixtures');
  return new Promise((res, rej) => {
    StatsItems.findAll()
      .then((retrievedStatsItems) => {
        console.log(`${retrievedStatsItems.length} StatsItem(s) Retrieved`);
        const statsItems = retrievedStatsItems.map((dataItem) => {
          return dataItem.dataValues;
        });

        let statItemsHash = objectify(statsItems, 'stat_item_name', ['id']);
        res({...data, statsItems: statItemsHash});
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/**
 * @param {array} a
 * @param {string} key
 * @param {array} values
 * @return {object}
 */
function objectify(a, key, values) {
  let retObj = {};
  // loop over a
  for (let i = 0; i < a.length; i++) {
    let obj = a[i];

    // if only one value key provided return object
    // of scalar values
    if (values.length === 1) {
      retObj[obj[key]] = obj[values[0]];

    // else return obj of objs.
    } else {
      let innerObj = {};
      for ( let j = 0; j < values.length; j++) {
        innerObj[values[j]] = obj[values[j]];
      }

      retObj[key] = innerObj;
    }
  }
  return retObj;
}
