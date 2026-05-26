// api/steam/featured.js — GET /api/steam/featured
import { setCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch('https://store.steampowered.com/api/featured');
    const json     = await response.json();
    res.json({ success: true, data: json });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
