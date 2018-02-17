/**
 *  Scoring system - defines statistical elements and scoring values for the game
 *  
 */
CREATE TABLE bonus_points_system(
  id	SMALLINT UNIQUE PRIMARY KEY,
  scoring_item	VARCHAR(35) NOT NULL,
  display_name	VARCHAR(35) NOT NULL,
  value	SMALLINT NOT NULL,
  description	TEXT,
  specific	BOOLEAN NOT NULL,
  position	VARCHAR(3) NOT NULL
);

INSERT INTO bonus_points_system
VALUES 
  (1, 'bps_assists', 'assists', 9, 'points scored per item',  FALSE, 'ALL'),
  (2, 'bps_attempted_passes_limit', 'attempted_passes_limit', 30, 'Need to test this',  FALSE, 'ALL'),
  (3, 'bps_big_chances_created', 'big_chances_created', 3, 'points scored per item',  FALSE, 'ALL'),
  (4, 'bps_big_chances_missed', 'big_chances_missed', -3, 'points scored per item',  FALSE, 'ALL'),
  (5, 'bps_cbi_limit', 'cbi_limit', 2, 'number of clearances blocks ints required for a point',  FALSE, 'ALL'),
  (6, 'bps_clearances_blocks_interceptions', 'clearances_blocks_interceptions', 1, 'points scored per item specifed by cbi_limit',  FALSE, 'ALL'),
  (7, 'bps_dribbles', 'dribbles', 1, 'points scored per item',  FALSE, 'ALL'),
  (8, 'bps_errors_leading_to_goal', 'errors_leading_to_goal', -3, 'points scored per item',  FALSE, 'ALL'),
  (9, 'bps_errors_leading_to_goal_attempt', 'errors_leading_to_goal_attempt', -1, 'points scored per item',  FALSE, 'ALL'),
  (10, 'bps_fouls', 'fouls', -1, 'points scored per item',  FALSE, 'ALL'),
  (11, 'bps_key_passes', 'key_passes', 1, 'points scored per item',  FALSE, 'ALL'),
  (12, 'bps_long_play', 'long_play', 6, 'points scored if played minimum of long_play_limit minutes',  FALSE, 'ALL'),
  (13, 'bps_long_play_limit', 'long_play_limit', 60, 'points scored per item',  FALSE, 'ALL'),
  (14, 'bps_offside', 'offside', -1, 'points scored per item',  FALSE, 'ALL'),
  (15, 'bps_open_play_crosses', 'open_play_crosses', 1, 'points scored per item',  FALSE, 'ALL'),
  (16, 'bps_own_goals', 'own_goals', -6, 'points scored per item',  FALSE, 'ALL'),
  (17, 'bps_pass_percentage_70', 'pass_percentage_70', 2, 'points scored per item',  FALSE, 'ALL'),
  (18, 'bps_pass_percentage_80', 'pass_percentage_80', 4, 'points scored per item',  FALSE, 'ALL'),
  (19, 'bps_pass_percentage_90', 'pass_percentage_90', 6, 'points scored per item',  FALSE, 'ALL'),
  (20, 'bps_penalties_conceded', 'penalties_conceded', -3, 'points scored per item',  FALSE, 'ALL'),
  (21, 'bps_penalties_missed', 'penalties_missed', -6, 'points scored per item',  FALSE, 'ALL'),
  (22, 'bps_penalties_saved', 'penalties_saved', 15, 'points scored per item',  FALSE, 'ALL'),
  (23, 'bps_recoveries', 'recoveries', 1, 'points scored each time recoveries limit is achieved',  FALSE, 'ALL'),
  (24, 'bps_recoveries_limit', 'recoveries_limit', 3, 'recoveries required to score a point',  FALSE, 'ALL'),
  (25, 'bps_red_cards', 'red_cards', -9, 'points scored per item',  FALSE, 'ALL'),
  (26, 'bps_saves', 'saves', 2, 'points scored per item',  FALSE, 'ALL'),
  (27, 'bps_short_play', 'short_play', 3, 'points scored if less than long_play_limit achieved',  FALSE, 'ALL'),
  (28, 'bps_tackled', 'tackled', -1, 'points scored per item',  FALSE, 'ALL'),
  (29, 'bps_tackles', 'tackles', 2, 'points scored per item',  FALSE, 'ALL'),
  (30, 'bps_target_missed', 'target_missed', -1, 'points scored per item',  FALSE, 'ALL'),
  (31, 'bps_winning_goals', 'winning_goals', 3, 'points scored per item',  FALSE, 'ALL'),
  (32, 'bps_yellow_cards', 'yellow_cards', -3, 'points scored per item',  FALSE, 'ALL'),
  (33, 'bps_clean_sheets', 'clean_sheets', 12, 'points scored per item for specified position', TRUE, 'GKP'),
  (34, 'bps_goals_scored', 'goals_scored', 12, 'points scored per item for specified position', TRUE, 'GKP'),
  (35, 'bps_clean_sheets', 'clean_sheets', 12, 'points scored per item for specified position', TRUE, 'DEF'),
  (36, 'bps_goals_scored', 'goals_scored', 12, 'points scored per item for specified position', TRUE, 'DEF'),
  (37, 'bps_clean_sheets', 'clean_sheets',  0, 'points scored per item for specified position', TRUE, 'MID'),
  (38, 'bps_goals_scored', 'goals_scored', 18, 'points scored per item for specified position', TRUE, 'MID'),
  (39, 'bps_clean_sheets', 'clean_sheets',  0, 'points scored per item for specified position', TRUE, 'FWD'),
  (40, 'bps_goals_scored', 'goals_scored', 24, 'points scored per item for specified position', TRUE, 'FWD');
