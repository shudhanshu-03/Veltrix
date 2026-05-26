// api/steam/news/[gameId].js — GET /api/steam/news/:gameId
import { getSteamId, setCors } from '../../_lib/supabase.js';

const STEAM_WEB = 'https://api.steampowered.com';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { gameId } = req.query;
  const steamId = await getSteamId(parseInt(gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  const STEAM_API_KEY = process.env.STEAM_API_KEY || '';

  try {
    const url = `${STEAM_WEB}/ISteamNews/GetNewsForApp/v2/?appid=${steamId}&count=5&maxlength=300&format=json${STEAM_API_KEY ? '&key=' + STEAM_API_KEY : ''}`;
    const response = await fetch(url);
    const json     = await response.json();
    res.json({ success: true, steamId, data: json.appnews?.newsitems || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
