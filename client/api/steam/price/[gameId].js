const { games } = require('../../../_lib/data');

const STEAM_STORE = 'https://store.steampowered.com/api';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { gameId } = req.query;
  const game = games.find(g => String(g.id) === String(gameId));
  const steamId = game?.steamAppId || game?.steam_app_id || gameId;

  try {
    const json = await fetch(
      `${STEAM_STORE}/appdetails?appids=${steamId}&cc=us&filters=price_overview`
    ).then(r => r.json());
    res.json({ success: true, data: json[steamId]?.data || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
