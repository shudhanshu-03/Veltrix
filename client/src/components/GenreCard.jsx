import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function GenreCard({ genre, count = 0 }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/games?genre=${genre.name}`} className="block no-underline group">
        <div
          className="relative overflow-hidden cursor-pointer"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            aspectRatio: '1 / 1.1',
          }}
        >
          {/* Genre Cover Image */}
          <div className="absolute inset-0 z-0">
             <img 
               src={genre.image} 
               alt={genre.name}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
             />
          </div>

          {/* Ambient glow from genre color */}
          <div
            className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-70 z-10"
            style={{ background: `radial-gradient(circle at center, ${genre.glowColor || 'rgba(0,229,255,0.3)'}, transparent 80%)` }}
          />

          {/* Multi-stage dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-[#08080f]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 z-10" />

          {/* Top-right arrow icon */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-20">
            <div className="w-7 h-7 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center backdrop-blur-md">
              <ArrowUpRight size={14} className="text-[#00E5FF]" />
            </div>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
            <div className="relative">
              <div className="font-orbitron text-base font-black text-white mb-1.5 tracking-tighter uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {genre.name}
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {count} <span style={{ color: 'var(--cyan)' }}>MODULES</span>
              </div>
            </div>
          </div>

          {/* Hover border glow */}
          <div
            className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(0,229,255,0.35), 0 0 25px rgba(0,229,255,0.15)' }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
