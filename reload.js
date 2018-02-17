"use strict";

const MongoClient  = require('mongodb').MongoClient,
	  request 	   = require('request'),
	  util		   = require('util'),
	  EventEmitter = require('events').EventEmitter,
	  fs 		   = require('fs'),
      path 		   = require('path');

/****
 * To do:
 * - Add logging of operations
 * 	  - Statistics (e.g. time of operation, errors encountered, players downloaded, time taken)
 * - create error capture module
 * - consolidate fixture lists
 * - Once written, write way to schedule jobs depending on significant gameweek events, 
 *   times and dates.
 * - What am I looking for?
*/

//###################//
// Emitter Functions //
//###################//

class Reload extends EventEmitter {

	constructor() {
		super();
	}

	//==================================================//
	//  	Functions to get data from FPL              //
	//==================================================//

	GetMainData() {

		var self = this;
		var source = 'https://fantasy.premierleague.com/drf/bootstrap-static';
		var allPlayerData = {};
		var teamData = {};
		var gameweekData = {};

		console.log("function(GetPlayerData): getting fresh playerHeader data...");

		requestDataJSON(source, function(err, data) { 
			
			if (err){	

				console.log(err);

			} else {

				// update player data
				allPlayerData["Count"] = data.body.elements.length;			
				allPlayerData["playerData"] = data.body.elements;

				self.emit('PlayerHeaderRefresh', allPlayerData);

				// update team data
				teamData["Count"] = data.body.teams.length;
				teamData["teamData"] = data.body.teams;

				self.emit('GotTeams', teamData);

				// Gameweek info
				gameweekData["Count"] = data.body.events.length;
				gameweekData["gameweekData"] = data.body.events;

				self.emit('gotGW', gameweekData);
			}
		});
	}

	GetPlayerDetail(playerIds, i , x) {

		var self = this;
		var source = 'https://fantasy.premierleague.com/drf/element-summary/';

		if ( i < x ) {
			
			var playerIdDoc = playerIds[i];

			GetNextPlayer(source, playerIdDoc, function(err, data) {

				if (err) {
					console.log(err);
				} else {
					self.emit("PlayerDetailReceived", data);
				}

				getData.GetPlayerDetail(playerIds, i + 1, x);
			});

		} else {
			// need to check number of players
			// wrong player count likely being listed due to this being emitted before 
			// player has chance to be inserted

			self.emit("AllPlayerDetailReceived");
		}
	}

	GetFullFixtures(i, x) {

		var self = this;
		var source = 'https://fantasy.premierleague.com/drf/fixtures/?event='

		if (i < x + 1) {

			source = source + i ;

			getGWFixtures(source, function(err, data) {

				if (err) {
					console.log(err);
				} else {
					self.emit("GotFixtures", data);
				}

				getData.GetPlayerDetail(i + 1 , x);
			});

		} else {
			// need to check fixtures collection for reassurances.
			getData.fixtureCheck(1);
		}

	}

	// function checks if global fixtures array is 380 fixtures long.
	// Once 380 fixtures long triggers insertion to database.
	fixtureCheck(attempts) {
		if(attempts < 11){

			setTimeout( function() {

				if(fixtures.length == 380) {
					self.emit("FixturesReady");
				} else {
					fixtureCheck(attempts + 1);
				}
			}, 1000);
		} else {
			self.emit("FixturesTimeout", attempts);
		}
	}
}


//#######################//
// Interact with MongoDB //
//#######################//

// important mongo variables
var mongoConnection = 'mongodb://localhost:27017/fantasy';

// function takes collection and drops if it exists
function mongoDrop(coll, callback){
	console.log("Dropping Collection: " + coll);
	MongoClient.connect( mongoConnection, function(err, db) {
		
		if(err) {
			db.close();
			return callback(err);
		} else {

			db.dropCollection(coll, function(err, result) {

				if(err) {
					db.close();
					return callback(err);
				} else {

					db.listCollections({name : coll}).toArray(function(err, names) {

						if (names.length !== 0) {
							err = "Collection not dropped"
							db.close();
							return callback(err);
						} else {
							var result = coll + " dropped successfully" 
							db.close();
							return callback(null, result);
						}
					});	
				}			
			});
		}
	});
}

function mongoInsertMany(data, options, coll, callback) {

	console.log("Inserting array of data...");
	MongoClient.connect(mongoConnection, function(err, db){	
		
		if(err) {
			db.close();
			return callback(err);
		} else {

			var collection = db.collection(coll);

			collection.insertMany(data, options, function(err, res){

				if(err){
					db.close();
					return callback(err);
				} else {

					collection.find().toArray(function(err, docs) {

						if (err) {
							db.close();
							return callback(err);
						} else {
							db.close();
							console.log(coll + " items inserted: " + docs.length);
							return callback(null, docs);
						}
					});
				}
			});
		}
	});
}

function mongoInsertOne(data, options, coll, callback) {

	//console.log("Inserting player_detail...");
	MongoClient.connect(mongoConnection, function(err, db){	
		
		if(err) {
			db.close();
			return callback(err);
		} else {
			var collection = db.collection(coll);

			collection.insertOne(data, options, function(err, res){

				if(err){
					console.log("sheet");
					db.close();
					return callback(err);
				} else {
					db.close();
					return callback(null, res);
				}
			});
		}
	});
}


//#########################################//
// functions to get data from the interweb //
//#########################################//

