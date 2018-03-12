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