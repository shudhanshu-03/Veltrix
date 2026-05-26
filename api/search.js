// api/search.js — GET /api/search?q=
import { supabase, normalizeRow, setCors } from './_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, data: [] });

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`title.ilike.%${q}%,developer.ilike.%${q}%`)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ success: true, data: (data || []).map(normalizeRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
