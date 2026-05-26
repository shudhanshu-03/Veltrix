# Gaming Hub

A full-stack PC game discovery platform built with React, Vite, and Supabase. Browse games by genre, search the catalog, view Steam reviews and news, and explore detailed game pages.

## Tech Stack

- **Frontend** — React 19, Vite, React Router, Framer Motion, GSAP, Three.js
- **Backend** — Node.js, Express (local dev), Vercel Serverless Functions (production)
- **Database** — Supabase (PostgreSQL)
- **Deployment** — Vercel

## Features

- Browse and filter games by genre, price, and rating
- Full-text search across the game catalog
- Steam integration — live reviews, news, and pricing
- User authentication via Firebase
- Scroll-linked 3D hero animation
- Responsive dark UI

## Project Structure

```
gaming-hub/
├── api/          # Vercel serverless API functions
├── client/       # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
├── server.js     # Express server (local development)
└── vercel.json   # Vercel deployment configuration
```

## Local Development

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Start Express API server (runs on port 3000)
npm run dev

# In a separate terminal, start the React dev server
cd client && npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
STEAM_API_KEY=your_steam_api_key  # optional
```

## Deployment

Hosted on Vercel. The `vercel.json` routes `/api/*` requests to serverless functions and serves the React build for all other routes.
