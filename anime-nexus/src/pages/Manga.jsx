import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Manga() {
  const [mangaList, setMangaList] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchRef = useRef(null);

  useEffect(() => {
    fetchData('https://api.jikan.moe/v4/top/manga');
  }, []);

  const fetchData = (url) => {
    setLoading(true);
    axios.get(url)
      .then(res => {
        setMangaList(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // --- Auto-Suggest Logic ---
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearchingSuggestions(true);
      setShowDropdown(true);
      axios.get(`https://api.jikan.moe/v4/manga?q=${query}&limit=5&sfw=true`)
        .then(res => {
          setSuggestions(res.data.data);
          setIsSearchingSuggestions(false);
        })
        .catch(() => setIsSearchingSuggestions(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (!query.trim()) {
      fetchData('https://api.jikan.moe/v4/top/manga');
      return;
    }
    fetchData(`https://api.jikan.moe/v4/manga?q=${query}&order_by=popularity&sort=asc&sfw=true`);
  };

  return (
    <div className="bg-slate-950 min-h-screen pt-28 pb-20 px-8 text-white max-w-[1400px] mx-auto">
      
      <div className="mb-16 text-center max-w-3xl mx-auto" ref={searchRef}>
        <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          Manga Library
        </h1>
        <p className="text-slate-400 mb-8 text-lg font-medium">Search through thousands of manga, manhwa, and novels.</p>
        
        <div className="relative z-20 text-left">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setShowDropdown(true)}
              placeholder="Search for manga..." 
              className="w-full bg-slate-900 border border-slate-700 hover:border-emerald-500/50 focus-within:border-emerald-500 rounded-full py-4 pl-8 pr-32 text-white focus:outline-none transition-colors shadow-inner"
              autoComplete="off"
            />
            <button type="submit" className="absolute right-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-full font-bold transition-colors">
              Search
            </button>
          </form>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 flex flex-col">
              {isSearchingSuggestions ? (
                <div className="p-4 text-center text-sm text-emerald-400 font-medium animate-pulse">Searching archives...</div>
              ) : suggestions.length > 0 ? (
                <>
                  {suggestions.map((manga) => (
                    <Link 
                      to={`/manga/${manga.mal_id}`} 
                      key={manga.mal_id}
                      className="flex items-center p-3 hover:bg-slate-800 transition border-b border-slate-800 last:border-0 group"
                    >
                      <img src={manga.images?.jpg?.small_image_url} alt={manga.title} className="w-12 h-16 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" />
                      <div className="ml-4 flex flex-col">
                        <span className="font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{manga.title}</span>
                        <span className="text-sm text-slate-400 font-medium">{manga.type} • ⭐ {manga.score || 'N/A'}</span>
                      </div>
                    </Link>
                  ))}
                  <div onClick={handleSearchSubmit} className="p-3 text-center text-sm text-emerald-400 font-bold hover:bg-slate-800 cursor-pointer transition">
                    Load Full Results &rarr;
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">No matching manga found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-emerald-400 animate-pulse text-xl font-bold mt-20">Searching Library...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mangaList.map(manga => (
            <Link to={`/manga/${manga.mal_id}`} key={manga.mal_id} className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:-translate-y-2 transition-all duration-300 shadow-lg block">
              <div className="h-80 overflow-hidden relative">
                <img src={manga.images.jpg.image_url} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-emerald-400 font-bold px-2 py-1 rounded text-xs border border-emerald-500/30">
                  ⭐ {manga.score || 'N/A'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">{manga.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{manga.type} • {manga.chapters ? `${manga.chapters} Ch.` : 'Ongoing'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}