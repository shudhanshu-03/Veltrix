/**
 * services/auth.js  ── JWT-based Auth (calls Veltrix server)
 *
 * How it works:
 *  1. signup / signin  → POST to /api/auth/*  → server stores bcrypt hash in SQLite
 *  2. Server returns a signed JWT token
 *  3. Token is stored in localStorage and sent as  Authorization: Bearer <token>
 *     on every protected request (favorites)
 *  4. onAuthStateChange uses a tiny in-memory event bus so the Navbar
 *     reacts to login / logout without a full page reload
 *
 * The session object shape mirrors what the rest of the app expects:
 *   { user: { id, email, created_at, user_metadata: { display_name } } }
 */

const TOKEN_KEY = 'veltrix_token';

// ── Tiny event bus ─────────────────────────────────────────────────────────────
const listeners = new Set();
function broadcast(event, session) {
  listeners.forEach(cb => cb(event, session));
}

// ── JWT utils ──────────────────────────────────────────────────────────────────
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

function tokenToSession(token) {
  const p = decodeToken(token);
  if (!p) return null;
  return {
    token,
    user: {
      id:            p.id,
      email:         p.email,
      created_at:    p.created_at,
      user_metadata: { display_name: p.display_name },
    },
  };
}

function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ── Auth header helper ─────────────────────────────────────────────────────────
function authHeaders() {
  const token = getToken();
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
               : { 'Content-Type': 'application/json' };
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function signUpWithEmail(email, password, displayName) {
  const res  = await fetch('/api/auth/signup', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password, displayName }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Sign-up failed');

  storeToken(json.token);
  const session = tokenToSession(json.token);
  broadcast('SIGNED_IN', session);
  return session.user;
}

export async function signInWithEmail(email, password) {
  const res  = await fetch('/api/auth/signin', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Sign-in failed');

  storeToken(json.token);
  const session = tokenToSession(json.token);
  broadcast('SIGNED_IN', session);
  return session.user;
}

export async function signOut() {
  clearToken();
  broadcast('SIGNED_OUT', null);
}

export async function getCurrentSession() {
  const token = getToken();
  if (!token) return null;
  const session = tokenToSession(token);
  if (!session) { clearToken(); return null; } // expired
  return session;
}

/**
 * onAuthStateChange(callback)
 * Fires immediately with current state, then on every login/logout.
 * Returns { data: { subscription: { unsubscribe } } } to match Supabase shape.
 */
export function onAuthStateChange(callback) {
  // Fire immediately with current state
  const token   = getToken();
  const session = token ? tokenToSession(token) : null;
  callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);

  listeners.add(callback);
  const subscription = { unsubscribe: () => listeners.delete(callback) };
  return { data: { subscription } };
}

// ── Favorites ──────────────────────────────────────────────────────────────────

/** Returns an array of game IDs the current user has favorited */
export async function getFavorites() {
  const token = getToken();
  if (!token) return [];
  try {
    const res  = await fetch('/api/auth/favorites', { headers: authHeaders() });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

/**
 * Toggle a game in / out of the user's favorites.
 * Returns { success, isFav, requireLogin }
 */
export async function toggleFavorite(gameId) {
  const token = getToken();
  if (!token) return { success: false, requireLogin: true };
  try {
    const res  = await fetch('/api/auth/favorites/toggle', {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ gameId }),
    });
    const json = await res.json();
    return json.success ? { success: true, isFav: json.isFav } : { success: false };
  } catch {
    return { success: false };
  }
}
