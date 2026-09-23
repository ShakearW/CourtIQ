require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/players', async (req, res) => {
  const { season = 2025 } = req.query;
  const result = await pool.query(`
    SELECT p.id, p.first_name, p.last_name, p.jersey_number, p.position, p.height, p.weight,
      t.id AS team_id, t.name AS team_name, t.abbreviation,
      s.pts_avg, s.reb_avg, s.ast_avg
    FROM players p
    LEFT JOIN teams t ON t.id = p.team_id
    LEFT JOIN player_season_stats s ON s.player_id = p.id AND s.season = $1
    WHERE p.team_id IS NOT NULL AND s.games_played > 0
    ORDER BY p.last_name
  `, [season]);
  res.json(result.rows);
});

app.get('/api/teams', async (req, res) => {
  const result = await pool.query('SELECT * FROM teams');
  res.json(result.rows);
});

app.get('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  const player = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
  const stats = await pool.query(
    'SELECT * FROM player_season_stats WHERE player_id = $1 ORDER BY season DESC',
    [id]
  );
  if (player.rows.length === 0) return res.status(404).json({ error: 'Player not found' });
  res.json({ ...player.rows[0], seasons: stats.rows });
});

app.get('/api/leaders', async (req, res) => {
  const { stat = 'pts_avg', season } = req.query;

  const allowedStats = ['pts_avg', 'reb_avg', 'ast_avg', 'ts_pct'];
  if (!allowedStats.includes(stat)) {
    return res.status(400).json({ error: 'Invalid stat' });
  }

  const query = season
    ? `SELECT p.id, p.first_name, p.last_name, p.position, p.team_id, t.abbreviation,
         s.games_played, s.pts_avg, s.reb_avg, s.ast_avg, s.ts_pct, s.season
       FROM player_season_stats s
       JOIN players p ON p.id = s.player_id
       LEFT JOIN teams t ON t.id = p.team_id
       WHERE s.season = $1 AND s.games_played >= 45
       ORDER BY s.${stat} DESC LIMIT 10`
    : `SELECT p.id, p.first_name, p.last_name, p.position, p.team_id, t.abbreviation,
         s.games_played, s.pts_avg, s.reb_avg, s.ast_avg, s.ts_pct, s.season
       FROM player_season_stats s
       JOIN players p ON p.id = s.player_id
       LEFT JOIN teams t ON t.id = p.team_id
       WHERE s.games_played >= 45
       ORDER BY s.${stat} DESC LIMIT 10`;

  const result = season
    ? await pool.query(query, [season])
    : await pool.query(query);

  res.json(result.rows);
});

app.get('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  const team = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
  if (team.rows.length === 0) return res.status(404).json({ error: 'Team not found' });
  res.json(team.rows[0]);
});

app.get('/api/teams/:id/roster', async (req, res) => {
  const { id } = req.params;
  const { season } = req.query;
  const result = await pool.query(`
    SELECT DISTINCT p.id, p.first_name, p.last_name, p.position, p.jersey_number, p.height, p.weight,
    s.games_played, s.pts_avg, s.reb_avg, s.ast_avg, s.ts_pct
    FROM box_scores b
    JOIN games g ON g.id = b.game_id
    JOIN players p ON p.id = b.player_id
    LEFT JOIN player_season_stats s ON s.player_id = p.id AND s.season = g.season
    WHERE b.team_id = $1 AND g.season = $2
    ORDER BY s.pts_avg DESC NULLS LAST
  `, [id, season]);
  res.json(result.rows);
});

app.get('/api/games/recent', async (req, res) => {
  const result = await pool.query(`
    SELECT g.id, g.date, g.home_team_score, g.away_team_score,
      ht.name AS home_team, ht.abbreviation AS home_abbr,
      vt.name AS away_team, vt.abbreviation AS away_abbr
    FROM games g
    JOIN teams ht ON ht.id = g.home_team_id
    JOIN teams vt ON vt.id = g.away_team_id
    WHERE g.status = 'Final'
    ORDER BY g.date DESC
    LIMIT 5
  `);
  res.json(result.rows);
});

