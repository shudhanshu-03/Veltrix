const games = require('./gamesData.cjs');

const GENRES = [
  { id:'action',     name:'Action',     icon:'⚔️',  gradient:'linear-gradient(135deg,#e53935,#b71c1c)',  desc:'Fast-paced combat and explosions.' },
  { id:'rpg',        name:'RPG',        icon:'🧙',  gradient:'linear-gradient(135deg,#7b1fa2,#4a148c)',  desc:'Deep stories, character progression.' },
  { id:'fps',        name:'FPS',        icon:'🔫',  gradient:'linear-gradient(135deg,#2e7d32,#1b5e20)',  desc:'First-person shooting action.' },
  { id:'strategy',   name:'Strategy',   icon:'♟️',  gradient:'linear-gradient(135deg,#0288d1,#01579b)',  desc:'Build, plan, and conquer.' },
  { id:'horror',     name:'Horror',     icon:'💀',  gradient:'linear-gradient(135deg,#8B0000,#1a0000)',  desc:'Survive the darkness and fear.' },
  { id:'sports',     name:'Sports',     icon:'⚽',  gradient:'linear-gradient(135deg,#00897b,#004d40)',  desc:'Compete in your favorite sport.' },
  { id:'simulation', name:'Simulation', icon:'🏙️', gradient:'linear-gradient(135deg,#558b2f,#33691e)', desc:'Build, manage, and simulate.' },
  { id:'adventure',  name:'Adventure',  icon:'🗺️', gradient:'linear-gradient(135deg,#ef6c00,#bf360c)', desc:'Explore vast worlds and stories.' },
  { id:'puzzle',     name:'Puzzle',     icon:'🧩',  gradient:'linear-gradient(135deg,#0097a7,#006064)',  desc:'Challenge your mind and logic.' },
  { id:'racing',     name:'Racing',     icon:'🏎️', gradient:'linear-gradient(135deg,#f57c00,#e65100)', desc:'High-speed racing and stunts.' },
  { id:'fighting',   name:'Fighting',   icon:'🥊',  gradient:'linear-gradient(135deg,#c62828,#6d1010)',  desc:'One-on-one combat showdowns.' },
  { id:'sandbox',    name:'Sandbox',    icon:'🌍',  gradient:'linear-gradient(135deg,#f9a825,#e65100)', desc:'Build anything in open worlds.' },
];

function normalizeRow(g) {
  const genreId = (g.genre || '').toLowerCase();
  const genresArr = Array.isArray(g.genres) ? g.genres : (g.genre ? [g.genre] : []);
  const tagsArr = Array.isArray(g.tags) ? g.tags : [];
  
  return {
    id:          g.id,
    steamAppId:  g.steamAppId || g.steam_app_id || null,
    title:       g.title,
    genre:       g.genre || '',
    genres:      genresArr,
    year:        g.year || null,
    developer:   g.developer || '',
    publisher:   g.publisher || '',
    rating:      parseFloat(g.rating) || 0,
    price:       g.price || 'Free',
    priceType:   g.priceType || g.price_type || 'Free',
    tags:        tagsArr,
    icon:        g.icon || '🎮',
    headerImage: g.headerImage || g.header_image || '',
    description: g.description || '',
    steam:       g.steam || '',
    gradient:    g.gradient || GENRES.find(genre => genre.id === genreId)?.gradient || 'linear-gradient(135deg,#1a1a2e,#16213e)',
  };
}

function queryGames({ genre, q, priceType, sort, limit = 100, offset = 0 }) {
  let filtered = games;

  if (genre && genre !== 'all') {
    const gUpper = genre.charAt(0).toUpperCase() + genre.slice(1);
    filtered = filtered.filter(g => {
      const gArr = Array.isArray(g.genres) ? g.genres : [g.genre];
      return gArr.some(gen => gen && gen.toLowerCase() === genre.toLowerCase());
    });
  }
  
  if (priceType && priceType !== 'all') {
    filtered = filtered.filter(g => (g.priceType || g.price_type) === priceType);
  }
  
  if (q) {
    const term = q.toLowerCase();
    filtered = filtered.filter(g => 
      (g.title && g.title.toLowerCase().includes(term)) ||
      (g.developer && g.developer.toLowerCase().includes(term)) ||
      (g.description && g.description.toLowerCase().includes(term))
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    const ratingA = parseFloat(a.rating) || 0;
    const ratingB = parseFloat(b.rating) || 0;
    
    if (sort === 'year') {
      const yA = a.year || 0;
      const yB = b.year || 0;
      if (yA !== yB) return yB - yA;
      return ratingB - ratingA;
    }
    if (sort === 'az') return (a.title || '').localeCompare(b.title || '');
    if (sort === 'za') return (b.title || '').localeCompare(a.title || '');
    
    // Default: rating DESC
    if (ratingA !== ratingB) return ratingB - ratingA;
    return (a.title || '').localeCompare(b.title || '');
  });

  const total = filtered.length;
  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

  return { total, data: paginated.map(normalizeRow) };
}

module.exports = { games, GENRES, normalizeRow, queryGames };
