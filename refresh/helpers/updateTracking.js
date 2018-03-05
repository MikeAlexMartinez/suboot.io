'use strict';

/* eslint no-unused-vars: [
    "error", { "varsIgnorePattern": "updatedAt|createdAt" }
  ]
*/

const async = require('async');
const deepEquals = require('fast-deep-equal');

const {UpdateHeaders,
       UpdateDetails} = require('../../db/Models');

const {createDateId} = require('./general');

const TIMEOFUPDATE = new Date();

module.exports = {
  compareItems,
  processUpdate,
  cleanNewItem,
};

/**
 * converts specified items to appropriate format
 * @param {object} item
 * @return {object}
 */
function cleanNewItem(item) {
  const conversions = ['player_id', 'gameweek_id'];
  let cleanItem = {};

  let keys = Object.keys(item);

  keys.forEach((key) => {
    if (conversions.indexOf(key) !== -1) {
      cleanItem[key] = parseInt(item[key]);
    } else {
      cleanItem[key] = item[key];
    }
  });

  return cleanItem;
}

/**
 * compares two objects and returns whether the object has changed
 * and an object of values that have changed.
 * @param {object} previousItem - the values that the item currently has
 * @param {object} newItem - the new values
 * @return {{ isChanged: boolean, updatedItem: object }}
 */
function compareItems(previousItem, newItem) {
  let {createdAt, updatedAt, ...pI} = previousItem;
  let updatedItem = {id: previousItem.id};
  let isChanged = false;

  const pKeys = Object.keys(pI);
  const nKeys = Object.keys(newItem);

  // Check that the items have the same set of keys
  if (nKeys.length !== pKeys.length) {
    // find missing keys
    const missingKeys = compareShallowArrays(pKeys, nKeys);

    // log missing keys to be added in later.
    console.log(missingKeys);
  }

  // compare each item
  pKeys.forEach((v) => {
    if (!deepEquals(pI[v], newItem[v])) {
      updatedItem[v] = newItem[v];
      isChanged = true;
    }
  });

  return {isChanged, updatedItem};
}

/*
  ########################################
  #                                      #
  #           Process Updates            #
  #                                      #
  ########################################
*/

/**
 * captures when db values change, and records in db tables
 * @param {object} previousItem
 * @param {object} updatedItem
 * @param {string} name
 * @return {promise}
 */
function processUpdate(previousItem, updatedItem, name) {
  return new Promise((res) => {
    const {id, ...upItem} = updatedItem;
    const updatedKeys = Object.keys(upItem);

    // this defines what to do to each item in the queue
    const updateQ = async.queue(function manageUpdateQ(key, cb) {
      let headerId = `${createDateId(TIMEOFUPDATE)}-${name}-${key}`;
      const header = {
        id: headerId,
        time_of_update: TIMEOFUPDATE,
        model: name,
        key_updated: key,
      };

      // check if this key has been updated during this
      // update process
      UpdateHeaders.findOrCreate({
          where: header,
          defaults: {
            ...header,
            occurences: 1,
          },
        })
        .then(([foundItem, status]) => {
          // items exists
          if (!status) {
            // If so increment occurences
            foundItem.increment('occurences', {by: 1})
              .then(() => {
                // Then create detail entry
                return createUpdateDetail(
                  foundItem,
                  previousItem[key],
                  updatedItem[key],
                  name,
                  id
                );
              })
              .then(() => {
                cb(null);
              })
              .catch((err) => {
                cb(err, foundItem);
              });
          } else {
            // create detail entry
            createUpdateDetail(
                foundItem,
                previousItem[key],
                updatedItem[key],
                name,
                id
              )
              .then(() => {
                cb(null);
              })
              .catch((err) => {
                cb(err, foundItem);
              });
          }
        })
        .catch((err) => cb(err, 0));
    }, 1);

    // This runs after all items are processed
    updateQ.drain = function updateQueueFinished() {
      res();
    };

    // This runs after each item has been processed
    updateQ.push(updatedKeys, function processItem(err) {
      if (err) {
        console.error(err);
        // console.log(`## Error processing ${item.id}!`);
      } else {
        // console.log(`Successfully added header ${item.id}!`);
      }
    });
  });
}

/**
 * creates accompanying update_detail entry to accompay update_header
 * @param {*} foundItem
 * @param {*} prevVal
 * @param {*} updatedVal
 * @param {*} name
 * @param {*} itemId
 * @return {promise}
 */
function createUpdateDetail(foundItem, prevVal, updatedVal, name, itemId) {
  return new Promise((res, rej) => {
    // All value stored in these columns as strings.
    const newVal = updatedVal ? updatedVal.toString() : 'null';
    const oldVal = prevVal ? prevVal.toString() : 'null';
    let diff;

    // diff is a number, and so only provide value if values are numbers.
    if (typeof prevVal === 'number' || typeof updatedVal === 'number') {
      diff = updatedVal - prevVal;
    }

    const updatedDetails = {
      header_id: foundItem.id,
      model: name,
      item_id: itemId,
      new_val: newVal,
      old_val: oldVal,
      difference: diff,
    };

    UpdateDetails.create(updatedDetails, {returning: true})
      .then(() => {
        res(null);
      })
      .catch((err) => {
        rej(err);
      });
  });
}
