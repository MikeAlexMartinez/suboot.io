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
let usersUpdated = 506;
const gameweeks = intializeGWArray();
let currentEntry = 0;

/**
 * Steps:
 * 
 * 1. retrieve user entry_id
 *      a. if user returned, need to get data, continue,
 *         else, end process
 * 2. for each user entry:
 *      a. retrive picks data from each GW (1-38)
 *      b. push user detail and picks to user_picks collection
 *      c. if all gravy, update "got_picks" to "true" in users
 *      d. go again
 * 
 */

retrieveUserWithoutPicks();

function retrieveUserWithoutPicks() {
    
    const query = {got_picks: false};
    const fields = {entry: 1};
    const options = {fields: fields};

    read.findOne("users", query, options)
        .then(processUser) // if user not null get all data
        .then(storeUserPicks)
        .then(updateUser)
        .then(restart)
        .catch((err) => {

            // error encountered
            errorEncountered(err);
        });
}

function restart() {
    console.log(usersUpdated + " users completed!");

    retrieveUserWithoutPicks();
}

/**
 * This function runs if the sufficient gw data has been collected
 * and stored correctly.
 * 
 * user can now has got_picks field in user collection set to true.
 */
function updateUser(entry_id, status) {

    return new Promise((res, rej) => {
        save.updateOne("users", {got_picks: true}, {entry: entry_id})
            .then((r) => {
                console.log(r.result.nModified + " user updated!");
                usersUpdated++;

                res();
            })
            .catch((err) => {
                console.log(err);

                rej(err);
            });
    })
}

/**
 * If data is valid, store user picks data in user_picks collection
 * 
 */
function storeUserPicks(userWithPicks) {
    return new Promise((res, rej) => {

        console.log("entry: " + userWithPicks.entry);
        console.log("picks length: " + userWithPicks.gwPicks.length);
        // check that userWithPicks has an entry_id and also has
        // 38 weeks worth of data.
        if (!userWithPicks.entry) {
            rej(new Error("userWithPicks has no entry_id"));
        }

        save.insertOne("user_picks", userWithPicks)
            .then((r) => {
                console.log("Successfully inserted entry " + userWithPicks.entry);
                
                res(userWithPicks.entry);
            })
            .catch((err) => {
                console.log("Error Inserting userWithPicks Object");

                rej(err);
            });
    });

}

/**
 * This function takes a user object with it's entry id
 * and collected each of the 38 weeks worth of picks data.
 * 
 * If an error is encountered the task queue is emptied and the 
 * promise is rejected.
 * 
 * Else all 38 weeks are returned in an array with an object
 * that also contains the entry id of the user in question
 **/
function processUser(user) {
    return new Promise((res, rej) => {

        currentEntry = user.entry;
        
        console.log(user);

        if (!user) {
            console.log("All users updated");

            process.exit();
        }

        // get gameweek data to determine which gameweeks the user was 
        // active in.
        getUserDetail(user.entry)
            .then((uris) => {

                const uriLength = uris.length;
                let gwPicks = [];
                
                let q = async.queue((u, callback) => {
                    
                    const entry_id = u.entry;

                    let user = {
                        entry_id: entry_id
                    }

                    setTimeout( function(){
                        
                        getUserPicks(u.entry, u.gw)
                            .then((picks) => {
                                gwPicks.push(picks);
                                if (gwPicks.length === uriLength) {
                                    console.log("Got all gwPicks");
                                    
                                    res({
                                        entry: entry_id,
                                        gwPicks: gwPicks
                                    });
                                }

                                callback();
                            })
                            .catch(err => {
                                
                                rej(err);
                                callback(err);
                            });
                        
                    }, delay);

                }, 1);

                // run this function after all 38 weeks worth of data
                // has been retrieved
                q.drain = function() {
                    console.log("DRAINED!");
                }

                // callback that is called after each item in the queue
                // is processed
                q.push(uris, function(err) {
                    if (err) {
                        console.log("ERROR FETCHING GW DATA");
                        q.kill();
                    }
                });
            })
            .catch((err) => {
                console.error(err);
                console.log("Error getting detail");
                rej(err);
            });
    });
}

// get GW detail for a user to determine which gameweek the user
// joined the fantasy game.
function getUserDetail(entry_id) {
    return new Promise((res, rej) => {

        const options = {
            fields: {gw_data: 1, _id: 0}
        };

        read.findOne("user_detail", {entry_id: entry_id}, options)
            .then((user_detail) => {
                const uris = user_detail.gw_data.gameweeks.map((v) => {
                    return {
                        gw: v.event,
                        entry: entry_id
                    }
                });

                res(uris);
            })
            .catch((err) => {
                console.log("Error");
                rej(err);
            });

    });
}

// get GW data for each user (1 request)
function getUserPicks(entry, gw) {
    return new Promise((res, rej) => {
        console.log("Getting entry " + entry + ", gw " + gw);

        const uri = USER_DETAIL + entry + "/event/" + gw + '/picks';

        api(uri)
            .then((data) => {
                 res({
                    auto_subs: data.automatic_subs,
                    chips: data.active_chips,
                    general_event: data.event,
                    picks: data.picks
                 });
            })
            .catch((err) => {
                rej(err);
            })
    });
}

// on error change current entry from false to error.
function userError() {
    return new Promise((res, rej) => {
        console.log("Error Encountered");

        let filter = {entry: currentEntry};
        let data = { got_picks: "error" };

        save.updateOne("users", data, filter)
            .then((r) => {
                console.log(r.insertedCount + " user set to error");

                res();
            })
            .catch(err => {
                rej(err);
            });

    });
}

// deal with error
function errorEncountered(err) {
    console.log(err);

    userError().then(() => retrieveUserWithoutPicks())
        .catch(() => retrieveUserWithoutPicks());
}

// Create array with numbers 1 to 38
function intializeGWArray() {
    let arr = [];
    for(let i = 1; i < 39; i++) {
        arr.push(i);
    }
    return arr;
}