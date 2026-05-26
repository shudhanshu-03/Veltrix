import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { getGames } from '../services/api';
import { GENRES } from '../data/genres';
import GenreCard from '../components/GenreCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Genres() {
  const [counts, setCounts] = useState({});
  const [total,  setTotal]  = useState(0);

  useEffect(() => {
    getGames({ limit:200 }).then(res => {
      const all = res?.data || [];
      setTotal(all.length);
      const map = {};
      GENRES.forEach(g => { map[g.name] = all.filter(x=>(x.genres||[]).includes(g.name)).length; });
      setCounts(map);
    }).catch(()=>{});
  }, []);

  const chartData = {
    labels: GENRES.map(g=>g.name),
    datasets: [{
      label:'Games',
      data: GENRES.map(g=>counts[g.name]||0),
      backgroundColor:'rgba(255,85,0,.7)',
      borderColor:'rgba(255,85,0,1)',
      borderWidth:1, borderRadius:6,
    }],
  };

  return (
    <div>
      {/* Page hero */}
      <div className="page-hero">
        <h1 className="font-orbitron font-black mb-4" style={{fontSize:'clamp(1.8rem,4vw,3rem)'}}>
          🎭 Game <span className="gradient-text">Genres</span>
        </h1>
        <p className="text-slate-400 max-w-md mx-auto">
          {total} games across {GENRES.length} genres. Browse by your favourite style.
        </p>
      </div>

      {/* Genre grid */}
      <section className="py-20" style={{ background: 'var(--bg2)' }}>
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="section-head">
            <h2 className="section-title">All Genres</h2>
            <Link to="/games" className="view-all">All Games →</Link>
          </div>
          <div className="grid-games">
            {GENRES.map(g => <GenreCard key={g.id} genre={g} count={counts[g.name]||0}/>)}
          </div>
        </div>
      </section>

      {/* Bar chart */}
      {Object.keys(counts).length>0&&(
        <section className="py-20" style={{ background: 'var(--bg)' }}>
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="section-head">
              <div>
                <h2 className="section-title">📊 Games Per Genre</h2>
                <p className="text-slate-400 text-sm mt-1">Which categories have the most coverage</p>
              </div>
            </div>
            <div className="rounded-xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              <Bar data={chartData} options={{
                responsive:true,
                plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.parsed.y} games`}}},
                scales:{
                  x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,.05)'}},
                  y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,.05)'},beginAtZero:true},
                },
              }}/>
            </div>
          </div>
        </section>
      )}

      {/* Highlight cards */}
      <section className="py-20" style={{ background: 'var(--bg2)' }}>
        <div className="max-w-[1440px] mx-auto px-8">
          <h2 className="section-title mb-8">Genre Highlights</h2>
          <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
            {GENRES.map(g=>(
              <Link key={g.id} to={`/games?genre=${g.name}`} className="no-underline block group">
                <div className="rounded-xl p-5 flex items-start gap-4
                                group-hover:-translate-y-1 transition-all duration-300" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}
                  onMouseOver={e => e.currentTarget.style.borderColor='var(--border-o)'}
                  onMouseOut={e => e.currentTarget.style.borderColor='var(--border)'}
                >
                  <div className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center text-2xl"
                    style={{background:g.gradient}}>{g.icon}</div>
                  <div>
                    <div className="font-orbitron font-bold text-slate-100 mb-1">{g.name}</div>
                    <div className="text-xs text-slate-600 mb-2">{g.desc}</div>
                    <span className="badge badge-orange">{counts[g.name]||0} games</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
