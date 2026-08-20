require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/players', async (req, res) => {
  const result = await pool.query('SELECT * FROM players LIMIT 50');
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
    ? `SELECT p.id, p.first_name, p.last_name, s.${stat}, s.season
       FROM player_season_stats s
       JOIN players p ON p.id = s.player_id
       WHERE s.season = $1
       ORDER BY s.${stat} DESC LIMIT 10`
    : `SELECT p.id, p.first_name, p.last_name, s.${stat}, s.season
       FROM player_season_stats s
       JOIN players p ON p.id = s.player_id
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
    SELECT DISTINCT p.id, p.first_name, p.last_name, p.position,
      s.pts_avg, s.reb_avg, s.ast_avg, s.ts_pct
    FROM box_scores b
    JOIN games g ON g.id = b.game_id
    JOIN players p ON p.id = b.player_id
    LEFT JOIN player_season_stats s ON s.player_id = p.id AND s.season = g.season
    WHERE b.team_id = $1 AND g.season = $2
    ORDER BY s.pts_avg DESC NULLS LAST
  `, [id, season]);
  res.json(result.rows);
});

app.listen(3000, () => console.log('API running on port 3000'));