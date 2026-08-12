require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function computeSeasonStats() {
  const res = await pool.query(`
    INSERT INTO player_season_stats
      (player_id, season, games_played, pts_avg, reb_avg, ast_avg, ts_pct)
    SELECT
      b.player_id,
      g.season,
      COUNT(*) AS games_played,
      AVG(b.pts) AS pts_avg,
      AVG(b.reb) AS reb_avg,
      AVG(b.ast) AS ast_avg,
      SUM(b.pts)::numeric / NULLIF(2 * (SUM(b.fga) + 0.44 * SUM(b.fta)), 0) AS ts_pct
    FROM box_scores b
    JOIN games g ON g.id = b.game_id
    GROUP BY b.player_id, g.season
    ON CONFLICT (player_id, season) DO UPDATE SET
      games_played = EXCLUDED.games_played,
      pts_avg = EXCLUDED.pts_avg,
      reb_avg = EXCLUDED.reb_avg,
      ast_avg = EXCLUDED.ast_avg,
      ts_pct = EXCLUDED.ts_pct;
  `);
  console.log(`Season stats computed: ${res.rowCount} rows`);
}

async function computeCareerStats() {
  const res = await pool.query(`
    INSERT INTO career_stats
      (player_id, seasons_played, games_played, pts_total, reb_total, ast_total, stl_total, blk_total, pts_avg, reb_avg, ast_avg, ts_pct)
    SELECT
      player_id,
      COUNT(DISTINCT season),
      SUM(games_played),
      SUM(pts_avg * games_played),
      SUM(reb_avg * games_played),
      SUM(ast_avg * games_played),
      0, 0,
      AVG(pts_avg),
      AVG(reb_avg),
      AVG(ast_avg),
      AVG(ts_pct)
    FROM player_season_stats
    GROUP BY player_id
    ON CONFLICT (player_id) DO UPDATE SET
      seasons_played = EXCLUDED.seasons_played,
      games_played = EXCLUDED.games_played,
      pts_total = EXCLUDED.pts_total,
      reb_total = EXCLUDED.reb_total,
      ast_total = EXCLUDED.ast_total,
      pts_avg = EXCLUDED.pts_avg,
      reb_avg = EXCLUDED.reb_avg,
      ast_avg = EXCLUDED.ast_avg,
      ts_pct = EXCLUDED.ts_pct;
  `);
  console.log(`Career stats computed: ${res.rowCount} rows`);
}

async function main() {
  await computeSeasonStats();
  await computeCareerStats();
  await pool.end();
}

main().catch(console.error);