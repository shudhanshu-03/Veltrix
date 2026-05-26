import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Search, Menu, X, Gamepad2 } from 'lucide-react';
import { searchGames } from '../services/api';
import { onAuthStateChange } from '../services/auth';

export default function Navbar() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [mobileOpen, setMO]   = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser]       = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = !!user; 

  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (authListener?.subscription) authListener.subscription.unsubscribe();
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
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 flex items-center ${
        isScrolled ? 'bg-[#0D0D1A]/85 backdrop-blur-[12px] border-b border-white/[0.08] shadow-[0_1px_20px_rgba(0,0,0,0.8)] h-16' : 'bg-transparent h-20'
      }`}>
        <div className="w-full max-w-[1400px] mx-auto px-6 flex items-center">

          {/* Logo */}
          <Link to="/" className="font-orbitron text-xl md:text-2xl font-black gradient-text whitespace-nowrap flex items-center gap-2 group">
            <motion.span 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-white group-hover:scale-110 transition-transform"
            >
              <Gamepad2 size={28} className="text-brand-cyan" />
            </motion.span> 
            <span className="tracking-tighter">GAMING <span className="text-white">HUB</span></span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 ml-12">
            {[['/', 'Home'],['/games', 'Games'],['/genres', 'Genres']].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `text-[13px] font-bold tracking-widest uppercase transition-all duration-300 relative py-1 ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-grad shadow-purple-glow"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Search box */}
            <div className="relative hidden lg:block">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-full px-4 py-2 transition-all duration-300 focus-within:bg-white/[0.08] focus-within:border-brand-purple/30 focus-within:w-64 w-48 group">
                <Search size={16} className="text-slate-600 group-focus-within:text-brand-cyan transition-colors" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Find your nexus..."
                  className="bg-transparent border-none outline-none text-slate-100 text-sm w-full placeholder:text-slate-600 font-medium"
                />
              </div>

              {/* Dropdown results */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[calc(100%+8px)] right-0 w-80 glass-panel border border-white/10 rounded-2xl z-[1001] overflow-hidden shadow-2xl"
                  >
                    {results.map(g => (
                      <div key={g.id} onClick={() => go(g.id)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.06] transition-colors last:border-b-0 group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{g.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-100 group-hover:text-brand-cyan transition-colors">{g.title}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{g.genre} · {g.year}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile / Auth */}
            {isLoggedIn ? (
              <Link to="/profile" className="flex items-center gap-2 p-1 pl-1 pr-4 rounded-full bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:border-brand-purple/30 transition-all group">
                <div className="w-8 h-8 rounded-full bg-brand-grad p-[1px] group-hover:shadow-purple-glow transition-all">
                   <div className="w-full h-full rounded-full bg-gaming-dark flex items-center justify-center overflow-hidden">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-brand-cyan" />
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
              className="md:hidden bg-transparent border-0 text-slate-100 cursor-pointer ml-2 hover:text-brand-cyan transition-colors">
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
            className="fixed inset-0 bg-gaming-dark/98 z-[999] flex flex-col items-center justify-center gap-8 backdrop-blur-2xl"
          >
            {['Home', 'Games', 'Genres', 'Profile'].map((label) => {
              const to = label === 'Home' ? '/' : `/${label.toLowerCase()}`;
              return (
                <NavLink key={to} to={to} onClick={() => setMO(false)}
                  className="font-orbitron text-3xl font-black text-slate-500 hover:text-white transition-all hover:scale-110 tracking-tighter"
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
