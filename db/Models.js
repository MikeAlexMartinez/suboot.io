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

function clean(string) {
  return stripFileEnding(decamelize(string));
}

function stripFileEnding(string) {
  return string.substr(0, string.length - 3);
}
