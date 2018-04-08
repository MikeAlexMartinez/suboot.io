'use strict';

module.exports = {
  filterFixtures,
  determineGamedays,
};

/**
 * Takes unfinished fixtures and finds remaining
 * distinct gamedays
 * @param {array} fixtures
 * @return {array}
 */
function determineGamedays(fixtures) {
  const dates = new Set(fixtures.map((f) =>
    f.kickoff_time.substring(0, 10)
  ));
  return Array.from(dates).sort((a, b) => b - a);
}

/**
 * @param {array} fixtures
 * @return {object}
 */
function filterFixtures(fixtures) {
  let finished = [];
  let unfinished = [];
  let finishedProvisional = [];

  for ( let i = 0; i < fixtures.length; i++ ) {
    let fixture = fixtures[i];
    if (fixture.finished) {
      finished.push(fixture);
    } else if (fixture.finished_provisional) {
      finishedProvisional.push(fixture);
    } else {
      unfinished.push(fixture);
    }
  }

  return {
    finished,
    unfinished,
    finishedProvisional,
  };
}

