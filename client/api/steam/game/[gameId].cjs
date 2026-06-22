const { games } = require('../../_lib/data.cjs');

const STEAM_STORE = 'https://store.steampowered.com/api';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { gameId } = req.query;
  const game = games.find(g => String(g.id) === String(gameId));
  const steamId = game?.steamAppId || game?.steam_app_id;

  if (!steamId) return res.status(404).json({ success: false, error: 'No Steam ID for this game' });

  try {
    const json = await fetch(`${STEAM_STORE}/appdetails?appids=${steamId}&cc=us&l=en`).then(r => r.json());
    const data = json[steamId];
    if (!data?.success) return res.status(404).json({ success: false, error: 'Steam data unavailable' });
    res.json({ success: true, steamId, data: data.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
