'use strict';

// node modules
const path = require('path');

// Third party apps
const async = require('async');

// db connection
const db = require('../db/connect');

// models
const {LeagueTables} = require('../db/Models');
const leagueTablesDef = require('../db/models/LeagueTables');

// helpers
const {manageModelUpdate} = require('./helpers/modelUpdates');
const {printLogs} = require('./helpers/logs');
const {batchInsert} = require('./helpers/insert');
const {objectify,
       constructSimpleNumberArray} = require('./helpers/general');

// Globals
const args = process.argv;

// if file called specifically run from within
if (path.parse(args[1]).name === 'createLeagueTable' ) {
  const start = 1;
  const end = args[2] || 38;

  updateLeagueTables(start, end)
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
  updateLeagueTables: updateLeagueTables,
};

/**
 * @param {number} start
 * @param {number} end
 * @return {promise}
 */
function updateLeagueTables(start=1, end) {
  return new Promise((res, rej) => {
    // query to see the number of passed gameweeks.
    // from 1 to n construct table and add to leaguetables table
    howManyGameweeks({start, end})
      .then((data) => {
        return constructTableData(data);
      })
      .then((data) => {
        return manageModelUpdate(
          db,
          'league_tables',
          leagueTablesDef,
          LeagueTables,
          insertLeagueTableData,
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
 * @param {array} leagueTables
 * @return {promise}
 */
function insertLeagueTableData(leagueTables) {
  return new Promise((res, rej) => {
    // adds Model and transfrom function before processing as batch
    batchInsert(leagueTables, LeagueTables, transformEntry)
      .then((result) => res(result))
      .catch((err) => rej(err));
  });
}

/**
 * @param {object} entry
 * @return {object}
 */
function transformEntry(entry) {
  const prevPos = typeof entry.previousPosition === 'number'
    ? parseInt(entry.previousPosition)
    : null;

  return {
    id: entry.id,
    team_id: entry.Team_id,
    team_name: entry.Team,
    focus: entry.Focus,
    played: parseInt(entry.PL),
    won: parseInt(entry.W),
    drawn: parseInt(entry.D),
    lost: parseInt(entry.L),
    for: parseInt(entry.F),
    against: parseInt(entry.A),
    goal_difference: parseInt(entry.GD),
    points: parseInt(entry.PTS),
    current_position: parseInt(entry.Current_Position),
    previous_position: prevPos,
    gameweek_id: entry.gameweek_id,
  };
}

/**
 * @param {object} param
 * @param {number} param.start
 * @param {number} param.end
 * @return {promise}
 */
function constructTableData({start, end}) {
  return new Promise((res, rej) => {
    let tableEntries = [];
    const gameweeks = constructSimpleNumberArray(start, end);

    const q = async.queue((gameweek, cb) => {
      // query database
      db.query(tableQuery(gameweek), {
          type: db.QueryTypes.SELECT,
        })
        .then((results) => {
          cb(null, results.map((v) => {
            return {...v, gameweek_id: gameweek, id: `${v.id}-${gameweek}`};
          }));
        })
        .catch((err) => {
          console.error(err);
          rej(err);
        });
    }, 10);

    q.drain = function queueFinished() {
      const tableEntriesObj = objectify(
        tableEntries, 'id', ['Current_Position']
      );

      const amendedTableEntries = tableEntries.map((entry) => {
        let previousPosition;

        if (entry.gameweek_id === 1) {
          previousPosition = null;
        } else {
          const lookup =
            `${entry.Team_id}-${entry.Focus}-${entry.gameweek_id - 1}`;
          previousPosition = tableEntriesObj[lookup];
        }

        return {
          ...entry,
          previousPosition,
        };
      });

      res({
        start,
        end,
        league_tables: amendedTableEntries,
      });
    };

    q.push(gameweeks, function processWeek(err, results) {
        if (err) {
          rej(err);
        } else {
          tableEntries = tableEntries.concat(results);
        }
    });
  });
}

/**
 * @param {object} param
 * @param {number} param.start
 * @param {number} param.end
 * @return {promise}
 */
function howManyGameweeks({start=1, end}) {
  return new Promise((res, rej) => {
    const maxGameweekQuery = `SELECT MAX(id)
       FROM gameweeks 
       WHERE finished = true;`;

    db.query(maxGameweekQuery, {
        type: db.QueryTypes.SELECT,
      })
      .then((results) => {
        let max = results[0].max;

        // if invalid value given to end use max
        if (!end || end > max || end < 1) {
          end = max;
        }

        res({start, end});
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/**
 * @param {number} gameweek
 * @return {string}
 */
function tableQuery(gameweek) {
  return `/* All League Tables */
  SELECT * FROM (
    /* Combined - Home and Away */
    (
      SELECT  *
        , row_number() over () AS "Current_Position"
      FROM (
        SELECT "Team_id"::text || '-T'::text AS "id"
          , "Team_id"
          , "Team"
          , 'T' AS "Focus"
          , SUM("PL") AS "PL"
          , SUM("W") AS "W"
          , SUM("D") AS "D"
          , SUM("L") AS "L"
          , SUM("F") AS "F"
          , SUM("A") AS "A"
          , SUM("GD") AS "GD"
          , SUM("PTS") AS "PTS"
        FROM (
          /* Away */
          SELECT t.id AS "Team_id"
            , t.name AS "Team"
            , 'A'
            , COUNT(DISTINCT f.id) AS "PL"
            , COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "W"
            , COUNT(CASE WHEN f.result = 'SD' THEN 1 
                  WHEN f.result = 'ND' THEN 1
                ELSE NULL END) AS "D"
            , COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "L"
            , SUM(f.team_a_score) AS "F"
            , SUM(f.team_h_score) AS "A"
            , SUM(f.team_a_score) - SUM(f.team_h_score) AS "GD"
            , SUM(f.team_a_points) AS "PTS"
          FROM teams t
          LEFT JOIN fixtures f
            ON f.team_a = t.id
          WHERE f.finished = true
            AND gameweek_id <= ${gameweek}
          GROUP BY t.id
            , t.name
  
          UNION ALL
  
          SELECT t.id
            , t.name
            , 'A' AS "Focus"
            , 0 AS "PL"
            , 0 AS "W"
            , 0 AS "D"
            , 0 AS "L"
            , 0 AS "F"
            , 0 AS "A"
            , 0 AS "GD"
            , 0 AS "PTS"
          FROM teams t
          WHERE t.id NOT IN (
            SELECT DISTINCT t.id
            FROM teams t
            INNER JOIN fixtures f
              ON f.team_a = t.id
            WHERE (f.finished = true
              AND gameweek_id <= ${gameweek})
          )
  
          UNION ALL
  
          /* Home */
          SELECT t.id AS "Team_id"
            , t.name AS "Team"
            , 'H'
            , COUNT(DISTINCT f.id) AS "PL"
            , COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "W"
            , COUNT(CASE WHEN f.result = 'SD' THEN 1 
                  WHEN f.result = 'ND' THEN 1
                ELSE NULL END) AS "D"
            , COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "L"
            , SUM(f.team_h_score) AS "F"
            , SUM(f.team_a_score) AS "A"
            , SUM(f.team_h_score) - SUM(f.team_a_score) AS "GD"
            , SUM(f.team_h_points) AS "PTS"
          FROM teams t
          LEFT JOIN fixtures f
            ON f.team_h = t.id
          WHERE f.finished = true
            AND gameweek_id <= ${gameweek}
          GROUP BY t.id
            , t.name
  
          UNION ALL
  
          SELECT t.id
            , t.name
            , 'H' AS "Focus"
            , 0 AS "PL"
            , 0 AS "W"
            , 0 AS "D"
            , 0 AS "L"
            , 0 AS "F"
            , 0 AS "A"
            , 0 AS "GD"
            , 0 AS "PTS"
          FROM teams t
          WHERE t.id NOT IN (
            SELECT DISTINCT t.id
            FROM teams t
            INNER JOIN fixtures f
              ON f.team_h = t.id
            WHERE (f.finished = true
              AND gameweek_id <= ${gameweek})
          )
        ) AS tbl
        GROUP BY "id"
          , "Team_id"
          , "Team"
        ORDER BY "PTS" DESC
          , "GD" DESC
          , "F" DESC
          , "Team" ASC
      ) AS total
    ) 
  
    UNION ALL
  
    /* Home Table */
    (
      SELECT *
        , row_number() over() AS  "Current_Position"
      FROM (
        SELECT * FROM (
          SELECT t.id::text || '-H'::text AS "id"
            , t.id AS "Team_id"
            , t.name AS "Team"
            , 'H' AS "Focus"
            , COUNT(DISTINCT f.id) AS "PL"
            , COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "W"
            , COUNT(CASE WHEN f.result = 'SD' THEN 1 
                  WHEN f.result = 'ND' THEN 1
                ELSE NULL END) AS "D"
            , COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "L"
            , SUM(f.team_a_score) AS "F"
            , SUM(f.team_h_score) AS "A"
            , SUM(f.team_a_score) - SUM(f.team_h_score) AS "GD"
            , SUM(f.team_a_points) AS "PTS"
          FROM teams t
          INNER JOIN fixtures f
            ON f.team_h = t.id
          WHERE f.finished = true
            AND gameweek_id <= ${gameweek}
          GROUP BY t.id
            , t.name
  
          UNION ALL
  
          SELECT t.id::text || '-H'::text AS "id"
            , t.id AS "Team_id"
            , t.name AS "Team"
            , 'H' AS "Focus"
            , 0 AS "PL"
            , 0 AS "W"
            , 0 AS "D"
            , 0 AS "L"
            , 0 AS "F"
            , 0 AS "A"
            , 0 AS "GD"
            , 0 AS "PTS"
          FROM teams t
          WHERE t.id NOT IN (
            SELECT DISTINCT t.id
            FROM teams t
            INNER JOIN fixtures f
              ON f.team_h = t.id
            WHERE (f.finished = true
              AND gameweek_id <= ${gameweek})
          )
        ) AS home_unordered
        ORDER BY "PTS" DESC
          , "GD" DESC
          , "F" DESC
          , "Team" ASC
      ) AS home_ordered
    )
  
    UNION ALL
  
    /* Away Table */
    (
      SELECT *
        , row_number() over() AS  "Current_Position"
      FROM (
        SELECT * FROM (
          SELECT t.id::text || '-A'::text AS "id"
            , t.id AS "Team_id"
            , t.name AS "Team"
            , 'A' AS "Focus"
            , COUNT(DISTINCT f.id) AS "PL"
            , COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "W"
            , COUNT(CASE WHEN f.result = 'SD' THEN 1 
                  WHEN f.result = 'ND' THEN 1
                ELSE NULL END) AS "D"
            , COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "L"
            , SUM(f.team_a_score) AS "F"
            , SUM(f.team_h_score) AS "A"
            , SUM(f.team_a_score) - SUM(f.team_h_score) AS "GD"
            , SUM(f.team_a_points) AS "PTS"
          FROM teams t
          LEFT JOIN fixtures f
            ON f.team_a = t.id
          WHERE f.finished = true
            AND gameweek_id <= ${gameweek}
          GROUP BY t.id
            , t.name
  
          UNION ALL
  
          SELECT t.id::text || '-A'::text AS "id"
            , t.id AS "Team_id"
            , t.name AS "Team"
            , 'A' AS "Focus"
            , 0 AS "PL"
            , 0 AS "W"
            , 0 AS "D"
            , 0 AS "L"
            , 0 AS "F"
            , 0 AS "A"
            , 0 AS "GD"
            , 0 AS "PTS"
          FROM teams t
          WHERE t.id NOT IN (
            SELECT DISTINCT t.id
            FROM teams t
            INNER JOIN fixtures f
              ON f.team_a = t.id
            WHERE (f.finished = true
              AND gameweek_id <= ${gameweek})
          )
        ) AS away_unordered
        ORDER BY "PTS" DESC
          , "GD" DESC
          , "F" DESC
          , "Team" ASC
      ) AS away_ordered
    )
  ) AS league_table_entries;`;
};
