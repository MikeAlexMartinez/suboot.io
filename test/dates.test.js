'use strict';

const assert = require('assert');
const moment = require('moment');
const {
  fetchTimeToNext,
  match,
  lastWeek,
  displayDate,
  determineCurrentDay,
  determineNextDay,
} = require('../utils/dates');

const seconds = 1000;
const minutes = 60 * seconds;

describe('dates helpers ---> ', () => {
  describe('fetchTimeToNext()', () => {
    it('should calculate the milliseconds until the next defined period' +
      ' (5 minutes)',
      () => {
        const now = moment('2018-01-01 00:02:30.000');

        // five minutes past
        const expected = (2 * minutes) + (30 * seconds);

        assert.equal(fetchTimeToNext(5, now), expected,
          'expected duration to next 5 minute period to be returned'
        );
      }
    );

    it('should calculate the milliseconds until the next defined period' +
      ' (20 minutes)',
      () => {
        const now = moment('2018-01-01 00:07:22.000');

        // difference to 20 minutes past
        const expected = (12 * minutes) + (38 * seconds);

        assert.equal(fetchTimeToNext(20, now), expected,
          'expected duration to next 20 minute period to be returned'
        );
      }
    );

    it('should calculate the milliseconds until the next defined period' +
    ' (60 minutes)',
      () => {
        const now = moment('2018-01-01 00:07:22.000');

        // difference to 60 minutes past (next hour)
        const expected = (52 * minutes) + (38 * seconds);

        assert.equal(fetchTimeToNext(60, now), expected,
          'expected duration to next 60 minute period to be returned'
        );
      }
    );

    it('if a number that isn\'t a factor of 60 is provided an error' +
      ' should be returned',
      () => {
        assert.throws(() => fetchTimeToNext(58), Error,
          'expected an Error to be thrown'
        );
      }
    );

    it('if a number larger than 60 is provided, an error should be thrown',
      () => {
        assert.throws(() => fetchTimeToNext(80), Error,
          'Expected Error to be thrown'
        );
      }
    );
  });

  describe('match()', () => {
    it('should identify two dates that are the same', () => {
      const dateA = new Date;
      const dateB = new Date;

      assert.equal(
        match(dateA, dateB),
        true,
        'should match two dates that are the same'
      );
    });

    it('should identify two dates that are the same day but with ' +
       'different times', () => {
      const dateA = new Date('December 31, 1975, 11:15:30 GMT+11:00');
      const dateB = new Date('December 31, 1975, 12:15:30 GMT+11:00');

      assert.equal(
        match(dateA, dateB),
        true,
        'should match two dates that are the same'
      );
    });

    it('should identify two dates that aren\'t the same', () => {
      const dateA = new Date(2017, 10, 1);
      const dateB = new Date(2017, 9, 1);

      assert.equal(match(dateA, dateB), false, 'Expected false');
    });
  });

  describe('lastWeek()', () => {
    it('should create 7 day date range from midnight tonight to midnight' +
       ' 6 days ago',
      (done) => {
        const sevenDays = lastWeek(moment('2018-01-29', 'YYYY-MM-DD'));

        assert.equal(
          sevenDays.startDate,
          '2018-01-23T00:00:00Z',
          'date strings should match'
        );
        assert.equal(
          sevenDays.endDate,
          '2018-01-30T00:00:00Z',
          'date strings should match'
        );

        done();
      }
    );

    it('should create 7 day date range from midnight tonight to midnight' +
       ' 6 days ago',
      (done) => {
      const newWeek = lastWeek(moment('2018-01-01', 'YYYY-MM-DD'));

      assert.equal(
        newWeek.startDate,
        '2017-12-26T00:00:00Z',
        'date strings should match'
      );
      assert.equal(
        newWeek.endDate,
        '2018-01-02T00:00:00Z',
        'date strings should match'
      );

      done();
    });

    it('should create 7 day date range from midnight tonight to midnight 6' +
       ' days ago',
      (done) => {
      const newWeek = lastWeek(moment('2018-01-30', 'YYYY-MM-DD'));

      assert.equal(
        newWeek.startDate,
        '2018-01-24T00:00:00Z',
        'date strings should match'
      );
      assert.equal(
        newWeek.endDate,
        '2018-01-31T00:00:00Z',
        'date strings should match'
      );

      done();
    });

    it('should create 7 day date range from midnight tonight to' +
       ' midnight 6 days ago',
      (done) => {
        const newWeek = lastWeek(moment('2018-01-30', 'YYYY-MM-DD'));

        assert.equal(
          newWeek.startDate,
          '2018-01-24T00:00:00Z',
          'date strings should match'
        );
        assert.equal(
          newWeek.endDate,
          '2018-01-31T00:00:00Z',
          'date strings should match'
        );

        done();
    });
  });

  describe('displayDate()', () => {
    it('should return a date in the format "D / M / YY"', (done) => {
      const now = new Date(2018, 0, 31);
      const test = displayDate(now, 'D / M / YY');
      const expected = '31 / 1 / 18';

      assert.equal(test, expected, `Expected ${test} to equal ${expected}`);

      done();
    });
  });

  describe('determineCurrentDay()', () => {
    it('should return moment when currentDate is present', () => {
      const todayFormatted = moment().format('YYYY-MM-DD');
      const today = moment(todayFormatted);
      const dates = ['2017-12-01', todayFormatted, '2017-03-10'];
      const currentDate = determineCurrentDay(dates);

      assert.equal(
        currentDate instanceof moment,
        true,
        'expected date returned to be Moment date instance'
      );

      assert.deepEqual(
        today,
        currentDate,
        'expected date returned to be same as today'
      );
    });

    it('should return null if today is not passed', () => {
      const oldDates = ['2017-12-01', '2018-04-07'];
      const currentDate = determineCurrentDay(oldDates);

      assert.equal(currentDate, null, 'expected date to be null');
    });
  });

  describe('determineNextDay()', () => {
    describe('should identify when later day is present', () => {
      const todayFormatted = moment().format('YYYY-MM-DD');
      const tomorrowFormatted = moment().add(1, 'd').format('YYYY-MM-DD');
      const tomorrow = moment(tomorrowFormatted);
      const dates = ['2017-08-01', todayFormatted, tomorrowFormatted];
      const nextDay = determineNextDay(dates);

      it('returns an instance of a moment', () => {
        assert.equal(
          nextDay instanceof moment,
          true,
          'expected returned date to be an instance of a moment'
        );
      });

      it('returns a date equal to tomorrow', () => {
        assert.deepEqual(
          nextDay,
          tomorrow,
          'expected returned date to be equal to tomorrow'
        );
      });
    });

    describe('should identify when no future date is present', () => {
      const todayFormatted = moment().format('YYYY-MM-DD');
      const dates = ['2018-04-07', '2017-08-01', todayFormatted];
      const nextDay = determineNextDay(dates);

      it('should return null', () => {
        assert.equal(
          nextDay,
          null,
          'expected returned date to be null'
        );
      });
    });

    describe('where multiple future dates are present should return ' +
      'closest future date', () => {
      const todayFormatted = moment().format('YYYY-MM-DD');
      const tomorrowFormatted = moment().add(1, 'd').format('YYYY-MM-DD');
      const tomorrow = moment(tomorrowFormatted);
      const laterFormatted =
        tomorrow.clone().add(3, 'd').format('YYYY-MM-DD');
      const dates = [
        '2017-08-01',
        todayFormatted,
        tomorrowFormatted,
        laterFormatted];
      const nextDay = determineNextDay(dates);

      it('returns an instance of a moment', () => {
        assert.equal(
          nextDay instanceof moment,
          true,
          'expected returned date to be an instance of a moment'
        );
      });

      it('returns a date equal to tomorrow', () => {
        assert.deepEqual(
          nextDay,
          tomorrow,
          'expected returned date to be equal to tomorrow'
        );
      });
    });
  });
});
