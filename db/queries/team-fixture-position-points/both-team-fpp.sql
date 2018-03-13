/**
 * Available Headings:
 *  - fixture_id
 *  - kickoff_time (default sort) ASC
 *  - focus (is the for team home 'H' or away 'A')
 *  - team_for_id
 *  - team_for
 *  - team_against_id
 *  - point_item_id
 *  - point_item
 *  - scoring_item_type
 *  - position
 *  - points
 */
SELECT * 
FROM (
  /* Home team points by fixture, points_item and by position */
  SELECT pts_tbl.fixture_id
    , f.kickoff_time
    , 'H' AS "focus"
    , pts_tbl.home_team_id AS "team_for_id"
    , home_teams.name AS "team_for"
    , pts_tbl.away_team_id AS "team_against_id"
    , away_teams.name AS "team_against"
    , pts_tbl.point_item_id
    , pts_tbl.point_item
    , pi.scoring_item_type
    , pts_tbl.singular_name_short AS "position"
    , SUM(pts_tbl.points) AS "points"
  FROM (
    SELECT ft.fixture_id
      , ft.player_id
      , ft.home_team_id
      , ft.away_team_id
      , ft.was_home
      , sp.point_item_id
      , sp.point_item
      , sp.points
      , sp.value
      , pt.singular_name_short
    FROM scoring_points sp
    INNER JOIN (
      SELECT DISTINCT pfs.fixture_id
        , pfs.home_team_id
        , pfs.away_team_id
        , pfs.was_home
        , pfs.player_id 
      FROM player_fixture_stats pfs
    ) AS ft
      ON ft.player_id = sp.player_id
      AND ft.fixture_id = sp.fixture_id
    INNER JOIN players p
      ON p.id = sp.player_id
    INNER JOIN player_types pt
      ON  p.element_type = pt.id
  ) AS pts_tbl
  INNER JOIN teams home_teams
    ON pts_tbl.home_team_id = home_teams.id
  INNER JOIN teams away_teams
    ON pts_tbl.away_team_id = away_teams.id
  INNER JOIN fixtures f
    ON f.id = pts_tbl.fixture_id
  INNER JOIN points_items pi
    ON pts_tbl.point_item_id = pi.id
  WHERE was_home = true
  GROUP BY pts_tbl.fixture_id
    , f.kickoff_time
    , pts_tbl.home_team_id
    , home_teams.name
    , pts_tbl.away_team_id
    , away_teams.name
    , pts_tbl.point_item_id
    , pts_tbl.point_item
    , pi.scoring_item_type
    , pts_tbl.singular_name_short

  UNION ALL

  /* Away team points by points_item and by position */
  SELECT pts_tbl.fixture_id
    , f.kickoff_time
    , 'A' AS "focus"
    , pts_tbl.away_team_id AS "team_for_id"
    , away_teams.name AS "team_for"
    , pts_tbl.home_team_id AS "team_against_id"
    , home_teams.name AS "team_against"
    , pts_tbl.point_item_id
    , pts_tbl.point_item
    , pi.scoring_item_type
    , pts_tbl.singular_name_short AS "position"
    , SUM(pts_tbl.points) AS "points"
  FROM (
    SELECT ft.fixture_id
      , ft.player_id
      , ft.home_team_id
      , ft.away_team_id
      , ft.was_home
      , sp.point_item_id
      , sp.point_item
      , sp.points
      , sp.value
      , pt.singular_name_short
    FROM scoring_points sp
    INNER JOIN (
      SELECT DISTINCT pfs.fixture_id
        , pfs.home_team_id
        , pfs.away_team_id
        , pfs.was_home
        , pfs.player_id 
      FROM player_fixture_stats pfs
    ) AS ft
      ON ft.player_id = sp.player_id
      AND ft.fixture_id = sp.fixture_id
    INNER JOIN players p
      ON p.id = sp.player_id
    INNER JOIN player_types pt
      ON  p.element_type = pt.id
  ) AS pts_tbl
  INNER JOIN teams home_teams
    ON pts_tbl.home_team_id = home_teams.id
  INNER JOIN teams away_teams
    ON pts_tbl.away_team_id = away_teams.id
  INNER JOIN fixtures f
    ON f.id = pts_tbl.fixture_id  
  INNER JOIN points_items pi
    ON pts_tbl.point_item_id = pi.id
  WHERE was_home = false
  GROUP BY pts_tbl.fixture_id
    , f.kickoff_time
    , pts_tbl.home_team_id
    , home_teams.name
    , pts_tbl.away_team_id
    , away_teams.name
    , pts_tbl.point_item_id
    , pts_tbl.point_item
    , pi.scoring_item_type
    , pts_tbl.singular_name_short
) team_fixture_points
ORDER BY team_fixture_points.kickoff_time
  , team_fixture_points.fixture_id
  , team_fixture_points.focus DESC
  , team_fixture_points.point_item
  , team_fixture_points.position;