'use strict';

/**
 * this will contain an algorithm to construct home, away, or total
 * league tables based on the fixtures data, and setting present
 * with the table container component.
 * @param {object}
 * @param {object.array} teams - array of all teams
 * @param {object.array} fixtures - array of fixtures to date
 * @param {object.boolean} all - tells us to calculate all played matches
 * @param {object.boolean} range - tells us whether to use a range
 * @param {object.number} start - the gameweek to start from
 *  (when range is true)
 * @param {object.number} end - the gameweek to end at (when range is true)
 * @param {object.number} lastXGames - number of games to use to calculate
 *   fixtures
 * @return {object}
 * @return {object.home} - table using just home games
 * @return {object.away} - table using just away games
 * @return {object.total} - table using all games.
 */
function createTables({teams, fixtures, all, range, start, end, lastXGames}) {
  // define respective object pieces that will be returned.
  let home = teams.reduce((a, b) => a[b] = {
    // need to define base object here...
  }, {});
  let away = {...home};
  let total = {...home};

  /**
   * Items to create:
   * team name, games played, win, lost, drawn, for, against, goal difference
   * points, form
   */
  // loop through fixtures to create home and away tables.
  for (let i = 0; i < fixtures.length; i++) {
    let f = fixtures[i];
    // if range check gameweek is within parameters provided.
    if (all || (range && f.gameweek_id >= start && f.gameweek_id <= end)) {
      let homeTeamShortName = f.home_team_short;
      let awayTeamShortName = f.away_team_short;
      let hT = home[homeTeamShortName];
      let aT = away[awayTeamShortName];
      let result = f.result;

      hT = {
        ...hT,
        played: hT.played + 1 || 1,
        won: result === 'HW' ? hT.won + 1 : hT.won,
        draw: result === 'SD' || result === 'ND' ? hT.draw + 1 : hT.draw,
        lost: result === 'AW' ? hT.lost + 1 : hT.lost,
        for: hT.for + f.home_fix_goals,
        against: hT.against + f.away_fix_goals,
        points: hT.points + f.home_fix.points,
        form: hT.form.push(f.result), // use unshift
      };

      aT = {
        ...aT,
        played: aT.played + 1,
        won: result === 'AW' ? aT.won + 1 : aT.won,
        draw: result === 'SD' || result === 'ND' ? aT.draw + 1 : aT.draw,
        lost: result === 'HW' ? aT.lost + 1 : aT.lost,
        for: aT.for + f.away_fix_goals,
        against: aT.against + f.home_fix_goals,
        points: aT.points + f.away_fix.points,
        form: aT.form.push(f.result), // use unshift
      };
    }

    // Do goal differences
    Object.keys(home).forEach((key) => {
      let homeTeam = home[key];
      homeTeam.goal_difference = homeTeam.for - homeTeam.against;
    });

    Object.keys(away).forEach((key) => {
      let awayTeam = away[key];
      awayTeam.goal_difference = awayTeam.for - awayTeam.against;
    });
  }

  console.log(home);

  console.log(away);
  // create total table by combining home and away

  return {
    home, away, total,
  };
}

module.exports = {
  createTables,
};
