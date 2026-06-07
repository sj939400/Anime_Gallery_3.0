import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Characters() {
  const [characterList, setCharacterList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://api.jikan.moe/v4/top/characters')
      .then(response => {
        setCharacterList(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching characters:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="text-2xl font-bold animate-pulse text-purple-400">Loading Hall of Fame...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        Most Loved Characters
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {characterList.map((char) => (
          <Link 
            to={`/character/${char.mal_id}`} 
            key={char.mal_id} 
            className="group bg-slate-800 rounded-2xl p-4 flex flex-col items-center hover:-translate-y-2 transition-all duration-300 shadow-lg border border-slate-700/50 block text-center"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-slate-700 group-hover:border-purple-400 transition-colors">
               <img src={char.images.jpg.image_url} alt={char.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-bold text-md text-white group-hover:text-purple-400 transition-colors line-clamp-2">
              {char.name}
            </h3>
            <p className="text-slate-400 text-xs mt-2 font-medium bg-slate-900 px-3 py-1 rounded-full">
              ❤️ {char.favorites.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}