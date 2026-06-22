const { GENRES } = require('../_lib/data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.json({ success: true, data: GENRES });
};
