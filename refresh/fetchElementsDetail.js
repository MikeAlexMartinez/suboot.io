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

// Could add code to fetch a range of players.
// Or take an array to fetch a group of specified players.

// Core Node Modules
const path = require('path');

// Third Party modules
const async = require('async');
const _cliProgress = require('cli-progress');

// Models and DB
const db = require('../db/connect');
const {PlayerFixtureStats,
       Fixtures,
       StatsItems,
       Players} = require('../db/Models');
const playerFixtureStatsDef = require('../db/models/PlayerFixtureStats');

// helpers
const {manageModelUpdate} = require('./helpers/modelUpdates');
const {printLogs} = require('./helpers/logs');
const {batchInsert} = require('./helpers/insert');
const {objectify} = require('./helpers/general');

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
    fetchPlayers(target)
      .then((data) => {
        // fetch fixtures
        return fetchFixtures(data);
      })
      .then((data) => {
        return fetchStatsItems(data);
      })
      .then((data) => {
        return fetchElements(data);
      })
      .then((data) => {
        const playerDetails = Object.keys(data.detail);
        const errors = data.errors;

        console.log(`${playerDetails.length} player details retrieved`);

        if (errors.length === 0) {
          console.log(`No errors encoutered!`);
        } else {
          errors.forEach((id) => {
            console.log(`ERROR ENCOUNTERED: fetching detail for player ${id}`);
          });
        }

        return processPlayerDetail(data);
      })
      .then((data) => {
        let entries = data.player_fixture_stats;
        console.log(
          `${entries.length} Data Entries Created ` +
          `for PlayerFixtureStats table`
        );

        return manageModelUpdate(
          db,
          'player_fixture_stats',
          playerFixtureStatsDef,
          PlayerFixtureStats,
          insertPlayerFixtureStats,
          data
        );
      })
      .then((data) => {
        return printLogs(data);
      })
      .then(() => res())
      .catch((err) => {
        rej(err);
      });
  });
}

/*
  ###########################################
  #                                         #
  #  PlayerFixtureStats Specific functions  #
  #                                         #
  ###########################################
*/

/**
 * Takes an array of player items, and initiates batchInsert process
 * with necessary transform.
 * @param {array} data
 * @return {promise}
 */
function insertPlayerFixtureStats(data) {
  return new Promise((res, rej) => {
    // adds Model and transform function before processing as batch
    batchInsert(data, PlayerFixtureStats)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * @param {number} player
 * @return {promise}
 */
function fetchPlayers(player) {
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
        res({players: players, logs: []});
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
function processPlayerDetail(data) {
  return new Promise((res, rej) => {
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
     * for each stat_item key,
     * - use data above,
     * - construct id with fixture_id, player_id and stat_item_id
     * - save.
     */
    const statsItems = [
      'assists', 'attempted_passes', 'big_chances_created',
      'big_chances_missed', 'bonus', 'bps', 'clean_sheets',
      'clearances_blocks_interceptions', 'completed_passes', 'creativity',
      'dribbles', 'ea_index', 'errors_leading_to_goal',
      'errors_leading_to_goal_attempt', 'fouls', 'goals_conceded',
      'goals_scored', 'ict_index', 'influence', 'key_passes', 'minutes',
      'offside', 'open_play_crosses', 'own_goals', 'penalties_conceded',
      'penalties_missed', 'penalties_saved', 'recoveries', 'red_cards', 'saves',
      'selected', 'tackled', 'tackles', 'target_missed', 'team_a_score',
      'team_h_score', 'threat', 'total_points', 'transfers_balance',
      'transfers_in', 'transfers_out', 'value', 'winning_goals',
      'yellow_cards'];

    const detailEntries = [];
    const details = data.detail;
    const detailKeys = Object.keys(details);

    // get specific player details
    detailKeys.forEach((playerId) => {
      const playerDetails = details[playerId];
      // loop through details for specific player
      for ( let i = 0; i < playerDetails.length; i++) {
        const playerfixtureDetail = playerDetails[i];
        const wasHome = playerfixtureDetail.was_home;
        const opponent = playerfixtureDetail.opponent_team;
        const fixtureId = playerfixtureDetail.fixture;
        const fixture = data.fixtures[fixtureId];
        const homeTeamId = fixture.team_h;
        const awayTeamId = fixture.team_a;
        const playerTeamId = wasHome ? homeTeamId : awayTeamId;
        const baseEntry = {
          fixture_id: fixtureId,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          player_team_id: playerTeamId,
          was_home: wasHome,
          player_id: playerId,
        };

        let check;

        // check fixture with data expectation
        if (wasHome) {
          check = awayTeamId === opponent;
        } else {
          check = homeTeamId === opponent;
        }

        if (!check) {
          console.error(`fixture info doesn't match expecations: \n` +
            `  fixtureId: ${fixtureId}` +
            `  opponent: ${oppponent}` +
            `  wasHome: ${wasHome}` +
            `  homeTeamId: ${homeTeamId}` +
            `  awayTeamId: ${awayTeamId}` +
            `${playerFixtureDetail}`
          );
        } else {
          statsItems.forEach((statsItemName) => {
            // get id from hash
            const statItemId = data.statsItems[statsItemName];
            // create id for baseEntry
            const entryId = `${fixtureId}-${playerId}-${statItemId}`;
            // complete entry by extending baseEntry object.

            let newEntry = Object.assign({}, baseEntry, {
              id: entryId,
              stat_item_id: statItemId,
              stat_item_name: statsItemName,
              stat_item_value: parseFloat(playerfixtureDetail[statsItemName]),
            });
            // add to entries.
            detailEntries.push(newEntry);
          });
        }
      }
    });

    res({...data, 'player_fixture_stats': detailEntries});
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
        // create new object so I can mutate without damaging original
        const keysObj = Object.assign({}, fixtures[0]);
        delete keysObj.id;
        const keys = Object.keys(keysObj);
        const fixturesHash = objectify(fixtures, 'id', [...keys]);
        res({...data, fixtures: fixturesHash});
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
 * @param {object} data
 * @return {promise}
 */
function fetchElements(data) {
  return new Promise((res, rej) => {
    const playerDetail = {};
    const targets = data.players;

    // prepare progress bar options
    const progressOtions = {
      stopOnComplete: true,
      format: '[{bar}] {percentage}% | {value}/{total}',
    };

    const progressBar = new _cliProgress.Bar(
      progressOtions,
      _cliProgress.Presets.shades_classic
    );

    progressBar.start(targets.length, 0);

    let errors = [];
    let processed = [];

    const q = async.queue(function processQueue(playerId, cb) {
      // fetch from API
      const uri = elementUri + playerId;

      // add delay to API calls to prevent being blacklisted.
      setTimeout(() => {
        fetchFromAPI({uri, logging: false})
          .then((data) => {
            playerDetail[playerId] = data.history;

            cb(null, playerId);
          })
          .catch((err) => {
            console.error(err);
            cb(err, id);
          });
      }, 500);
    }, 1);

    q.drain = function queueFinished() {
      progressBar.stop();
      console.log(`Finished fetching element details`);
      res({...data, detail: playerDetail, errors: errors});
    };

    q.push(targets, function processDetail(err, id) {
      if (err) {
        console.log(`## Error processing ${id}!`);
        errors.push(id);
      } else {
        processed.push(id);
      }

      // add progress to the progress bar
      progressBar.update(progressBar.value + 1);
    });
  });
}
