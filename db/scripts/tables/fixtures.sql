/**
 *  formation equivalanet to formations found in https://fantasy.premierleague.com/drf/bootstrap-static:game_settings.game.formations
 *
 */
CREATE TABLE fixtures(
  id	SMALLINT UNIQUE PRIMARY KEY,
  code	INTEGER NOT NULL,
  deadline_time	TIMESTAMPTZ NOT NULL,
  deadline_time_formatted	VARCHAR(15) NOT NULL,
  event	SMALLINT NOT NULL,
  event_day	SMALLINT NOT NULL,
  finished	BOOLEAN NOT NULL,
  finished_provisional	BOOLEAN NOT NULL,
  kickoff_time	TIMESTAMPTZ NOT NULL,
  kickoff_time_formatted	VARCHAR(15) NOT NULL,
  minutes	SMALLINT NOT NULL,
  provisional_start_time	BOOLEAN NOT NULL,
  started	BOOLEAN NOT NULL,
  team_a	SMALLINT NOT NULL,
  team_a_score	SMALLINT NOT NULL,
  team_h	SMALLINT NOT NULL,
  team_h_score	SMALLINT NOT NULL
);