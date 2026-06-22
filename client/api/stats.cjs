const { games, GENRES } = require('../_lib/data.cjs');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const totalGames = games.length;
  
  const genreCounts = {};
  games.forEach(g => {
    const genre = g.genre;
    if (genre) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  });

  const validRatings = games.map(g => parseFloat(g.rating)).filter(r => !isNaN(r) && r > 0);
  const avg = validRatings.length > 0 
    ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length) 
    : 0;
  const avgRating = avg.toFixed(2);

  const topRated = [...games]
    .filter(g => g.rating)
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 5)
    .map(g => ({ id: g.id, title: g.title, rating: parseFloat(g.rating) }));

  res.json({
    success: true,
    data: { totalGames, totalGenres: GENRES.length, avgRating, genreCounts, topRated },
  });
};
