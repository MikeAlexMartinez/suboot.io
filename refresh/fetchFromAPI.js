'use strict';

// npm modules
const rp = require("request-promise");

const headerFields = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' + 
    ' (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
};

// This function sets the uri of the options
// object with the required uri and then return a
// json response or an error. 
function fetchFromAPI(uri, qS) {
  return new Promise((resolve, reject) => {
    console.log('Requesting: ' + uri);
    
    // set options for request
    const options = {
      uri: uri,
      qs: qS || '',
      headers: headerFields,
      json: true, // automatically parses the JSON string in the response
    };
    
    // hit API
    rp(options)
      .then(success)
      .catch(error);
    
    function success(data) {
      return resolve(data);
    }
    
    function error(err) {
      return reject(err);
    }
  });
}

module.exports = fetchFromAPI;