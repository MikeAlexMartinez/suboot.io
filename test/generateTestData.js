'use strict';

const fs = require('fs');
const path = require('path');

const rp = require('request-promise');

const rpFixtures = {
  uri: 'http://localhost:3030/v1/api/fixtures',
  json: true,
};

const rpTeamNames = {
  uri: 'http://localhost:3030/v1/api/teams/shortnames',
  json: true,
};

createTableData();

/**
 * @param {error} err
 * @return {null}
 */
function errorHandler(err) {
  console.warn(err);
  return null;
}

/**
 * @param {*} file
 * @param {*} data
 * @return {promise}
 */
function writeToFile(file, data) {
  return new Promise((res, rej) => {
    let stringy = JSON.stringify(data, null, 2);
    fs.writeFile(file, stringy, (err) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
}

/**
 * @return {null}
 */
async function createTableData() {
  const [fixtures, teams] = await Promise.all([
    rp(rpFixtures),
    rp(rpTeamNames)]
  ).catch(errorHandler);

  const fixtureData = fixtures.data.finished;
  const teamData = teams.data;

  const [fixRes, teamRes] = await Promise.all([
    writeToFile(
      path.resolve(__dirname, 'data', 'testTeamData.json'),
      teamData
    ),
    writeToFile(
      path.resolve(__dirname, 'data', 'testFixtureData.json'),
      fixtureData
    )]
  ).catch(errorHandler);

  console.log(fixRes === undefined && teamRes === undefined);

  return null;
}
