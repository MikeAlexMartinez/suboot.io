'use strict';

const moment = require('moment');

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
  const now = time || moment();

  // calculate next target minutes
  let minutes = Math.ceil(now.minutes() / n) * n;
  let target = now.clone().minutes(minutes).second(0).millisecond(0);

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
