SELECT  t.id, t.name, pfs.stat_item_name, SUM(pfs.stat_item_value) AS "total"
FROM player_fixture_stats pfs
INNER JOIN teams t
	ON t.id = pfs.player_team_id
GROUP BY t.name, pfs.stat_item_name
ORDER BY pfs.stat_item_name, "total" DESC, t.name;