import { Link } from 'react-router-dom';
import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight } from 'lucide-react';

export default memo(function GameCard({ game }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = game.headerImage && !imgError;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group h-full"
    >
      <Link to={`/game/${game.id}`}
        className="game-card flex flex-col h-full w-full glass-panel overflow-hidden border border-white/[0.08] hover:border-[#00E5FF]/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-all duration-500 no-underline bg-[#111827]"
      >
        <div className="relative flex-1 min-h-[12rem] overflow-hidden bg-slate-900/50">
          {hasImage ? (
            <>
              <img
                src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/capsule_616x353.jpg`}
                alt={game.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out brightness-[1.02] contrast-[1.05] crisp-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-gaming-dark/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
            </>
          ) : (
            <div className="h-full relative flex flex-col justify-between p-4" style={{ background: game.gradient }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
              <span className="absolute bottom-4 right-4 text-6xl opacity-40 drop-shadow-2xl group-hover:opacity-60 group-hover:scale-110 transition-all duration-500">
                {game.icon}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span className="badge badge-purple backdrop-blur-md bg-brand-purple/30 border-brand-purple/40 text-[10px] px-2.5">
              {game.genre}
            </span>
          </div>
          
          <div className="absolute top-4 right-4 z-10">
            <div className="glass-panel px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-orbitron font-black text-white/90">{game.year}</span>
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-brand-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Info Area */}
        <div className="p-5 flex flex-col gap-2">
          <h3 className="font-orbitron text-[15px] font-black leading-tight text-white group-hover:text-brand-cyan transition-colors line-clamp-1">
            {game.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{game.developer}</p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Star size={10} className="text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-bold text-amber-500">{game.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {(game.tags || []).slice(0, 2).map(t => (
              <span key={t} className="text-[10px] font-bold text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5 uppercase tracking-tighter">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 bg-white/[0.02] border-t border-white/[0.05] flex items-center justify-between group-hover:bg-brand-purple/5 transition-colors">
          <span className={`text-sm font-black font-orbitron ${game.priceType === 'Free' ? 'text-brand-cyan' : 'text-white'}`}>
            {game.priceType === 'Free' ? 'FREE' : game.price}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-black font-orbitron text-brand-purple group-hover:text-brand-cyan transition-colors uppercase tracking-widest">
            NEXUS <ArrowUpRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
