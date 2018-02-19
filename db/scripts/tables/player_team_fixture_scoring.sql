/**
 *
 *
 */
CREATE TABLE player_team_fixture_scoring(
  id	VARCHAR(50) UNIQUE PRIMARY KEY,
  fixture_id	SMALLINT NOT NULL,
  player_id	SMALLINT NOT NULL,
  player_team_id	SMALLINT,
  opponent_team_id SMALLINT,
  is_home BOOLEAN,
  scoring_item_id	SMALLINT NOT NULL,
  scoring_item_name	VARCHAR(50) NOT NULL,
  scoring_item_value	REAL
);
