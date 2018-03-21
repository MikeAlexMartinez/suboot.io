/* Home team stats by stat_item by position */
SELECT * FROM (
  -- Points split out by position of player
  SELECT pts_tbl.home_team_id
    , t.name
    , pts_tbl.point_item 
    , pts_tbl.singular_name_short
    , SUM(pts_tbl.points)
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

  --Add totals
  SELECT pts_tbl.home_team_id
    , t.name
    , pts_tbl.point_item 
    , 'TOT'
    , SUM(pts_tbl.points)
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
    , pts_tbl.point_item
) AS home_points
ORDER BY home_points.home_team_id
	, home_points.point_item;