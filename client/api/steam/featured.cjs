const { games, normalizeRow } = require('../_lib/data.cjs');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const featured = [...games]
    .filter(g => g.headerImage || g.header_image)
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, 5)
    .map(normalizeRow);

  res.json({ success: true, data: featured });
};
