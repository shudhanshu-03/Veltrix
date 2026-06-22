const { games, normalizeRow } = require('../../_lib/data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { id } = req.query;
  const game = games.find(g => String(g.id) === String(id));
  
  if (!game) {
    return res.status(404).json({ success: false, error: 'Game not found' });
  }
  
  res.json({ success: true, data: normalizeRow(game) });
};
