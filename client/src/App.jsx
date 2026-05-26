import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';
import Home       from './pages/Home';
import Games      from './pages/Games';
import GameDetail from './pages/GameDetail';
import Genres     from './pages/Genres';
import Login      from './pages/Login';
import Profile    from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login — fullscreen standalone, no Navbar/Footer */}
        <Route path="/login" element={<Login />} />

        {/* All other pages share Navbar + Footer */}
        <Route path="*" element={
          <>
            <Navbar />
            <main style={{ paddingTop: 'var(--nav-h)' }}>
              <Routes>
                <Route path="/"         element={<Home />} />
                <Route path="/games"    element={<Games />} />
                <Route path="/game/:id" element={<GameDetail />} />
                <Route path="/genres"   element={<Genres />} />
                <Route path="/profile"  element={<Profile />} />
                <Route path="*"         element={
                  <div className="text-center py-32">
                    <div className="text-6xl mb-4">🕹️</div>
                    <h2 className="font-orbitron text-2xl mb-3">404 — Page Not Found</h2>
                    <a href="/" className="text-brand-cyan hover:underline">← Back to Veltrix</a>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}
