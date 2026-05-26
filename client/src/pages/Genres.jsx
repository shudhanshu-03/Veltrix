import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getGames } from '../services/api';
import { GENRES } from '../data/genres';
import GenreCard from '../components/GenreCard';

export default function Genres() {
  const [counts, setCounts] = useState({});
  const [total,  setTotal]  = useState(0);

  useEffect(() => {
    getGames({ limit: 200 }).then(res => {
      const all = res?.data || [];
      setTotal(all.length);
      const map = {};
      GENRES.forEach(g => { map[g.name] = all.filter(x => (x.genres || []).includes(g.name)).length; });
      setCounts(map);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Page hero */}
      <div className="page-hero">
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          🎮 All <span className="gradient-text">Genres</span>
        </h1>
        <p style={{ color: 'var(--text2)', maxWidth: 500, margin: '0 auto' }}>
          Explore 12 genres covering every type of PC gaming experience.
        </p>
      </div>

      {/* Genre grid — compact */}
      <section style={{ padding: '2rem 0 5rem', background: 'var(--bg)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GENRES.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <GenreCard genre={g} count={counts[g.name] || 0} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
