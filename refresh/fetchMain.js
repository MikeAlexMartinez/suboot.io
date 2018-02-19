'use strict';

const async = require('async');

const { Player, Gameweek, Team } = require('../db/Models');

const fetchFromAPI = require('./fetchFromAPI');

const MAIN = 'https://fantasy.premierleague.com/drf/bootstrap-static';

getMainData();

function getMainData() {
  return new Promise((res, rej) => {
    fetchFromAPI(MAIN)
      .then((data) => {
        
        const { elements: players, teams, events: gameweeks } = data;

        console.log(players.length);
        console.log(teams.length);
        console.log(gameweeks.length);

      })
      .catch(err => {
        console.error(err);
        
        process.exit(1);
      });
  });
}