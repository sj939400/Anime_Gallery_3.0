import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Build the dynamic Jikan API URL
    let apiUrl = `https://api.jikan.moe/v4/anime?q=${query}&sfw=true&order_by=popularity&sort=asc`;
    if (genre) apiUrl += `&genres=${genre}`;

    axios.get(apiUrl)
      .then(response => {
        setResults(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching search results:", error);
        setLoading(false);
      });
  }, [query, genre]);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="text-2xl font-bold animate-pulse text-indigo-400">Scanning Database...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-white">
        Search Results
      </h1>
      <p className="text-slate-400 mb-10 font-medium">
        Found {results.length} results for <span className="text-indigo-400">"{query}"</span>
      </p>
      
      {results.length === 0 ? (
        <div className="text-center p-20 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <h3 className="text-2xl text-white font-bold mb-2">No data found</h3>
          <p className="text-slate-400">Try adjusting your search terms or genre filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {results.map((anime) => (
            <Link 
              to={`/anime/${anime.mal_id}`} 
              key={anime.mal_id} 
              className="group relative bg-slate-800 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-lg border border-slate-700/50 block"
            >
              <div className="relative h-80 overflow-hidden">
                 <img 
                   src={anime.images.jpg.image_url} 
                   alt={anime.title} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80"></div>
                 <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-indigo-400 font-bold px-3 py-1 rounded-full text-xs border border-indigo-500/30">
                   ⭐ {anime.score || 'N/A'}
                 </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 text-white group-hover:text-indigo-400 transition-colors">
                  {anime.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}