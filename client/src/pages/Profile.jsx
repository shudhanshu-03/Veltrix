import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Heart, 
  Settings, 
  LogOut, 
  Calendar, 
  Shield, 
  Cpu, 
  Gamepad2,
  Mail,
  Edit2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getGames, getGame } from '../services/api';
import GameCard from '../components/GameCard';
import { getCurrentSession, signOut, getFavorites } from '../services/auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const FavoritesTab = memo(({ favorites, loading }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-orbitron text-2xl font-bold flex items-center gap-3">
          <Heart className="text-red-500 fill-red-500" size={24} /> 
          My Favorites <span className="text-slate-600">({favorites.length})</span>
        </h2>
      </div>
      
      {loading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => <div key={i} className="h-80 skeleton rounded-2xl" />)}
         </div>
      ) : (
        favorites.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          >
            {favorites.map((game, i) => {
              // Creating artificial Masonry varied heights purely for the aesthetic layout
              const heightClass = i % 3 === 0 ? 'h-[28rem]' : i % 2 === 0 ? 'h-[22rem]' : 'h-[18rem]';
              return (
                <motion.div key={game.id} variants={itemVariants} className={`break-inside-avoid ${heightClass}`}>
                  <GameCard game={game} />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="glass-panel py-20 rounded-[2rem] text-center max-w-2xl mx-auto">
             <div className="text-6xl mb-6 opacity-30">🎮</div>
             <h3 className="font-orbitron text-xl font-bold mb-3">No favorites yet</h3>
             <p className="text-slate-500 mb-8 max-w-sm mx-auto">Explore our collection of the best PC games and save them here for quick access.</p>
             <div className="flex justify-center">
               <Link to="/games" className="btn btn-primary px-10 py-3.5">Browse Games</Link>
             </div>
          </div>
        )
      )}
    </div>
  );
});

const AccountTab = memo(({ user }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-panel p-8 md:p-12 rounded-[2rem]">
        <h2 className="font-orbitron text-2xl font-bold mb-8">Account Settings</h2>
        
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Public Profile Name</p>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
            <button className="btn btn-outline btn-sm font-orbitron text-[10px] tracking-widest uppercase">Change Name</button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <button className="btn btn-outline btn-sm font-orbitron text-[10px] tracking-widest uppercase">Verify Email</button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Security & Privacy</p>
              <p className="text-sm text-slate-400">Two-factor authentication is currently disabled.</p>
            </div>
            <button className="btn btn-outline btn-sm text-brand-cyan border-brand-cyan/20 font-orbitron text-[10px] tracking-widest uppercase">Enable 2FA</button>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-red-400 font-bold mb-4">Danger Zone</h3>
            <button className="text-red-500/70 text-sm font-medium hover:text-red-500 hover:underline bg-transparent border-0 cursor-pointer">
              Permanently delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const ActivityTab = memo(() => {
  return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <div className="text-5xl mb-6 opacity-30">⚡</div>
      <h3 className="font-orbitron text-xl font-bold mb-3">Activity Stream</h3>
      <p className="text-slate-500">Coming soon in the next system update.</p>
    </div>
  );
});

export default function Profile() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndFavorites = async () => {
      try {
        const session = await getCurrentSession();
        if(!session) {
          navigate('/login');
          return;
        }

        const email = session.user.email;
        const name = session.user.user_metadata?.display_name || email.split('@')[0];
        
        setUser({
          name: name,
          email: email,
          joined: new Date(session.user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          avatar: session.user.user_metadata?.avatar_url || null,
          level: 1,
          xp: 0,
        });

        // Load real favorites from Supabase
        const favIds = await getFavorites();
        if (favIds.length > 0) {
          const gameDetails = await Promise.all(
            favIds.map(id => getGame(id).then(r => r?.data).catch(() => null))
          );
          setFavorites(gameDetails.filter(Boolean));
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndFavorites();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if(!user) return (
    <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
      <div className="animate-spin w-8 h-8 rounded-full border-t-2 border-brand-cyan"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gaming-dark text-slate-100 pb-20">
      {/* Hero Section */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        {/* Cinematic Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-purple/10 blur-[120px] rounded-full opacity-50" />
          <div className="absolute top-40 left-[40%] w-[400px] h-[400px] bg-brand-cyan/5 blur-[100px] rounded-full opacity-30" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 md:p-12 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 md:gap-12"
          >
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full grad-border p-1 group-hover:shadow-purple-glow transition-shadow duration-500">
                <div className="grad-border-inner flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gaming-dark w-full h-full flex items-center justify-center">
                      <span className="font-orbitron text-4xl md:text-5xl font-black gradient-text">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-brand-purple rounded-full border-2 border-gaming-dark text-white hover:scale-110 transition-transform">
                <Edit2 size={16} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="font-orbitron text-3xl md:text-4xl font-bold tracking-tight">
                  {user.name}
                </h1>
                <div className="flex gap-2 justify-center md:justify-start">
                  <span className="badge badge-purple px-3 py-1 flex items-center gap-1.5">
                    <Shield size={12} /> PRO MEMBER
                  </span>
                  <span className="badge bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20 px-3 py-1 flex items-center gap-1.5">
                    <Cpu size={12} /> LVL {user.level}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 justify-center md:justify-start text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-brand-purple" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-cyan" />
                  Joined {user.joined}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 max-w-md">
                <div className="flex justify-between text-xs font-orbitron mb-2">
                  <span className="text-slate-500 uppercase tracking-widest">Global Rank Progress</span>
                  <span className="text-brand-cyan">{user.xp}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${user.xp}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-brand-grad shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3 shrink-0">
               <button onClick={handleLogout} className="btn btn-outline border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 px-8 py-3 w-full md:w-auto">
                 <LogOut size={18} /> Sign Out
               </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-12">
          <div className="glass-panel p-1.5 rounded-2xl flex gap-1">
            {[
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'account', label: 'Account', icon: Settings },
              { id: 'activity', label: 'Activity', icon: Gamepad2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-3 rounded-xl font-orbitron text-sm font-bold flex items-center gap-2.5 transition-all duration-300 border-0 cursor-pointer ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-grad rounded-xl -z-10 shadow-purple-glow"
                  />
                )}
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              switch (activeTab) {
                case 'favorites':
                  return <FavoritesTab favorites={favorites} loading={loading} />;
                case 'account':
                  return <AccountTab user={user} />;
                case 'activity':
                  return <ActivityTab />;
                default:
                  return null;
              }
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
