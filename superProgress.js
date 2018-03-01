'use strict';

const {Progress} = require('super-progress');
const {clearInterval, setTimeout} = require('timers');
// Defines end of line marker
const {EOL} = require('os');

const async = require('async');

const {constructSimpleNumberArray} = require('./refresh/helpers/general');

let n = 400;

let tasks = constructSimpleNumberArray(1, n);

const pbOptions = {
  total: tasks.length,
  pattern: `[{spinner}] {bar} | Elapsed: {elapsed} | {percent}`,
  renderInterval: 33,
};

const pb = Progress.create(process.stdout.columns - 1, pbOptions);

const q = async.queue((n, cb) => {
  // create random delay to see progress bar in action
  let delay = Math.floor((Math.random() * 0.5) * n) + 0;

  setTimeout(function() {
    cb(null);
  }, delay);
}, 10);

q.drain = function tasksFinished() {
  // All finished
  pb.tick()
    .then(() => {
      process.stdout.write(EOL);
    });
};

q.push(tasks, function processN(err, item) {
  // item processed, so add tick to progress bar.
  pb.tick();
});

/* Example from docs
let t = setInterval(() => {
  pb.tick(10)
    .then(() => {
      if (pb.state.percentComplete >= 1.0) {
        clearInterval(t);
        // end process and create os specific linebreak
        process.stdout.write(EOL);
      }
    });
}, 100);
*/
