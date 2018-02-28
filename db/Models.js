'use strict';

const fs = require('fs');
const path = require('path');

const decamelize = require('decamelize');

const db = require('./connect');

const models = fs.readdirSync(path.resolve(__dirname, 'models'));

models.forEach((v) => {
  const model = require(path.resolve(__dirname, 'models', v));
  module.exports[stripFileEnding(v)] = db.define(clean(v), model);
});

/**
 * returns string in snake case with .js file ending removed
 * @param {string} string
 * @return {string}
 */
function clean(string) {
  return stripFileEnding(decamelize(string));
}

/**
 * returns string with last three characters removed
 * @param {string} string
 * @return {string}
 */
function stripFileEnding(string) {
  return string.substr(0, string.length - 3);
}
