'use strict';

const assert = require('assert');
const {createTables} = require('./tableUtils');

const teams = require('./data/testTeamData.json');
const fixtures = require('./data/testFixtureData.json');

describe('createTable() (after gameweek 31)', () => {
  describe('testing result with all as true', () => {
    const manCityTotal = {
      teamName: 'Man City',
      key: 'MCI',
      played: 30,
      won: 26,
      draw: 3,
      lost: 1,
      for: 85,
      against: 20,
      goal_difference: 65,
      points: 81,
      form: [
        'W', 'W', 'W', 'W', 'D', 'W', 'W', 'L', 'W', 'D',
        'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W',
        'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'D', 'W'],
    };
    const westBromTotal = {
      teamName: 'West Brom',
      key: 'WBA',
      played: 31,
      won: 3,
      draw: 11,
      lost: 17,
      for: 24,
      against: 49,
      goal_difference: -25,
      points: 20,
      form: [
        'L', 'L', 'L', 'L', 'L', 'L', 'L', 'D', 'W', 'L', 'D',
        'D', 'L', 'L', 'D', 'L', 'D', 'D', 'D', 'L', 'L',
        'L', 'L', 'D', 'D', 'L', 'D', 'L', 'D', 'W', 'W',
      ],
    };

    const {home, away, total} = createTables({
      teams,
      fixtures,
      all: true,
    });

    it('should calculate correct total table', () => {
      assert.deepEqual(total[0], manCityTotal,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(total[19], westBromTotal,
        'total table should return west brom stats as defined.'
      );
    });

    it('should calculate the correct home table', () => {

    });

    it('should calculate the correct away table', () => {
      
    });
  });

  describe('testing with a range of fixtures, 10-20', () => {

  });
});
