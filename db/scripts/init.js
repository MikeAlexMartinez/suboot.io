'use strict';

// Models that use Seed Data
const playerType = require('../models/PlayerType');
const formation = require('../models/Formation');
const bonusPointsSystem = require('../models/BonusPointsSystem');
const phase = require('../models/Phase');
const statsItems = require('../models/StatsItems');
const pointsItems = require('../models/PointsItems');
const scoringSystem = require('../models/ScoringSystem');

const db = require('../connect');

const data = require('./seedData');

/**
 * This file creates and initializes the database with starting data.
 *
 * Tables that are to be seeded with data are as follows:
 * - player_types
 * - formations
 * - bonus_points_systems
 * - phases
 * - stat_items
 * - scoring_items
 * - scoring_systems
 *
 */

db
  .authenticate()
  .then(() => {
    console.log('Connection to database established successfully');
    return Promise.resolve();
  })
  .then(() => {
    return createAndSeedModel('player_type', playerType, data.playerType);
  })
  .then(() => {
    return createAndSeedModel('formation', formation, data.formation);
  })
  .then(() => {
    return createAndSeedModel(
      'bonus_points_system',
      bonusPointsSystem,
      data.bonusPointsSystem
    );
  })
  .then(() => {
    return createAndSeedModel('phase', phase, data.phase);
  })
  .then(() => {
    return createAndSeedModel('stats_item', statsItems, data.statsItems);
  })
  .then(() => {
    return createAndSeedModel('points_item', pointsItems, data.pointsItems);
  })
  .then(() => {
    return createAndSeedModel(
      'scoring_system',
      scoringSystem,
      data.scoringSystem
    );
  })
  .then(() => {
    console.log(`Database Initialization complete!`);

    process.exit();
  })
  .catch((err) => {
    console.error(`Unable to connect to database: ${err}`);

    process.exit(1);
  });

/**
 *
 * @param {string} modelName
 * @param {Model} model
 * @param {array} dataToInsert
 * @return {promise}
 */
function createAndSeedModel(modelName, model, dataToInsert) {
  return new Promise((res, rej) => {
    const Model = db.define(modelName, model);

    // Add default data to Player Type
    Model.sync({force: true, alter: true})
      .then(() => {
        return Model.bulkCreate(dataToInsert);
      })
      .then(() => {
        console.log(`${modelName}s updated succesfully`);

        res();
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}
