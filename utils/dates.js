'use strict';

const moment = require('moment');

/**
 * takes ordered (earliest first) array of date strings and returns
 * the next closest future date. If no future date present return null.
 * @param {array} gamedays
 * @return {moment|null}
 */
exports.determineNextDay = function(gamedays) {
  let nextGameDay = null;
  const today = moment().format('YYYY-MM-DD');

  gamedays.some((date) => {
    let day = moment(date);
    if (day.isAfter(today)) {
      nextGameDay = day;
      return true;
    }
    return false;
  });

  return nextGameDay;
};

/**
 * takes array of date strings and returns current date as moment
 * or null if today isn't present.
 * @param {array} gamedays
 * @return {moment|null}
 */
exports.determineCurrentDay = function(gamedays) {
  let currentGameday = null;
  const today = moment().format('YYYY-MM-DD');

  gamedays.some((date) => {
    let day = moment(date);
    if (day.isSame(today)) {
      currentGameday = day.clone();
      return true;
    }
    return false;
  });

  return currentGameday;
};

/**
 * This function returns the number of milliseconds
 * until the next 20 / 40 minutes past the hour. or
 * on the hour.
 * @param {number} n - how often to run the task in minutes,
 * should be a factor of 60 (so it can be run on the hour)
 * @param {moment} time - moment date object (defaults to now)
 * @return {number} - returns number of milliseconds
 * until the next time the main task should be run
 */
exports.fetchTimeToNext = function(n, time) {
  // check n is a factor of 60
  if (60 % n !== 0) {
    throw new Error('parameter n needs to be a factor of 60');
  }

  // get current time if not set
  const now = time || moment().add(1, 'ms');

  // calculate next target minutes
  const fraction = now.minutes() % n === 0
    ? ((now.minutes() + 0.5) / n)
    : (now.minutes() / n);
  const minutes = Math.ceil(fraction) * n;
  const target = now.clone().minutes(minutes).second(0).millisecond(0);

  // calculate difference in milliseconds
  return moment.duration(target.diff(now)).asMilliseconds();
};

const prependZero = (val) => val.toString().length < 2 ? `0${val}` : val;

exports.tsFormat = () => (new Date()).toISOString();

exports.fileDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${prependZero(date.getMonth()+1)}-`;
};

/**
 * takes two dates and matches if day, month and year are the same
 * @param {Date} dateA
 * @param {Date} dateB
 * @return {Boolean}
 */
exports.match = (dateA, dateB) => {
  if (dateA.getUTCDate() !== dateB.getUTCDate() ||
      dateA.getUTCMonth() !== dateB.getUTCMonth() ||
      dateA.getUTCFullYear() !== dateB.getUTCFullYear()) {
    return false;
  } else {
    return true;
  }
};

/**
 * Returns object with startDate and endDate that encompasses
 * last 7 days including today
 * @param {Date} [target] - the current date from which to calculate 7 days
 * @return {{startDate: String, endDate: String}}
 */
exports.lastWeek = (target=moment()) => {
  const endDate = target.add(1, 'days').utc().format();
  const startDate = target.add(-7, 'days').utc().format();

  return {
    startDate: startDate,
    endDate: endDate,
  };
};

/**
 * Takes a date object and returns a string in the format ""
 * @param {Date} date - The date being passed
 * @param {String} string - outlines format to return
 * @return {String}
 */
exports.displayDate = (date, string) => {
  const mom = moment(date);
  const retStr = mom.format(string);
  return retStr;
};
