const { queryGames } = require('../_lib/data.cjs');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { genre, limit = 50, offset = 0 } = req.query;
  const { total, data } = queryGames({ genre, limit, offset });
  res.json({ success: true, total, data });
};
