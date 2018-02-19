"use strict";

// npm modules
const async = require('async');

// My modules
const read = require('./readFromMongo');
const api = require('./get-from-api').getJSONFromAPI;

// main data api.
const MAIN_DATA = 'https://fantasy.premierleague.com/drf/bootstrap-static';
// need to append this with player id.
const PLAYER_DETAIL = 'https://fantasy.premierleague.com/drf/element-summary/';
/*
getMainData(MAIN_DATA)
    .then(()=>{
        console.log("Finished getting main data.");
        console.log("Now getting player detail");
        getPlayerDetail();
    })
    .catch((err)=>{
        console.log("Error encountered: ", err);
        process.exit();
    });*/

getPlayerDetail();

function getPlayerDetail() {
  fetchPlayerHeaders()
    .then((data)=>{
      const players = data.length;

      const delay = 500; // 1/2 second
      const playerData = data; 
      let fetchedCount = 0;
      let errors = [];

      // use async queue functionalities to call player detail
      // one at a time.
      let q = async.queue(function(player_header, callback) {
          
        // initiate function with a defined delay to prevent 
        // calling the FPL API too frequently.
        setTimeout(function(){
            
          fetchPlayerDetail(player_header.id)
            .then((player) => {
              console.log(player.player_id);
              console.log("Fetched " + player_header.first_name 
                          + " " + player_header.second_name);
              
              // Save player to database
              save.insertOne("player_detail", player)
                .then((r) => {
                  console.log("inserted " + r.insertedCount + " player to database!")
                  fetchedCount += r.insertedCount;
                  console.log("finished processing item");
                  callback(null);
                })
                .catch((err) => {
                  console.log(err);
                  callback(err);
                });

            })
            .catch((err, id) => {
              let errString = "Error encountered fetching player: " + id;
              let errObj = {
                  error: err,
                  message: errString,
                  player_id: id
              }  
              console.log(errString);
              errors.push(errObj);
              callback(err);
            });

        }, delay);

      }, 1);

      // this function runs after all queued items have completed
      q.drain = function() {
          console.log("Fetched count: " + fetchedCount);
          console.log(errors);
      };

      // add players to queue to be processed
      q.push(playerData, function(err) {
        if (err) {
          console.log(err);
          errors.push(err);
        }
      });

    })
    .catch((err) => {
      console.log("Error fetching data from MongoDB");
      console.log(err);
    });
}

// This code fetches detailed data about the specified player.
function fetchPlayerDetail(id) {
    return new Promise((resolve, reject) => {
        
        // construct api url with PLAYER_DETAIL and id
        const uri = PLAYER_DETAIL + id;
        
        // get data from api.
        api(uri)
            .then((data)=>{
                
                // create player object with the data I want to keep
                var player = {
                    player_id: id,
                    prior_seasons: data.history_past,
                    current_season_match_stats: data.history,
                }

                // complete promise
                resolve(player);

            })
            .catch((err) => {
                console.log(err);
                reject(err, id);
            });;
    });
}

// function to fetch player header data from database
function fetchPlayerHeaders() {
    return new Promise((resolve, reject) => {
        var collection = 'player_header';

        read.fetchAll(collection)
            .then(success)
            .catch(error);

        function success(data) {
            console.log("retrieved " + data.length + " from database.");

            resolve(data);
        }

        function error(err) {
            console.error(err);
            reject(err);
        }
    });
}

// This code retrieves main data from the main data API.
function getMainData(MAIN_DATA) {
    return new Promise((resolve, reject) => {
        api(MAIN_DATA)
            .then(function(data){

                // splits data from API into component parts
                // and saves into respective collections.
                const toInsert = [
                    { col: "teams", data: data.teams },
                    { col: "player_header", data: data.elements },
                    { col: "player_positions", data: data.element_types },
                    { col: "phases", data: data.phases },
                    { col: "events", data: data.events }
                ];

                // create iterable promise functions
                let inserts = toInsert.map((v) => {
                    return new Promise((resolve, reject) => {
                        save.insertMany(v.col, v.data)
                            .then((r)=>{
                                console.log("Inserted " + r.insertedCount + 
                                            " objects into the  " + v.col + " collection.");
                                resolve();
                            })
                            .catch((err) => {
                                console.log("ERROR inserting into " + v.col);
                                console.error(err);
                                reject("v.col");
                            });
                    });
                });

                // Once all iterables complete exit function.
                Promise.all(inserts)
                    .then(() => {
                        console.log("Retreived all main data items");
                        resolve();
                    })
                    .catch((err)=>{
                        console.error(err);
                        reject(err);
                    });
            })
            .catch(function(err){
                console.error("ERROR ENCOUNTERED: ", err);
                reject("ERROR encountered: ", err);
            });
    });
}