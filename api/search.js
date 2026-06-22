const { queryGames } = require('../_lib/data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, data: [] });
  
  const { data } = queryGames({ q, limit: 10, offset: 0 });
  res.json({ success: true, data });
};
