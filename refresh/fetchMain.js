/*jshint camelcase: false */

'use strict';

// External libs
const async = require('async');

// Models and DB
const db = require('../db/connect');
const { Players, Teams, Gameweeks } = require('../db/Models');
const playerDef = require('../db/models/players');
const teamDef = require('../db/models/teams');
const gameweekDef = require('../db/models/gameweeks');

// API
const fetchFromAPI = require('./fetchFromAPI');
const MAIN = 'https://fantasy.premierleague.com/drf/bootstrap-static';

// global variabale to store data retrieved from API
let data;

/*
  ##########################
  # MAIN FILE PROCESS HERE #
  ##########################
*/

getMainData()
  .then(() => {
    // update the players table
    return manageModelUpdate('players', playerDef, Players, insertPlayerData);
  })
  .then(() => {
    // update the teams table
    return manageModelUpdate('teams', teamDef, Teams, insertTeamData);
  })
  .then(() => {
    // update the Gameweeks table
    return manageModelUpdate('gameweeks', gameweekDef, Gameweeks, insertGameweekData);
  })
  .then(() => {
    console.log('UPDATE COMPLETE');

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    
    process.exit(1);
  });


/**
 * Hit API at MAIN data source.
 */
function getMainData() {
  return new Promise((res, rej) => {
    fetchFromAPI(MAIN)
      .then(d => {
        
        // keep data for later
        data = {
          players: d.elements,
          teams: d.teams,
          gameweeks: d.events
        };
      
        res();
      })
      .catch(err => rej(err));
  });
}

/**
 * Abstract the model update process to make process chainable
 * @param {*} model 
 * @param {*} modelDef 
 * @param {*} Model 
 * @param {*} fn 
 */
function manageModelUpdate(model, modelDef, Model, fn) {
  return new Promise((res, rej) => {
    
    checkAndCreateTable(model, modelDef, Model)
      .then((obj) => {
        console.log(obj);
    
        // Now that the table exists we can insert items using function
        // models and data provided.
        return fn(data[model], Model);
      })
      .then(({ updates, errors, noChange}) => {
        console.log(`!! => Updated ${updates.length} Items. <= !!`);
        console.log(`!! => ${noChange.length} items did not change. <= !!`);
        console.log(`!! => ${errors.length} Errors Encountered! <= !!`);
    
        res();
      })
      .catch(err => rej(err));
  });
}

/**
 * Check if table exists, create if not
 */ 
function checkAndCreateTable(model, modelDef, Model) {
  return new Promise((res, rej) => {
    if (!db.isDefined(model)) {
      rej(new Error(model + ' is NOT defined!'));
    } else {

      db.query(
          `SELECT EXISTS (
            SELECT 1 
            FROM   pg_catalog.pg_class c
            JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE  n.nspname = 'public'
            AND    c.relname = '${model}'
            AND    c.relkind = 'r'    -- only tables ...(?)
          );`
        )
        .spread((results, metadata) => {
          console.log(results);
          console.log(metadata);

          return createTable();
        })
        .then((obj) => {
          res(obj);
        })
        .catch((err) => {
          rej(err);
        });
    
    }
  });
  
  /**
   * Create Table if it doesn't exist
   */
  function createTable() {
    return new Promise((res, rej) => {
      db.getQueryInterface()
        .createTable(
          model,
          modelDef,
          {
            engine: 'postgres',
            charset: 'utf-8',
            schema: 'public'
          },
          Model
        ).
        then(() => {
          res({
            message: '=> Model defined, table Created! <=',
            status: true
          });
        })
        .catch(err => {
          console.error(err);
          
          rej(err);
        });
    });
  }
}

/*
  ######################################
  #                                    #
  #  Players model Specific functions  #
  #                                    #
  ######################################
*/

/**
 * Takes an array of player items, and initiates batchInsert process 
 * with necessary transform.
 * @param {array} players 
 */
function insertPlayerData(players) {
  return new Promise((res, rej) => {

    // adds Model and transfrom function before processing as batch
    batchInsert(players, Players, transformPlayer)
      .then(result => res(result))
      .catch(err => rej(err));

  });  
}
/**
 * takes a player item and transforms it to conform with 
 * Players data Model
 * @param {object} player 
 */
function transformPlayer(player) {
  
  let newPlayer = Object.assign({}, player);

  // Convert strings to floats
  const floats = [
    'creativity', 'ep_next', 'ep_this', 'form', 'ict_index',
    'influence', 'points_per_game', 'selected_by_percent',
    'threat', 'value_form', 'value_season' 
  ];

  floats.forEach((v) => {
    newPlayer[v] = parseFloat(player[v]);
  });

  // Convert date field
  newPlayer.news_added = new Date(player.news_added);

  return newPlayer;
}

