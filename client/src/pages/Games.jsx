import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGames } from '../services/api';
import { GENRES } from '../data/genres';
import GameCard from '../components/GameCard';
import { SkeletonGrid } from '../components/Loader';

const SORT_OPTIONS = [
  { value:'rating', label:'⭐ Top Rated' },
  { value:'year',   label:'✨ Newest' },
  { value:'az',     label:'🔤 A–Z' },
  { value:'za',     label:'🔤 Z–A' },
];
const PAGE_SIZE = 16;

export default function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState(searchParams.get('q') || '');
  const [sort, setSort]       = useState(searchParams.get('sort') || 'rating');
  const [genres, setGenres]   = useState(searchParams.get('genre') ? [searchParams.get('genre')] : []);
  const [priceType, setPrice] = useState('all');
  const [page, setPage]       = useState(1);

  const [animKey, setAnimKey] = useState(0);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGames({ genre: genres.length===1?genres[0]:undefined, sort, q:query, priceType:priceType!=='all'?priceType:undefined, limit:PAGE_SIZE, offset:(page-1)*PAGE_SIZE });
      setGames(res?.data||[]); setTotal(res?.total||0);
      setAnimKey(k => k + 1); // trigger CSS re-animation
    } finally { setLoading(false); }
  }, [genres, sort, query, priceType, page]);

  useEffect(()=>{ fetchGames(); },[fetchGames]);
  useEffect(()=>{
    const p={};
    if(query)p.q=query; if(sort!=='rating')p.sort=sort; if(genres.length===1)p.genre=genres[0];
    setSearchParams(p,{replace:true});
  },[query,sort,genres]);

  const toggleGenre = n => { setGenres(prev=>prev.includes(n)?prev.filter(g=>g!==n):[...prev,n]); setPage(1); };
  const totalPages  = Math.ceil(total/PAGE_SIZE);

  return (
    <div>
      {/* Page hero */}
      <div className="page-hero">
        <h1 className="font-orbitron font-black mb-4" style={{ fontSize:'clamp(1.8rem,4vw,3rem)' }}>
          🕹️ Browse <span className="gradient-text">PC Games</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">74+ games across 12 genres. Filter, sort, and find your next obsession.</p>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid gap-8" style={{ gridTemplateColumns:'260px 1fr' }}>

          {/* ── Sidebar ────────────────────────────── */}
          <aside className="bg-gaming-card border border-white/[0.07] rounded-xl p-6 self-start sticky top-20">
            <div className="flex items-center justify-between font-orbitron text-sm mb-6">
              Filters
              <button onClick={() => { setGenres([]); setPrice('all'); setQuery(''); setPage(1); }}
                className="btn btn-outline btn-sm text-xs py-1 px-3">Clear All</button>
            </div>

            {/* Genre */}
            <div className="mb-6">
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-3 font-semibold">Genre</p>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                {GENRES.map(g => (
                  <label key={g.id} className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <input type="checkbox" checked={genres.includes(g.name)} onChange={()=>toggleGenre(g.name)}
                      className="accent-brand-purple w-4 h-4 cursor-pointer"/>
                    <span className={`text-sm ${genres.includes(g.name)?'text-slate-100':'text-slate-400'}`}>{g.icon} {g.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-3 font-semibold">Price</p>
              {[['all','All'],['free','Free to Play'],['paid','Paid']].map(([val,label])=>(
                <label key={val} className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 mb-0.5">
                  <input type="radio" name="price" checked={priceType===val} onChange={()=>{setPrice(val);setPage(1);}}
                    className="accent-brand-purple cursor-pointer"/>
                  <span className="text-sm text-slate-400">{label}</span>
                </label>
              ))}
            </div>

            {/* Quick picks */}
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-3 font-semibold">Quick Picks</p>
              <div className="flex flex-col gap-2">
                <button onClick={()=>{setSort('rating');setPage(1);}} className="btn btn-outline btn-sm justify-start">⭐ Top Rated</button>
                <button onClick={()=>{setSort('year');setPage(1);}}   className="btn btn-outline btn-sm justify-start">✨ New Releases</button>
                <button onClick={()=>{setPrice('free');setPage(1);}} className="btn btn-outline btn-sm justify-start">🆓 Free Games</button>
              </div>
            </div>
          </aside>

          {/* ── Main ───────────────────────────────── */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex-1 min-w-48 flex items-center gap-2 bg-gaming-card border border-white/[0.07] rounded-xl px-4 py-3 focus-within:border-brand-purple/50 transition-colors">
                <span className="text-slate-600">🔍</span>
                <input type="text" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}
                  placeholder="Search games, developers..."
                  className="bg-transparent border-0 outline-none text-slate-100 text-sm w-full placeholder:text-slate-600"/>
              </div>
              <select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}
                className="bg-gaming-card border border-white/[0.07] rounded-xl px-4 py-3 text-slate-100 text-sm outline-none cursor-pointer">
                {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="text-sm text-slate-600 whitespace-nowrap">{loading?'…':`${total} games`}</span>
            </div>

            {/* Active filter chips */}
            {(genres.length>0||priceType!=='all') && (
              <div className="flex gap-2 flex-wrap mb-4">
                {genres.map(g=>(
                  <button key={g} onClick={()=>toggleGenre(g)} className="badge badge-purple cursor-pointer border-0">
                    {g} ✕
                  </button>
                ))}
                {priceType!=='all'&&(
                  <button onClick={()=>setPrice('all')} className="badge badge-gray cursor-pointer border-0">
                    {priceType==='free'?'Free':'Paid'} ✕
                  </button>
                )}
              </div>
            )}

            {/* Game grid */}
            {loading ? <SkeletonGrid count={PAGE_SIZE}/>
            : games.length===0 ? (
              <div className="text-center py-16 text-slate-600">
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-lg font-semibold mb-2 text-slate-400">No games found</h3>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div key={animKey} className="grid-games cards-enter">
                {games.map(g=><GameCard key={g.id} game={g}/>)}
              </div>
            )}

            {/* Pagination */}
            {totalPages>1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gaming-card border border-white/[0.07] text-slate-400 cursor-pointer hover:border-brand-purple/50 transition-colors disabled:opacity-40">‹</button>
                {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                  const p=Math.max(1,Math.min(totalPages-4,page-2))+i;
                  return (
                    <button key={p} onClick={()=>setPage(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm cursor-pointer transition-all font-medium ${
                        p===page?'border-transparent text-white':'bg-gaming-card border-white/[0.07] text-slate-400 hover:border-brand-purple/50'
                      }`}
                      style={p===page?{background:'linear-gradient(135deg,#7c3aed,#06b6d4)'}:{}}>{p}</button>
                  );
                })}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gaming-card border border-white/[0.07] text-slate-400 cursor-pointer hover:border-brand-purple/50 transition-colors disabled:opacity-40">›</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
