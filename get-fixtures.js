"use strict";

// npm modules
const async = require('async');

// My modules
const save = require('./saveToMongo');
const read = require('./readFromMongo');
const api = require('./get-from-api').getJSONFromAPI;

// need to add ':gameweek/live' to this
const FIXTURE_DETAIL = 'https://fantasy.premierleague.com/drf/event/';

// array container for fixtures.
let fixtures = [];
let errors = [];
let gameWeekIds = initializeArray(38);
let fixturesRetrieved = 0;
let delay = 500; // 1/2 second;

let q = async.queue(function(id, callback) {

  setTimeout(function() {

    getFixtures(id)
      .then((gwFixtures) => {
        let gwSorted = gwFixtures.sort((a, b) => { 
          return parseInt(a.id) - parseInt(b.id);
        });
        fixtures = fixtures.concat(gwSorted).sort((a, b) => { 
          return parseInt(a.id) - parseInt(b.id);
        });
        fixturesRetrieved += gwFixtures.length;
        callback(null, id);
      })
      .catch((err) => {
        console.log("Error retrieving fixtures from GW" + id);
        console.log(err);
        errors.push(id);
        callback(err);
      });

  }, delay);

});

q.drain = function() {
  console.log("Fetched count: " + fixturesRetrieved);
  console.log("Errors: " + errors.length);
  console.log(errors);

  if (errors.length === 0 && fixturesRetrieved === 380) {
    saveToDB();
  } else {
    console.log("Please review errors and restart!");
  }
};

q.push(gameWeekIds, function(err, gW) {
  if (err) {
    console.log(err);
  } else {
    console.log("Processed GW" + gW)
  }
});

function saveToDB() {
  save.insertMany("fixtures", fixtures)
    .then((r) => {
      console.log(r.insertedCount + " fixtures inserted into DB");
    })
    .catch((err) => {
      console.log(err);
    });
}

// this function makes a call to the API which contains lists of fixtures
// for each Gameweek.
function getFixtures(gW) {
  return new Promise((resolve, reject) => {

    const uri = FIXTURE_DETAIL + gW + "/live";
    console.log("fetching " + uri);

    api(uri)
      .then((data) => {
        console.log("Fetched " + data.fixtures.length + " fixtures from GW" + gW);
        resolve(data.fixtures);
      })
      .catch((err) => {
        reject(err);
      });

  });
}

// This function initializes an array with numbers from
// 1 to n.
function initializeArray(n) {
  let arr = new Array(n);
  for(let i = 0; i < n; i++) {
      arr[i] = i + 1;
  }
  console.log(arr);
  return arr;
}