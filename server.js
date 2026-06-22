'use strict';
/**
 * server.js  ── Veltrix API  (SQLite + JWT Auth)
 *
 * Data source : veltrix.db  (SQLite — no cloud, no env vars needed for games)
 * Auth        : bcrypt passwords stored in users table, JWT returned to client
 *
 * Start:  npm run dev  (or  node server.js)
 * Seed:   node db/seed.js
 */

require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const fetch       = require('node-fetch');
const path        = require('path');
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const db          = require('./db/database');

const app  = express();
const PORT = process.env.PORT || 3000;

// JWT secret — set JWT_SECRET in .env for production; fallback is fine for demos
const JWT_SECRET  = process.env.JWT_SECRET || 'veltrix-sqlite-dev-secret';
const JWT_EXPIRES = '7d';

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(compression());
app.use(cors());
app.use(express.json());
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.static(path.join(__dirname)));

// ── Genre config ───────────────────────────────────────────────────────────────
const GENRES = [
  { id:'action',     name:'Action',     icon:'⚔️',  gradient:'linear-gradient(135deg,#e53935,#b71c1c)',  desc:'Fast-paced combat and explosions.' },
  { id:'rpg',        name:'RPG',        icon:'🧙',  gradient:'linear-gradient(135deg,#7b1fa2,#4a148c)',  desc:'Deep stories, character progression.' },
  { id:'fps',        name:'FPS',        icon:'🔫',  gradient:'linear-gradient(135deg,#2e7d32,#1b5e20)',  desc:'First-person shooting action.' },
  { id:'strategy',   name:'Strategy',   icon:'♟️',  gradient:'linear-gradient(135deg,#0288d1,#01579b)',  desc:'Build, plan, and conquer.' },
  { id:'horror',     name:'Horror',     icon:'💀',  gradient:'linear-gradient(135deg,#8B0000,#1a0000)',  desc:'Survive the darkness and fear.' },
  { id:'sports',     name:'Sports',     icon:'⚽',  gradient:'linear-gradient(135deg,#00897b,#004d40)',  desc:'Compete in your favorite sport.' },
  { id:'simulation', name:'Simulation', icon:'🏙️', gradient:'linear-gradient(135deg,#558b2f,#33691e)', desc:'Build, manage, and simulate.' },
  { id:'adventure',  name:'Adventure',  icon:'🗺️', gradient:'linear-gradient(135deg,#ef6c00,#bf360c)', desc:'Explore vast worlds and stories.' },
  { id:'puzzle',     name:'Puzzle',     icon:'🧩',  gradient:'linear-gradient(135deg,#0097a7,#006064)',  desc:'Challenge your mind and logic.' },
  { id:'racing',     name:'Racing',     icon:'🏎️', gradient:'linear-gradient(135deg,#f57c00,#e65100)', desc:'High-speed racing and stunts.' },
  { id:'fighting',   name:'Fighting',   icon:'🥊',  gradient:'linear-gradient(135deg,#c62828,#6d1010)',  desc:'One-on-one combat showdowns.' },
  { id:'sandbox',    name:'Sandbox',    icon:'🌍',  gradient:'linear-gradient(135deg,#f9a825,#e65100)', desc:'Build anything in open worlds.' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Convert a SQLite game row → standard API shape */
function normalizeRow(row) {
  const genres = JSON.parse(row.genres || '[]');
  const tags   = JSON.parse(row.tags   || '[]');
  const genreId = (row.genre || '').toLowerCase();
  return {
    id:          row.id,
    steamAppId:  row.steam_app_id,
    title:       row.title,
    genre:       row.genre,
    genres,
    year:        row.year,
    developer:   row.developer,
    publisher:   row.publisher,
    rating:      parseFloat(row.rating) || 0,
    price:       row.price,
    priceType:   row.price_type,
    tags,
    icon:        row.icon || '🎮',
    headerImage: row.header_image || '',
    description: row.description  || '',
    steam:       row.steam        || '',
    gradient:    row.gradient     || GENRES.find(g => g.id === genreId)?.gradient
                                  || 'linear-gradient(135deg,#1a1a2e,#16213e)',
  };
}

/** Build a parameterised SELECT from filter options */
function queryGames({ genre, q, priceType, sort, limit = 100, offset = 0 }) {
  const conds  = ['1=1'];
  const params = {};

  if (genre && genre !== 'all') {
    // genres column holds a JSON array — search for the capitalised genre string
    const g = genre.charAt(0).toUpperCase() + genre.slice(1);
    conds.push(`genres LIKE @genre_like`);
    params.genre_like = `%"${g}"%`;
  }
  if (priceType && priceType !== 'all') {
    conds.push(`price_type = @price_type`);
    params.price_type = priceType;
  }
  if (q) {
    conds.push(`(title LIKE @q OR developer LIKE @q OR description LIKE @q)`);
    params.q = `%${q}%`;
  }

  const sortMap = {
    rating: 'rating DESC, title ASC',
    year:   'year DESC,   title ASC',
    az:     'title ASC',
    za:     'title DESC',
  };
  const orderBy = sortMap[sort] || 'rating DESC, title ASC';
  const where   = conds.join(' AND ');

  const total = db.prepare(`SELECT COUNT(*) AS n FROM games WHERE ${where}`).get(params).n;
  const data  = db.prepare(
    `SELECT * FROM games WHERE ${where} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
  ).all({ ...params, limit: Number(limit), offset: Number(offset) });

  return { total, data };
}

/** Auth middleware — validates Bearer JWT, attaches req.user */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES  /api/auth/*
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/signup
 * Body: { email, password, displayName }
 * Returns: { token, user }
 */
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  // Check if email already taken
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  }

  try {
    const hash      = await bcrypt.hash(password, 10); // 10 salt rounds
    const id        = crypto.randomUUID();
    const name      = (displayName || '').trim() || email.split('@')[0];
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO users (id, email, password, display_name, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(id, email, hash, name, createdAt);

    const token = jwt.sign(
      { id, email, display_name: name, created_at: createdAt },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id, email, display_name: name, created_at: createdAt },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/signin
 * Body: { email, password }
 * Returns: { token, user }
 */
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, display_name: user.display_name, created_at: user.created_at },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, display_name: user.display_name, created_at: user.created_at },
  });
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Returns current user info (re-validates token on server)
 */
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, display_name, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FAVORITES ROUTES  /api/auth/favorites/*
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/auth/favorites
 * Returns list of game_ids the current user has favorited
 */
app.get('/api/auth/favorites', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT game_id FROM favorites WHERE user_id = ?').all(req.user.id);
  res.json({ success: true, data: rows.map(r => r.game_id) });
});

/**
 * POST /api/auth/favorites/toggle
 * Body: { gameId }
 * Adds or removes a favorite; returns { isFav: boolean }
 */
app.post('/api/auth/favorites/toggle', requireAuth, (req, res) => {
  const gameId = parseInt(req.body?.gameId);
  if (!gameId) return res.status(400).json({ success: false, error: 'gameId required' });

  // Check game exists
  const game = db.prepare('SELECT id FROM games WHERE id = ?').get(gameId);
  if (!game) return res.status(404).json({ success: false, error: 'Game not found' });

  const existing = db.prepare(
    'SELECT id FROM favorites WHERE user_id = ? AND game_id = ?'
  ).get(req.user.id, gameId);

  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND game_id = ?').run(req.user.id, gameId);
    res.json({ success: true, isFav: false });
  } else {
    db.prepare('INSERT INTO favorites (user_id, game_id) VALUES (?, ?)').run(req.user.id, gameId);
    res.json({ success: true, isFav: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GAME CATALOG ROUTES  /api/*
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /api/genres */
app.get('/api/genres', (req, res) => {
  res.json({ success: true, data: GENRES });
});

/** GET /api/games  — list with optional filters */
app.get('/api/games', (req, res) => {
  const { genre, sort, q, priceType, limit = 100, offset = 0 } = req.query;
  const { total, data } = queryGames({ genre, q, priceType, sort, limit, offset });
  res.json({ success: true, total, data: data.map(normalizeRow) });
});

/** GET /api/games/:id  — single game */
app.get('/api/games/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM games WHERE id = ?').get(parseInt(req.params.id));
  if (!row) return res.status(404).json({ success: false, error: 'Game not found' });
  res.json({ success: true, data: normalizeRow(row) });
});

/** GET /api/search?q=  — quick search */
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, data: [] });
  const { data } = queryGames({ q, limit: 10, offset: 0 });
  res.json({ success: true, data: data.map(normalizeRow) });
});

/** GET /api/stats  — aggregate stats */
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS n FROM games').get().n;

  const genreRows = db.prepare(`
    SELECT genre, COUNT(*) AS count FROM games GROUP BY genre ORDER BY count DESC
  `).all();
  const genreCounts = Object.fromEntries(genreRows.map(r => [r.genre, r.count]));

  const { avg } = db.prepare('SELECT AVG(rating) AS avg FROM games').get();
  const avgRating = avg ? avg.toFixed(2) : '0.00';

  const topRated = db.prepare(
    'SELECT id, title, rating FROM games ORDER BY rating DESC LIMIT 5'
  ).all().map(r => ({ ...r, rating: parseFloat(r.rating) }));

  res.json({
    success: true,
    data: { totalGames: total, totalGenres: GENRES.length, avgRating, genreCounts, topRated },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEAM API PROXY  /api/steam/*  (live per-game data for GameDetail page)
// ═══════════════════════════════════════════════════════════════════════════════
const STEAM_STORE = 'https://store.steampowered.com/api';
const STEAM_WEB   = 'https://api.steampowered.com';

function getSteamAppId(hubId) {
  const row = db.prepare('SELECT steam_app_id FROM games WHERE id = ?').get(hubId);
  return row?.steam_app_id || null;
}

app.get('/api/steam/game/:gameId', async (req, res) => {
  const steamId = getSteamAppId(parseInt(req.params.gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });
  try {
    const json = await fetch(`${STEAM_STORE}/appdetails?appids=${steamId}&cc=us&l=en`).then(r => r.json());
    const data = json[steamId];
    if (!data?.success) return res.status(404).json({ success: false, error: 'Steam data unavailable' });
    res.json({ success: true, steamId, data: data.data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/steam/reviews/:gameId', async (req, res) => {
  const steamId = getSteamAppId(parseInt(req.params.gameId)) || req.params.gameId;
  try {
    const json = await fetch(
      `https://store.steampowered.com/appreviews/${steamId}?json=1&language=en&review_type=positive&num_per_page=5`
    ).then(r => r.json());
    res.json({ success: true, data: json });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/steam/news/:gameId', async (req, res) => {
  const steamId = getSteamAppId(parseInt(req.params.gameId)) || req.params.gameId;
  const key = process.env.STEAM_API_KEY || '';
  try {
    const json = await fetch(
      `${STEAM_WEB}/ISteamNews/GetNewsForApp/v2/?appid=${steamId}&count=5&maxlength=300&format=json&key=${key}`
    ).then(r => r.json());
    res.json({ success: true, data: json?.appnews?.newsitems || [] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/steam/price/:gameId', async (req, res) => {
  const steamId = getSteamAppId(parseInt(req.params.gameId)) || req.params.gameId;
  try {
    const json = await fetch(
      `${STEAM_STORE}/appdetails?appids=${steamId}&cc=us&filters=price_overview`
    ).then(r => r.json());
    res.json({ success: true, data: json[steamId]?.data || {} });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Start ──────────────────────────────────────────────────────────────────────
const totalGames = db.prepare('SELECT COUNT(*) AS n FROM games').get().n;
const totalUsers = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;

app.listen(PORT, () => {
  console.log(`\n🎮  Veltrix API  →  http://localhost:${PORT}`);
  console.log(`    Database  : veltrix.db (SQLite)`);
  console.log(`    Games     : ${totalGames}`);
  console.log(`    Users     : ${totalUsers}`);
  console.log(`    Auth      : JWT (bcrypt + jsonwebtoken)\n`);
});
