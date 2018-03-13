/* All League Tables */
SELECT * FROM (
	(
		SELECT  *
			, row_number() over () AS "Current_Position"
		FROM (
			/* Combined */
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
				FROM fixtures f
				INNER JOIN teams t
					ON f.team_a = t.id
				WHERE f.finished = true
					AND gameweek_id <= ?
				GROUP BY t.id
					, t.name

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
				FROM fixtures f
				INNER JOIN teams t
					ON f.team_h = t.id
				WHERE f.finished = true
					AND gameweek_id <= ?
				GROUP BY t.id
					, t.name
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

			SELECT t.id::text || '-H'::text AS "id"
				, t.id
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
			FROM fixtures f
			INNER JOIN teams t
				ON f.team_h = t.id
			WHERE f.finished = true
				AND gameweek_id <= ?
			GROUP BY t.id
				, t.name
			ORDER BY "PTS" DESC
				, "GD" DESC
				, "F" DESC
				, "Team" ASC
		) AS home
	)

	UNION ALL

	/* Away Table */
	(
		SELECT *
			, row_number() over() AS  "Current_Position"
		FROM (
			SELECT t.id::text || '-A'::text AS "id"
				, t.id
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
			FROM fixtures f
			INNER JOIN teams t
				ON f.team_a = t.id
			WHERE f.finished = true
				AND gameweek_id <= ?
			GROUP BY t.id
				, t.name
			ORDER BY "PTS" DESC
				, "GD" DESC
				, "F" DESC
				, "Team" ASC
		) AS away
	)
) AS league_table_entries;