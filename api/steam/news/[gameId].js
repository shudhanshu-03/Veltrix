const fetch = require('node-fetch');
const { games } = require('../../../_lib/data');

const STEAM_WEB = 'https://api.steampowered.com';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { gameId } = req.query;
  const game = games.find(g => String(g.id) === String(gameId));
  const steamId = game?.steamAppId || game?.steam_app_id || gameId;
  const key = process.env.STEAM_API_KEY || '';

  try {
    const json = await fetch(
      `${STEAM_WEB}/ISteamNews/GetNewsForApp/v2/?appid=${steamId}&count=5&maxlength=300&format=json&key=${key}`
    ).then(r => r.json());
    res.json({ success: true, data: json?.appnews?.newsitems || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
