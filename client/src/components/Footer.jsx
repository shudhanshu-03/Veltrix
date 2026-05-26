import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gaming-darker border-t border-white/[0.07] pt-12 pb-6 mt-12">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* Top grid */}
        <div className="grid grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="font-orbitron text-xl font-black gradient-text mb-4">🎮 Veltrix</div>
            <p className="text-slate-600 text-sm leading-7 max-w-[230px]">
              Your ultimate guide to the best PC games across every genre.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-orbitron text-xs text-slate-100 mb-4 uppercase tracking-widest">Explore</h4>
            {[['/', 'Home'], ['/games', 'All Games'], ['/genres', 'Genres']].map(([to, l]) => (
              <Link key={to} to={to} className="block text-slate-600 text-sm mb-2.5 hover:text-brand-cyan transition-colors">{l}</Link>
            ))}
          </div>

          {/* Genres */}
          <div>
            <h4 className="font-orbitron text-xs text-slate-100 mb-4 uppercase tracking-widest">Genres</h4>
            {['Action', 'RPG', 'FPS', 'Strategy', 'Horror'].map(g => (
              <Link key={g} to={`/games?genre=${g}`} className="block text-slate-600 text-sm mb-2.5 hover:text-brand-cyan transition-colors">{g}</Link>
            ))}
          </div>

          {/* Stores */}
          <div>
            <h4 className="font-orbitron text-xs text-slate-100 mb-4 uppercase tracking-widest">Quick Links</h4>
            {[
              ['https://store.steampowered.com', 'Steam Store'],
              ['https://www.epicgames.com', 'Epic Games'],
              ['https://www.gog.com', 'GOG.com'],
            ].map(([href, l]) => (
              <a key={l} href={href} target="_blank" rel="noopener"
                className="block text-slate-600 text-sm mb-2.5 hover:text-brand-cyan transition-colors">{l}</a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.07] pt-5 flex items-center justify-between text-xs text-slate-600">
          <span>© 2024 Veltrix — Built with React + Node.js + Tailwind CSS</span>
          <span>74+ Games · 12 Genres · Live Steam Data</span>
        </div>
      </div>
    </footer>
  );
}
