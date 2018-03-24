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
  .then((tables) => {
    console.log(tables);
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
    const tables = createTables({
        teams: teams,
        fixtures: fixtures,
        all: true,
        range: false,
        start: 0,
        end: 0,
        lastXGames: 0,
      });

    res(tables);
  });
}
