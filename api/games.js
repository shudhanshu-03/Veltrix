// api/games.js — GET /api/games?genre=&sort=&q=&priceType=&limit=&offset=
import { supabase, normalizeRow, setCors } from './_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { genre, sort, q, priceType, limit = 100, offset = 0 } = req.query;

    let query = supabase.from('games').select('*', { count: 'exact' });

    if (genre && genre !== 'all') {
      query = query.contains('genres', [genre.charAt(0).toUpperCase() + genre.slice(1)]);
    }
    if (priceType && priceType !== 'all') {
      query = query.eq('price_type', priceType);
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,developer.ilike.%${q}%,genre.ilike.%${q}%`);
    }

    switch (sort) {
      case 'rating': query = query.order('rating', { ascending: false }); break;
      case 'year':   query = query.order('year',   { ascending: false }); break;
      case 'az':     query = query.order('title',  { ascending: true  }); break;
      case 'za':     query = query.order('title',  { ascending: false }); break;
      default:       query = query.order('rating', { ascending: false }); break;
    }

    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, total: count, data: (data || []).map(normalizeRow) });
  } catch (err) {
    console.error('/api/games error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
