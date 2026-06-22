import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { getGame, getGames, getSteamReviews, getSteamNews, getSteamGameDetails } from '../services/api';
import { getFavorites, toggleFavorite } from '../services/auth';
import GameCard from '../components/GameCard';
import { Spinner } from '../components/Loader';

// ─── Parse Steam HTML requirements into readable lines ────────────────────────
function parseRequirements(htmlStr) {
  if (!htmlStr) return [];
  // Strip HTML tags, split on <br> or <strong> boundaries
  const lines = htmlStr
    .replace(/<strong>/gi, '\n')
    .replace(/<\/strong>/gi, ': ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
  // Pair "Label: Value" into objects
  const pairs = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.endsWith(':') && lines[i + 1]) {
      pairs.push({ label: line.slice(0, -1), value: lines[i + 1] });
      i++;
    } else if (line.includes(': ')) {
      const idx = line.indexOf(': ');
      pairs.push({ label: line.slice(0, idx), value: line.slice(idx + 2) });
    }
  }
  return pairs.length ? pairs : [{ label: 'Info', value: htmlStr.replace(/<[^>]+>/g, '') }];
}

// ─── System Requirements Block ────────────────────────────────────────────────
function SysReqBlock({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
      <h4 className="font-orbitron text-xs text-[#ff8c42] mb-4">{label}</h4>
      <div className="text-xs text-slate-400 space-y-2.5">
        {items.map(({ label: l, value: v }, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-slate-500 min-w-[80px] shrink-0 font-medium">{l}:</span>
            <span className="text-slate-300 leading-relaxed">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame]           = useState(null);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [reviews, setReviews]     = useState(null);
  const [news, setNews]           = useState([]);
  const [steamData, setSteamData] = useState(null);
  const [isFav, setIsFav]         = useState(false);
  const [favLoading, setFavLoad]  = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true); setGame(null); setReviews(null); setNews([]); setSteamData(null); setIsFav(false);

    // Check if this game is already favorited
    getFavorites().then(favIds => setIsFav(favIds.includes(parseInt(id)))).catch(() => {});

    getGame(id).then(res => {
      const g = res?.data;
      if (!g) return;
      setGame(g);
      document.title = `${g.title} — Veltrix`;

      requestAnimationFrame(() => {
        gsap.from('.detail-hero', { opacity: 0, duration: .6, ease: 'power2.out' });
        gsap.from('.detail-info > *', { y: 30, opacity: 0, duration: .65, stagger: .1, ease: 'power2.out', delay: .2 });
        gsap.from('.detail-body > *', { y: 40, opacity: 0, duration: .65, stagger: .12, ease: 'power2.out', delay: .35 });
      });

      getGames({ genre: g.genre, limit: 5 }).then(r => setRelated((r?.data || []).filter(x => x.id !== g.id).slice(0, 4))).catch(() => {});
      getSteamReviews(g.id).then(r => setReviews(r?.data || null)).catch(() => {});
      getSteamNews(g.id).then(r => setNews(r?.data?.slice(0, 4) || [])).catch(() => {});
      // Fetch full Steam data for system requirements + screenshots
      getSteamGameDetails(g.id).then(r => setSteamData(r?.data || null)).catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleFavToggle = async () => {
    setFavLoad(true);
    const result = await toggleFavorite(parseInt(id));
    if (result.success) setIsFav(result.isFav);
    else if (result.requireLogin) alert('Please sign in to save favorites!');
    setFavLoad(false);
  };

  if (loading) return <div className="pt-24"><Spinner /></div>;
  if (!game) return (
    <div className="text-center py-32 text-slate-400">
      <div className="text-5xl mb-4">🎮</div>
      <h3 className="text-xl font-semibold mb-2">Game not found</h3>
      <Link to="/games" className="text-[#ff8c42] hover:underline">← Browse all games</Link>
    </div>
  );

  const stars    = '★'.repeat(Math.round(game.rating)) + '☆'.repeat(5 - Math.round(game.rating));
  const pct      = reviews?.total_positive && reviews?.total_reviews ? Math.round(reviews.total_positive / reviews.total_reviews * 100) : null;
  const revColor = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';

  // Parse system requirements from Steam API response
  const minReq = parseRequirements(steamData?.pc_requirements?.minimum);
  const recReq = parseRequirements(steamData?.pc_requirements?.recommended);
  const hasReqs = minReq.length > 0 || recReq.length > 0;

  // Screenshots from Steam
  const screenshots = (steamData?.screenshots || []).slice(0, 4);

  // Description: prefer Steam's full version
  const description = steamData?.short_description || game.description || game.desc || 'No description available.';

  return (
    <div>
      {/* Hero Image - Full, uncropped, no overlay */}
      <div className="detail-hero w-full bg-[#05050a]" style={{ marginTop: 'var(--nav-h)' }}>
        {(game.headerImage || steamData?.header_image) && (
          <img
            src={steamData?.header_image || game.headerImage}
            alt={game.title}
            className="w-full h-auto object-contain block mx-auto max-h-[60vh]"
          />
        )}
      </div>

      {/* Game Details Header (Below the image) */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-6 border-b border-white/[0.07] mb-12">
        <div className="detail-info">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {(game.genres || [game.genre]).map(g => (
              <Link key={g} to={`/games?genre=${g}`} className="badge badge-purple">{g}</Link>
            ))}
            <span className="badge badge-gray">{game.year}</span>
            {game.priceType === 'Free' && <span className="badge badge-green">Free to Play</span>}
          </div>
          <h1 className="font-orbitron font-black mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>{game.title}</h1>
          <div className="flex items-center gap-4 flex-wrap text-sm text-slate-400 mb-4">
            <span>By <strong className="text-slate-100">{game.developer}</strong></span>
            <span>·</span><span>{game.publisher}</span>
            <span>·</span><span className="text-amber-400">{stars}</span>
            <span className="text-slate-600">{game.rating.toFixed(1)} / 5.0</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(game.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
          </div>

          {/* Favorite button */}
          <div className="mt-6">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleFavToggle}
              disabled={favLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all duration-300 ${
                isFav
                  ? 'bg-red-500/20 border-red-500/60 text-red-400 hover:bg-red-500/30'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:border-white/20'
              }`}
            >
              <Heart size={16} className={isFav ? 'fill-red-400 text-red-400' : ''} />
              {isFav ? 'Saved to Favorites' : 'Add to Favorites'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="detail-body grid gap-10 py-12 grid-cols-1 lg:grid-cols-[1fr_340px]">

          {/* Main content */}
          <div>
            {/* About */}
            <h3 className="font-orbitron text-sm text-[#ff8c42] uppercase tracking-widest mb-3">About This Game</h3>
            <p className="text-slate-400 leading-relaxed mb-8 text-sm">{description}</p>

            {/* Steam Screenshots */}
            {screenshots.length > 0 && (
              <>
                <h3 className="font-orbitron text-sm text-[#ff8c42] uppercase tracking-widest mb-4">Screenshots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  {screenshots.map((ss, i) => (
                    <a key={i} href={ss.path_full} target="_blank" rel="noopener">
                      <img
                        src={ss.path_thumbnail}
                        alt={`${game.title} screenshot ${i + 1}`}
                        className="w-full rounded-lg border border-white/[0.07] hover:border-[rgba(255,85,0,0.4)]/50 transition-colors object-cover h-36"
                      />
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* System Requirements */}
            <h3 className="font-orbitron text-sm text-[#ff8c42] uppercase tracking-widest mb-4">System Requirements</h3>
            {hasReqs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <SysReqBlock label="⚡ MINIMUM" items={minReq} />
                <SysReqBlock label="🚀 RECOMMENDED" items={recReq} />
              </div>
            ) : (
              <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5 mb-10 text-sm text-slate-500">
                {steamData === null
                  ? 'Loading system requirements…'
                  : 'System requirements not available for this title.'}
              </div>
            )}

            {/* Related games */}
            {related.length > 0 && (
              <>
                <h3 className="font-orbitron text-sm text-[#ff8c42] uppercase tracking-widest mb-4">More Like This</h3>
                <div className="grid-games">
                  {related.map(g => <GameCard key={g.id} game={g} />)}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Game info */}
            <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
              <h4 className="font-orbitron text-xs text-slate-600 uppercase tracking-widest mb-4">Game Info</h4>
              {[
                ['Developer', game.developer],
                ['Publisher', game.publisher],
                ['Release', game.year],
                ['Genre', game.genre],
                ['Rating', `${game.rating.toFixed(1)} ⭐`],
                ['Price', game.priceType === 'Free' ? '🟢 Free to Play' : game.price],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm mb-2.5">
                  <span className="text-slate-600">{k}</span>
                  <span className={`font-medium ${k === 'Price' && game.priceType === 'Free' ? 'text-green-400' : 'text-slate-100'}`}>{v}</span>
                </div>
              ))}
            </div>

            {/* Buy links */}
            <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
              <h4 className="font-orbitron text-xs text-slate-600 uppercase tracking-widest mb-4">Where to Buy</h4>
              {game.steam && (
                <a href={game.steam} target="_blank" rel="noopener"
                  className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] border border-white/[0.07] rounded-xl text-slate-100 hover:bg-brand-orange/15 hover:border-[rgba(255,85,0,0.4)]/50 transition-all mb-3 text-sm font-medium no-underline">
                  🎮 View on Steam
                </a>
              )}
              <a href={`https://www.epicgames.com/store/en-US/browse?q=${encodeURIComponent(game.title)}`} target="_blank" rel="noopener"
                className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] border border-white/[0.07] rounded-xl text-slate-100 hover:bg-brand-orange/15 hover:border-[rgba(255,85,0,0.4)]/50 transition-all text-sm font-medium no-underline">
                🛒 Epic Games Store
              </a>
            </div>

            {/* Steam reviews */}
            {reviews && (
              <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
                <h4 className="font-orbitron text-xs text-slate-600 uppercase tracking-widest mb-4">Steam Reviews</h4>
                <div className={`font-bold text-base mb-1 ${revColor}`}>{reviews.review_score_desc}</div>
                {pct && <div className="text-xs text-slate-600 mb-3">{pct}% positive · {(reviews.total_reviews || 0).toLocaleString()} reviews</div>}
                {/* Review score bar */}
                {pct && (
                  <div className="w-full bg-white/[0.07] rounded-full h-1.5 mb-3">
                    <div className={`h-1.5 rounded-full ${pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                )}
                {game.steam && <a href={`${game.steam}#app_reviews_hash`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">View on Steam →</a>}
              </div>
            )}

            <Link to={`/games?genre=${game.genre}`} className="btn btn-outline w-full justify-center flex">
              More {game.genre} Games →
            </Link>
          </div>
        </div>
      </div>

      {/* Steam News */}
      {news.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-12">
          <h3 className="font-orbitron text-sm text-[#ff8c42] uppercase tracking-widest mb-5">📰 Latest Steam News</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener"
                className="block bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-4 hover:border-[rgba(255,85,0,0.4)]/50 transition-colors no-underline">
                <div className="text-sm font-semibold text-slate-100 mb-2 line-clamp-2">{item.title}</div>
                <div className="text-xs text-slate-600">{new Date(item.date * 1000).toLocaleDateString()} · {item.feedlabel}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
