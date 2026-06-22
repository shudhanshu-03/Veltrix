const { games } = require('../../../_lib/data');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { gameId } = req.query;
  const game = games.find(g => String(g.id) === String(gameId));
  const steamId = game?.steamAppId || game?.steam_app_id || gameId;

  try {
    const json = await fetch(
      `https://store.steampowered.com/appreviews/${steamId}?json=1&language=en&review_type=positive&num_per_page=5`
    ).then(r => r.json());
    res.json({ success: true, data: json });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