// standard request template to get JSON object back
function requestDataJSON(URL, callback){

	request.get( URL , function(err, res, body) {
			
		var response = {};

		if(!err && res.statusCode == 200) {

			var bodyJSON = JSON.parse(body);

			response["body"] = bodyJSON;
			response["Headers"] = res;

			return callback(null, response)

		} else {
			
			if(!err && res.statusCode != 200) {

				var err = "Response received but not OK"; 

				response["body"] = body;
				response["Headers"] = res;

				return callback(err, response);

			} else {

				return callback(err);

			}
		}
	});
}

// function for player detail API
function GetNextPlayer(source, playerIdDoc, callback) {
	
	setTimeout( function() {	

		var playerID = playerIdDoc["id"];
		var firstName = playerIdDoc["first_name"];
		var secondName = playerIdDoc["second_name"];
		var playerSource = source + playerID;

		requestDataJSON(playerSource, function(err, data) {

			if (err) {
				console.log(err);
				return callback(err);
			} else {
				var returnData = {};
				returnData.id = playerID;
				returnData.first_name = firstName;
				returnData.second_name = secondName;
				returnData.history = data.body.history;
				returnData.fixtures = data.body.fixtures;
				return callback(null, returnData);
			}

		});
	}, 1000);	
}

// function to get fixture stats from API
function getGWFixtures(source, callback){

	setTimeout( function() {

		requestDataJSON(source, function(err, data) { 

			if (err) {
				console.log(err);
				return callback(err);
			} else {
				var returnData = {};
				returnData.fixtures = data.body;
				return callback(null, returnData)
			}

		});

	}, 1000);
}

//#########################################################################//
// 						Main Program - Listeners     	                   //
//#########################################################################//

const getData = new Reload();
var playersInserted = 0;
var fixtures = [];

// Listener triggered when playerHeader stats data has been succesfully requested.
// inserts updated data into playerHeader Database
getData.on('PlayerHeaderRefresh', (data) => {

	var collection = 'player_header';
	var collectionTwo = 'player_detail';
	mongoDrop(collection, function(err, res){
		
		if(err){
			console.log(err);
		} else {

			mongoDrop(collectionTwo, function(err, res) {
				if (err) {
					console.log(err);
				} else {
					playersInserted = 0;
					var dataToInsert = data.playerData;
					var insertOptions = {w:1, keepGoing: true, forceServerObjectID: true};

					mongoInsertMany(dataToInsert, insertOptions, collection, function(err, docs) {
						if(err){
							console.log(err);
						} else {

							if (dataToInsert.length === docs.length) {
								
								var playerIDArray = [];
								for ( var i = 0 ; i < docs.length ; i++ ){
									var playerIDDoc = {}
									playerIDDoc.id = docs[i]["id"];
									playerIDDoc.first_name = docs[i]["first_name"];
									playerIDDoc.second_name = docs[i]["second_name"];
									playerIDArray.push(playerIDDoc);
									if (i == docs.length-1) {
										console.log("Starting Player detail operations...");
										getData.GetPlayerDetail(playerIDArray, 0, playerIDArray.length);
									}
								}
								
							} else {
								// need to write function to capture and deal with these errors
								console.log("Some docs missing: Investigate");
							}
						}
					});
				}
			});
		}
	});
});

getData.on('GotFixtures', (data) => {

	var x = data.length;

	for(var fix = 0; fix < x ; fix++ ) {
		console.log(data.fixtures[fix]);
		fixtures.push(data.fixtures[fix]);
	}

});

getData.on('FixturesReady', insertFixtures(); );

getData.on('FixturesTimeout', function(){
	console.log("FixturesTimeout: ")
});


// Listener triggered once playerHeader updated
// queries each player for their detailed match history and adds to document
getData.on('PlayerDetailReceived', (doc) => {
	
	var collection = 'player_detail';
	var dataToInsert = doc;
	var insertOptions = {forceServerObjectID: true};

	mongoInsertOne(dataToInsert, insertOptions, collection, function(err, result) {
		if (err) {
			console.log(err);
		} else {
			playersInserted += 1;
		}
	});
});

getData.on('AllPlayerDetailReceived', function(){
	console.log("Got all player detail");
	console.log("Total Players Detail Inserted: " + playersInserted);
	GetFullFixtures(1, 38);
});

getData.on('gotGW', (data) => {

	var collection = 'gameweeks';
	var dataToInsert = data.gameweekData;
	var insertOptions = {forceServerObjectID: true};
	var dataLength = data.gameweekData.length;

	mongoDrop(collection, function(err, res){

		if(err) {
			console.log(err)
		} else {
			mongoInsertMany(dataToInsert, insertOptions, collection, function(err, docs) {
				if (err) {
					console.log(err);
				} else {
					if (docs.length == 38){
						console.log("Gameweek Data Updated");
					} else {
						console.log("Error: Not enough gameweeks inserted!");
					}
				}
			});
		}
	});
});

getData.on('GotTeams', (data) => {

	var collection = 'teamsHeader';
	var dataToInsert = data.teamData;
	var insertOptions = {forceServerObjectID: true};
	var dataLength = data.teamData.length;

	if(dataLength !== 20 ) {
		console.log("Not enough teams retrieved from bootstrap-static");
	}

	mongoDrop(collection, function(err, res){

		if(err) {
			console.log(err)
		} else {
			mongoInsertMany(dataToInsert, insertOptions, collection, function(err, docs) {
				if (err) {
					console.log(err);
				} else {
					if (docs.length == 20){
						console.log("Team Data Updated");
					} else {
						console.log("Error: Not enough teams inserted!");
					}
				}
			});
		}
	});
});

var interval = 3600000; // 60 minutes

getData.GetMainData();

setInterval(function() {
	getData.GetMainData
}, interval);