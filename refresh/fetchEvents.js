'use strict';

/**
 * This file will collect data from the events API.
 *
 * Two primary types of data are available from the events API.
 * - the detailed player statistics for each gameweek, and
 * - the fixtures for each gameweek (event)
 *
 * The event specifc data is in each gameweek so to refresh the data
 * I will need to hit the endpoint 38 times. in order to construct and maintain
 * an up to date fixture list.
 *
 * The majority of the datapoints will be fixed once the gameweek has passed.
 * but there are occasions when historical data points may change. Equally,
 * future fixtures may be rescheduled. Over the course of a gameweek, i.e.
 * once matches have kicked off, until the last one finishes. The datapoints
 * will be changing fairly frequently. To being with I will seek to only update
 * my data once matches have finished and player stats have settled down.
 *
 */

// Models and DB
const db = require('../db/connect');
const {Fixtures} = require('../db/Models');
const fixtureDef = require('../db/models/')

// helpers
const {manageModelUpdate,
  checkAndCreateTable} = require('./helpers/modelUpdates');
const {printLogs} = require('./helpers/logs');
const {batchInsert} = require('./helpers/insert');
const {constructSimpleNumberArray} = require('./helpers/general');
  
// API
const fetchFromAPI = require('./fetchFromAPI');
const eventUri = 'https://fantasy.premierleague.com/drf/event/';

// global

// data
let data = {
  fixtures: [],
  players: [],
};

const args = process.argv;

// if file called specifically run from within
if (path.parse(args[1]).name === 'fetchEvents' ) {
  fetchEventsData(1, 38);
}
// else functionality is exported to be used in the
// application scheduler


/**
 * fetches all the events data from the 'start' gameweek to the 'finish'
 * gameweek inclusive
 * @param {number} start
 * @param {number} finish
 * @return {promise.array}
 */
function fetchEventsData(start, finish) {
  return new Promise((res, rej) => {
    const gameweeksArray = constructSimpleNumberArray(start, finish);

    console.log(gameweeksArray);
    rej();
  });
}
