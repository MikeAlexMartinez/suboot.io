// This file will run the scheduler at set intervals.
// Running processes when necessary.
// The goal wil be to update data once it is complete in the fantasy
// football website.
// i.e. I will seek to refresh data, once a days matches are complete.

/* in between gameweeks ./drf/bootstrap-static
  - hit main api once every 20 minutes to monitor ownership of players and
    availability (injuries and news)
  - monitor next_event_fixtures in order to schedule gameweek start process.
  - monitor for when gameweek is complete (current_event finished = true)
  - start at one hour after first fixture kick off.

  This should run constantly (504 api calls per week)
*/

/* Gameweek starts (triggered by main api) ./drf/event/{gameweek}/live
  -> Starting one hour after fixture grouping starts call every hour, until
     last game of that day finishes and all fixtures that day have
     finished: true (15 api calls per week)
  -> Data returned includes player details so may as well update DB for
     summary data.

  -> Once a players teams fixtures is finished, fetch player details for
     those players. (630 api calls approx per week)
  -> use elements in ./drf/event/{gameweek}/live response to query applicable
    element detail at /drf/element-summary/{player-id}. Filter by team ids
    found in fixture detail.
  -> Analyse update for most recent fixture only.

  At end of day process, rerun createLeagueTable and createTeamPointsTable
  process. (and any other necessary analysis)
*/

/* At end of gameweek
  - Rerun full process once
  - fetch all gameweeks data, using full fetchEvents routine.
    Current week and history (38 api calls)
  - fetch all players using fetchElementDetails routine.
    Current week and history (630 api calls approximately)
  - reproduce any analysis tables
  - refresh any data sources for website
*/

/* Total expected API calls
  - Main process ./drf/bootstrap-static - 504 api calls per week
  - fetchEvents  ./drf/event/{gameweek}/live - 40 to 45 calls per week
  - fetchElements /drf/element-summary/{player-id} - 1260 calls per week.

  - Total api calls is approx 1810 per week.
*/
