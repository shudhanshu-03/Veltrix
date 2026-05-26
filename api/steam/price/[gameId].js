// api/steam/price/[gameId].js — GET /api/steam/price/:gameId
import { getSteamId, setCors } from '../../_lib/supabase.js';

const STEAM_STORE = 'https://store.steampowered.com/api';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { gameId } = req.query;
  const steamId = await getSteamId(parseInt(gameId));
  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const url  = `${STEAM_STORE}/appdetails?appids=${steamId}&filters=price_overview&cc=us`;
    const resp = await fetch(url);
    const json = await resp.json();
    const data = json[steamId];
    if (!data?.success) return res.status(404).json({ success: false, error: 'Price not available' });
    res.json({ success: true, steamId, price: data.data?.price_overview || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
