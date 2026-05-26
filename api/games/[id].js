// api/games/[id].js — GET /api/games/:id
import { supabase, normalizeRow, setCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) return res.status(404).json({ success: false, error: 'Game not found' });
    res.json({ success: true, data: normalizeRow(data) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
