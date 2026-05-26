import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [tab, setTab]       = useState('login');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [name, setName]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const { signInWithEmail } = await import('../services/auth');
        await signInWithEmail(email, pass);
      } else {
        const { signUpWithEmail } = await import('../services/auth');
        await signUpWithEmail(email, pass, name);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-gaming-card border border-white/[0.07] rounded-xl px-4 py-3 text-slate-100 text-sm outline-none transition-colors focus:border-brand-purple/60 placeholder:text-slate-600";

  return (
    <div className="min-h-screen grid grid-cols-2 bg-gaming-dark">

      {/* Left — branding */}
      <div className="relative flex flex-col items-center justify-center p-12 bg-gaming-darker overflow-hidden"
        style={{background:'linear-gradient(135deg,rgba(124,58,237,.2),rgba(6,182,212,.1)),#0d0d1a'}}>
        {/* Glow blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-purple/15 blur-3xl pointer-events-none"/>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-brand-cyan/10 blur-3xl pointer-events-none"/>

        <div className="relative text-center">
          <div className="text-6xl mb-6 animate-float">🎮</div>
          <h1 className="font-orbitron text-3xl font-black gradient-text mb-4">Gaming Hub</h1>
          <p className="text-slate-400 text-base leading-7 max-w-xs mb-8">
            Your ultimate destination for discovering the best PC games. Sign in to save favourites and personalise your experience.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {['74+ Games','12 Genres','Live Steam Data'].map(f=>(
              <div key={f} className="bg-white/5 border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-slate-400">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <h2 className="font-orbitron text-2xl font-bold mb-1">
            {tab==='login'?'Welcome Back':'Create Account'}
          </h2>
          <p className="text-slate-600 text-sm mb-7">
            {tab==='login'?'Sign in to your Gaming Hub account':'Join thousands of PC gamers'}
          </p>

          {/* Tab switcher */}
          <div className="flex bg-gaming-card border border-white/[0.07] rounded-xl p-1 mb-6">
            {['login','signup'].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border-0 cursor-pointer ${
                  tab===t?'text-white':'text-slate-400 bg-transparent hover:text-slate-200'
                }`}
                style={tab===t?{background:'linear-gradient(135deg,#7c3aed,#06b6d4)'}:{}}>
                {t==='login'?'Sign In':'Sign Up'}
              </button>
            ))}
          </div>

          {error&&(
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab==='signup'&&(
              <div>
                <label className="block text-xs text-slate-600 mb-1.5 font-medium">Display Name</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} required
                  placeholder="Your gamer tag" className={inputCls}/>
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-medium">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="you@example.com" className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-medium">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required
                placeholder="••••••••" className={inputCls}/>
            </div>
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center text-base py-3.5 mt-2">
              {loading?'⏳ Please wait...':(tab==='login'?'🔐 Sign In':'🚀 Create Account')}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-slate-600">
            {tab==='login'?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>setTab(tab==='login'?'signup':'login')}
              className="text-brand-purple-lt font-semibold bg-transparent border-0 cursor-pointer hover:underline">
              {tab==='login'?'Sign Up':'Sign In'}
            </button>
          </p>
          <div className="text-center mt-4">
            <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to Gaming Hub</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
