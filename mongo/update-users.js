"use strict";

// npm modules
const async = require('async');

// My modules
const read = require('../readFromMongo');
const update = require('../saveToMongo').updateOne;

// start program
read.fetchAll('users',{}, {_id: 1})
    .then(updateUsers)
    .then(writeToDB)
    .then(() => {
        console.log("Completed task");
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit();
    });

// get all users and update structure
function updateUsers(data) {
    return new Promise((resolve, reject) => {
        if(data.length < 1) {
            reject(new Error("No Users to update"));
        }

        const toUpdate = data.map((v) => {
            return {query: v, update: {got_picks: false} } 
        });

        resolve(toUpdate);
    });
}

// write updated users to db
function writeToDB(users) {
    console.log("users: " + users.length);

    return new Promise((resolve, reject) => {

        let usersUpdated = [];
        let errors = [];

        let q = async.queue(saveToDB);

        q.drain = function() {
            console.log("Updated " + usersUpdated.length + " Users");
            console.log("Encountered " + errors.length + " errors!");

            if (errors.length === 0) {
                resolve();
            } else {
                reject(errors);
            }
        }

        q.push(users, savedCallback)

        function saveToDB(user, callback){

            update("users", user.update, user.query)
                .then((r)=>{
                    console.log(r.result);
                    usersUpdated.push(user);
                    callback();
                })
                .catch((err) => {
                    errors.push(err);
                    callback(err);
                });
        };

        function savedCallback(err) {
            if (err) {
                console.log("Error encountered.");
                console.error(err);
            } else {
                console.log("user updated");
            }
        }

    });
}