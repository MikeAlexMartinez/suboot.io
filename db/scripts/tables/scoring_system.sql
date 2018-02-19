/**
 *  Scoring system - defines statistical elements and scoring values for the game
 *  
 */
CREATE TABLE scoring_system(
  id	SMALLINT UNIQUE PRIMARY KEY,
  scoring_item	VARCHAR(50) NOT NULL,
  display_name	VARCHAR(50) NOT NULL,
  value	SMALLINT NOT NULL,
  description	TEXT,
  specific	BOOLEAN NOT NULL,
  position	VARCHAR(3) NOT NULL
);

INSERT INTO scoring_system
VALUES 
  (1, 'scoring_assists', 'assists', 3, 'for each assist the player scores 3 points', FALSE, 'ALL'),
  (2, 'scoring_bonus', 'bonus', 1, 'for each bonus point the player scores 1 point', FALSE, 'ALL'),
  (3, 'scoring_bps', 'bps', 0, 'this is not used', FALSE, 'ALL'),
  (4, 'scoring_concede_limit', 'concede_limit', 2, 'For each 2 goals conceded the player will lose specified number of points', FALSE, 'ALL'),
  (5, 'scoring_creativity', 'creativity', 0, 'this is not used', FALSE, 'ALL'),
  (6, 'scoring_ea_index', 'ea_index', 0, 'this is not used', FALSE, 'ALL'),
  (7, 'scoring_ict_index', 'ict_index', 0, 'this is not used', FALSE, 'ALL'),
  (8, 'scoring_influence', 'influence', 0, 'this is not used', FALSE, 'ALL'),
  (9, 'scoring_long_play', 'long_play', 2, 'if the player reached the long_play_limit the player scores 2 points', FALSE, 'ALL'),
  (10, 'scoring_long_play_limit', 'long_play_limit', 60, 'defines minutes required to be awarded the long play limit points', FALSE, 'ALL'),
  (11, 'scoring_own_goals', 'own_goals', -2, 'the player loses 2 points if they score an own goal', FALSE, 'ALL'),
  (12, 'scoring_penalties_missed', 'penalties_missed', -2, 'the player loses 2 points if they miss a penalty', FALSE, 'ALL'),
  (13, 'scoring_penalties_saved', 'penalties_saved', 5, 'the GKP gains 5 points if they save a penalty', FALSE, 'ALL'),
  (14, 'scoring_red_cards', 'red_cards', -3, 'if the player receives a red card they lose 3 points', FALSE, 'ALL'),
  (15, 'scoring_saves', 'saves', 1, 'for each set of (saves_limit) saves, the GKP scores 1 point', FALSE, 'ALL'),
  (16, 'scoring_saves_limit', 'saves_limit', 3, 'the number of saves to be made to score an additional point', FALSE, 'ALL'),
  (17, 'scoring_short_play', 'short_play', 1, 'points scored by a player who plays but doesn’t meet the long_play_limit requirement', FALSE, 'ALL'),
  (18, 'scoring_threat', 'threat', 0, 'this is not used', FALSE, 'ALL'),
  (19, 'scoring_yellow_cards', 'yellow_cards', -1, 'if the player receives a yellow card they lose 3 points', FALSE, 'ALL'),
  (20, 'scoring_clean_sheets', 'clean_sheets', 4, 'this many points is gained if the player keeps a clean sheet', TRUE, 'GKP'),
  (21, 'scoring_goals_conceded', 'goals_conceded', -1, 'this many points is lost each time the concede_limit is reached', TRUE, 'GKP'),
  (22, 'scoring_goals_scored', 'goals_scored', 6, 'this many points is gained if the player scores a goal', TRUE, 'GKP'),
  (23, 'scoring_clean_sheets', 'clean_sheets', 4, 'this many points is gained if the player keeps a clean sheet', TRUE, 'DEF'),
  (24, 'scoring_goals_conceded', 'goals_conceded', -1, 'this many points is lost each time the concede_limit is reached', TRUE, 'DEF'),
  (25, 'scoring_goals_scored', 'goals_scored', 6, 'this many points is gained if the player scores a goal', TRUE, 'DEF'),
  (26, 'scoring_clean_sheets', 'clean_sheets', 1, 'this many points is gained if the player keeps a clean sheet', TRUE, 'MID'),
  (27, 'scoring_goals_conceded', 'goals_conceded', 0, 'this many points is lost each time the concede_limit is reached', TRUE, 'MID'),
  (28, 'scoring_goals_scored', 'goals_scored', 5, 'this many points is gained if the player scores a goal', TRUE, 'MID'),
  (29, 'scoring_clean_sheets', 'clean_sheets', 0, 'this many points is gained if the player keeps a clean sheet', TRUE, 'FWD'),
  (30, 'scoring_goals_conceded', 'goals_conceded', 0, 'this many points is lost each time the concede_limit is reached', TRUE, 'FWD'),
  (31, 'scoring_goals_scored', 'goals_scored', 4, 'this many points is gained if the player scores a goal', TRUE, 'FWD');

