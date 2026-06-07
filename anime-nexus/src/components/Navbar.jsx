import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const isAuth = localStorage.getItem('anime_user');

  // --- Debounced Auto-Suggest Logic ---
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      setShowDropdown(true);
      
      let apiUrl = `https://api.jikan.moe/v4/anime?q=${searchQuery}&limit=5&sfw=true`;
      if (genre) apiUrl += `&genres=${genre}`;

      axios.get(apiUrl)
        .then(response => {
          setSuggestions(response.data.data);
          setIsSearching(false);
        })
        .catch(error => {
          console.error("Autocomplete error:", error);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, genre]);

  // --- Close dropdown if clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery && !genre) return;
    setShowDropdown(false);
    let url = `/search?q=${searchQuery}`;
    if (genre) url += `&genre=${genre}`;
    navigate(url);
    setSearchQuery('');
  };

  const handleLogout = () => {
    localStorage.removeItem('anime_user');
    window.location.href = '/'; 
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50 transition-all">
      <Link to="/" className="text-3xl font-bold tracking-tight shrink-0">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          AnimeNexus
        </span>
      </Link>
      
      {/* Search Bar */}
      <div className="hidden lg:flex flex-col relative mx-6 flex-1 max-w-xl" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 focus-within:border-indigo-500 rounded-full px-2 py-1 shadow-inner transition-all z-20">
          <input 
            type="text" 
            placeholder="Search anime..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 3 && setShowDropdown(true)}
            className="bg-transparent border-none outline-none px-4 py-1 flex-1 text-sm text-white placeholder-slate-400"
            autoComplete="off"
          />
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            className="bg-transparent text-sm text-slate-300 outline-none border-none cursor-pointer pr-2"
          >
            <option value="">All Genres</option>
            <option value="1">Action</option>
            <option value="4">Comedy</option>
            <option value="8">Drama</option>
            <option value="10">Fantasy</option>
            <option value="22">Romance</option>
            <option value="24">Sci-Fi</option>
          </select>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-full transition ml-2 flex items-center justify-center">
            🔍
          </button>
        </form>

        {/* Dynamic Auto-Suggest Dropdown */}
        {showDropdown && (
          <div className="absolute top-12 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col mt-1">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-indigo-400 font-medium animate-pulse">Searching archives...</div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((anime) => (
                  <Link 
                    to={`/anime/${anime.mal_id}`} 
                    key={anime.mal_id}
                    onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                    className="flex items-center p-3 hover:bg-slate-700/50 transition border-b border-slate-700/50 last:border-0 group"
                  >
                    <img src={anime.images.jpg.small_image_url} alt={anime.title} className="w-10 h-14 object-cover rounded shadow-md group-hover:scale-105 transition-transform" />
                    <div className="ml-4 flex flex-col">
                      <span className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{anime.title}</span>
                      <span className="text-xs text-slate-400 font-medium">{anime.year || 'TBA'} • ⭐ {anime.score || 'N/A'}</span>
                    </div>
                  </Link>
                ))}
                <div onClick={handleSearchSubmit} className="p-3 text-center text-sm text-indigo-400 font-bold hover:bg-slate-700 cursor-pointer transition">
                  View All Results &rarr;
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-sm text-slate-400">No matching anime found.</div>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:flex gap-6 items-center font-semibold text-slate-300 text-sm tracking-wide shrink-0">
        <Link to="/categories" className="hover:text-indigo-400 transition">Categories</Link>
        <Link to="/manga" className="hover:text-indigo-400 transition">Manga</Link>
        <Link to="/characters" className="hover:text-indigo-400 transition">Characters</Link>
        <Link to="/collection" className="hover:text-indigo-400 transition">Vault</Link>
        
        {isAuth ? (
          <div className="flex items-center gap-3 ml-2 border-l border-slate-700 pl-4">
             <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
               AJ
             </div>
             <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 transition">Log Out</button>
          </div>
        ) : (
          <Link to="/auth" className="ml-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}