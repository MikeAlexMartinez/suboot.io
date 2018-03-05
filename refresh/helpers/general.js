'use strict';

module.exports = {
  capitalise,
  compareShallowArrays,
  constructSimpleNumberArray,
  createDateId,
};

/**
 * Takes a string returns a word where only the first character is capitalised
 * @param {string} string
 * @return {string}
 */
function capitalise(string) {
  return string[0].toUpperCase() + string.substring(1).toLowerCase();
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

/**
 * Construct array with digits from start to end inclusive
 * @param {number} start
 * @param {number} end
 * @return {array}
 */
function constructSimpleNumberArray(start, end) {
  let arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
}

/**
 * returns string from date in format "YYYY-MM-DD-HH:MM"
 * @param {date} date
 * @return {string}
 */
function createDateId(date) {
  const year = date.getFullYear().toString();
  const month = appendZero(date.getMonth() + 1);
  const day = appendZero(date.getDate());
  const hours = appendZero(date.getHours());
  const minutes = appendZero(date.getMinutes());

  return `${year}-${month}-${day}-${hours}:${minutes}`;
}

/**
 * converts single digit number into two digits
 * by prepending a 0 to the number provided
 * @param {number} n
 * @return {string}
 */
function appendZero(n) {
  return n.toString().length < 2
    ? `0${n}`
    : n.toString();
}
