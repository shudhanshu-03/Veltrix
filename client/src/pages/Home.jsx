import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TrendingUp, Star, Zap, Layers, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getGames, getSteamPrice } from '../services/api';
import { GENRES } from '../data/genres';
import GameCard from '../components/GameCard';
import GenreCard from '../components/GenreCard';

ChartJS.register(ArcElement, Tooltip, Legend);
gsap.registerPlugin(ScrollTrigger);

const FEATURED_IDS = [10, 31, 11, 1, 47];

const AnimatedStat = ({ target, label, color, duration = 1.2, suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null, rafId;
    const animate = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) rafId = requestAnimationFrame(animate);
    };
    if (target > 0) rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  
  return (
    <div className="text-center">
      <div className={`font-orbitron text-2xl md:text-3xl font-black mb-1 ${color}`}>{val}{suffix}</div>
      <div className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500">{label}</div>
    </div>
  );
};

const RevealText = ({ text }) => {
  const words = text.split(" ");
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
  };
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="inline-flex flex-wrap justify-center gap-x-[1vw]">
      {words.map((word, i) => (
        <motion.span variants={child} key={i} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function Home() {
  const heroRef    = useRef(null);
  const [games, setGames]           = useState([]);
  const [featured, setFeatured]     = useState([]);
  const [heroIdx, setHeroIdx]       = useState(0);
  const [steamPrice, setSteamPrice] = useState(null);

  useEffect(() => {
    getGames({ limit: 100, sort: 'rating' }).then(res => {
      const all = res?.data || [];
      setGames(all);
      const feat = FEATURED_IDS.map(id => all.find(g => g.id === id)).filter(Boolean);
      setFeatured(feat.length > 0 ? feat : all.slice(0, 5));
    }).catch(() => {});
  }, []);

  // We will isolate stat animation into a separate component to prevent full page re-renders.
  const [targetStats, setTargetStats] = useState({ games: 0, genres: 0, scale: 0 });

  useEffect(() => {
    if (!games.length) return;
    setTargetStats({ games: games.length, genres: 12, scale: 98 });
  }, [games.length]);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], ["0%", "30%"]);
  const midY = useTransform(scrollY, [0, 1000], ["0%", "60%"]);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(() => setHeroIdx(i => (i+1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured]);

  useEffect(() => {
    if (!featured.length) return;
    setSteamPrice(null);
    getSteamPrice(featured[heroIdx].id).then(r => setSteamPrice(r?.price || null)).catch(()=>{});
  }, [featured, heroIdx]);

  const heroGame   = featured[heroIdx];
  const trending   = useMemo(() => games.slice(0, 12), [games]);
  const topRated   = useMemo(() => games.filter(g => g.rating >= 4.7).slice(0, 8), [games]);
  const newReleases = useMemo(() => [...games].sort((a,b) => b.year - a.year).slice(0, 12), [games]);

  const chartData = useMemo(() => ({
    labels: GENRES.map(g => g.name),
    datasets: [{
      data: GENRES.map(g => games.filter(x => (x.genres||[]).includes(g.name)).length),
      backgroundColor: ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#0ea5e9', '#84cc16'],
      borderColor: '#08080f', borderWidth: 4,
    }],
  }), [games]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="bg-gaming-dark">
      {/* ── HERO (Parallax & Text Reveal) ────────────────────────── */}
      <section className="relative min-h-[100vh] flex flex-col justify-center items-center overflow-hidden">
        {/* Background Layer (30% scroll speed) */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-cyan/10 via-gaming-dark to-[#0D0D1A]" />
        </motion.div>
        
        {/* Middle Layer Blobs (60% scroll speed) */}
        <motion.div style={{ y: midY }} className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-brand-cyan/10 blur-[140px] rounded-full mix-blend-screen" />
           <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-brand-purple/10 blur-[120px] rounded-full mix-blend-screen" />
        </motion.div>

        {/* Foreground Layer (Normal scroll) */}
        <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-5 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full mb-10 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-lime animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-300">System Online • Version 4.0</span>
          </motion.div>

          {/* Staggered Text Reveal Headline */}
          <h1 className="font-orbitron font-black leading-[1.0] mb-8 tracking-tighter" style={{ fontSize: 'clamp(52px, 7.5vw, 105px)' }}>
            <RevealText text="DISCOVER THE" />
            <br />
            <span className="inline-block" style={{ color: 'var(--cyan)', textShadow: '0 0 40px rgba(0,229,255,0.5)' }}>
              <RevealText text="ULTIMATE" />
            </span>
            <br />
            <RevealText text="GAMING UNIVERSE." />
          </h1>

          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}
             className="w-full h-px bg-white/[0.08] mb-10 max-w-3xl mx-auto"
          />

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
            className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {games.length > 0 ? games.length : '400'}+ curated games. One discovery platform.
            Built for those who live and breathe gaming.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link to="/games" className="btn btn-primary px-10 py-4 w-full sm:w-auto uppercase tracking-widest text-[#0a0a0a]">
              Initiate Discovery
            </Link>
            <Link to="/genres" className="btn btn-outline px-10 py-4 w-full sm:w-auto uppercase tracking-widest">
              Explore Timeline ⭢
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SECTIONS ────────────────────────────────────────────────── */}
      <div className="relative space-y-32 pb-32">
        
        {/* Trending Section */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-6"
        >
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 text-brand-purple mb-2">
                <TrendingUp size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Phase 01 // Trending</span>
              </div>
              <h2 className="font-orbitron text-4xl font-black">POPULAR <span className="text-white/30">MODULES</span></h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 mr-6">
                  <button className="swiper-prev-btn w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all duration-300">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="swiper-next-btn w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all duration-300">
                    <ChevronRight size={18} />
                  </button>
               </div>
               <Link to="/games" className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                 Access Full Grid <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>

          <Swiper 
            modules={[Autoplay, Pagination, Navigation]} 
            spaceBetween={30} 
            slidesPerView="auto" 
            pagination={{ clickable: true }}
            navigation={{
              prevEl: '.swiper-prev-btn',
              nextEl: '.swiper-next-btn',
            }}
            autoplay={{ delay: 4000 }} 
            className="pb-16 px-4 -mx-4 overflow-visible"
            breakpoints={{ 320: { slidesPerView: 1.2 }, 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.5 }, 1280: { slidesPerView: 4.5 } }}
          >
            {trending.map(g => <SwiperSlide key={g.id}><GameCard game={g} /></SwiperSlide>)}
          </Swiper>
        </motion.section>

        {/* Genre Grid */}
        <motion.section
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          className="bg-white/[0.01] py-32 border-y border-white/[0.03]"
        >
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mb-16">
              <div className="flex items-center gap-3 text-brand-cyan mb-2">
                <Layers size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Phase 02 // Categories</span>
              </div>
              <h2 className="font-orbitron text-4xl font-black mb-6 uppercase tracking-tighter">THE GENRE <span className="gradient-text">MATRIX</span></h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Navigate the multi-dimensional landscape of digital entertainment. Ten distinct vectors of gameplay analyzed.
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
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          className="container mx-auto px-6"
        >
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 text-amber-500 mb-2">
                <Star size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Phase 04 // Elite Tier</span>
              </div>
              <h2 className="font-orbitron text-4xl font-black">HALL OF <span className="text-white/30">LEGENDS</span></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
            {topRated.slice(0, 6).map((g, i) => {
              // Mathematical Bento Pattern (Vibe Coder Section 1.5)
              let classes = "h-full min-h-[inherit]";
              if (i === 0) classes = "md:col-span-2 md:row-span-2"; // Feature Tile
              if (i === 1) classes = "md:row-span-2"; // Side Tall Tile
              if (i === 4) classes = "md:col-span-2"; // Bottom Wide Tile
              
              return (
                <div key={g.id} className={`${classes} break-inside-avoid`}>
                  <GameCard game={g} />
                </div>
              );
            })}
          </div>
        </motion.section>

      </div>

      {/* CTA Section — Cinematic Dark Luxury */}
      <section className="py-40 relative overflow-hidden">
        {/* Neon ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00E5FF]/5 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-[#7c3aed]/8 blur-[80px] rounded-full" />
        </div>
        {/* Top hairline */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
        {/* Bottom hairline */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          {/* Stats strip */}
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
                <div className="font-orbitron text-2xl font-black text-white mb-1" style={{ color: 'var(--cyan)' }}>{s.num}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">{s.label}</div>
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
            <h2 className="font-orbitron font-black mb-8 uppercase tracking-tighter leading-[1.0]" style={{ fontSize: 'clamp(44px, 6vw, 90px)' }}>
              Ready to <span className="gradient-text" style={{ textShadow: '0 0 60px rgba(0,229,255,0.3)' }}>Level Up?</span>
            </h2>
            <p className="text-slate-500 text-xl mb-14 max-w-xl mx-auto leading-relaxed">
              Your next favourite game is one click away. Join thousands of gamers discovering their next obsession.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/games" className="btn btn-primary px-14 py-5 text-sm uppercase tracking-[0.3em] font-black">
                Enter the Grid
              </Link>
              <Link to="/genres" className="btn btn-outline px-14 py-5 text-sm uppercase tracking-[0.3em]">
                Browse Genres
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
