// api/steam/reviews/[gameId].js — GET /api/steam/reviews/:gameId
import { getSteamId, setCors } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { gameId } = req.query;
  const steamId = await getSteamId(parseInt(gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const url = `https://store.steampowered.com/appreviews/${steamId}?json=1&language=all&purchase_type=all`;
    const response = await fetch(url);
    const json     = await response.json();
    res.json({ success: true, steamId, data: json.query_summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
