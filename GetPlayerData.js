// Aim: update playerData from fantasy.premierleague.com
// Compare each player with existing entry. 
// if not exists insert, else assess changes and record movements.

// Detailed player stats are here: https://fantasy.premierleague.com/drf/element-summary/255 (Eric Bailly)
// 

// Process: 1. Get PlayerHeader from headerSource (https://fantasy.premierleague.com/drf/bootstrap-static)
//				- Gives us count of players
//				- Gives us high level data for all players.
//			2. Use temporary collection to ingest data.
//			3. drop existing temp collection in database
//			4. insert player header data into new temp collection. each player is an individual document.
//			5. Once 4 is complete...
//				- for each playerdoc in temp collection, get detailed match data from detailSource
//				(https://fantasy.premierleague.com/drf/element-summary/).
//			6. 
//			7. Add detailed match data into new collection. 


var MongoClient = require('mongodb').MongoClient,
	ObjectID 	= require('mongodb').ObjectID,
	request 	= require('request'),
	assert 		= require('assert'),
	_			= require('lodash');

var headerSource = 'https://fantasy.premierleague.com/drf/bootstrap-static';
var mongoConnection = 'mongodb://localhost:27017/fantasy';

// Step 1: get player header
getPlayerHeader(headerSource, function(err, allPlayerData) {

	if (err) {
		console.log(err);
	}

	var playersInserted = 0;
	var errors = 0;
	var timer = 500;

	looper(allPlayerData, timer);

});

function looper(aPD, timer) {

	// aPD["Count"]
	for ( i = 0 ; i < 10; i++ ) {
		
		var timeOut = timer * i;
		var playerID = aPD["playerData"][i]["id"];
		var playerHeader = aPD["playerData"][i];

		playerHeader["_id"] = playerID;

		setTimeout(process(aPD, playerID, playerHeader), timeOut);

	}

};

function process(aPD, id, playerHeader) {

	var detailSource = 'https://fantasy.premierleague.com/drf/element-summary/';
	detailSource = detailSource + id;

	getPlayerDetail( detailSource, id, playerHeader, function(err, indivPlayerData) {

		if(err) {

			console.log("Error: " + err);
			errors = errors + 1;

		} else {
			
			insertPlayer(indivPlayerData, function(err, res) {

			});
		}
	});
};


////////////////////////////////////////
// functions to interact with MongoDB //
////////////////////////////////////////

function insertPlayer(iPD, callback) {

	MongoClient.connect(mongoConnection, function(err, db) {

		// check connected to MongoDB properly
		if(err) {						
			db.close();
			console.log(err);
			return callback(err);
		}

		console.log("Successfully connected to MongoDB.");
		
		var collection = db.collection("player_data");
		var pID = iPD["id"];

		// Fetch document
		collection.find({"id": pID}).toArray( function(err, items) {

			if(err) {
				db.close();
				console.log(err);
				return callback(err, null);
			}

			console.log(items.length)

			if (items.length == 0) {

				var objectID = new ObjectID();
				iPD["_id"] = objectID;

				collection.insertOne({ "id": pID }, iPD , {w:1}, function(err, result) {

					if(err) {
						db.close();
						console.log(err);
						return callback(err, null);
					}

					// check player inserted
					setTimeout(function(){

						// Fetch document
						collection.findOne({"id":pID}, function(err, item) {

							if(err) {
								db.close();
								console.log(err);
								return callback(err, null);
							} else {

								var rS = item["first_name"] + " " + item["second_name"] + " was inserted!";

								db.close();
								return callback(null, rS);
							}
						});

					}, 50);
				});

			} else {

				// insert player info.
				collection.updateOne({ "id": pID }, iPD , {w:1}, function(err, result) {

					if(err) {
						db.close();
						return callback(err);
					}

					// check player inserted
					setTimeout(function(){

						// Fetch document
						collection.findOne({"id":pID}, function(err, item) {

							if(err) {
								db.close();
								return callback(err);
							} else {

								var rS = item["first_name"] + " " + item["second_name"] + " inserted!"; 
								db.close();

								return callback(null, rS);
							}
						});

					}, 50);
				});
			}
		});
	});
};

///////////////////////////////////////////////////////////////////////////
// # TODO: create module with various getData functions from fantasy API //
///////////////////////////////////////////////////////////////////////////

// gets detailed game data for each player
function getPlayerDetail(URL, pid, name, playerHeader, callback) {

	var playerDetail = {};

	console.log("Getting detailed playerData");

	URL = URL + pid ;

	console.log("getting data for " + name + " from: " + URL);

	request.get( URL , function(err, res, body) {

		if(!err && res.statusCode == 200){

			var bodyJSON = JSON.parse(body);
			var matchesPlayed = bodyJSON["history"].length;
			console.log(name + " has played " + matchesPlayed + " matches.");

			playerDetail["matchesPlayed"] = matchesPlayed;
			playerDetail["matchDetails"] = bodyJSON["history"];
			playerHeader["playerDetail"] = playerDetail;

			return callback(null, playerHeader);

		} else {

			return callback(err);
		}
	});

};


// retrieves count of and 'headline' stats for each player  
function getPlayerHeader(URL, callback) {

	var allPlayerData = {};

	console.log("getting fresh playerHeader data...");

	request.get( URL , function(err, res, body) {
		
		if(!err && res.statusCode == 200) {

			var bodyJSON = JSON.parse(body);
			var playerCount = bodyJSON.elements.length;
			var playerArray = bodyJSON["elements"];

			allPlayerData["Count"] = playerCount;			
			allPlayerData["playerData"] = playerArray;

			return callback(null, allPlayerData);

		} else {

			return callback(err);
		}
	});
};