// api/steam/game/[gameId].js — GET /api/steam/game/:gameId
import { getSteamId, setCors } from '../../_lib/supabase.js';

const STEAM_STORE = 'https://store.steampowered.com/api';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { gameId } = req.query;
  const steamId = await getSteamId(parseInt(gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const url      = `${STEAM_STORE}/appdetails?appids=${steamId}&cc=us&l=en`;
    const response = await fetch(url);
    const json     = await response.json();
    const data     = json[steamId];
    if (!data?.success) return res.status(404).json({ success: false, error: 'Steam data not available' });
    res.json({ success: true, steamId, data: data.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
