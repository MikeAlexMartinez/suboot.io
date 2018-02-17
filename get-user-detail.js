"use strict";

// npm modules
const async = require('async');

// My modules
const save = require('./saveToMongo');
const read = require('./readFromMongo');
const api = require('./get-from-api').getJSONFromAPI;

// main variables
const USER_DETAIL = "https://fantasy.premierleague.com/drf/entry/";
const delay = 500; // 1/2 second.
let errors = [];

// get users from db
const query = {};
const fields = { entry: 1, _id: 0 };


// Should reimplement the below using the async waterfall function
read.fetchAll("users", query, fields)
    .then((users) => {
        console.log(users.length + " user entry ID's retrieved");

        const totalUsers = users.length;
        let userDetailRetrieved = 0;

        let q = async.queue((u, callback) => {
            
            const entry_id = u.entry;

            let user = {
                entry_id: entry_id
            }

            setTimeout( function(){
                
                getUserGWData(entry_id)
                    .then((gw_data) => {

                        user["gw_data"] = gw_data;

                        getUserTransfers(entry_id)
                            .then((transfer_data) => {

                                user["transfer_data"] = transfer_data;

                                save.insertOne("user_detail", user)
                                    .then((r) => {
                                        console.log("Inserted " + r + " set of user detail");

                                        callback();
                                    })
                                    .catch((err) => {
                                        console.log("Error saving to DB");
                                        errors.push({ 
                                            entry_id: entry_id, 
                                            type: "SavingToDB",
                                            err_message: err
                                        });

                                        callback(err);
                                    });
                                
                            })
                            .catch((err) => {
                                console.log("Error getting user transfers");
                                errors.push({ 
                                    entry_id: entry_id, 
                                    type: "Transfers",
                                    err_message: err
                                });

                                callback(err);
                            });
                    })
                    .catch((err) => {
                        console.log("Error getting user detail");
                        errors.push({ 
                            entry_id: entry_id, 
                            type: "Detail",
                            err_message: err
                        });

                        callback(err);
                    });
                
            }, delay);

        }, 1);

        q.drain = function() {
            console.log("Fetched count: " + userDetailRetrieved);
            console.log(errors);
        };

        q.push(users, function(err) {
            if (err) {
                console.log(err);
                errors.push(err);
            }
        });
    })
    .catch((err) => {
        console.log(err);
    });


// For each user
// get transfer data for user (1 request)
function getUserTransfers(entry) {
    return new Promise((res, rej) => {

        const uri = USER_DETAIL + entry + "/transfers";

        api(uri)
            .then((data) => {
                
                let user = {
                    entry_id: entry,
                    transfers: data.history,
                    wildcards: data.wildcards,
                    leagues: data.leagues
                }
                
                res(user);
            })
            .catch((err) => {
                rej(err);
            })
    });
}

// get GW data for each user (1 request)
function getUserGWData(entry) {
    return new Promise((res, rej) => {

        const uri = USER_DETAIL + entry + "/history";

        api(uri)
            .then((data) => {
                
                let gw_stats = {
                    entry_id: entry,
                    chips: data.chips,
                    gameweeks: data.history,
                    seasons: data.season
                }
                
                res(gw_stats);
            })
            .catch((err) => {
                rej(err);
            })
    });
}

// more intensive...
// get each GW picks (38 request)