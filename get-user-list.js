"use strict";

// npm modules
const async = require('async');

// My modules
const save = require('./saveToMongo');
const read = require('./readFromMongo');
const api = require('./get-from-api').getJSONFromAPI;

// global module variables
const PHASE = 1;
const LE_PAGE = 1;
const LEAGUE_TABLE = "https://fantasy.premierleague.com/drf/leagues-classic-standings/313"
const MAX = 4500000;
const GAP = 500000;
const delay = 500; // 1/2 second;

let usersInserted = 0;

let queueArray = initializeArray(1, MAX, 1, GAP);
console.log(queueArray);

let q = async.queue(function(page, callback) {

  setTimeout(function() {

    getUsers(page)
      .then((users) => {
        
        saveToDB(users)
          .then((v) => {
            usersInserted += v;
            callback(null, page);
          })
          .catch((err) => {
            console.log("Error inserting to DB");
            callback(err);
          });

      })
      .catch((err) => {
        console.log("ERROR ENCOUNTERED");
        console.log(err);
        errors.push();
        callback(err);
      });

  }, delay);

});

q.drain = function() {
  console.log("Processed Users");
  console.log("Inserted a total of " + usersInserted + " users!");
};

q.push(queueArray, function(err, page) {
  if (err) {
    console.log(err);
  } else {
    console.log("Processed users from page " + page);
  }
});

function saveToDB(users) {
  return new Promise((res, rej) => {
    save.insertMany("users", users)
      .then((r) => {
        console.log(r.insertedCount + " users inserted into DB");
        res(r.insertedCount);
      })
      .catch((err) => {
        console.log(err);
        rej(err);
      });
  });
}

function getUsers(page) {
    return new Promise((resolve, reject) => {

        const uri = LEAGUE_TABLE;
        let qs = {
            "phase": PHASE,
            "le-page": LE_PAGE,
            "ls-page": page 
        };

        api(uri, qs)
            .then((data) => {
                const users = data.standings.results;
                console.log("Fetched " + users.length + " users");
                resolve(users);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });

    });
}

// create array which will define which players to get.
function initializeArray(start, max, groupSize, gap) {
    let arr = [];
    let current = start;
    
    while(current < max) {
        let stop = current + groupSize;
        for(let i = current; i < stop; i++) {
            arr.push(calcLsPage(i));
            arr.push(calcLsPage(i + 50));
            arr.push(calcLsPage(i + 100));
            arr.push(calcLsPage(i + 150));
            arr.push(calcLsPage(i + 200));
            arr.push(calcLsPage(i + 250));
            arr.push(calcLsPage(i + 300));
            arr.push(calcLsPage(i + 350));
            arr.push(calcLsPage(i + 400));
            arr.push(calcLsPage(i + 450));
        }
        current += gap;
    }

    return arr;
}

function calcLsPage(rank) {
    return Math.floor((rank + 50) / 50); 
}