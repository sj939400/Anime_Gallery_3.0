import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AnimeRow({ title, apiUrl }) {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !shouldFetch) {
          setShouldFetch(true);
        }
      },
      { rootMargin: '300px' }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => {
      if (rowRef.current) observer.unobserve(rowRef.current);
    };
  }, [shouldFetch]);

  useEffect(() => {
    if (shouldFetch) {
      axios.get(apiUrl)
        .then(response => {
          setAnimeList(response.data.data);
          setLoading(false);
        })
        .catch(error => {
          console.error(`Error fetching ${title}:`, error);
          setLoading(false);
        });
    }
  }, [shouldFetch, apiUrl]);

  return (
    <div className="mb-12" ref={rowRef}>
      <h2 className="text-3xl font-black mb-6 text-slate-900 dark:text-white px-8 max-w-[1400px] mx-auto tracking-tight uppercase">
        {title}
      </h2>
      
      {loading ? (
        <div className="flex gap-6 overflow-hidden px-8 pb-8 max-w-[1400px] mx-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-none w-64 h-80 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-300 dark:border-slate-700/50"></div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto px-8 pb-8 scrollbar-hide max-w-[1400px] mx-auto">
          {animeList.map((anime) => (
            <Link 
              to={`/anime/${anime.mal_id}`} 
              key={anime.mal_id} 
              className="flex-none w-64 group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-md dark:shadow-none hover:shadow-xl dark:hover:shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 block"
            >
              <div className="relative h-80 overflow-hidden">
                 <img 
                   src={anime.images.jpg.image_url} 
                   alt={anime.title} 
                   loading="lazy"
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-slate-950 dark:via-slate-950/40 opacity-80"></div>
                 
                 <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-full text-xs border border-slate-200 dark:border-indigo-500/30 shadow-sm">
                   ⭐ {anime.score || 'N/A'}
                 </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {anime.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">{anime.year || 'TBA'} • {anime.type || 'TV'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}