'use strict';

module.exports = {
  capitalise,
  compareShallowArrays,
  constructSimpleNumberArray,
};

/**
 * Takes a string returns a word where only the first character is capitalised
 * @param {string} string
 * @return {string}
 */
function capitalise(string) {
  return string[0].toUpperCase() + string.substring(1).toLowerCase;
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
