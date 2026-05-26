require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Supabase Client ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://poaorgynzqylsxeiotob.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_2XCJ7usbF29k6RA6FobkUQ_OX7f_tsy';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(compression());
app.use(cors());
app.use(express.json());

// Rate limit: 100 req/15min per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ─── Genres (static config) ───────────────────────────────────────────────────
const GENRES = [
  { id: 'action', name: 'Action', icon: '⚔️', gradient: 'linear-gradient(135deg,#e53935,#b71c1c)', desc: 'Fast-paced combat and explosions.' },
  { id: 'rpg', name: 'RPG', icon: '🧙', gradient: 'linear-gradient(135deg,#7b1fa2,#4a148c)', desc: 'Deep stories, character progression.' },
  { id: 'fps', name: 'FPS', icon: '🔫', gradient: 'linear-gradient(135deg,#2e7d32,#1b5e20)', desc: 'First-person shooting action.' },
  { id: 'strategy', name: 'Strategy', icon: '♟️', gradient: 'linear-gradient(135deg,#0288d1,#01579b)', desc: 'Build, plan, and conquer.' },
  { id: 'horror', name: 'Horror', icon: '💀', gradient: 'linear-gradient(135deg,#8B0000,#1a0000)', desc: 'Survive the darkness and fear.' },
  { id: 'sports', name: 'Sports', icon: '⚽', gradient: 'linear-gradient(135deg,#00897b,#004d40)', desc: 'Compete in your favorite sport.' },
  { id: 'simulation', name: 'Simulation', icon: '🏙️', gradient: 'linear-gradient(135deg,#558b2f,#33691e)', desc: 'Build, manage, and simulate.' },
  { id: 'adventure', name: 'Adventure', icon: '🗺️', gradient: 'linear-gradient(135deg,#ef6c00,#bf360c)', desc: 'Explore vast worlds and stories.' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩', gradient: 'linear-gradient(135deg,#0097a7,#006064)', desc: 'Challenge your mind and logic.' },
  { id: 'racing', name: 'Racing', icon: '🏎️', gradient: 'linear-gradient(135deg,#f57c00,#e65100)', desc: 'High-speed racing and stunts.' },
  { id: 'fighting', name: 'Fighting', icon: '🥊', gradient: 'linear-gradient(135deg,#c62828,#6d1010)', desc: 'One-on-one combat showdowns.' },
  { id: 'sandbox', name: 'Sandbox', icon: '🌍', gradient: 'linear-gradient(135deg,#f9a825,#e65100)', desc: 'Build anything in open worlds.' },
];

// ─── Helper: normalize Supabase row → our API shape ──────────────────────────
function normalizeRow(row) {
  return {
    id: row.id,
    steamAppId: row.steam_app_id,
    title: row.title,
    genre: row.genre,
    genres: row.genres || [row.genre].filter(Boolean),
    year: row.year,
    developer: row.developer,
    publisher: row.publisher,
    rating: row.rating != null ? parseFloat(row.rating) : 0,
    price: row.price,
    priceType: row.price_type,
    tags: row.tags || [],
    icon: row.icon || '🎮',
    headerImage: row.header_image,
    description: row.description,
    steam: row.steam,
    // Gradient derived from genre for fallback display
    gradient: GENRES.find(g => g.id === (row.genre || '').toLowerCase())?.gradient
      || 'linear-gradient(135deg,#1a1a2e,#16213e)',
  };
}

// ─── API Routes ───────────────────────────────────────────────────────────────

/** GET /api/genres */
app.get('/api/genres', (req, res) => {
  res.json({ success: true, data: GENRES });
});

/** GET /api/games — dynamic Steam API catalog */
app.get('/api/games', async (req, res) => {
  try {
    const { genre, sort, q, limit = 50, offset = 0 } = req.query;

    // Map genres to Steam Tags
    const STEAM_TAGS = {
      action: 19, rpg: 122, fps: 1663, strategy: 9, horror: 1662,
      sports: 1773, simulation: 599, adventure: 21, puzzle: 1664,
      racing: 1644, fighting: 1743, sandbox: 5547
    };

    let url = `https://store.steampowered.com/search/results/?json=1&count=${limit}&start=${offset}`;
    if (q) {
      url += `&term=${encodeURIComponent(q)}`;
    } else if (genre && genre !== 'all' && STEAM_TAGS[genre.toLowerCase()]) {
      url += `&tags=${STEAM_TAGS[genre.toLowerCase()]}`;
    }

    if (sort === 'rating') url += '&filter=topsellers';
    if (sort === 'year') url += '&filter=recent';

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    if (!response.ok) throw new Error('Steam search failed');
    const json = await response.json();

    const games = (json.items || []).map(item => {
      const match = item.logo?.match(/\/apps\/(\d+)\//);
      const steamId = match ? parseInt(match[1]) : Math.floor(Math.random() * 1000000);
      
      return {
        id: steamId,
        steamAppId: steamId,
        title: item.name,
        genre: genre !== 'all' ? genre : 'Action',
        genres: [genre !== 'all' ? genre : 'Action'],
        year: new Date().getFullYear(),
        rating: 4.5,
        price: 'See Store',
        priceType: 'Paid',
        tags: [],
        icon: '🎮',
        headerImage: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamId}/capsule_616x353.jpg`,
        steam: `https://store.steampowered.com/app/${steamId}`,
        gradient: GENRES.find(g => g.id === (genre || 'action').toLowerCase())?.gradient || 'linear-gradient(135deg,#1a1a2e,#16213e)',
      };
    });

    res.json({ success: true, total: 10000, source: 'steam', data: games });
  } catch (err) {
    console.error('/api/games error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/games/:id — single game */
app.get('/api/games/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    let { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    // If not found in DB (because we dynamically loaded it from Steam search), fetch from Steam API directly
    if (error || !data) {
      const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${gameId}&cc=us&l=en`;
      const steamRes = await fetch(steamUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const steamJson = await steamRes.json();
      const entry = steamJson[gameId];
      if (!entry?.success || !entry.data) {
        return res.status(404).json({ success: false, error: 'Game not found on Steam' });
      }

      const d = entry.data;
      const priceObj = d.price_overview;
      let price = 'Free', priceType = 'Free';
      if (d.is_free === false && priceObj) {
        price = priceObj.final_formatted || '$0.00'; priceType = 'Paid';
      }
      
      const tags = (d.genres || []).map(g => g.description).slice(0, 4);

      data = {
        id: gameId,
        steamAppId: gameId,
        title: d.name,
        genre: tags[0] || 'Action',
        genres: tags,
        year: (d.release_date?.date || '').match(/\d{4}/)?.[0] || 2024,
        developer: (d.developers || ['Unknown'])[0],
        publisher: (d.publishers || ['Unknown'])[0],
        rating: 4.5,
        price,
        priceType,
        tags,
        icon: '🎮',
        headerImage: d.header_image,
        description: (d.short_description || '').replace(/<[^>]*>/g, ''),
        steam: `https://store.steampowered.com/app/${gameId}`,
        gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)',
      };
      return res.json({ success: true, data });
    }

    res.json({ success: true, data: normalizeRow(data) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/search?q= */
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, data: [] });

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`title.ilike.%${q}%,developer.ilike.%${q}%`)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ success: true, data: (data || []).map(normalizeRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/stats — aggregate stats */
app.get('/api/stats', async (req, res) => {
  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('id, rating, genres, title');

    if (error) throw error;

    const genreCounts = {};
    games.forEach(g => {
      (g.genres || []).forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    const avgRating = games.length
      ? (games.reduce((s, g) => s + parseFloat(g.rating || 0), 0) / games.length).toFixed(2)
      : '0.00';

    const topRated = [...games]
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 5)
      .map(g => ({ id: g.id, title: g.title, rating: parseFloat(g.rating) }));

    res.json({
      success: true,
      data: { totalGames: games.length, totalGenres: GENRES.length, avgRating, genreCounts, topRated }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Steam API Proxy ──────────────────────────────────────────────────────────
const STEAM_API_KEY = process.env.STEAM_API_KEY || '';
const STEAM_STORE = 'https://store.steampowered.com/api';
const STEAM_WEB = 'https://api.steampowered.com';

async function getSteamId(hubId) {
  // If the ID is large, it's already a Steam App ID (because of our dynamic Steam proxy)
  if (hubId > 100000) return hubId;

  const { data } = await supabase
    .from('games')
    .select('steam_app_id')
    .eq('id', hubId)
    .single();
  return data?.steam_app_id || hubId;
}

/** GET /api/steam/game/:gameId */
app.get('/api/steam/game/:gameId', async (req, res) => {
  const steamId = await getSteamId(parseInt(req.params.gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const url = `${STEAM_STORE}/appdetails?appids=${steamId}&cc=us&l=en`;
    const response = await fetch(url);
    const json = await response.json();
    const data = json[steamId];
    if (!data?.success) return res.status(404).json({ success: false, error: 'Steam data not available' });
    res.json({ success: true, steamId, data: data.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/steam/catalog */
app.get('/api/steam/catalog', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || 50), 200);
  const offset = parseInt(req.query.offset || 0);
  const genre = (req.query.genre || '').toLowerCase();

  try {
    let query = supabase.from('games').select('*', { count: 'exact' }).order('rating', { ascending: false });
    if (genre && genre !== 'all') {
      query = query.contains('genres', [genre.charAt(0).toUpperCase() + genre.slice(1)]);
    }
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, total: count, source: 'supabase', data: (data || []).map(normalizeRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/steam/featured */
app.get('/api/steam/featured', async (req, res) => {
  try {
    const response = await fetch(`${STEAM_STORE}/featured`);
    const json = await response.json();
    res.json({ success: true, data: json });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/steam/news/:gameId */
app.get('/api/steam/news/:gameId', async (req, res) => {
  const steamId = await getSteamId(parseInt(req.params.gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const url = `${STEAM_WEB}/ISteamNews/GetNewsForApp/v2/?appid=${steamId}&count=5&maxlength=300&format=json${STEAM_API_KEY ? '&key=' + STEAM_API_KEY : ''}`;
    const response = await fetch(url);
    const json = await response.json();
    res.json({ success: true, steamId, data: json.appnews?.newsitems || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/steam/reviews/:gameId */
app.get('/api/steam/reviews/:gameId', async (req, res) => {
  const steamId = await getSteamId(parseInt(req.params.gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const url = `https://store.steampowered.com/appreviews/${steamId}?json=1&language=all&purchase_type=all`;
    const response = await fetch(url);
    const json = await response.json();
    res.json({ success: true, steamId, data: json.query_summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/steam/price/:gameId */
app.get('/api/steam/price/:gameId', async (req, res) => {
  const steamId = await getSteamId(parseInt(req.params.gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const url = `${STEAM_STORE}/appdetails?appids=${steamId}&filters=price_overview&cc=us`;
    const resp = await fetch(url);
    const json = await resp.json();
    const data = json[steamId];
    if (!data?.success) return res.status(404).json({ success: false, error: 'Price not available' });
    res.json({ success: true, steamId, price: data.data?.price_overview || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚡ Veltrix server (Supabase-powered) running at:\n   http://localhost:${PORT}\n`);
});
