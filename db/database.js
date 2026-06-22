'use strict';
/**
 * db/database.js
 *
 * Opens (or creates) veltrix.db and applies the full schema.
 * Import this module anywhere in the server — you get back a shared
 * better-sqlite3 Database instance (synchronous, fast, zero config).
 *
 * Tables
 * ──────
 *  games     — full game catalog (seeded from data/games.json)
 *  users     — registered accounts  (password stored as bcrypt hash)
 *  favorites — many-to-many: user ↔ game
 */

const Database = require('better-sqlite3');
const path     = require('path');

// veltrix.db sits in the project root
const db = new Database(path.join(__dirname, '..', 'veltrix.db'));

// ── SQLite performance & integrity settings ────────────────────────────────────
db.pragma('journal_mode = WAL');   // Write-Ahead Logging → faster concurrent reads
db.pragma('foreign_keys  = ON');   // Enforce referential integrity

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  -- ── Games ──────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS games (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    steam_app_id  INTEGER UNIQUE,
    title         TEXT    NOT NULL,
    genre         TEXT    DEFAULT '',
    genres        TEXT    DEFAULT '[]',   -- JSON-encoded text[]
    year          INTEGER,
    developer     TEXT    DEFAULT '',
    publisher     TEXT    DEFAULT '',
    rating        REAL    DEFAULT 0,
    price         TEXT    DEFAULT 'Free',
    price_type    TEXT    DEFAULT 'Free',
    tags          TEXT    DEFAULT '[]',   -- JSON-encoded text[]
    icon          TEXT    DEFAULT '🎮',
    header_image  TEXT    DEFAULT '',
    description   TEXT    DEFAULT '',
    steam         TEXT    DEFAULT '',
    gradient      TEXT    DEFAULT ''
  );

  -- ── Users ───────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT    PRIMARY KEY,           -- crypto.randomUUID()
    email         TEXT    UNIQUE NOT NULL,
    password      TEXT    NOT NULL,              -- bcrypt hash (10 rounds)
    display_name  TEXT    DEFAULT '',
    created_at    TEXT    DEFAULT (datetime('now'))
  );

  -- ── Favorites ───────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS favorites (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT    NOT NULL  REFERENCES users(id)  ON DELETE CASCADE,
    game_id     INTEGER NOT NULL  REFERENCES games(id)  ON DELETE CASCADE,
    created_at  TEXT    DEFAULT (datetime('now')),
    UNIQUE(user_id, game_id)      -- one row per user-game pair
  );
`);

module.exports = db;
