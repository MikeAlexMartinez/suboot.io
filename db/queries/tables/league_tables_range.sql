/* All League Tables */
SELECT * FROM (
	/* Combined - Home and Away */
	(
		SELECT  *
			, row_number() over () AS "Current_Position"
		FROM (
			SELECT "Team_id"::text || '-T'::text AS "id"
				, "Team_id"
				, "Team"
				, 'T' AS "Focus"
				, SUM("PL") AS "PL"
				, SUM("W") AS "W"
				, SUM("D") AS "D"
				, SUM("L") AS "L"
				, SUM("F") AS "F"
				, SUM("A") AS "A"
				, SUM("GD") AS "GD"
				, SUM("PTS") AS "PTS"
			FROM (
				/* Away */
				SELECT t.id AS "Team_id"
					, t.name AS "Team"
					, 'A'
					, COUNT(DISTINCT f.id) AS "PL"
					, COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "W"
					, COUNT(CASE WHEN f.result = 'SD' THEN 1 
								WHEN f.result = 'ND' THEN 1
							ELSE NULL END) AS "D"
					, COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "L"
					, SUM(f.team_a_score) AS "F"
					, SUM(f.team_h_score) AS "A"
					, SUM(f.team_a_score) - SUM(f.team_h_score) AS "GD"
					, SUM(f.team_a_points) AS "PTS"
				FROM teams t
				LEFT JOIN fixtures f
					ON f.team_a = t.id
				WHERE f.finished = true
					AND gameweek_id <= 20
					AND gameweek_id >= 11																			
				GROUP BY t.id
					, t.name

				UNION ALL

				SELECT t.id
					, t.name
					, 'A' AS "Focus"	
					, 0 AS "PL"
					, 0 AS "W"
					, 0 AS "D"
					, 0 AS "L"
					, 0 AS "F"
					, 0 AS "A"
					, 0 AS "GD"
					, 0 AS "PTS"
				FROM teams t
				WHERE t.id NOT IN (
					SELECT DISTINCT t.id
					FROM teams t
					INNER JOIN fixtures f
						ON f.team_a = t.id
					WHERE (f.finished = true
						AND gameweek_id <= 20
						AND gameweek_id >= 11)
				)

				UNION ALL

				/* Home */
				SELECT t.id AS "Team_id"
					, t.name AS "Team"
					, 'H'
					, COUNT(DISTINCT f.id) AS "PL"
					, COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "W"
					, COUNT(CASE WHEN f.result = 'SD' THEN 1 
								WHEN f.result = 'ND' THEN 1
							ELSE NULL END) AS "D"
					, COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "L"
					, SUM(f.team_h_score) AS "F"
					, SUM(f.team_a_score) AS "A"
					, SUM(f.team_h_score) - SUM(f.team_a_score) AS "GD"
					, SUM(f.team_h_points) AS "PTS"
				FROM teams t
				LEFT JOIN fixtures f
					ON f.team_h = t.id
				WHERE f.finished = true
					AND gameweek_id <= 20
					AND gameweek_id >= 11	
				GROUP BY t.id
					, t.name

				UNION ALL

				SELECT t.id
					, t.name
					, 'H' AS "Focus"	
					, 0 AS "PL"
					, 0 AS "W"
					, 0 AS "D"
					, 0 AS "L"
					, 0 AS "F"
					, 0 AS "A"
					, 0 AS "GD"
					, 0 AS "PTS"
				FROM teams t
				WHERE t.id NOT IN (
					SELECT DISTINCT t.id
					FROM teams t
					INNER JOIN fixtures f
						ON f.team_h = t.id
					WHERE (f.finished = true
						AND gameweek_id <= 20
						AND gameweek_id >= 11	)
				)
			) AS tbl
			GROUP BY "id"
				, "Team_id"
				, "Team"
			ORDER BY "PTS" DESC
				, "GD" DESC
				, "F" DESC
				, "Team" ASC
		) AS total
	) 

	UNION ALL

	/* Home Table */
	(
		SELECT *
			, row_number() over() AS  "Current_Position"
		FROM (
			SELECT * FROM (
				SELECT t.id::text || '-H'::text AS "id"
					, t.id AS "Team_id"
					, t.name AS "Team"
					, 'H' AS "Focus"
					, COUNT(DISTINCT f.id) AS "PL"
					, COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "W"
					, COUNT(CASE WHEN f.result = 'SD' THEN 1 
								WHEN f.result = 'ND' THEN 1
							ELSE NULL END) AS "D"
					, COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "L"
					, SUM(f.team_h_score) AS "F"
					, SUM(f.team_a_score) AS "A"
					, SUM(f.team_h_score) - SUM(f.team_a_score) AS "GD"
					, SUM(f.team_h_points) AS "PTS"
				FROM teams t
				INNER JOIN fixtures f
					ON f.team_h = t.id
				WHERE f.finished = true
					AND gameweek_id <= 20
					AND gameweek_id >= 11
				GROUP BY t.id
					, t.name

				UNION ALL

        -- incase no matches where played in range selected
				SELECT t.id::text || '-H'::text AS "id"
					, t.id AS "Team_id"
					, t.name AS "Team"
					, 'H' AS "Focus"	
					, 0 AS "PL"
					, 0 AS "W"
					, 0 AS "D"
					, 0 AS "L"
					, 0 AS "F"
					, 0 AS "A"
					, 0 AS "GD"
					, 0 AS "PTS"
				FROM teams t
				WHERE t.id NOT IN (
					SELECT DISTINCT t.id
					FROM teams t
					INNER JOIN fixtures f
						ON f.team_h = t.id
					WHERE (f.finished = true
						AND gameweek_id <= 20
						AND gameweek_id >= 11)
				)
			) AS home_unordered
			ORDER BY "PTS" DESC
				, "GD" DESC
				, "F" DESC
				, "Team" ASC
		) AS home_ordered
	)

	UNION ALL

	/* Away Table */
	(
		SELECT *
			, row_number() over() AS  "Current_Position"
		FROM (
			SELECT * FROM (
				SELECT t.id::text || '-A'::text AS "id"
					, t.id AS "Team_id"
					, t.name AS "Team"
					, 'A' AS "Focus"
					, COUNT(DISTINCT f.id) AS "PL"
					, COUNT(CASE WHEN f.result = 'AW' THEN 1 ELSE NULL END) AS "W"
					, COUNT(CASE WHEN f.result = 'SD' THEN 1 
								WHEN f.result = 'ND' THEN 1
							ELSE NULL END) AS "D"
					, COUNT(CASE WHEN f.result = 'HW' THEN 1 ELSE NULL END) AS "L"
					, SUM(f.team_a_score) AS "F"
					, SUM(f.team_h_score) AS "A"
					, SUM(f.team_a_score) - SUM(f.team_h_score) AS "GD"
					, SUM(f.team_a_points) AS "PTS"
				FROM teams t
				LEFT JOIN fixtures f
					ON f.team_a = t.id
				WHERE f.finished = true
					AND gameweek_id <= 20
					AND gameweek_id >= 11
				GROUP BY t.id
					, t.name

				UNION ALL

				SELECT t.id::text || '-A'::text AS "id"
					, t.id AS "Team_id"
					, t.name AS "Team"
					, 'A' AS "Focus"	
					, 0 AS "PL"
					, 0 AS "W"
					, 0 AS "D"
					, 0 AS "L"
					, 0 AS "F"
					, 0 AS "A"
					, 0 AS "GD"
					, 0 AS "PTS"
				FROM teams t
				WHERE t.id NOT IN (
					SELECT DISTINCT t.id
					FROM teams t
					INNER JOIN fixtures f
						ON f.team_a = t.id
					WHERE (f.finished = true
						AND gameweek_id <= 20
						AND gameweek_id >= 11)
				)
			) AS away_unordered
			ORDER BY "PTS" DESC
				, "GD" DESC
				, "F" DESC
				, "Team" ASC
		) AS away_ordered
	)
) AS league_table_entries;