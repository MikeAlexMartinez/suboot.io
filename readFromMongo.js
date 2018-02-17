const MongoClient = require('mongodb').MongoClient;
const database = 'mongodb://localhost:27017/fantasy-stats';
const test = require('assert');
const validCollections = ['player_header', 'player_detail', 
                          'teams', 'fixtures', 'player_positions',
                          'phases', 'events', 'meta', 'users', 
                          'user_detail', 'user_picks'];

// Returns all documents from requested collection.
function fetchAll(targetCollection, query, fields) {
    return new Promise((resolve, reject) => {

        // make sure targetCollection is one of listed valid collections.
        if (validCollections.indexOf(targetCollection) === -1 ) {
            reject( new Error("Invalid target collection provided"));
        }

        if (!query) {
            query = {};
        }

        if (!fields) {
            fields = {};
        }

        MongoClient.connect( database, function(err, db) {
            if (err) {
                db.close();
                reject("ERROR CONNECTING TO DB: ", err);
            }

            const col = db.collection(targetCollection);
            // Get all documents from collection
            col.find(query, fields).toArray(function(err, docs) {
                if (err) {
                    db.close();
                    reject("ERROR fetching from database: ", err);
                }

                console.log("Retrieved " + docs.length + " docs");
                // completed successfully
                db.close();
                resolve(docs);
            });
        });


    });
}

function findOne(targetCollection, query, options) {
    return new Promise((res, rej) => {

       // make sure arguments are valid
       // make sure targetCollection is one of listed valid collections.
        if (validCollections.indexOf(targetCollection) === -1 ) {
            rej( new Error("Invalid target collection provided"));
        }

        if (!query) {
            query = {};
        }

        if (!options) {
            options = {};
        }

        MongoClient.connect( database , function(err, db) {
            if (err) {
                db.close();
                rej("ERROR CONNECTING TO DB: ", err);
            }

            const col = db.collection(targetCollection);

            col.findOne(query, options)
                .then(function(doc) {
                    db.close();
                    res(doc);
                })
                .catch(err => rej(err));
        });

    });
}

module.exports = {
    fetchAll: fetchAll,
    findOne: findOne
}