app.get('/api/standings', async (req, res) => {
  const { season } = req.query;
  const result = await pool.query(`
    WITH team_games AS (
      SELECT home_team_id AS team_id,
        CASE WHEN home_team_score > away_team_score THEN 1 ELSE 0 END AS win,
        CASE WHEN home_team_score < away_team_score THEN 1 ELSE 0 END AS loss
      FROM games WHERE season = $1 AND status = 'Final' AND postseason = false
      UNION ALL
      SELECT away_team_id AS team_id,
        CASE WHEN away_team_score > home_team_score THEN 1 ELSE 0 END AS win,
        CASE WHEN away_team_score < home_team_score THEN 1 ELSE 0 END AS loss
      FROM games WHERE season = $1 AND status = 'Final' AND postseason = false
    )
    SELECT t.id, t.name, t.abbreviation, t.conference,
      SUM(tg.win) AS wins, SUM(tg.loss) AS losses,
      ROUND(SUM(tg.win)::numeric / NULLIF(SUM(tg.win) + SUM(tg.loss), 0), 3) AS pct
    FROM team_games tg
    JOIN teams t ON t.id = tg.team_id
    GROUP BY t.id, t.name, t.abbreviation, t.conference
    ORDER BY t.conference, pct DESC
  `, [season]);
  res.json(result.rows);
});

app.get('/api/team-ratings', async (req, res) => {
  const { season } = req.query;

  const result = await pool.query(`
    WITH team_game_stats AS (
      SELECT b.game_id, b.team_id,
        SUM(b.pts) AS pts, SUM(b.fga) AS fga, SUM(b.fta) AS fta, SUM(b.turnover) AS tov
      FROM box_scores b
      JOIN games g ON g.id = b.game_id
      WHERE g.season = $1 AND g.status = 'Final' AND g.postseason = false
      GROUP BY b.game_id, b.team_id
    ),
    matchup AS (
      SELECT id AS game_id, home_team_id, away_team_id FROM games
      WHERE season = $1 AND status = 'Final' AND postseason = false
    ),
    with_opponent AS (
      SELECT tgs.*,
        CASE WHEN tgs.team_id = m.home_team_id THEN m.away_team_id ELSE m.home_team_id END AS opp_team_id,
        (tgs.fga + 0.44 * tgs.fta + tgs.tov) AS poss
      FROM team_game_stats tgs
      JOIN matchup m ON m.game_id = tgs.game_id
    )
    SELECT own.team_id,
      ROUND(100 * SUM(own.pts) / NULLIF(SUM(own.poss), 0), 1) AS off_rating,
      ROUND(100 * SUM(opp.pts) / NULLIF(SUM(opp.poss), 0), 1) AS def_rating
    FROM with_opponent own
    JOIN with_opponent opp ON opp.game_id = own.game_id AND opp.team_id = own.opp_team_id
    GROUP BY own.team_id
  `, [season]);

  const threePct = await pool.query(`
    SELECT b.team_id, ROUND(SUM(b.fg3m)::numeric / NULLIF(SUM(b.fg3a), 0), 3) AS three_pct
    FROM box_scores b
    JOIN games g ON g.id = b.game_id
    WHERE g.season = $1 AND g.status = 'Final' AND g.postseason = false
    GROUP BY b.team_id
  `, [season]);

  const teams = await pool.query('SELECT id, name, abbreviation FROM teams');

  const merged = teams.rows.map(t => {
    const r = result.rows.find(x => x.team_id === t.id) || {};
    const p = threePct.rows.find(x => x.team_id === t.id) || {};
    return { ...t, off_rating: r.off_rating, def_rating: r.def_rating, three_pct: p.three_pct };
  });

  res.json(merged);
});

app.listen(3000, () => console.log('API running on port 3000'));