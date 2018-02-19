/**
 *
 *
 */
CREATE TABLE phases(
  id	SMALLINT UNIQUE PRIMARY KEY,
  name	VARCHAR(15) NOT NULL,
  start_event	SMALLINT NOT NULL,
  stop_event	SMALLINT NOT NULL
);

INSERT INTO phases
VALUES
  ( 0, 'Overall', 1, 38),
  ( 1, 'August', 1, 3),
  ( 2, 'September', 4, 7),
  ( 3, 'October', 8, 10),
  ( 4, 'November', 11, 14),
  ( 5, 'December', 15, 21),
  ( 6, 'January', 22, 25),
  ( 7, 'February', 26, 28),
  ( 8, 'March', 29, 32),
  ( 9, 'April', 33, 36),
  ( 10, 'May', 37, 38);
