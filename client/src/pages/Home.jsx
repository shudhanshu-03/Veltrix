import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { TrendingUp, Star, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getGames } from '../services/api';
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
      <div className="gradient-text" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2.2rem', fontWeight: 700 }}>{val}{suffix}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  );
};

/* ── V-Mark hero SVG ────────────────────────────────────────── */
const HeroVMark = () => (
  <div className="animate-veltrix-pulse" style={{ width: 120, height: 120, margin: '0 auto 2rem', filter: 'drop-shadow(0 0 40px rgba(255,85,0,0.5)) drop-shadow(0 0 80px rgba(136,0,255,0.35))' }}>
    <svg viewBox="0 0 120 120" fill="none" width="120" height="120">
      <defs>
        <linearGradient id="hvg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5500"/>
          <stop offset="100%" stopColor="#8800ff"/>
        </linearGradient>
        <linearGradient id="hvg2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8c42"/>
          <stop offset="100%" stopColor="#cc00ff"/>
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" fill="none" stroke="url(#hvg1)" strokeWidth="2" opacity="0.6"/>
      <polygon points="60,16 98,38 98,82 60,104 22,82 22,38" fill="none" stroke="url(#hvg2)" strokeWidth="1" opacity="0.35"/>
      <polygon points="60,20 94,40 94,80 60,100 26,80 26,40" fill="rgba(255,85,0,0.06)"/>
      <polygon points="32,32 60,80 88,32 80,32 60,65 40,32" fill="url(#hvg1)" filter="url(#glow)" opacity="0.95"/>
      <circle cx="12" cy="33" r="2.5" fill="#ff5500" opacity="0.9"/>
      <circle cx="108" cy="33" r="2.5" fill="#ff8c42" opacity="0.7"/>
      <circle cx="108" cy="87" r="2.5" fill="#8800ff" opacity="0.8"/>
      <circle cx="12" cy="87" r="2.5" fill="#cc00ff" opacity="0.6"/>
      <circle cx="60" cy="6" r="3" fill="#ff5500" opacity="0.9"/>
      <circle cx="60" cy="114" r="3" fill="#8800ff" opacity="0.8"/>
      <line x1="60" y1="6" x2="32" y2="32" stroke="url(#hvg1)" strokeWidth="0.75" opacity="0.4"/>
      <line x1="60" y1="6" x2="88" y2="32" stroke="url(#hvg2)" strokeWidth="0.75" opacity="0.4"/>
      <line x1="60" y1="80" x2="60" y2="114" stroke="url(#hvg1)" strokeWidth="0.75" opacity="0.3"/>
    </svg>
  </div>
);

export default function Home() {
  const [games, setGames]     = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    getGames({ limit: 100, sort: 'rating' }).then(res => {
      setGames(res?.data || []);
    }).catch(() => {});
  }, []);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], ["0%", "30%"]);

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
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 70% 60% at 20% 50%, rgba(255,85,0,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 40%, rgba(136,0,255,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 50% 80%, rgba(255,85,0,0.06) 0%, transparent 50%)
            `
          }} />
        </div>

        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          zIndex: 1,
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)'
        }} />

        {/* Hero content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center" style={{ padding: '5rem 2rem 4rem', minHeight: 'calc(100vh - var(--nav-h))' }}>
          
          {/* V-Mark Logo */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
            <HeroVMark />
          </motion.div>

          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.3)', color: 'var(--orange-light)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            ⚡ <span>The Ultimate PC Gaming Experience</span>
          </motion.div>

          {/* Cinematic Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(3.5rem, 9vw, 8rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' }}
          >
            <span className="block" style={{ color: 'rgba(241,240,255,0.6)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', letterSpacing: '0.25em', marginBottom: '0.2em' }}>
              Enter The
            </span>
            <span className="block gradient-text" style={{ filter: 'drop-shadow(0 0 30px rgba(255,85,0,0.4))' }}>
              VELTRIX
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}
            className="animate-float gradient-text"
            style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.45rem', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 auto 2.5rem', filter: 'drop-shadow(0 0 25px rgba(255,85,0,0.4))' }}
          >
            PLAY BEYOND LIMITS
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link to="/games" className="btn btn-primary btn-lg">
              ⚔️ Explore Games
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }}
            className="flex gap-12 justify-center pt-10"
            style={{ borderTop: '1px solid rgba(255,85,0,0.15)' }}
          >
            <AnimatedStat target={games.length > 0 ? games.length * 600 : 50000} label="Games Listed" suffix="+" />
            <AnimatedStat target={12} label="Genres" />
            <AnimatedStat target={100} label="PC Focused" suffix="%" />
          </motion.div>

          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" style={{ color: 'var(--text3)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>Scroll</span>
            <div style={{ width: 20, height: 20, borderRight: '2px solid var(--orange)', borderBottom: '2px solid var(--orange)', transform: 'rotate(45deg)', animation: 'scrollBounce 1.6s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── SECTIONS ──────────────────────────────────────────────── */}
      <div className="relative space-y-0 pb-32">
        
        {/* Trending Section */}
        <motion.section 
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          style={{ background: 'var(--bg)', padding: '4.5rem 0' }}
        >
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--orange)' }}>
                  <TrendingUp size={20} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔥 Trending Now</span>
                </div>
                <h2 className="section-title">Trending Now</h2>
                <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Featured & recommended games in the Veltrix universe</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 mr-6">
                    <button className="swiper-prev-btn w-10 h-10 rounded-full border flex items-center justify-center">
                      <ChevronLeft size={18} />
                    </button>
                    <button className="swiper-next-btn w-10 h-10 rounded-full border flex items-center justify-center">
                      <ChevronRight size={18} />
                    </button>
                 </div>
                 <Link to="/games" className="view-all">See All</Link>
              </div>
            </div>

            <Swiper 
              modules={[Autoplay, Pagination, Navigation]} 
              spaceBetween={30} slidesPerView="auto" 
              pagination={{ clickable: true }}
              navigation={{ prevEl: '.swiper-prev-btn', nextEl: '.swiper-next-btn' }}
              autoplay={{ delay: 4000 }} 
              className="pb-16 px-4 -mx-4 overflow-visible"
              breakpoints={{ 320: { slidesPerView: 1.2 }, 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.5 }, 1280: { slidesPerView: 4.5 } }}
            >
              {trending.map(g => <SwiperSlide key={g.id}><GameCard game={g} /></SwiperSlide>)}
            </Swiper>
          </div>
        </motion.section>

        {/* Genre Grid */}
        <motion.section
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ background: 'var(--bg2)', padding: '4.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="max-w-2xl mb-16">
              <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--orange-light)' }}>
                <Layers size={20} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Categories</span>
              </div>
              <h2 className="section-title mb-6">All Genres</h2>
              <p style={{ color: 'var(--text2)', fontSize: '1rem', lineHeight: 1.7 }}>
                Navigate the multi-dimensional landscape of digital entertainment. Twelve distinct vectors of gameplay analyzed.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {GENRES.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <GenreCard genre={g} count={games.filter(x=>(x.genres||[]).includes(g.name)).length} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Top Rated Section (Bento Grid) */}
        <motion.section 
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-[1440px] mx-auto px-8"
          style={{ padding: '4.5rem 0' }}
        >
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2" style={{ color: '#f59e0b' }}>
                <Star size={20} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⭐ Elite Tier</span>
              </div>
              <h2 className="section-title">Top Rated</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Games rated 4.7 stars and above</p>
            </div>
            <Link to="/games?sort=rating" className="view-all">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
            {topRated.slice(0, 6).map((g, i) => {
              let classes = "h-full min-h-[inherit]";
              if (i === 0) classes = "md:col-span-2 md:row-span-2";
              if (i === 1) classes = "md:row-span-2";
              if (i === 4) classes = "md:col-span-2";
              return (
                <div key={g.id} className={`${classes} break-inside-avoid`}>
                  <GameCard game={g} />
                </div>
              );
            })}
          </div>
        </motion.section>

      </div>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full" style={{ background: 'rgba(255,85,0,0.08)', filter: 'blur(120px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full" style={{ background: 'rgba(136,0,255,0.06)', filter: 'blur(80px)' }} />
        </div>
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,85,0,0.2), transparent)' }} />
        <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />

        <div className="max-w-[1440px] mx-auto px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-12 mb-16"
          >
            {[
              { num: `${games.length > 0 ? games.length : '400'}+`, label: 'Games' },
              { num: '12', label: 'Genres' },
              { num: '4.8★', label: 'Avg Rating' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="gradient-text font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2rem' }}>{s.num}</div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--text3)', fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-bold mb-8 uppercase tracking-tighter leading-[1.0]" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(44px, 6vw, 90px)' }}>
              Ready to <span className="gradient-text" style={{ textShadow: '0 0 60px rgba(255,85,0,0.3)' }}>Level Up?</span>
            </h2>
            <p className="text-xl mb-14 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text2)' }}>
              Your next favourite game is one click away. Join thousands of gamers discovering their next obsession.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/games" className="btn btn-primary px-14 py-5 text-sm uppercase" style={{ letterSpacing: '0.3em', fontWeight: 900 }}>
                Enter the Grid
              </Link>
              <Link to="/genres" className="btn btn-outline px-14 py-5 text-sm uppercase" style={{ letterSpacing: '0.3em' }}>
                Browse Genres
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
