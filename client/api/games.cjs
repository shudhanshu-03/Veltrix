const { queryGames } = require('../_lib/data.cjs');

module.exports = (req, res) => {
  // Add CORS headers for good measure
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { genre, sort, q, priceType, limit = 100, offset = 0 } = req.query;
  const { total, data } = queryGames({ genre, q, priceType, sort, limit, offset });
  
  res.json({ success: true, total, data });
};
