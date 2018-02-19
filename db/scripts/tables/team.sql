/**
 *
 *
 */
CREATE TABLE team(
  code SMALLINT UNIQUE PRIMARY KEY NOT NULL,
  id SMALLINT UNIQUE NOT NULL,
  current_event_fixture	SMALLINT NOT NULL,
  name	VARCHAR(35) NOT NULL,
  next_event_fixture SMALLINT NOT NULL,
  short_name	VARCHAR(3) NOT NULL,
  strength	SMALLINT NOT NULL,
  strength_attack_away	SMALLINT NOT NULL,
  strength_attack_home	SMALLINT NOT NULL,
  strength_defence_away	SMALLINT NOT NULL,
  strength_defence_home	SMALLINT NOT NULL,
  strength_overall_away	SMALLINT NOT NULL,
  strength_overall_home	SMALLINT NOT NULL,
  team_division	SMALLINT NOT NULL,
  unavailable	BOOLEAN NOT NULL
);