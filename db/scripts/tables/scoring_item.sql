/**
 * scoring_item specifies details the different scoring_items used to give each player a total score.
 * 
 */
CREATE TABLE scoring_item(
  id	SMALLINT UNIQUE PRIMARY KEY,
  scoring_item_name	VARCHAR(50) NOT NULL,
  scoring_item_is_general	BOOLEAN NOT NULL,
  scoring_item_type	VARCHAR(6) NOT NULL
);

INSERT INTO scoring_item
VALUES
  (1, 'assists', FALSE, 'attack'),
  (2, 'bonus', TRUE, 'normal'),
  (3, 'bps', TRUE, 'normal'),
  (4, 'clean_sheets', FALSE, 'defend'),
  (5, 'creativity', FALSE, 'attack'),
  (6, 'goals_conceded', FALSE, 'defend'),
  (7, 'goals_scored', FALSE, 'attack'),
  (8, 'ict_index', FALSE, 'attack'),
  (9, 'in_dreamteam', TRUE, 'normal'),
  (10, 'influence', TRUE, 'normal'),
  (11, 'minutes', TRUE, 'normal'),
  (12, 'own_goals', FALSE, 'defend'),
  (13, 'penalties_missed', FALSE, 'attack'),
  (14, 'penalties_saved', FALSE, 'keeper'),
  (15, 'red_cards', TRUE, 'normal'),
  (16, 'saves', FALSE, 'keeper'),
  (17, 'threat', FALSE, 'attack'),
  (18, 'total_points', TRUE, 'normal'),
  (19, 'yellow_cards', TRUE, 'normal');