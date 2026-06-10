import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AnimeDetail from './pages/AnimeDetail';
import Collection from './pages/Collection';
import Manga from './pages/Manga';
import Characters from './pages/Characters';
import Categories from './pages/Categories';
import CategoryResults from './pages/CategoryResults';
import MangaDetail from './pages/MangaDetail';
import CharacterDetail from './pages/CharacterDetail';
import SearchResults from './pages/SearchResults';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        
        <button 
          onClick={toggleTheme}
          className="fixed bottom-6 right-6 z-[100] p-4 rounded-full shadow-2xl bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-110 transition-all"
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/manga" element={<Manga />} />
          <Route path="/manga/:id" element={<MangaDetail />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/character/:id" element={<CharacterDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:id/:name" element={<CategoryResults />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;