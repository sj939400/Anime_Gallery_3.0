import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Categories() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://api.jikan.moe/v4/genres/anime')
      .then(response => {
        // Filter out genres with 0 count to keep it clean
        const activeGenres = response.data.data.filter(g => g.count > 0);
        setGenres(activeGenres);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching genres:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="text-2xl font-bold animate-pulse text-indigo-400">Loading Database...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-white">Explore by Category</h1>
      <div className="flex flex-wrap gap-4">
        {genres.map((genre) => (
          <Link 
            to={`/category/${genre.mal_id}/${genre.name}`}
            key={genre.mal_id} 
            className="px-6 py-4 bg-slate-800 rounded-xl shadow border border-slate-700/50 hover:bg-indigo-600 hover:border-indigo-400 transition-all cursor-pointer group flex items-center justify-between w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)]"
          >
            <span className="font-bold text-slate-200 group-hover:text-white">{genre.name}</span>
            <span className="text-xs text-slate-500 group-hover:text-indigo-200 font-medium bg-slate-900 group-hover:bg-indigo-700 px-2 py-1 rounded">
              {genre.count.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}