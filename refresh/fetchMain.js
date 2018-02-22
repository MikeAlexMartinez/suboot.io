/*jshint camelcase: false */

'use strict';

// External libs
const async = require('async');
const deepEquals = require('fast-deep-equal');

// Models and DB
const db = require('../db/connect');
const { Players, 
        Teams, 
        Gameweeks, 
        UpdateHeaders, 
        UpdateDetails } = require('../db/Models');
const playerDef = require('../db/models/Players');
const teamDef = require('../db/models/Teams');
const gameweekDef = require('../db/models/Gameweeks');
const updateHeaderDef = require('../db/models/UpdateHeaders');
const updateDetailDef = require('../db/models/UpdateDetails');

// API
const fetchFromAPI = require('./fetchFromAPI');
const MAIN = 'https://fantasy.premierleague.com/drf/bootstrap-static';

// global variabale to store data retrieved from API
const TIMEOFUPDATE = new Date();
let data;
let logs = [];

/*
  ##########################
  # MAIN FILE PROCESS HERE #
  ##########################
*/
console.log(TIMEOFUPDATE.toISOString());

getMainData()
  .then(() => {
    // set up update tables
    return generateUpdateTables();
  })
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
    return printLogs();
  })
  .then(() => process.exit(0))
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
      .then(() => {
        // console.log(obj);
    
        // Now that the table exists we can insert items using function
        // models and data provided.
        return fn(data[model], Model);
      })
      .then(({ updates, errors, noChange, isNew }) => {

        logs.push({
          name: model,
          results: [
            `!! => ${isNew.length} items were created. <= !!`,
            `!! => ${updates.length} items were updated. <= !!`,
            `!! => ${noChange.length} items did not change. <= !!`,
            `!! => ${errors.length} Errors Encountered! <= !!`
          ]
        });

        res();
      })
      .catch(err => rej(err));
  });
}

/**
 * prints all summary log items to screen after process has complete
 */
function printLogs() {
  return new Promise((res, rej) => {

    if (logs.length === 0) {

      rej( new Error('No logs were created'));
    } else {

      logs.forEach(v => {
        console.log(`=========== ${capitalise(v.name)} Summary ===========`);

        v.results.forEach(r => {
          console.log(r);
        });

        console.log('');
      });
      
      res();
    }
  });
}

function capitalise(string) {
  return string[0].toUpperCase() + string.substring(1);
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
        .spread((results) => {

          // if rowCount greater than 0 table exists
          if( results[0].exists ) {
            res({
              message: '=> Model defined, table already exists! <=',
              status: true
            });
          } else {
            return createTable();
          }
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
  #  Update models Specific functions  #
  #                                    #
  ######################################
*/

function generateUpdateTables() {
  return new Promise((res, rej) => {

    // create header table
    checkAndCreateTable('update_headers', updateHeaderDef, UpdateHeaders)
      .then(() => {
        return checkAndCreateTable('update_details', updateDetailDef, UpdateDetails);
      })
      .then(() => {
        // link models
        UpdateHeaders.hasMany(UpdateDetails, {foreignKey: 'header_id', sourceKey: 'id'});
        UpdateDetails.belongsTo(UpdateHeaders, {foreignKey: 'header_id', targetKey: 'id'});
      
        res();
      })
      .catch(err => {
        rej(err);
      });

  });
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

  newTeam.current_event_fixture = team.current_event_fixture.map(v => v.id);
  newTeam.next_event_fixture = team.next_event_fixture.map(v => v.id);

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
    const isNew = [];
    
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
          } else if (isNew === 1) {
            // Item is new
            isNew.push(itemId);
          } else {
            // item generated an error
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
        noChange,
        isNew,
      });
    };
    
    // This runs after each item has been processed
    q.push(data, function processItem(err, item) {
      if (err) {
        console.log(`## Error processing ${item.id}!`);
      } else { 
        // console.log(`Successfully processed ${item.id}!`);
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
    let isNew = 0;
    let processed = 1;

    // check for existence of player, update, or create
    Model.findOrCreate({ where: {id: item.id}, defaults: item })
      .then(([foundItem, status]) => {

        // player exists
        if (!status) {
          //console.log(`item ${foundItem.id} was NOT created!`);
          
          const { isChanged,  updatedItem } = compareItems(foundItem.dataValues, item);

          // if isChanged update new item
          if (isChanged) {
            
            Model.update(updatedItem, {
                where: {id: foundItem.id},
              })
              .then(([count, rows]) => {
                updated++;  
                // console.log(`item ${foundItem.id} WAS updated!`);


                // once updated store update in update header and detail
                return processUpdate(foundItem, updatedItem, Model.modelName);
              })
              .then(() => {
                res({ updated, processed, isNew, itemId: item.id });
              })
              .catch((err) => {
                console.error(err);
                
                res({ updated, processed: 0, isNew, itemId: item.id });
              });

          } else {
 
            
            //console.log(`item ${foundItem.id} was NOT updated!`);
            // return
            res({ updated, processed, isNew, itemId: item.id });
          }
        } else { 
          // else record that player was updated.
          //console.log(`item ${foundItem.id} WAS created!`);
          isNew++;
          
          res({ updated, processed, isNew, itemId: item.id });
        }
        
      })
      .catch((err) => {

        // handle error but continue with rest of queue
        console.error(err);
        
        res({ updated: 0, processed: 0, isNew: 0, item: item.id });
      });
  });
}

/**
 * compares two objects and returns whether the object has changed
 * and an object of values that have changed.
 * @param {object} previousItem - the values that the item currently has
 * @param {object} newItem - the new values
 * @returns {{ isChanged: boolean, updatedItem: object }}
 */
function compareItems(previousItem, newItem) {
  let { createdAt, updatedAt, ...pI } = previousItem;
  let updatedItem = {id: previousItem.id};
  let isChanged = false;

  const pKeys = Object.keys(pI);
  const nKeys = Object.keys(newItem);

  // Check that the items have the same set of keys
  if (nKeys.length !== pKeys.length) {

    // find missing keys
    const missingKeys = compareShallowArrays(pKeys, nKeys);

    // log missing keys to be added in later.
    console.log(missingKeys);
  }

  // compare each item
  pKeys.forEach((v) => {
    if (!deepEquals(pI[v], newItem[v])) {
      updatedItem[v] = newItem[v];
      isChanged = true;
    } 
  });

  return { isChanged, updatedItem };
}

/**
 * Takes two arrays scalar (not nested) arrays and returns unique values 
 * from each array as a nested array 
 * @param {array} arrA 
 * @param {array} arrB
 * @return {array.array} 
 */
function compareShallowArrays(arrA, arrB) {

  const filteredA = arrA.filter((v) => {
    return arrB.indexOf(v) === -1;
  });

  const filteredB = arrB.filter((v) => {
    return arrA.indexOf(v) === -1;
  });

  return [filteredA, filteredB];
}

/*
  ########################################
  #                                      #
  #           Process Updates            #
  #                                      #
  ########################################
*/

function processUpdate(previousItem, updatedItem, name) {
  return new Promise((res, rej) => {
    
    Object.keys(updatedItem).forEach((key) => {

      const header = {
        time_of_update: TIMEOFUPDATE,
        model: name,
        key_updated: key
      };
    
      // check if this key has been updated during this
      // update process
        // If so increment occurences
        // else
        // create new header entry
  
        // create detail item using id of header element.
    
    
    });

    
    res();
  });
}