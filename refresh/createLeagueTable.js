'use strict';

const async = require('async');

const db = require('../db/connect');

const {LeagueTables} = require('../db/Models');
const leagueTablesDef = require('../db/models/LeagueTables');

const {constructSimpleNumberArray} = require('./helpers/general');

// query to see the number of passed gameweeks.
// from 1 to n construct table and add to leaguetables table
howManyGameweeks({start: 1})
  .then((data) => {
    console.log(data);

    return constructTableData(data);
  })
  .then((data) => {
    console.log(`Expected length: ${(data.end - data.start + 1) * 60}`);
    console.log(data.league_tables.length);

    return Promise.resolve();
  })
  .then(() => process.exit())
  .catch((err) => {
    process.exit(1);
  });

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
      res({start, end, league_tables: tableEntries});
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
  return `SELECT * FROM (
    (
      SELECT  *
        , row_number() over () AS "Current_Position"
      FROM (
        /* Combined */
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
          FROM fixtures f
          INNER JOIN teams t
            ON f.team_a = t.id
          WHERE f.finished = true
            AND gameweek_id <= ${gameweek}
          GROUP BY t.id
            , t.name
  
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
          FROM fixtures f
          INNER JOIN teams t
            ON f.team_h = t.id
          WHERE f.finished = true
            AND gameweek_id <= ${gameweek}
          GROUP BY t.id
            , t.name
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
  
        SELECT t.id::text || '-H'::text AS "id"
          , t.id
          , t.name AS "Team"
          , 'H' AS "Focus"
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
        FROM fixtures f
        INNER JOIN teams t
          ON f.team_h = t.id
        WHERE f.finished = true
          AND gameweek_id <= ${gameweek}
        GROUP BY t.id
          , t.name
        ORDER BY "PTS" DESC
          , "GD" DESC
          , "F" DESC
          , "Team" ASC
      ) AS home
    )
  
    UNION ALL
  
    /* Away Table */
    (
      SELECT *
        , row_number() over() AS  "Current_Position"
      FROM (
        SELECT t.id::text || '-A'::text AS "id"
          , t.id
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
        FROM fixtures f
        INNER JOIN teams t
          ON f.team_a = t.id
        WHERE f.finished = true
          AND gameweek_id <= ${gameweek}
        GROUP BY t.id
          , t.name
        ORDER BY "PTS" DESC
          , "GD" DESC
          , "F" DESC
          , "Team" ASC
      ) AS away
    )
  ) AS league_table_entries;`;
};
