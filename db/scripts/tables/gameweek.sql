/**
 *  gameweek is equivalent to 'events' found at https://fantasy.premierleague.com/drf/bootstrap-static
 *
 */
CREATE TABLE gameweek(
  id	SMALLINT UNIQUE PRIMARY KEY NOT NULL,
  average_entry_score	SMALLINT NOT NULL,
  data_checked	BOOLEAN NOT NULL,
  deadline_time	TIMESTAMPTZ NOT NULL,
  deadline_time_epoch	INTEGER NOT NULL,
  deadline_time_formatted	VARCHAR(25) NOT NULL,
  deadline_time_game_offset	INTEGER NOT NULL,
  finished	BOOLEAN NOT NULL,
  highest_score	SMALLINT,
  highest_scoring_entry	INTEGER,
  is_current	BOOLEAN NOT NULL,
  is_next	BOOLEAN NOT NULL,
  is_previous	BOOLEAN NOT NULL,
  name VARCHAR(12) NOT NULL
);