/**
 *  player_type is equivalent to the element_type found at https://fantasy.premierleague.com/drf/bootstrap-static
 *  describes player positions.
 *  should be static and unchanging data
 */
CREATE TABLE player_type(
 id serial PRIMARY KEY,
 plural_name VARCHAR (25) UNIQUE NOT NULL,
 plural_name_short VARCHAR (3) NOT NULL,
 singular_name VARCHAR (25) UNIQUE NOT NULL,
 singular_name_short VARCHAR (3) NOT NULL
);

INSERT INTO player_type(id, plural_name, plural_name_short, singular_name, singular_name_short)
VALUES
  (1,	'Goalkeepers',	'GKP',	'Goalkeeper',	'GKP'),
  (2,	'Defenders',	'DEF',	'Defender',	'DEF'),
  (3,	'Midfielders',	'MID',	'Midfielder',	'MID'),
  (4,	'Forwards',	'FWD',	'Forward',	'FWD');
