import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AnimeRow from '../components/AnimeRow';

export default function Home() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // --- Auto-Suggest Logic ---
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      setShowDropdown(true);
      axios.get(`https://api.jikan.moe/v4/anime?q=${query}&limit=5&sfw=true`)
        .then(res => {
          setSuggestions(res.data.data);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query) return;
    navigate(`/search?q=${query}`);
  };

  return (
    <div className="pt-28 pb-20 transition-colors duration-300">
      
      {/* Search Hero Section */}
      <div className="px-8 mb-16 max-w-3xl mx-auto text-center" ref={searchRef}>
        
        {/* Upgraded Cinematic Header */}
        <div className="mb-6 relative inline-flex flex-col items-center">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 opacity-80 mb-2">
            Discover Your Next Obsession
          </span>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase bg-gradient-to-b from-indigo-500 to-purple-700 dark:from-indigo-300 dark:to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            AnimeNexus
          </h1>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-8">
          Explore the vast universe of anime, curated just for you.
        </p>

        {/* Search Bar */}
        <div className="relative z-20 text-left">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-xl dark:shadow-2xl">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setShowDropdown(true)}
              placeholder="Search for anime..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 focus-within:border-indigo-500 rounded-full py-4 pl-8 pr-32 text-slate-900 dark:text-white focus:outline-none transition-colors shadow-inner"
              autoComplete="off"
            />
            <button type="submit" className="absolute right-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-full font-bold transition-colors shadow-lg shadow-indigo-500/30">
              Search
            </button>
          </form>

          {/* Dynamic Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 flex flex-col">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">Searching archives...</div>
              ) : suggestions.length > 0 ? (
                <>
                  {suggestions.map((anime) => (
                    <Link 
                      to={`/anime/${anime.mal_id}`} 
                      key={anime.mal_id}
                      className="flex items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800 last:border-0 group"
                    >
                      <img src={anime.images?.jpg?.small_image_url} alt={anime.title} className="w-12 h-16 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="ml-4 flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{anime.title}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{anime.year || 'TBA'} • ⭐ {anime.score || 'N/A'}</span>
                      </div>
                    </Link>
                  ))}
                  <div onClick={handleSearchSubmit} className="p-3 text-center text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition">
                    View All Results &rarr;
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No matching anime found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <AnimeRow title="🔥 Top Trending Now" apiUrl="https://api.jikan.moe/v4/top/anime?filter=airing&limit=15" />
      <AnimeRow title="⚔️ Action & Adventure" apiUrl="https://api.jikan.moe/v4/anime?genres=1&limit=15&order_by=score&sort=desc" />
      <AnimeRow title="🐉 Epic Fantasy" apiUrl="https://api.jikan.moe/v4/anime?genres=10&limit=15&order_by=score&sort=desc" />
      <AnimeRow title="❤️ Romance Picks" apiUrl="https://api.jikan.moe/v4/anime?genres=22&limit=15&order_by=score&sort=desc" />
    </div>
  );
}