# Veltrix 🎮

Veltrix is a high-performance, full-stack PC game discovery platform. It features a modern, fully responsive dark-mode UI, live real-time integrations with the Steam API, and an extremely resilient dual-architecture deployment model (Local SQLite for development, Static JSON Serverless for Vercel).

## 🌟 Key Features

- **Massive Catalog**: Browse 398+ PC games across 12 unique genres.
- **Advanced Filtering**: Filter by genre, sort by rating/newest, and search instantly.
- **Live Steam Integration**: Real-time server-side proxy fetching Steam reviews, pricing, and breaking news.
- **Fully Responsive**: Flawless grid and mobile menu experience across phones, tablets, and desktop.
- **Custom Authentication**: Fast, hand-coded JWT authentication system for favoriting games.
- **Dual Architecture**: Runs on local SQLite (`veltrix.db`) during development, and automatically compiles down to a lightning-fast static JSON file for zero-latency, scale-to-infinity Vercel Serverless deployments.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Framer Motion, GSAP, Swiper
- **Backend / Deployment:** Vercel Serverless Functions (`@vercel/node`), Express.js (for local dev)
- **Data Layer:** SQLite (`better-sqlite3`) for local, pre-compiled static `.cjs` modules for production.

## 🚀 Local Development Setup

Veltrix has two separate `package.json` configurations to cleanly separate the backend tools from the React frontend.

### 1. Install Dependencies
```bash
# Install backend/server dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

### 2. Prepare the Local Database
We need to generate the local SQLite database from the raw data files.
```bash
# From the root directory
npm run seed
```

### 3. Run the Development Servers
You will need to run the API server and the React dev server simultaneously.

```bash
# Terminal 1: Start the Express API (Runs on port 3000)
# From the root directory:
npm run dev

# Terminal 2: Start the Vite React Frontend (Runs on port 5173)
# From the /client directory:
npm run dev
```

### 4. Environment Variables
Copy `.env.example` to `.env` in the root folder and fill in the values:
```env
PORT=3000
JWT_SECRET=any_random_secure_string_here  # Used to sign auth tokens
STEAM_API_KEY=your_steam_api_key_here     # (Optional)
```

## ☁️ Production Deployment (Vercel)

Veltrix is designed for high-performance, zero-maintenance edge deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. The `client/vercel.json` configuration file automatically handles all API routing.
3. The data layer utilizes a compiled `gamesData.cjs` module. Because the data is bundled directly into the serverless functions, there is **no external database connection required** in production. This guarantees 100% uptime and lightning-fast data retrieval.

## 📂 Project Structure

```text
veltrix/
├── client/                 # React frontend & Vercel deployment root
│   ├── api/                # Vercel Serverless Functions
│   │   ├── _lib/           # Production JSON data (gamesData.cjs)
│   │   ├── games/          # Game data endpoints
│   │   └── steam/          # Live Steam API proxy endpoints
│   ├── src/                # React source code (Pages, Components)
│   └── vercel.json         # Critical routing & build rules
├── data/                   # Raw JSON catalogs
├── db/                     # SQLite schema and seeder
├── scripts/                # Data generation and fetching utilities
└── server.js               # Local Express.js entry point
```

## 📜 License
ISC
