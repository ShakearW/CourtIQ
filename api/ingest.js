require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_BASE = 'https://api.balldontlie.io/v1';
const HEADERS = { Authorization: process.env.BALLDONTLIE_API_KEY };

async function fetchWithRetry(url, headers, retries = 5) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers });
    if (res.status === 429) {
      const wait = 2000 * (i + 1); // backs off: 2s, 4s, 6s...
      console.log(`Rate limited, waiting ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    return res;
  }
  throw new Error('Max retries hit');
}

async function ingestTeams() {
  const res = await fetch(`${API_BASE}/teams`, { headers: HEADERS });
  const { data } = await res.json();
  for (const t of data) {
    await pool.query(
      `INSERT INTO teams (id, name, abbreviation, city, conference, division)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name=$2, abbreviation=$3, city=$4, conference=$5, division=$6`,
      [t.id, t.full_name, t.abbreviation, t.city, t.conference, t.division]
    );
  }
  console.log(`Teams ingested: ${data.length}`);
}

async function ingestPlayers() {
  let cursor = null;
  let total = 0;
  do {
    const url = new URL(`${API_BASE}/players`);
    url.searchParams.set('per_page', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetchWithRetry(url, HEADERS);
    const json = await res.json();

    for (const p of json.data) {
      await pool.query(
        `INSERT INTO players (id, first_name, last_name, position, height, weight, team_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET team_id=$7, updated_at=NOW()`,
        [p.id, p.first_name, p.last_name, p.position, p.height, p.weight, p.team?.id]
      );
    }
    total += json.data.length;
    cursor = json.meta?.next_cursor;

    if (cursor) await new Promise(r => setTimeout(r, 13000)); // ~4.6 req/min, safe margin
  } while (cursor);
  console.log(`Players ingested: ${total}`);
}

async function ingestGames(season) {
  let cursor = null;
  let total = 0;
  do {
    const url = new URL(`${API_BASE}/games`);
    url.searchParams.set('seasons[]', season);
    url.searchParams.set('per_page', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetchWithRetry(url, HEADERS);
    const json = await res.json();

    for (const g of json.data) {
        if (!g.home_team || !g.visitor_team) {
            console.log(`Skipping game ${g.id} — missing team data`);
            continue;
        }
        await pool.query(
            `INSERT INTO games (id, date, season, home_team_id, away_team_id, home_team_score, away_team_score, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            ON CONFLICT (id) DO UPDATE SET home_team_score=$6, away_team_score=$7, status=$8`,
            [g.id, g.date, g.season, g.home_team.id, g.visitor_team.id, g.home_team_score, g.visitor_team_score, g.status]
        );
    }
    total += json.data.length;
    cursor = json.meta?.next_cursor;

    if (cursor) await new Promise(r => setTimeout(r, 13000));
  } while (cursor);
  console.log(`Games ingested: ${total}`);
}

async function ingestBoxScores(season) {
  let cursor = null;
  let total = 0;
  do {
    const url = new URL(`${API_BASE}/stats`);
    url.searchParams.set('seasons[]', season);
    url.searchParams.set('per_page', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetchWithRetry(url, HEADERS);
    const json = await res.json();

    for (const s of json.data) {
      await pool.query(
        `INSERT INTO box_scores (game_id, player_id, mins, pts, reb, ast, stl, blk, fgm, fga, fg3m, fg3a, ftm, fta, turnover, pf)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (game_id, player_id) DO UPDATE SET pts=$4, reb=$5, ast=$6`,
        [s.game.id, s.player.id, s.min, s.pts, s.reb, s.ast, s.stl, s.blk, s.fgm, s.fga, s.fg3m, s.fg3a, s.ftm, s.fta, s.turnover, s.pf]
      );
    }
    total += json.data.length;
    cursor = json.meta?.next_cursor;

    if (cursor) await new Promise(r => setTimeout(r, 13000));
  } while (cursor);
  console.log(`Box scores ingested: ${total}`);
}

async function main() {
  const step = process.argv[2];
  const seasons = [2020, 2021, 2022, 2023, 2024, 2025]; // adjust range here

  if (!step || step === 'teams') await ingestTeams();
  if (!step || step === 'players') await ingestPlayers();

  if (!step || step === 'games') {
    for (const season of seasons) {
      console.log(`--- Games: ${season} ---`);
      await ingestGames(season);
    }
  }

  if (!step || step === 'boxscores') {
    for (const season of seasons) {
      console.log(`--- Box scores: ${season} ---`);
      await ingestBoxScores(season);
    }
  }

  await pool.end();
}

main().catch(console.error);