/*
  ######################################
  #                                    #
  #   Teams model Specific functions   #
  #                                    #
  ######################################
*/

/**
 * Takes an array of player items, and initiates batchInsert process 
 * with necessary transform.
 * @param {array} teams
 */
function insertTeamData(teams) {
  return new Promise((res, rej) => {

    // adds Model and transfrom function before processing as batch
    batchInsert(teams, Teams, transformTeam)
      .then(result => res(result))
      .catch(err => rej(err));

  });  
}
/**
 * takes a player item and transforms it to conform with 
 * Players data Model
 * @param {object} team 
 */
function transformTeam(team) {
  let newTeam = Object.assign({}, team);

  console.log(team);

  newTeam.current_event_fixture = team.current_event_fixture.map(v => v.id);
  newTeam.next_event_fixture = team.next_event_fixture.map(v => v.id);

  console.log(newTeam);
  return newTeam;
}

/*
  ########################################
  #                                      #
  #  Gameweeks model Specific functions  #
  #                                      #
  ########################################
*/

/**
 * Takes an array of Gameweek items, and initiates batchInsert process 
 * with the necessary transform.
 * @param {array} gameweeks 
 */
function insertGameweekData(gameweek) {
  return new Promise((res, rej) => {

    // adds Model and transfrom function before processing as batch
    batchInsert(gameweek, Gameweeks, transformGameweek)
      .then(result => res(result))
      .catch(err => rej(err));

  });  
}
/**
 * takes a player item and transforms it to conform with 
 * Players data Model
 * @param {object} gameweek
 */
function transformGameweek(gameweek) {
  
  let newGameweek = Object.assign({}, gameweek);

  // Convert date field
  newGameweek.deadline_time = new Date(newGameweek.deadline_time);

  return newGameweek;
}


/*
  ########################################
  #                                      #
  #   Insert Clean Items into DB Table   #
  #                                      #
  ########################################
*/

/**
 * Takes data and inserts into db using given model, transforming data
 * if necessary.
 * @param {array} data - an array of data items to insert using the Model
 * @param {model} Model - A Sequelize Model
 * @param {function} fn - a function to transform the array items to conform to Model
 *   definition.
 */
function batchInsert(data, Model, fn) {
  return new Promise((res) => {

    // capture and categorise the results of the data.
    const updates = [];
    const errors = [];
    const noChange = [];
    
    // this defines what to do to each item in the queue
    const q = async.queue(function manageQ(item, cb) {
      
      // transform if transform function provided
      const cleanItem = fn ? fn(item): item;
      
      insertItem(cleanItem, Model)
        .then(({ updated, processed, itemId }) => { 

          if (updated === 1 ) {

            // has item been updated
            updates.push(itemId);

          } else if (processed === 1) {
            // has item been processed but not updated
            noChange.push(itemId);

          } else {
            // item has an error
            errors.push(itemId);
          }
          
          cb(null, item);
        })
        .catch(err => {
          console.log(err);

          errors.push(item.id);
          cb(err, item.id);
        });
      
    }, 10);
    
    // This runs after all items are processed
    q.drain = function queueFinished() {
      res({
        updates,
        errors,
        noChange
      });
    };
    
    // This runs after each item has been processed
    q.push(data, function processItem(err, item) {
      if (err) {
        console.log(`## Error processing ${item.id}!`);
      } else { 
        console.log(`Successfully processed ${item.id}!`);
      }
    });
    
  });
}

/**
 * Takes an item to insert and a Model to use to control the insert
 * @param {object} item 
 * @param {model} Model 
 */
function insertItem(item, Model) {
  return new Promise((res) => {
    let updated = 0;
    let processed = 1;
    
    // check for existence of player, update, or create
    Model.findOrCreate({ where: {id: item.id}, defaults: item })
      .then(([foundItem, status]) => {
        
        // if no changes where made
        if (!status) {
          console.log(`player ${foundItem.id} was NOT updated!`);
        } else { 
          // else record that player was updated.
          console.log(`player ${foundItem.id} was updated!`);
          updated++;
        }
        
        res({ updated, processed, itemId: item.id });

      })
      .catch((err) => {

        // handle error but continue with rest of queue
        console.error(err);
        
        res({ updated: 0, processed: 0, item: item.id });
      });
  });
}
