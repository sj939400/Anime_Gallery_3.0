import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Characters() {
  const [characterList, setCharacterList] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchRef = useRef(null);

  useEffect(() => {
    fetchData('https://api.jikan.moe/v4/top/characters');
  }, []);

  const fetchData = (url) => {
    setLoading(true);
    axios.get(url)
      .then(res => {
        setCharacterList(res.data.data);
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
      axios.get(`https://api.jikan.moe/v4/characters?q=${query}&limit=5`)
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
      fetchData('https://api.jikan.moe/v4/top/characters');
      return;
    }
    fetchData(`https://api.jikan.moe/v4/characters?q=${query}&order_by=favorites&sort=desc`);
  };

  return (
    <div className="pt-28 pb-20 px-8 max-w-[1400px] mx-auto transition-colors duration-300">
      
      <div className="mb-16 text-center max-w-3xl mx-auto" ref={searchRef}>
        
        {/* Upgraded Cinematic Header */}
        <div className="mb-6 relative inline-flex flex-col items-center">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400 opacity-80 mb-2">
            Meet The Legends
          </span>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase bg-gradient-to-b from-pink-500 to-rose-700 dark:from-pink-300 dark:to-rose-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            Character Database
          </h1>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg font-medium">Find your favorite heroes, villains, and side characters.</p>
        
        <div className="relative z-20 text-left">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-xl dark:shadow-2xl">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setShowDropdown(true)}
              placeholder="Search characters (e.g., Levi, Gojo...)" 
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-pink-400 dark:hover:border-pink-500/50 focus-within:border-pink-500 rounded-full py-4 pl-8 pr-32 text-slate-900 dark:text-white focus:outline-none transition-colors shadow-inner"
              autoComplete="off"
            />
            <button type="submit" className="absolute right-2 bg-pink-600 hover:bg-pink-500 text-white px-8 py-2.5 rounded-full font-bold transition-colors">
              Search
            </button>
          </form>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 flex flex-col">
              {isSearchingSuggestions ? (
                <div className="p-4 text-center text-sm text-pink-600 dark:text-pink-400 font-medium animate-pulse">Scanning database...</div>
              ) : suggestions.length > 0 ? (
                <>
                  {suggestions.map((char) => (
                    <Link 
                      to={`/character/${char.mal_id}`} 
                      key={char.mal_id}
                      className="flex items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800 last:border-0 group"
                    >
                      <img src={char.images?.jpg?.image_url} alt={char.name} className="w-12 h-16 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="ml-4 flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1">{char.name}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">❤️ {char.favorites?.toLocaleString() || 0} Favorites</span>
                      </div>
                    </Link>
                  ))}
                  <div onClick={handleSearchSubmit} className="p-3 text-center text-sm text-pink-600 dark:text-pink-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition">
                    Load Full Results &rarr;
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No matching characters found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-pink-600 dark:text-pink-400 animate-pulse text-xl font-bold mt-20">Searching Database...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {characterList.map(char => (
            <Link to={`/character/${char.mal_id}`} key={char.mal_id} className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-lg dark:shadow-none block">
              <div className="h-72 overflow-hidden relative">
                <img src={char.images.jpg.image_url} alt={char.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => {e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}} />
                {char.favorites > 0 && (
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm text-pink-600 dark:text-pink-400 font-bold px-2 py-1 rounded text-xs border border-pink-200 dark:border-pink-500/30 shadow-sm">
                    ❤️ {char.favorites.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{char.name}</h3>
                {char.name_kanji && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{char.name_kanji}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}