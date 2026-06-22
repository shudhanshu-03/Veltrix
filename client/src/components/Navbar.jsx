import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Search, Menu, X } from 'lucide-react';
import { searchGames } from '../services/api';
import { onAuthStateChange } from '../services/auth';

/* Inline SVG V-mark logo */
const VeltrixMark = ({ size = 32 }) => (
  <svg viewBox="0 0 120 120" fill="none" width={size} height={size}>
    <defs>
      <linearGradient id="vg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff5500"/>
        <stop offset="100%" stopColor="#8800ff"/>
      </linearGradient>
      <linearGradient id="vg2" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff8c42"/>
        <stop offset="100%" stopColor="#cc00ff"/>
      </linearGradient>
    </defs>
    <polygon points="60,6 108,33 108,87 60,114 12,87 12,33" fill="none" stroke="url(#vg1)" strokeWidth="2" opacity="0.6"/>
    <polygon points="60,16 98,38 98,82 60,104 22,82 22,38" fill="none" stroke="url(#vg2)" strokeWidth="1" opacity="0.35"/>
    <polygon points="60,20 94,40 94,80 60,100 26,80 26,40" fill="rgba(255,85,0,0.06)"/>
    <polygon points="32,32 60,80 88,32 80,32 60,65 40,32" fill="url(#vg1)" opacity="0.95"/>
    <circle cx="60" cy="6" r="3" fill="#ff5500" opacity="0.9"/>
    <circle cx="60" cy="114" r="3" fill="#8800ff" opacity="0.8"/>
  </svg>
);

export default function Navbar() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [mobileOpen, setMO]   = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser]       = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = !!user; 

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription?.unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await searchGames(query).catch(() => null);
      setResults(res?.data?.slice(0, 6) || []);
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  const go = (id) => { setQuery(''); setResults([]); navigate(`/game/${id}`); };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center ${
        isScrolled ? 'bg-[#05050a]/88 backdrop-blur-[24px] border-b border-[rgba(255,85,0,0.12)] shadow-[0_1px_20px_rgba(0,0,0,0.8)] h-[68px]' : 'bg-transparent h-20'
      }`}>
        <div className="w-full max-w-[1440px] mx-auto px-8 flex items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <motion.span 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="group-hover:scale-110 transition-transform"
            >
              <VeltrixMark size={32} />
            </motion.span> 
            <span className="gradient-text tracking-wider">VELTRIX</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7 ml-auto mr-4">
            {[['/', 'Home'],['/games', 'Games'],['/genres', 'Genres']].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `text-[0.9rem] font-medium transition-all duration-200 relative py-1 ${
                    isActive ? 'text-white' : 'text-[var(--text2)] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-sm"
                        style={{ background: 'var(--grad)' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-auto md:ml-0">
            {/* Search box */}
            <div className="relative hidden lg:block">
              <div className="flex items-center gap-2 bg-white/[0.05] border border-[var(--border)] rounded-[var(--r-md)] px-3.5 py-2 transition-all duration-300 focus-within:bg-[rgba(255,85,0,0.07)] focus-within:border-[var(--orange)] w-48 focus-within:w-64 group">
                <Search size={16} className="text-[var(--text3)] group-focus-within:text-[var(--orange-light)] transition-colors" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search games..."
                  className="bg-transparent border-none outline-none text-slate-100 text-sm w-full placeholder:text-[var(--text3)] font-medium"
                />
              </div>

              {/* Dropdown results */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[calc(100%+8px)] right-0 w-80 border border-white/10 rounded-[var(--r-lg)] z-[1001] overflow-hidden shadow-2xl"
                    style={{ background: 'var(--card)' }}
                  >
                    {results.map(g => (
                      <div key={g.id} onClick={() => go(g.id)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.06] transition-colors last:border-b-0 group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{g.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-100 group-hover:text-[var(--orange-light)] transition-colors">{g.title}</div>
                          <div className="text-[10px] text-[var(--text3)] uppercase tracking-wider font-bold">{g.genre} · {g.year}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile / Auth */}
            {isLoggedIn ? (
              <Link to="/profile" className="flex items-center gap-2 p-1 pl-1 pr-4 rounded-full bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:border-[var(--border-o)] transition-all group">
                <div className="w-8 h-8 rounded-full p-[1px] group-hover:shadow-orange-glow transition-all" style={{ background: 'var(--grad)' }}>
                   <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg)' }}>
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-[var(--orange-light)]" />
                      )}
                   </div>
                </div>
                <span className="text-xs font-bold font-orbitron hidden sm:block uppercase">
                  {(user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User').substring(0, 10)}
                </span>
              </Link>
            ) : (
              <Link to="/login"
                className="btn btn-primary btn-sm text-[10px] uppercase tracking-widest px-6 ml-2">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMO(o => !o)}
              className="md:hidden bg-transparent border-0 text-slate-100 cursor-pointer ml-2 hover:text-[var(--orange-light)] transition-colors">
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 backdrop-blur-2xl"
            style={{ background: 'rgba(5,5,10,0.97)' }}
          >
            {['Home', 'Games', 'Genres', 'Profile'].map((label) => {
              const to = label === 'Home' ? '/' : `/${label.toLowerCase()}`;
              return (
                <NavLink key={to} to={to} onClick={() => setMO(false)}
                  style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  className="text-white hover:text-[var(--orange-light)] transition-all hover:scale-110"
                >
                  {({ isActive }) => (
                    <span className={isActive ? 'gradient-text' : ''}>{label}</span>
                  )}
                </NavLink>
              );
            })}
            {!isLoggedIn && (
              <Link to="/login" onClick={() => setMO(false)} className="btn btn-primary px-12 py-4 text-sm uppercase tracking-[0.2em] font-black mt-4">
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
