// api/stats.js — GET /api/stats
import { supabase, GENRES, setCors } from './_lib/supabase.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('id, rating, genres, title');

    if (error) throw error;

    const genreCounts = {};
    games.forEach(g => {
      (g.genres || []).forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    const avgRating = games.length
      ? (games.reduce((s, g) => s + parseFloat(g.rating || 0), 0) / games.length).toFixed(2)
      : '0.00';

    const topRated = [...games]
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 5)
      .map(g => ({ id: g.id, title: g.title, rating: parseFloat(g.rating) }));

    res.json({
      success: true,
      data: { totalGames: games.length, totalGenres: GENRES.length, avgRating, genreCounts, topRated }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
