/**
 *
 *
 */
CREATE TABLE player_team_fixture_stat(
  id	VARCHAR(50) UNIQUE PRIMARY KEY,
  player_id	SMALLINT NOT NULL,
  fixture_id	SMALLINT NOT NULL,
  player_team_id	SMALLINT,
  opponent_team_id	SMALLINT,
  is_home	BOOLEAN,
  stat_item_id	SMALLINT NOT NULL,
  stat_item_name	VARCHAR(50) NOT NULL,
  stat_item_score	REAL
);