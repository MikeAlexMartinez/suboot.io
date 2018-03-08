SELECT concat(p.first_name, ' ', p.second_name) AS "PlayerName", SUM(pfs.stat_item_value) AS "Goals Scored"
FROM player_fixture_stats pfs
INNER JOIN players p
	ON p.id = pfs.player_id
WHERE stat_item_id = 17
GROUP BY "PlayerName";