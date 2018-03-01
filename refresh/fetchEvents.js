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

// Core Node Modules
const path = require('path');

// Third Party modules
const async = require('async');

// Models and DB
const db = require('../db/connect');
const {Fixtures,
       ScoringPoints,
       ScoringStats,
       StatsItems,
       PointsItems} = require('../db/Models');
const scoringStatsDef = require('../db/models/ScoringStats');
const scoringPointsDef = require('../db/models/ScoringPoints');
const fixtureDef = require('../db/models/Fixtures');

// helpers
const {manageModelUpdate} = require('./helpers/modelUpdates');
const {printLogs} = require('./helpers/logs');
const {batchInsert} = require('./helpers/insert');
const {constructSimpleNumberArray} = require('./helpers/general');

// API
const fetchFromAPI = require('./fetchFromAPI');
const eventUri = 'https://fantasy.premierleague.com/drf/event/';

// Globals
const args = process.argv;

let scoringItems = {};
let statItems = {};
let generalLogs = [];
let data;

// if file called specifically run from within
if (path.parse(args[1]).name === 'fetchEvents' ) {
  let start = args[2] || 1;
  let end = args[3] || 38;

  fetchEvents(start, end)
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
// else functionality is exported to be used in the
// application scheduler
module.exports = {
  fetchEvents: fetchEvents,
};

/*
  ######################################
  #                                    #
  #     fetchEvents main sequence      #
  #                                    #
  ######################################
*/

/**
 * @param {number} start
 * @param {number} end
 * @return {promise}
 */
function fetchEvents(start=1, end=38) {
  return new Promise((res, rej) => {
    // Get data for gameweeks
    fetchScoringAndStatItems()
      .then(() => {
        // Now we have scoring and stat item ids stored
        // in memory we can get on with the proper work.
        return fetchEventsData(start, end);
      })
      .then(({data: retrievedData, logs}) => {
        // add to block scope data variable
        data = retrievedData;

        // print logs returned from fetchEventsData
        printLogs(logs);

        // set up and insert data for fixtures
        return manageModelUpdate(
          db,
          'fixtures',
          fixtureDef,
          Fixtures,
          insertFixturesData,
          data
        );
      })
      .then((log) => {
        generalLogs.push(log);

        // set up and insert scoring points data
        return manageModelUpdate(
          db,
          'scoring_points',
          scoringPointsDef,
          ScoringPoints,
          insertScoringPointsData,
          data
        );
      })
      .then((log) => {
        generalLogs.push(log);

        // set up and insert scoring stats data
        return manageModelUpdate(
          db,
          'scoring_stats',
          scoringStatsDef,
          ScoringStats,
          insertScoringStatsData,
          data
        );
      })
      .then((log) => {
        generalLogs.push(log);
        // print summary of what has been processed
        return printLogs(generalLogs);
      })
      // finish
      .then(() => res())
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/*
  ######################################
  #                                    #
  #  Fetch stat and scoring item ids   #
  #                                    #
  ######################################
*/
/**
 * Retrieve scoring and stat items in order to add foreign key
 * into scoring_points and scoring_stats tables.
 * @return {promise}
 */
function fetchScoringAndStatItems() {
  return new Promise((res, rej) => {
    StatsItems.findAll({
        attributes: ['id', 'stat_item_name'],
        order: [['id', 'ASC']],
      })
      .then((statIs) => {
        statIs.forEach((sI) => {
          const dV = sI.dataValues;
          statItems[dV.stat_item_name] = dV.id;
        });

        return PointsItems.findAll({
          attributes: ['id', 'scoring_item_name'],
          order: [['id', 'ASC']],
        });
      })
      .then((scoringIs) => {
        scoringIs.forEach((sI) => {
          const dV = sI.dataValues;
          scoringItems[dV.scoring_item_name] = dV.id;
        });

        res();
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/*
  ######################################
  #                                    #
  #  Hit end point and transform data  #
  #                                    #
  ######################################
*/

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

    // Data needs to have keys with the same name as their
    // respective tables to allow for insertion into PG table
    let data = {
      scoring_stats: [],
      scoring_points: [],
      fixtures: [],
    };

    let logs = [];

    let errorCount = 0;

    // Limit queue to concurrency of 1 to ensure calls to API are
    // restricted to defined speed.
    const q = async.queue(function manageQ(week, cb) {
      const uri = `${eventUri + week}/live`;
      const delay = 500;

      setTimeout(() => {
        fetchFromAPI(uri)
          .then((d) => {
            let playerPoints = [];
            let playerStats = [];

            const {elements, fixtures} = d;

            // alter fixture data
            const cleanFixtures = fixtures.map((fixture) => {
              fixture.gameweek_id = week;
              delete fixture.stats;

              return fixture;
            });

            data.fixtures = data.fixtures.concat(cleanFixtures);

            if (Object.keys(elements).length > 0) {
              const cleanData = transformPlayerEventData(elements, week);
              playerPoints = cleanData.playerPoints;
              playerStats = cleanData.playerStats;

              data.scoring_points = data.scoring_points.concat(playerPoints);
              data.scoring_stats = data.scoring_stats.concat(playerStats);
            }

            cb(
              null,
              playerPoints.length,
              playerStats.length,
              fixtures.length,
              week
            );
          })
          .catch((err) => {
            console.error(err);
            errorCount++;

            cb(err);
          });
      }, delay);
    }, 1);

    q.drain = function queueFinished() {
      if (errorCount > 0) {
        console.log(`A total of ${errorCount} Errors were encountered.`);
      }

      let logMessages = [
        `=>  Retrieved ${data.scoring_points.length} player points items  <==`,
        `=>  Retrieved ${data.scoring_stats.length} player stats items  <==`,
        `=>  Retrieved ${data.fixtures.length} fixtures  <==`];

      let totalLog = {
        name: `TOTAL EXPECTED`,
        results: logMessages,
      };

      logs.push(totalLog);

      res({data, logs});
    };

    q.push(gameweeksArray,
      function finishWeek(err, playerPoints, playerStats, fixtures, week) {
        let logMessages = err
          ? ['=> ERROR ENCOUNTERED <=']
          : [`=>  Retrieved ${playerPoints} player points items  <==`,
            `=>  Retrieved ${playerStats} player stats items  <==`,
            `=>  Retrieved ${fixtures} fixtures  <==`];

        let log = {
          name: `Gameweek-${week}`,
          results: logMessages,
        };

        logs.push(log);
    });
  });
}

/**
 * This function tidies the data returned in the elements section
 * from the API
 * @param {object} players
 * @param {number} week
 * @return {array.array}
 */
function transformPlayerEventData(players, week) {
  const rD = {
    playerPoints: [],
    playerStats: [],
  };

  const playerKeys = Object.keys(players);

  playerKeys.forEach((key) => {
    const playerId = key;
    const explain = players[key].explain[0];

    if (explain) {
      let fixtureId = explain[1];

      // process actual points scoring info for each player
      const points = explain[0];
      const pointsKeys = Object.keys(points);

      // need to create compound id from combo of
      // player, fixure and item ids
      if (pointsKeys.length > 0) {
        pointsKeys.forEach((pKey) => {
          let pointsItemId = scoringItems[pKey] || pKey;
          let id = `${playerId}-${fixtureId}-`;

          if (!pointsItemId) {
            console.log(`scoring points key missing: ${pKey}`);
            id += pKey;
          } else {
            id += pointsItemId;
          }

          const sPI = {
            id: id,
            gameweek_id: week,
            player_id: playerId,
            fixture_id: fixtureId,
            point_item: pKey,
            point_item_id: pointsItemId,
            points: points[pKey].points,
            value: points[pKey].value,
          };

          rD.playerPoints.push(sPI);
        });
      }

      // process stats
      const stats = players[key].stats;
      const statsKeys = Object.keys(stats);

      // need to create compound id from combo of
      // player, fixure and item ids
      if (statsKeys.length > 0) {
        statsKeys.forEach((sKey) => {
          let statsItemId = statItems[sKey] || sKey;
          let id = `${playerId}-${fixtureId}-`;

          if (!statsItemId) {
            console.log(`stats item key missing: ${sKey}`);
            id += sKey;
          } else {
            id += statsItemId;
          }
          const scoringStatsItem = {
            id: id,
            gameweek_id: week,
            player_id: playerId,
            fixture_id: fixtureId,
            stat_item_id: statsItemId,
            stat_item: sKey,
            value: stats[sKey],
          };

          rD.playerStats.push(scoringStatsItem);
        });
      }
    }
  });

  return rD;
}

/*
  ######################################
  #                                    #
  #  Fixture model Specific functions  #
  #                                    #
  ######################################
*/

/**
 * Takes an array of player items, and initiates batchInsert process
 * with necessary transform.
 * @param {array} fixtures
 * @return {promise}
 */
function insertFixturesData(fixtures) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(fixtures, Fixtures, transformFixture)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * takes a fixture item and transforms it to conform with
 * Fixtures data Model
 * @param {object} fixture
 * @return {object}
 */
function transformFixture(fixture) {
  let newFixture = Object.assign({}, fixture);

  newFixture.deadline_time = new Date(fixture.deadline_time);
  newFixture.kickoff_time = new Date(fixture.kickoff_time);

  return newFixture;
}


/*
  ######################################
  #                                    #
  #  ScoringPoints Specific functions  #
  #                                    #
  ######################################
*/

/**
 * Takes an array of player items, and initiates batchInsert process
 * with necessary transform.
 * @param {array} scoringPoints
 * @return {promise}
 */
function insertScoringPointsData(scoringPoints) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(scoringPoints, ScoringPoints)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * takes a scoringPoint item and transforms it to conform with
 * ScoringPoints data Model
 * @param {object} tSP - scoringPoint item
 * @return {object}
 */
/* function transformScoringPoint(tSP) {
  // Not required
} */

/*
  ######################################
  #                                    #
  #  ScoringPoints Specific functions  #
  #                                    #
  ######################################
*/

/**
 * Takes an array of scoringStat items, and initiates batchInsert process
 * with necessary transform.
 * @param {array} scoringStats
 * @return {promise}
 */
function insertScoringStatsData(scoringStats) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(scoringStats, ScoringStats, transformScoringStat)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * takes a scoringStat item and transforms it to conform with
 * ScoringStats data Model
 * @param {object} tSS - scoringStat item
 * @return {object}
 */
function transformScoringStat(tSS) {
  let newTss = Object.assign({}, tSS);

  // change in_dreamteam from boolean to integer
  if (newTss.stat_item = 'in_dreamteam') {
    newTss.value = tSS.value ? 1 : 0;
  }

  return newTss;
}
