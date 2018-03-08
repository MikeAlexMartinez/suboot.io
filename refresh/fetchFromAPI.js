'use strict';

// npm modules
const rp = require('request-promise');

const headerFields = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/' +
    '537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
};


/**
 * This function sets the uri of the options object with the required
 * uri and then return a json response or an error.
 * @param {string} uri
 * @param {string} qS
 * @param {object} options - default true
 * @return {promise}
 */
function fetchFromAPI({uri, qS='', logging=true}) {
  return new Promise((resolve, reject) => {
    if (logging) {
      console.log('Requesting: ' + uri);
    }

    // set options for request
    const rpOptions = {
      uri: uri,
      qs: qS,
      headers: headerFields,
      json: true, // automatically parses the JSON string in the response
    };

    // hit API
    rp(rpOptions)
      .then(function success(data) {
        return resolve(data);
      })
      .catch(function error(err) {
        return reject(err);
      });
  });
}

module.exports = fetchFromAPI;
