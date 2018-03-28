'use strict';

const assert = require('assert');
const {createTables} = require('../utils/tables');

const teams = require('./data/testTeamData.json');
const fixtures = require('./data/testFixtureData.json');

const {all: {home: homeAll, away: awayAll, total: totalAll},
       range: {home: homeRange, away: awayRange, total: totalRange},
       lastX: {home: homeX, away: awayX, total: totalX}}
       = require('./data/tableExpectations.json');

describe('createTable() (after gameweek 31)', () => {
  /* describe('testing result with all as true', () => {
    const {home: homeTable, away: awayTable, total: totalTable} = createTables({
      teams,
      fixtures,
      all: true,
    });

    it('should calculate correct total table', () => {
      assert.deepEqual(totalTable[0], totalAll.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(totalTable[19], totalAll.westBrom,
        'total table should return west brom stats as defined.'
      );
    });

    it('should calculate the correct home table', () => {
      assert.deepEqual(homeTable[0], homeAll.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(homeTable[19], homeAll.westBrom,
        'total table should return west brom stats as defined.'
      );
    });

    it('should calculate the correct away table', () => {
      assert.deepEqual(awayTable[0], awayAll.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(awayTable[19], awayAll.westBrom,
        'total table should return west brom stats as defined.'
      );
    });
  });

  describe('testing with a range of fixtures, Gameweeks 11-20', () => {
    const {home: homeTable, away: awayTable, total: totalTable} = createTables({
      teams,
      fixtures,
      all: false,
      range: true,
      start: 11,
      end: 20,
    });

    it('should calculate correct total table', () => {
      assert.deepEqual(totalTable[0], totalRange.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(totalTable[19], totalRange.newcastle,
        'total table should return west brom stats as defined.'
      );
    });

    it('should calculate the correct home table', () => {
      assert.deepEqual(homeTable[0], homeRange.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(homeTable[19], homeRange.newcastle,
        'total table should return west brom stats as defined.'
      );
    });

    it('should calculate the correct away table', () => {
      assert.deepEqual(awayTable[0], awayRange.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(awayTable[12], awayRange.newcastle,
        'total table should return west brom stats as defined.'
      );
    });
  });
*/

  describe('testing with a last X fixtures, X = 5', () => {
    const {home: homeTable, away: awayTable, total: totalTable} = createTables({
      teams,
      fixtures,
      all: false,
      range: false,
      lastXGames: 5,
    });
    console.log(totalTable.map((t) => t.teamName));
    console.log(homeTable.map((t) => t.teamName));
    console.log(awayTable.map((t) => t.teamName));

    it('should calculate correct total table', () => {
      assert.deepEqual(totalTable[1], totalX.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(totalTable[2], totalX.liverpool,
        'total table should return west brom stats as defined.'
      );
    });

    it('should calculate the correct home table', () => {
      assert.deepEqual(homeTable[0], homeX.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(homeTable[1], homeX.liverpool,
        'total table should return west brom stats as defined.'
      );
    });

    it('should calculate the correct away table', () => {
      assert.deepEqual(awayTable[1], awayX.manCity,
        'total table should return man city stats as defined.'
      );
      assert.deepEqual(awayTable[3], awayX.liverpool,
        'total table should return west brom stats as defined.'
      );
    });
  });
});
