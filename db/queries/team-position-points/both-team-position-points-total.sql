SELECT team_id
  , team_name
  , statistic_name
  , position
  , SUM("for") AS "for"
FROM (
  /* Home team stats by stat_item by position */
  SELECT pts_tbl.home_team_id AS "team_id"
    , t.name AS "team_name"
    , pts_tbl.point_item AS "statistic_name"
    , pts_tbl.singular_name_short AS "position"
    , SUM(pts_tbl.points) AS "for"
  FROM (
    SELECT ft.fixture_id
      , ft.player_id 
      , ft.home_team_id
      , ft.away_team_id
      , ft.was_home
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
  INNER JOIN teams t
    ON pts_tbl.home_team_id = t.id
  WHERE was_home = true
  GROUP BY pts_tbl.home_team_id
    , t.name
    , pts_tbl.point_item
    , pts_tbl.singular_name_short
    , pts_tbl.point_item

  UNION ALL

  /* Away team stats by stat_item by position */
  SELECT pts_tbl.away_team_id AS "team_id"
    , t.name AS "team_name"
    , pts_tbl.point_item AS "statistic_name" 
    , pts_tbl.singular_name_short AS "position"
    , SUM(pts_tbl.points) AS "for"
  FROM (
    SELECT ft.fixture_id
      , ft.player_id 
      , ft.home_team_id
      , ft.away_team_id
      , ft.was_home
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
  INNER JOIN teams t
    ON pts_tbl.away_team_id = t.id
  WHERE was_home = false
  GROUP BY pts_tbl.away_team_id
    , t.name
    , pts_tbl.point_item
    , pts_tbl.singular_name_short
    , pts_tbl.point_item
) AS home_away_points_for
GROUP BY team_id
  , team_name
  , statistic_name
  , position
ORDER BY team_id
  , statistic_name;