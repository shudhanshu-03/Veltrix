import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '3rem 0 1.5rem', marginTop: '3rem' }}>
      <div className="max-w-[1440px] mx-auto px-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="gradient-text mb-4" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>VELTRIX</div>
            <p style={{ color: 'var(--text3)', fontSize: '0.875rem', maxWidth: 250, lineHeight: 1.7 }}>
              Your cinematic destination to discover the best PC games across every genre.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Explore</h4>
            {[['/', 'Home'], ['/games', 'All Games'], ['/genres', 'Genres']].map(([to, l]) => (
              <Link key={to} to={to} className="block text-sm mb-2.5 transition-colors" style={{ color: 'var(--text3)' }} onMouseOver={e => e.target.style.color='var(--orange-light)'} onMouseOut={e => e.target.style.color='var(--text3)'}>{l}</Link>
            ))}
          </div>

          {/* Genres */}
          <div>
            <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Genres</h4>
            {['Action', 'RPG', 'FPS', 'Strategy', 'Horror'].map(g => (
              <Link key={g} to={`/games?genre=${g}`} className="block text-sm mb-2.5 transition-colors" style={{ color: 'var(--text3)' }} onMouseOver={e => e.target.style.color='var(--orange-light)'} onMouseOut={e => e.target.style.color='var(--text3)'}>{g}</Link>
            ))}
          </div>

          {/* Stores */}
          <div>
            <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Links</h4>
            {[
              ['https://store.steampowered.com', 'Steam Store'],
              ['https://www.epicgames.com', 'Epic Games'],
              ['https://www.gog.com', 'GOG.com'],
            ].map(([href, l]) => (
              <a key={l} href={href} target="_blank" rel="noopener"
                className="block text-sm mb-2.5 transition-colors" style={{ color: 'var(--text3)' }} onMouseOver={e => e.target.style.color='var(--orange-light)'} onMouseOut={e => e.target.style.color='var(--text3)'}>{l}</a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', color: 'var(--text3)' }}>
          <span>© 2025 Veltrix — Built with React + Node.js + Tailwind</span>
          <span>74+ Games · 12 Genres · Live Steam Data</span>
        </div>
      </div>
    </footer>
  );
}
