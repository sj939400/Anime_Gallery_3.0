import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CategoryResults() {
  const { id, name } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch anime by genre ID, sorted by score descending
    axios.get(`https://api.jikan.moe/v4/anime?genres=${id}&order_by=score&sort=desc&sfw=true`)
      .then(response => {
        setAnimeList(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching category results:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="text-2xl font-bold animate-pulse text-indigo-400">Loading {name} Anime...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <Link to="/categories" className="text-indigo-400 hover:text-indigo-300 mb-6 inline-flex items-center gap-2 font-bold transition group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Categories
      </Link>
      
      <h1 className="text-4xl font-bold mb-10 text-white">
        Top <span className="text-indigo-400">{name}</span> Anime
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {animeList.map((anime) => (
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
    </div>
  );
}