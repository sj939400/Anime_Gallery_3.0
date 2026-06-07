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
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white">
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