'use strict';

const fs = require('fs');
const path = require('path');

const fixtures = require('./nextFixturesGW33');

const cleanFixtures = fixtures.map(({stats, ...rest}) => ({...rest}));

/**
 */
function writeDataFile() {
  fs.writeFile(
    path.resolve('nextFixtures33.json'),
    JSON.stringify(cleanFixtures, null, 2),
    (err) => {
      if (err) {
        console.error(err);
      }

      console.log('Created File succcessfully!');
    }
  );
}

writeDataFile();
