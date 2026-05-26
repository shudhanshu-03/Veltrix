// api/steam/catalog.js — GET /api/steam/catalog
import { supabase, normalizeRow, setCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const limit  = Math.min(parseInt(req.query.limit  || 50), 200);
  const offset = parseInt(req.query.offset || 0);
  const genre  = (req.query.genre || '').toLowerCase();

  try {
    let query = supabase.from('games').select('*', { count: 'exact' }).order('rating', { ascending: false });
    if (genre && genre !== 'all') {
      query = query.contains('genres', [genre.charAt(0).toUpperCase() + genre.slice(1)]);
    }
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, total: count, source: 'supabase', data: (data || []).map(normalizeRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
