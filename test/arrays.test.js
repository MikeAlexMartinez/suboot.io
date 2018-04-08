'use strict';

const assert = require('assert');

const fixtures = require('./data/nextFixtures33.json');
const unfinishedFixtures = require('./data/unfinishedFixtures.json');
const {filterFixtures,
  determineGamedays} = require('../utils/arrays');

describe('Arrays', () => {
  describe('filterFixtures()', () => {
    it('should filter the fixtures into appropriate keys', () => {
      const sortedFixtures = filterFixtures(fixtures);
      const expectedUnfinished = [321, 324];
      const expectedProv = [327];
      const expectedFinished = [325, 322, 323, 326, 328, 329, 330];

      const finished = filterIds(sortedFixtures.finished);
      const unfinished = filterIds(sortedFixtures.unfinished);
      const finishedProvisional = filterIds(sortedFixtures.finishedProvisional);


      assert.deepEqual(
        finished,
        expectedFinished,
        'expected to retrieve finished fixture ids'
      );

      assert.deepEqual(
        unfinished,
        expectedUnfinished,
        'expected to retrieve unfinished fixture ids'
      );

      assert.deepEqual(
        finishedProvisional,
        expectedProv,
        'expected to retrieve finishedProvisional fixture ids'
      );

      /**
       * @param {array} arr
       * @return {array}
       */
      function filterIds(arr) {
        return arr.map((a) => a.id);
      }
    });
  });

  describe('determineGamedays()', () => {
    it('should take an array of fixtures and return sorted list of' +
      ' unique dates', () => {
        const result = determineGamedays(unfinishedFixtures);

        assert.deepEqual(
          result,
          ['2018-04-08',
            '2018-04-09',
            '2018-04-10',
            '2018-04-12'],
          'expected unique, sorted of moments'
        );
    });
  });
});

