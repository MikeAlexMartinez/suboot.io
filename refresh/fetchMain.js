'use strict';

const async = require('async');

const db = require('../db/connect');
const player = require('../db/models/Player');
const gameweek = require('../db/models/Gameweek');
const team = require('../db/models/Team');

let data;
const fetchFromAPI = require('./fetchFromAPI');

const MAIN = 'https://fantasy.premierleague.com/drf/bootstrap-static';

getMainData();

function getMainData() {
  return new Promise((res, rej) => {
    fetchFromAPI(MAIN)
      .then((d) => {
        
        data = d;

        return insertPlayerData();
      })
      .then((err, count) => {

        console.log(err);
        console.log('Inserted Players');
      })
      .catch(err => {
        console.error(err);
        
        process.exit(1);
      });
  });
}

function insertPlayerData() {
  return new Promise((res, rej) => {
    const Player = db.define('player', player);
      
    const itemsToInsert = data.elements.length;
    const itemsInserted = [];
    const errors = [];

    const q = async.queue(function manageQ(item, cb) {
      console.log(transformPlayer(item).id);

      Player.sync({ force: true, alter: true })
        .then(() => {
          return Player.build(item).save();
        })
        .then((newInstance) => {
          return cb(null, newPlayer);
        })
        .catch((err) => {
          errors.push(item);
          
          q.kill();
          
          rej(err);
        });
      
    }, 10);
      
    q.drain = function drain() {
      if (errors.length > 0) {
        res(errors, itemsInserted);
      } else {
        res(null, itemsInserted);
      }
    };
    
    q.push(data.elements, function processItem(err, item) {
      if (err) {
        console.log(`${errors.length} errors encountered`);
      } else {
        console.log(`inserted ${itemsInserted.length} items.`);
        itemsInserted.push(item);
      }
    });
  });
}

function transformPlayer(player) {

  let newPlayer = {
    ...player,
    creativity: parseFloat(player.creativity),
    ep_next: parseFloat(player.ep_next),
    ep_this: parseFloat(player.ep_this),
    form: parseFloat(player.form),
    ict_index: parseFloat(player.ict_index),
    influence: parseFloat(player.influence),
    points_per_game: parseFloat(player.points_per_game),
    selected_by_percent: parseFloat(player.selected_by_percent),
    threat: parseFloat(player.threat),
    value_form: parseFloat(player.value_form),
    value_season: parseFloat(player.value_season),
    news_added: Date(player.news_added), 
  };

  return newPlayer;
}
