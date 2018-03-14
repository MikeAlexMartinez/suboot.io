'use strict';

/**
 * With player stats all contained within the relevant tables,
 * and fixtures updated. We can calculate team tables and form.
 */

'use strict';

// node modules
const path = require('path');

// Third party apps
const async = require('async');

// db connection
const db = require('../db/connect');

// models
const {FactTeamPoints} = require('../db/Models');
const factTeamPointsDef = require('../db/models/FactTeamPoints');

// helpers
const {manageModelUpdate} = require('./helpers/modelUpdates');
const {printLogs} = require('./helpers/logs');
const {batchInsert} = require('./helpers/insert');
const {objectify,
       constructSimpleNumberArray} = require('./helpers/general');

// Globals
const args = process.argv;

// if file called specifically run from within
if (path.parse(args[1]).name === 'createTeamPointsTable' ) {
  updateTeamPointsFacts()
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
  updateTeamPointsFacts: updateTeamPointsFacts,
};

/**
 * @param {number} start
 * @param {number} end
 * @return {promise}
 */
function updateTeamPointsFacts() {
  return new Promise((res, rej) => {
    // query to see the number of passed gameweeks.
    // from 1 to n construct table and add to leaguetables table
    fetchData()
      .then((data) => {
        return manageModelUpdate(
          db,
          'fact_team_points',
          factTeamPointsDef,
          FactTeamPoints,
          insertFactTeamPointsData,
          data
        );
      })
      .then((data) => {
        return printLogs(data);
      })
      .then(() => {
        res();
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * @param {array} entries
 * @return {promise}
 */
function insertFactTeamPointsData(entries) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(entries, FactTeamPoints, transformEntry)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * @param {object} entry
 * @return {object}
 */
function transformEntry(entry) {
  const {fixture_id: fI,
         team_for_id: tFI,
         team_against_id: tAI,
         point_item_id: pII,
         points,
         position} = entry;
  const id = `${fI}-${tFI}-${pII}-${position}`;

  return {
    ...entry,
    id,
    fixture_id: parseInt(fI),
    team_for_id: parseInt(tFI),
    team_against_id: parseInt(tAI),
    point_item_id: parseInt(pII),
    points: parseInt(points),
  };
}

/**
 * @return {promise}
 */
function fetchData() {
  return new Promise((res, rej) => {
    db.query(tableQuery(), {
        type: db.QueryTypes.SELECT,
      })
      .then((results) => {
        res({fact_team_points: results});
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/**
 * @return {string}
 */
function tableQuery() {
  return `SELECT * 
    FROM (
      /* Home team points by fixture, points_item and by position */
      SELECT pts_tbl.fixture_id
        , f.kickoff_time
        , 'H' AS "focus"
        , pts_tbl.home_team_id AS "team_for_id"
        , home_teams.name AS "team_for"
        , pts_tbl.away_team_id AS "team_against_id"
        , away_teams.name AS "team_against"
        , pts_tbl.point_item_id
        , pts_tbl.point_item
        , pi.scoring_item_type
        , pts_tbl.singular_name_short AS "position"
        , SUM(pts_tbl.points) AS "points"
      FROM (
        SELECT ft.fixture_id
          , ft.player_id
          , ft.home_team_id
          , ft.away_team_id
          , ft.was_home
          , sp.point_item_id
          , sp.point_item
          , sp.points
          , sp.value
          , pt.singular_name_short
        FROM scoring_points sp
        INNER JOIN (
          SELECT DISTINCT pfs.fixture_id
            , pfs.home_team_id
            , pfs.away_team_id
            , pfs.was_home
            , pfs.player_id 
          FROM player_fixture_stats pfs
        ) AS ft
          ON ft.player_id = sp.player_id
          AND ft.fixture_id = sp.fixture_id
        INNER JOIN players p
          ON p.id = sp.player_id
        INNER JOIN player_types pt
          ON  p.element_type = pt.id
      ) AS pts_tbl
      INNER JOIN teams home_teams
        ON pts_tbl.home_team_id = home_teams.id
      INNER JOIN teams away_teams
        ON pts_tbl.away_team_id = away_teams.id
      INNER JOIN fixtures f
        ON f.id = pts_tbl.fixture_id
      INNER JOIN points_items pi
        ON pts_tbl.point_item_id = pi.id
      WHERE was_home = true
      GROUP BY pts_tbl.fixture_id
        , f.kickoff_time
        , pts_tbl.home_team_id
        , home_teams.name
        , pts_tbl.away_team_id
        , away_teams.name
        , pts_tbl.point_item_id
        , pts_tbl.point_item
        , pi.scoring_item_type
        , pts_tbl.singular_name_short
    
      UNION ALL
    
      /* Away team points by points_item and by position */
      SELECT pts_tbl.fixture_id
        , f.kickoff_time
        , 'A' AS "focus"
        , pts_tbl.away_team_id AS "team_for_id"
        , away_teams.name AS "team_for"
        , pts_tbl.home_team_id AS "team_against_id"
        , home_teams.name AS "team_against"
        , pts_tbl.point_item_id
        , pts_tbl.point_item
        , pi.scoring_item_type
        , pts_tbl.singular_name_short AS "position"
        , SUM(pts_tbl.points) AS "points"
      FROM (
        SELECT ft.fixture_id
          , ft.player_id
          , ft.home_team_id
          , ft.away_team_id
          , ft.was_home
          , sp.point_item_id
          , sp.point_item
          , sp.points
          , sp.value
          , pt.singular_name_short
        FROM scoring_points sp
        INNER JOIN (
          SELECT DISTINCT pfs.fixture_id
            , pfs.home_team_id
            , pfs.away_team_id
            , pfs.was_home
            , pfs.player_id 
          FROM player_fixture_stats pfs
        ) AS ft
          ON ft.player_id = sp.player_id
          AND ft.fixture_id = sp.fixture_id
        INNER JOIN players p
          ON p.id = sp.player_id
        INNER JOIN player_types pt
          ON  p.element_type = pt.id
      ) AS pts_tbl
      INNER JOIN teams home_teams
        ON pts_tbl.home_team_id = home_teams.id
      INNER JOIN teams away_teams
        ON pts_tbl.away_team_id = away_teams.id
      INNER JOIN fixtures f
        ON f.id = pts_tbl.fixture_id  
      INNER JOIN points_items pi
        ON pts_tbl.point_item_id = pi.id
      WHERE was_home = false
      GROUP BY pts_tbl.fixture_id
        , f.kickoff_time
        , pts_tbl.home_team_id
        , home_teams.name
        , pts_tbl.away_team_id
        , away_teams.name
        , pts_tbl.point_item_id
        , pts_tbl.point_item
        , pi.scoring_item_type
        , pts_tbl.singular_name_short
    ) team_fixture_points
    ORDER BY team_fixture_points.kickoff_time
      , team_fixture_points.fixture_id
      , team_fixture_points.focus DESC
      , team_fixture_points.point_item
      , team_fixture_points.position;`;
};
