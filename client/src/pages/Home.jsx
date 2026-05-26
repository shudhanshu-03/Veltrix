import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getGames, getSteamFeatured, getSteamPrice } from '../services/api';
import { GENRES } from '../data/genres';
import GameCard from '../components/GameCard';
import GenreCard from '../components/GenreCard';

/* ── Animated stat counter ──────────────────────────────────── */
const AnimatedStat = ({ target, label, suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null, rafId;
    const animate = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1200, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) rafId = requestAnimationFrame(animate);
    };
    if (target > 0) rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target]);
  return (
    <div className="text-center">
      <div className="gradient-text" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2.2rem', fontWeight: 700 }}>{val.toLocaleString()}{suffix}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  );
};

/* ── V-Mark hero SVG ────────────────────────────────────────── */
const HeroVMark = () => (
  <div className="animate-veltrix-pulse" style={{ width: 120, height: 120, margin: '0 auto 2rem', filter: 'drop-shadow(0 0 40px rgba(255,85,0,0.5)) drop-shadow(0 0 80px rgba(136,0,255,0.35))' }}>
    <svg viewBox="0 0 120 120" fill="none" width="120" height="120">
      <defs>
        <linearGradient id="hvg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff5500"/><stop offset="100%" stopColor="#8800ff"/></linearGradient>
        <linearGradient id="hvg2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8c42"/><stop offset="100%" stopColor="#cc00ff"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" fill="none" stroke="url(#hvg1)" strokeWidth="2" opacity="0.6"/>
      <polygon points="60,16 98,38 98,82 60,104 22,82 22,38" fill="none" stroke="url(#hvg2)" strokeWidth="1" opacity="0.35"/>
      <polygon points="60,20 94,40 94,80 60,100 26,80 26,40" fill="rgba(255,85,0,0.06)"/>
      <polygon points="32,32 60,80 88,32 80,32 60,65 40,32" fill="url(#hvg1)" filter="url(#glow)" opacity="0.95"/>
      <circle cx="12" cy="33" r="2.5" fill="#ff5500" opacity="0.9"/><circle cx="108" cy="33" r="2.5" fill="#ff8c42" opacity="0.7"/>
      <circle cx="108" cy="87" r="2.5" fill="#8800ff" opacity="0.8"/><circle cx="12" cy="87" r="2.5" fill="#cc00ff" opacity="0.6"/>
      <circle cx="60" cy="6" r="3" fill="#ff5500" opacity="0.9"/><circle cx="60" cy="114" r="3" fill="#8800ff" opacity="0.8"/>
      <line x1="60" y1="6" x2="32" y2="32" stroke="url(#hvg1)" strokeWidth="0.75" opacity="0.4"/>
      <line x1="60" y1="6" x2="88" y2="32" stroke="url(#hvg2)" strokeWidth="0.75" opacity="0.4"/>
    </svg>
  </div>
);

/* ── Steam Spotlight Slider ─────────────────────────────────── */
const SteamSlider = ({ games }) => {
  const [idx, setIdx] = useState(0);
  const [prices, setPrices] = useState({});
  const featured = games.slice(0, 8);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  // Fetch prices for featured games
  useEffect(() => {
    featured.forEach(g => {
      if (!prices[g.id]) {
        getSteamPrice(g.id).then(r => {
          if (r?.price) setPrices(prev => ({ ...prev, [g.id]: r.price }));
        }).catch(() => {});
      }
    });
  }, [featured]);

  if (!featured.length) return null;
  const game = featured[idx];
  const steamId = game.steamAppId;
  const banner = steamId ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/library_hero.jpg` : '';
  const screenshots = steamId ? [0, 1, 2, 3].map(i => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/ss_${i}.jpg`) : [];
  const price = prices[game.id];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 1100, margin: '1.5rem auto 0', background: '#0b1219', boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)', borderRadius: 'var(--r-md)' }}>
      {/* Main Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', cursor: 'pointer', overflow: 'hidden', borderRadius: 'var(--r-md)', minHeight: 380, background: '#0f1822', transition: 'box-shadow 0.3s' }}
        onClick={() => window.location.href = `/game/${game.id}`}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(255,85,0,0.2)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* Banner */}
        <div style={{ position: 'relative', backgroundImage: `url(${banner}), url(https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/capsule_616x353.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'all 0.4s ease-in-out' }}>
          <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(11,18,25,0.85)', backdropFilter: 'blur(8px)', color: 'var(--orange-light)', fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: 4, letterSpacing: '0.12em', border: '1px solid rgba(255,85,0,0.35)', textTransform: 'uppercase' }}>FEATURED</span>
        </div>

        {/* Info Panel */}
        <div style={{ background: '#0f1822', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.title}</h3>
            
            {/* Screenshot Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  backgroundImage: `url(https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/ss_${['1','2','3','4'][i]}.600x338.jpg)`,
                  backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 3,
                  backgroundColor: '#0b1219', boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  aspectRatio: '16/10', opacity: 0.85, transition: '0.3s',
                }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.85} />
              ))}
            </div>
          </div>
          <div>
            {/* Meta */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Released: {game.year}</div>
              <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.07)', color: '#c7d5e0', padding: '3px 8px', fontSize: '0.68rem', fontWeight: 600, borderRadius: 2, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6 }}>Top Seller</span>
            </div>
            {/* Price bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>🪟 Windows</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {price?.discount_percent > 0 && (
                  <>
                    <span style={{ background: '#4c6b22', color: '#a3cf06', padding: '2px 6px', fontSize: '0.72rem', fontWeight: 700, borderRadius: 2 }}>-{price.discount_percent}%</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text3)', fontSize: '0.72rem' }}>{price.initial_formatted}</span>
                  </>
                )}
                <span style={{ color: price?.discount_percent > 0 ? '#a3cf06' : 'var(--text)', fontSize: '0.8rem', fontWeight: 700 }}>
                  {price ? price.final_formatted : (game.priceType === 'Free' ? 'Free' : 'See Store')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + featured.length) % featured.length); }}
        style={{ position: 'absolute', top: '50%', left: -54, transform: 'translateY(-50%)', width: 42, height: 62, background: 'rgba(11,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.25s', borderRadius: 4, zIndex: 10 }}
        onMouseOver={e => { e.target.style.background = 'var(--grad)'; e.target.style.color = '#fff'; }}
        onMouseOut={e => { e.target.style.background = 'rgba(11,18,25,0.8)'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}
      >‹</button>
      <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % featured.length); }}
        style={{ position: 'absolute', top: '50%', right: -54, transform: 'translateY(-50%)', width: 42, height: 62, background: 'rgba(11,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.25s', borderRadius: 4, zIndex: 10 }}
        onMouseOver={e => { e.target.style.background = 'var(--grad)'; e.target.style.color = '#fff'; }}
        onMouseOut={e => { e.target.style.background = 'rgba(11,18,25,0.8)'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}
      >›</button>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem', paddingBottom: '1rem' }}>
        {featured.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{ width: i === idx ? 32 : 18, height: 8, background: i === idx ? 'var(--orange)' : 'rgba(255,255,255,0.15)', borderRadius: 3, cursor: 'pointer', transition: '0.3s', border: 'none', boxShadow: i === idx ? '0 0 10px rgba(255,85,0,0.5)' : 'none' }}
          />
        ))}
      </div>
    </div>
  );
};


export default function Home() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    getGames({ limit: 100, sort: 'rating' }).then(res => {
      setGames(res?.data || []);
    }).catch(() => {});
  }, []);

  const trending    = useMemo(() => games.slice(0, 12), [games]);
  const topRated    = useMemo(() => games.filter(g => g.rating >= 4.7).slice(0, 8), [games]);
  const newReleases = useMemo(() => [...games].sort((a,b) => b.year - a.year).slice(0, 12), [games]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── CINEMATIC HERO ────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] flex flex-col justify-center items-center overflow-hidden" style={{ paddingTop: 'var(--nav-h)' }}>
        {/* Deep space radial glows */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(255,85,0,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 80% 40%, rgba(136,0,255,0.15) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 50% 80%, rgba(255,85,0,0.06) 0%, transparent 50%)' }} />
        {/* Scanline */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)' }} />

        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center" style={{ padding: '5rem 2rem 4rem', minHeight: 'calc(100vh - var(--nav-h))' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}><HeroVMark /></motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.3)', color: 'var(--orange-light)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ⚡ <span>The Ultimate PC Gaming Experience</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(3.5rem, 9vw, 8rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            <span className="block" style={{ color: 'rgba(241,240,255,0.6)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', letterSpacing: '0.25em', marginBottom: '0.2em' }}>Enter The</span>
            <span className="block gradient-text" style={{ filter: 'drop-shadow(0 0 30px rgba(255,85,0,0.4))' }}>VELTRIX</span>
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}
            className="animate-float gradient-text"
            style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.45rem', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 auto 2.5rem', filter: 'drop-shadow(0 0 25px rgba(255,85,0,0.4))' }}>
            PLAY BEYOND LIMITS
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }} className="flex flex-wrap gap-4 justify-center mb-16">
            <Link to="/games" className="btn btn-primary btn-lg">⚔️ Explore Games</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }}
            className="flex gap-12 justify-center pt-10" style={{ borderTop: '1px solid rgba(255,85,0,0.15)' }}>
            <AnimatedStat target={50000} label="Games Listed" suffix="+" />
            <AnimatedStat target={12} label="Genres" />
            <AnimatedStat target={100} label="PC Focused" suffix="%" />
          </motion.div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" style={{ color: 'var(--text3)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>Scroll</span>
            <div style={{ width: 20, height: 20, borderRight: '2px solid var(--orange)', borderBottom: '2px solid var(--orange)', transform: 'rotate(45deg)', animation: 'scrollBounce 1.6s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── TRENDING NOW — Steam Spotlight Slider ─────────────── */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        style={{ background: 'var(--bg)', padding: '4.5rem 0' }}>
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="section-title">🔥 Trending Now</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Featured & recommended games in the Veltrix universe</p>
            </div>
            <Link to="/games" className="view-all">See All</Link>
          </div>
          <SteamSlider games={trending} />
        </div>
      </motion.section>

      {/* ── NEW RELEASES — Swiper ────────────────────────────── */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        style={{ background: 'var(--bg2)', padding: '4.5rem 0' }}>
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">✨ New Releases</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: '0.5rem' }}>The latest arrivals of 2023–2024</p>
            </div>
            <Link to="/games?sort=year" className="view-all">See All</Link>
          </div>
          <Swiper modules={[Autoplay, Pagination, Navigation]} spaceBetween={24} slidesPerView={4}
            pagination={{ clickable: true }} navigation autoplay={{ delay: 4000 }} className="pb-12"
            breakpoints={{ 320: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }}>
            {newReleases.map(g => <SwiperSlide key={g.id} style={{ height: 'auto' }}><GameCard game={g} /></SwiperSlide>)}
          </Swiper>
        </div>
      </motion.section>

      {/* ── TOP RATED — Swiper ───────────────────────────────── */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        style={{ background: 'var(--bg)', padding: '4.5rem 0' }}>
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">⭐ Top Rated</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Games rated 4.7 stars and above</p>
            </div>
            <Link to="/games?sort=rating" className="view-all">View All</Link>
          </div>
          <Swiper modules={[Autoplay, Pagination, Navigation]} spaceBetween={24} slidesPerView={4}
            pagination={{ clickable: true }} navigation autoplay={{ delay: 5000 }} className="pb-12"
            breakpoints={{ 320: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }}>
            {topRated.map(g => <SwiperSlide key={g.id} style={{ height: 'auto' }}><GameCard game={g} /></SwiperSlide>)}
          </Swiper>
        </div>
      </motion.section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full" style={{ background: 'rgba(255,85,0,0.08)', filter: 'blur(120px)' }} />
        </div>
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,85,0,0.2), transparent)' }} />
        <div className="max-w-[1440px] mx-auto px-8 relative z-10 text-center">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">
            <h2 className="font-bold mb-8 uppercase tracking-tighter leading-[1.0]" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(44px, 6vw, 90px)' }}>
              Ready to <span className="gradient-text">Level Up?</span>
            </h2>
            <p className="text-xl mb-14 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text2)' }}>Your next favourite game is one click away.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/games" className="btn btn-primary px-14 py-5 text-sm uppercase" style={{ letterSpacing: '0.3em', fontWeight: 900 }}>Enter the Grid</Link>
              <Link to="/genres" className="btn btn-outline px-14 py-5 text-sm uppercase" style={{ letterSpacing: '0.3em' }}>Browse Genres</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
