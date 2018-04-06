'use strict';

// Core Node Modules
const path = require('path');

// Models and DB
const db = require('../db/connect');
const {Players,
       Teams,
       Gameweeks,
       UpdateHeaders,
       UpdateDetails} = require('../db/Models');
const playerDef = require('../db/models/Players');
const teamDef = require('../db/models/Teams');
const gameweekDef = require('../db/models/Gameweeks');
const updateHeaderDef = require('../db/models/UpdateHeaders');
const updateDetailDef = require('../db/models/UpdateDetails');

// helpers
const {manageModelUpdate,
       checkAndCreateTable} = require('./helpers/modelUpdates');
const {printLogs} = require('./helpers/logs');
const {batchInsert} = require('./helpers/insert');

// API
const fetchFromAPI = require('./fetchFromAPI');
const MAIN = 'https://fantasy.premierleague.com/drf/bootstrap-static';

// Globals
const args = process.argv;

// if file called specifically run from within
if (path.parse(args[1]).name === 'fetchMain' ) {
  fetchMain()
    .then(() => {
      console.log('exiting...');
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
  fetchMain: fetchMain,
};

/*
  ##########################
  # MAIN FILE PROCESS HERE #
  ##########################
*/

/**
 * @return {promise}
 */
function fetchMain() {
  return new Promise((res, rej) => {
    const TIMEOFUPDATE = new Date();
    console.log(`Update starting: ${TIMEOFUPDATE.toISOString()} `);
    getMainData()
      .then((data) => {
        // set up update tables
        return generateUpdateTables(data);
      })
      .then((data) => {
        // update the players table
        return manageModelUpdate(
          db,
          'players',
          playerDef,
          Players,
          insertPlayerData,
          data
        );
      })
      .then((data) => {
        // update the teams table
        return manageModelUpdate(
          db,
          'teams',
          teamDef,
          Teams,
          insertTeamData,
          data
        );
      })
      .then((data) => {
        // update the Gameweeks table
        return manageModelUpdate(
          db,
          'gameweeks',
          gameweekDef,
          Gameweeks,
          insertGameweekData,
          data
        );
      })
      .then((data) => {
        printLogs(data);
        res(data);
      })
      .catch((err) => {
        rej(err);
      });
  });
};

/*
  ######################################
  #                                    #
  #       Hit Main API End Point       #
  #                                    #
  ######################################
*/

/**
 * This function hits the main API point and stores data in module variable
 * @return {promise}
 */
function getMainData() {
  return new Promise((res, rej) => {
    fetchFromAPI({uri: MAIN})
      .then((d) => {
        // keep data for later
        const data = {
          players: d.elements,
          teams: d.teams,
          gameweeks: d.events,
          logs: [],
        };
        res(data);
      })
      .catch((err) => rej(err));
  });
}

/*
  ######################################
  #                                    #
  #  Update models Specific functions  #
  #                                    #
  ######################################
*/

/**
 * This function generates the update tables if they don't exist
 * @param {object} data
 * @return {promise}
 */
function generateUpdateTables(data) {
  return new Promise((res, rej) => {
    // create header table
    checkAndCreateTable(db, 'update_headers', updateHeaderDef, UpdateHeaders)
      .then(() => {
        return checkAndCreateTable(db,
          'update_details',
          updateDetailDef,
          UpdateDetails);
      })
      .then(() => {
        // link models
        UpdateHeaders.hasMany(UpdateDetails,
          {foreignKey: 'header_id', sourceKey: 'id'});
        UpdateDetails.belongsTo(UpdateHeaders,
          {foreignKey: 'header_id', targetKey: 'id'});

        res(data);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/*
  ######################################
  #                                    #
  #  Players model Specific functions  #
  #                                    #
  ######################################
*/

/**
 * Takes an array of player items, and initiates batchInsert process
 * with necessary transform.
 * @param {array} players
 * @return {promise}
 */
function insertPlayerData(players) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(players, Players, transformPlayer)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * takes a player item and transforms it to conform with
 * Players data Model
 * @param {object} player
 * @return {object}
 */
function transformPlayer(player) {
  let newPlayer = Object.assign({}, player);

  // Convert strings to floats
  const floats = [
    'creativity', 'ep_next', 'ep_this', 'form', 'ict_index',
    'influence', 'points_per_game', 'selected_by_percent',
    'threat', 'value_form', 'value_season'];

  floats.forEach((v) => {
    newPlayer[v] = parseFloat(player[v]);
  });

  // Convert date field
  newPlayer.news_added = new Date(player.news_added);

  return newPlayer;
}

/*
  ######################################
  #                                    #
  #   Teams model Specific functions   #
  #                                    #
  ######################################
*/

/**
 * Takes an array of player items, and initiates batchInsert process
 * with necessary transform.
 * @param {array} teams
 * @return {Promise}
 */
function insertTeamData(teams) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(teams, Teams, transformTeam)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * takes a player item and transforms it to conform with
 * Players data Model
 * @param {object} team
 * @return {object}
 */
function transformTeam(team) {
  let newTeam = Object.assign({}, team);

  newTeam.current_event_fixture = team.current_event_fixture.map((v) => v.id);
  newTeam.next_event_fixture = team.next_event_fixture.map((v) => v.id);

  return newTeam;
}

/*
  ########################################
  #                                      #
  #  Gameweeks model Specific functions  #
  #                                      #
  ########################################
*/

/**
 * Takes an array of Gameweek items, and initiates batchInsert process
 * with the necessary transform.
 * @param {array} gameweek
 * @return {promise}
 */
function insertGameweekData(gameweek) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(gameweek, Gameweeks, transformGameweek)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * takes a player item and transforms it to conform with
 * Players data Model
 * @param {object} gameweek
 * @return {object}
 */
function transformGameweek(gameweek) {
  let newGameweek = Object.assign({}, gameweek);

  // Convert date field
  newGameweek.deadline_time = new Date(newGameweek.deadline_time);

  return newGameweek;
}
