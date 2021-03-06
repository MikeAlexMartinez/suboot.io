/**
 *  player is equivalent to element found at https://fantasy.premierleague.com/drf/bootstrap-static
 *
 */
CREATE TABLE players(
  id	SMALLINT PRIMARY KEY UNIQUE NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL,
  updatedAt TIMESTAMPTZ NOT NULL,
  assists	SMALLINT NOT NULL,
  bonus	SMALLINT NOT NULL,
  bps	SMALLINT NOT NULL,
  chance_of_playing_this_round	SMALLINT NOT NULL,
  chance_of_playing_next_round	SMALLINT NOT NULL,
  clean_sheets	SMALLINT NOT NULL,
  code	INTEGER NOT NULL,
  cost_change_event	SMALLINT NOT NULL,
  cost_change_event_fall	SMALLINT NOT NULL,
  cost_change_start	SMALLINT NOT NULL,
  cost_change_start_fall	SMALLINT NOT NULL,
  creativity	REAL NOT NULL,
  dreamteam_count	SMALLINT NOT NULL,
  ea_index	SMALLINT NOT NULL,
  element_type	SMALLINT NOT NULL,
  ep_next	REAL NOT NULL,
  ep_this	REAL NOT NULL,
  event_points	SMALLINT NOT NULL,
  first_name	VARCHAR(25) NOT NULL,
  form	REAL NOT NULL,
  goals_conceded	SMALLINT NOT NULL,
  goals_scored	SMALLINT NOT NULL,
  ict_index	REAL NOT NULL,
  in_dreamteam	BOOLEAN NOT NULL,
  influence	REAL NOT NULL,
  loaned_in	SMALLINT NOT NULL,
  loaned_out	SMALLINT NOT NULL,
  loans_in	SMALLINT NOT NULL,
  loans_out	SMALLINT NOT NULL,
  minutes	SMALLINT NOT NULL,
  news	TEXT NOT NULL,
  news_added	TIMESTAMPTZ 
              DEFAULT CURRENT_TIMESTAMP,
  now_cost	SMALLINT NOT NULL,
  own_goals	SMALLINT NOT NULL,
  penalties_missed	SMALLINT NOT NULL,
  photo	VARCHAR(25) NOT NULL,
  points_per_game	REAL NOT NULL,
  red_cards	SMALLINT NOT NULL,
  saves	SMALLINT NOT NULL,
  second_name	VARCHAR(25) NOT NULL,
  selected_by_percent	REAL NOT NULL,
  special	BOOLEAN NOT NULL,
  squad_number	SMALLINT NOT NULL,
  status	VARCHAR(1) NOT NULL,
  team	SMALLINT NOT NULL,
  team_code	SMALLINT NOT NULL,
  threat	REAL NOT NULL,
  total_points	SMALLINT NOT NULL,
  transfers_in	INTEGER 
    DEFAULT 0,
  transfers_in_event	INTEGER
    DEFAULT 0,
  transfers_out	INTEGER
    DEFAULT 0,
  transfers_out_event	INTEGER
    DEFAULT 0,
  value_form	REAL NOT NULL,
  value_season	REAL NOT NULL,
  web_name	VARCHAR(25) NOT NULL,
  yellow_cards	SMALLINT NOT NULL
);

ALTER TABLE player
ADD CONSTRAINT element_type FOREIGN KEY (element_type) REFERENCES player_type (id);