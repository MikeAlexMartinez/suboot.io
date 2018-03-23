'use strict';

const rp = require('request-promise');

const {createTables} = require('./tableUtils');

let rpFixtures = {
  uri: 'http://localhost:3030/v1/api/fixtures',
  json: true,
};

let teamNames = {
  uri: 'http://localhost:3030/v1/api/teams/shortnames',
  json: true,
};

Promise.all(
    [rp(rpFixtures),
    rp(teamNames)]
  )
  .then(([fixtures, teams]) => {
    return callCreateTables(fixtures.data.finished, teams.data);
  })
  .catch((err) => {
    console.error(err);
  });

/**
 * @param {array} fixtures
 * @param {array} teams
 * @return {promise}
 */
function callCreateTables(fixtures, teams) {
  return new Promise((res, rej) => {
    console.log(fixtures);

    let teamArr = teams.map((t) => t.short_name);

    const tables = createTables({
        teams: teamArr,
        fixtures: fixtures,
        all: true,
        range: false,
        start: 0,
        end: 0,
        lastXGames: 0,
      });

    console.log(tables);
  });
}
