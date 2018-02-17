const MongoClient = require('mongodb').MongoClient;
const database = 'mongodb://localhost:27017/fantasy-stats';
const test = require('assert');
const validCollections = ['player_header', 'player_detail', 
                          'teams', 'fixtures', 'player_positions',
                          'phases', 'events', 'meta', 'users', 
                          'user_detail', 'user_picks'];

function insertMany(targetCollection, data) {
    return new Promise((resolve, reject) => {
        
        // check data is correct type and isn't empty
        if (!data || data.length === 0 ||  !Array.isArray(data) ) {
            reject(new Error("Data object needs to be a non-empty array"));
        }

        // make sure targetCollection is one of listed valid collections.
        if (validCollections.indexOf(targetCollection) === -1 ) {
            reject( new Error("Invalid target collection provided"));
        }

        // Attempt to connect to database
        MongoClient.connect( database, function(err, db) {
            if (err) {
                reject("ERROR CONNECTING TO DB: ", err);
            }

            const col = db.collection(targetCollection);
            col.insertMany(data)
                .then(success)
                .catch(error);

            function success(r) {
                db.close();
                resolve(r);
            }

            function error(err) {
                db.close();
                reject(err);
            }

        });
    });
}

function insertOne(targetCollection, data) {
    return new Promise((resolve, reject) => {

        // check data is a single object
        if(!data || Array.isArray(data)) {
            reject(new Error("Please submit single object as data source"));
        }

        // make sure targetCollection is one of listed valid collections.
        if (validCollections.indexOf(targetCollection) === -1 ) {
            reject( new Error("Invalid target collection provided"));
        }

        // attempt to connect to database
        MongoClient.connect( database, function(err, db) {
            if (err) {
                reject("ERROR CONNECTING TO DB: ", err);
            }

            const col = db.collection(targetCollection);
            col.insertOne(data)
              .then((r) => {
                db.close();
                if (r.insertedCount !== 1) {
                  reject(new Error("ERROR, 1 object was not inserted"))
                }

                resolve(r);
              }) 
              .catch((err) => {
                db.close();
                reject(err);
              });
        });


    });
}

function updateOne(targetCollection, data, filter) {
    return new Promise((resolve, reject) => {
        
        // check data is a single object
        if(!data || Array.isArray(data)) {
            reject(new Error("Please submit single object as data source"));
        }

        // make sure targetCollection is one of listed valid collections.
        if (validCollections.indexOf(targetCollection) === -1 ) {
            reject( new Error("Invalid target collection provided"));
        }

        MongoClient.connect( database, function(err, db) {
            if (err) {
                reject("ERROR CONNECTING TO DB: " + err);
            }

            const col = db.collection("users");

            col.updateOne(filter, {$set: data})
                .then(function(r) {
                    db.close();
                    resolve(r);
                })
                .catch(err => {
                    db.close();
                    reject(err)
                });

        });
    });
}

module.exports = {
    insertMany: insertMany,
    insertOne: insertOne,
    updateOne: updateOne
}