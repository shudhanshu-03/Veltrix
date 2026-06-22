# Veltrix

A full-stack PC game discovery platform built with React and Vite, powered by a self-contained local SQLite and Express.js backend. Browse games by genre, search the catalog, view Steam reviews and news, and explore detailed game pages.

## Tech Stack

- **Frontend** — React 19, Vite, React Router, Framer Motion, GSAP, Three.js
- **Backend** — Node.js, Express
- **Database** — SQLite (`better-sqlite3`)
- **Authentication** — Hand-coded JWT + bcrypt

## Features

- Browse and filter games by genre, price, and rating
- Full-text search across the game catalog
- Local JSON/SQLite integration (no cloud dependencies required)
- Custom authentication flow (Sign Up, Log In, Favorites) completely stored locally
- Steam API proxy — live reviews, news, and pricing fetched server-side
- Responsive dark UI with scroll-linked animations

## Project Structure

```
veltrix/
├── client/       # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
├── db/           # SQLite database schema and seed scripts
├── data/         # Raw JSON datasets
├── server.js     # Express server API endpoints and logic
└── veltrix.db    # (Generated) Local SQLite database file
```

## Local Development

```bash
# 1. Install root dependencies (Express, SQLite, etc.)
npm install

# 2. Install client dependencies
cd client && npm install

# 3. Seed the local SQLite database from data/games.json
npm run seed

# 4. Start Express API server (runs on port 3000)
npm run dev

# 5. In a separate terminal, start the React dev server
cd client && npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
PORT=3000
JWT_SECRET=your_jwt_secret
STEAM_API_KEY=your_steam_api_key  # optional, but recommended for Steam API limits
```
