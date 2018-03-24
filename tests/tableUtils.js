'use strict';

/**
 * this will contain an algorithm to construct home, away, or total
 * league tables based on the fixtures data, and setting present
 * with the table container component.
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
  let home = teams.reduce((a, b) => {
    a[b.short_name] = {
      teamName: b.name,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      for: 0,
      against: 0,
      points: 0,
      form: [],
    };
    return a;
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
      const homeTeamShortName = f.home_team_short;
      const awayTeamShortName = f.away_team_short;
      const hT = home[homeTeamShortName];
      const aT = away[awayTeamShortName];
      const htT = total[homeTeamShortName];
      const atT = total[awayTeamShortName];
      const result = f.result;
      const homeResult = result === 'HW'
        ? 'W'
        : result === 'AW'
          ? 'L'
          : 'D';
      const awayResult = result === 'AW'
        ? 'W'
        : result === 'HW'
          ? 'L'
          : 'D';

      home[homeTeamShortName] = {
        ...hT,
        played: hT.played + 1,
        won: result === 'HW' ? hT.won + 1 : hT.won,
        draw: result === 'SD' || result === 'ND' ? hT.draw + 1 : hT.draw,
        lost: result === 'AW' ? hT.lost + 1 : hT.lost,
        for: hT.for + f.home_fix_goals,
        against: hT.against + f.away_fix_goals,
        points: hT.points + f.home_fix_points,
        form: hT.form.concat([homeResult]),
      };

      total[homeTeamShortName] = {
        ...htT,
        form: htT.form.concat([homeResult]),
      };

      away[awayTeamShortName] = {
        ...aT,
        played: aT.played + 1,
        won: result === 'AW' ? aT.won + 1 : aT.won,
        draw: result === 'SD' || result === 'ND' ? aT.draw + 1 : aT.draw,
        lost: result === 'HW' ? aT.lost + 1 : aT.lost,
        for: aT.for + f.away_fix_goals,
        against: aT.against + f.home_fix_goals,
        points: aT.points + f.away_fix_points,
        form: aT.form.concat([awayResult]),
      };

      total[awayTeamShortName] = {
        ...atT,
        form: atT.form.concat([awayResult]),
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

    if (lastXGames) {
      
    }
  }

  if(!lastXGames) {
    // create total table by combining home and away
    const fields = ['played', 'won', 'draw', 'lost', 'for',
      'against', 'goal_difference', 'points'];
    total = mergeTables(home, away, total, fields);
  }

  return {
    home: sortTable(arrayify(home)),
    away: sortTable(arrayify(away)),
    total: sortTable(arrayify(total)),
  };
}

/**
 * Takes two league Tables (a and B) and merges both tables items
 * at the keys specified into tableC
 * @param {object} tableA
 * @param {object} tableB
 * @param {object} tableC
 * @param {array} fields
 * @return {object}
 */
function mergeTables(tableA, tableB, tableC, fields) {
  let returnTable = {...tableC};

  Object.keys(tableA).forEach((k) => {
    const aObj = tableA[k];
    const bObj = tableB[k];

    fields.forEach((key) => {
      returnTable[k][key] = aObj[key] + bObj[key];
    });
  });

  return returnTable;
}

/**
 * takes an object of objects and returns an array of the passed objects
 * objects, with the key embedded.
 * @param {object} obj
 * @return {array}
 */
function arrayify(obj) {
  return Object.keys(obj).map((key) => {
    return {
      ...obj[key],
      key,
    };
  });
}

/**
 * Sort Table, takes array and sorts league table array accordingly
 * @param {array} arr
 * @return {array}
 */
function sortTable(arr) {
  return arr.sort((a, b) => {
    // points hightest desc
    if (b.points < a.points) {
      return -1;
    } else if (a.points < b.points) {
      return 1;
    } else {
      // goal difference desc
      if (b.goal_difference < a.goal_difference) {
        return -1;
      } else if (a.goal_difference < b.goal_difference) {
        return 1;
      } else {
        // goals for desc
        if (b.for < a.for) {
          return -1;
        } else if (a.for < b.for) {
          return 1;
        } else {
          // team name (lowercase) asc
          let aName = a.teamName.toLowerCase();
          let bName = b.teamName.toLowerCase();

          if (aName < bName) {
            return -1;
          } else {
            return 1;
          }
        }
      }
    }
  });
}

module.exports = {
  createTables,
};
