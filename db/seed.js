'use strict';
/**
 * db/seed.js
 *
 * Reads data/games.json and bulk-inserts every game into the SQLite
 * `games` table using a single transaction (very fast).
 *
 * Run:  node db/seed.js
 *
 * Safe to re-run — uses INSERT OR REPLACE so existing rows are updated
 * without touching the users or favorites tables.
 */

const db   = require('./database');
const fs   = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, '..', 'client', 'api', '_lib', 'gamesData.js');

if (!fs.existsSync(gamesPath)) {
  console.error('❌  gamesData.js not found.');
  process.exit(1);
}

const games = require(gamesPath);
console.log(`📦  Read ${games.length} games from data/games.json`);

// ── Prepared statement ─────────────────────────────────────────────────────────
const insert = db.prepare(`
  INSERT OR REPLACE INTO games
    (steam_app_id, title, genre, genres, year, developer, publisher,
     rating, price, price_type, tags, icon, header_image, description, steam, gradient)
  VALUES
    (@steam_app_id, @title, @genre, @genres, @year, @developer, @publisher,
     @rating, @price, @price_type, @tags, @icon, @header_image, @description, @steam, @gradient)
`);

// ── Wrap in a transaction — 398 rows commit as one atomic write ────────────────
const seedAll = db.transaction((rows) => {
  for (const g of rows) {
    insert.run({
      steam_app_id: g.steamAppId  ?? g.steam_app_id  ?? null,
      title:        g.title,
      genre:        g.genre        ?? '',
      genres:       JSON.stringify(Array.isArray(g.genres) ? g.genres : [g.genre].filter(Boolean)),
      year:         g.year         ?? null,
      developer:    g.developer    ?? '',
      publisher:    g.publisher    ?? '',
      rating:       g.rating       ?? 0,
      price:        g.price        ?? 'Free',
      price_type:   g.priceType    ?? g.price_type ?? 'Free',
      tags:         JSON.stringify(Array.isArray(g.tags) ? g.tags : []),
      icon:         g.icon         ?? '🎮',
      header_image: g.headerImage  ?? g.header_image ?? '',
      description:  g.description  ?? '',
      steam:        g.steam        ?? '',
      gradient:     g.gradient     ?? '',
    });
  }
});

// Clear old game rows before re-seeding so IDs stay stable
db.exec('DELETE FROM games');
db.exec("DELETE FROM sqlite_sequence WHERE name='games'"); // reset AUTOINCREMENT counter

seedAll(games);

const count = db.prepare('SELECT COUNT(*) AS n FROM games').get().n;
console.log(`✅  Seeded ${count} games into veltrix.db`);

// Show genre breakdown
const genres = db.prepare(`
  SELECT genre, COUNT(*) AS total
  FROM games
  GROUP BY genre
  ORDER BY total DESC
  LIMIT 12
`).all();

console.log('\n📊  Genre breakdown:');
genres.forEach(r => console.log(`   ${r.genre.padEnd(14)} ${r.total} games`));
