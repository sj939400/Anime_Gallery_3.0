import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Manga() {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://api.jikan.moe/v4/top/manga')
      .then(response => {
        setMangaList(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching manga:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="text-2xl font-bold animate-pulse text-indigo-400">Loading Manga Library...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        Top Rated Manga
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {mangaList.map((manga) => (
          <Link 
            to={`/manga/${manga.mal_id}`} 
            key={manga.mal_id} 
            className="group relative bg-slate-800 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-lg border border-slate-700/50 block"
          >
            <div className="relative h-80 overflow-hidden">
               <img src={manga.images.jpg.image_url} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80"></div>
               <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-emerald-400 font-bold px-3 py-1 rounded-full text-xs border border-emerald-500/30">
                 ⭐ {manga.score}
               </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 text-white group-hover:text-emerald-400 transition-colors">
                {manga.title}
              </h3>
              <p className="text-slate-400 text-sm mt-1 font-medium">{manga.published?.prop?.from?.year || 'TBA'} • {manga.chapters ? `${manga.chapters} Ch.` : 'Ongoing'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}