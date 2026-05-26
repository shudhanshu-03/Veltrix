// Central API service — all requests go to Express backend (proxied by Vite)
const API = '/api';

const _cache = new Map();
async function apiFetch(endpoint) {
  if (_cache.has(endpoint)) return _cache.get(endpoint);
  const res  = await fetch(API + endpoint);
  if (!res.ok) throw new Error(`API error ${res.status}: ${endpoint}`);
  const json = await res.json();
  if (json.success !== false) _cache.set(endpoint, json);
  return json;
}

export async function getGames({ genre, sort, q, priceType, limit = 100, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (genre)     params.set('genre',     genre);
  if (sort)      params.set('sort',      sort);
  if (q)         params.set('q',         q);
  if (priceType) params.set('priceType', priceType);
  params.set('limit',  limit);
  params.set('offset', offset);
  return apiFetch(`/games?${params}`);
}

export async function getGame(id) {
  return apiFetch(`/games/${id}`);
}

export async function getGenres() {
  return apiFetch('/genres');
}

export async function searchGames(q) {
  if (!q) return { success: true, data: [] };
  return apiFetch(`/search?q=${encodeURIComponent(q)}`);
}

export async function getStats() {
  return apiFetch('/stats');
}

// Steam proxy — per-game data
export async function getSteamReviews(gameId) {
  try { return await apiFetch(`/steam/reviews/${gameId}`); } catch { return null; }
}
export async function getSteamNews(gameId) {
  try { return await apiFetch(`/steam/news/${gameId}`); } catch { return null; }
}
export async function getSteamPrice(gameId) {
  try { return await apiFetch(`/steam/price/${gameId}`); } catch { return null; }
}
export async function getSteamGameDetails(gameId) {
  try { return await apiFetch(`/steam/game/${gameId}`); } catch { return null; }
}

// Steam catalog — full game list (populated after running npm run fetch-steam)
export async function getSteamCatalog({ genre, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (genre)  params.set('genre',  genre);
  params.set('limit',  limit);
  params.set('offset', offset);
  try { return await apiFetch(`/steam/catalog?${params}`); } catch { return null; }
}

// Steam featured games (homepage spotlight)
export async function getSteamFeatured() {
  try { return await apiFetch('/steam/featured'); } catch { return null; }
}
