import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CharacterDetail() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [appearances, setAppearances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch both the full character bio AND their anime appearances
    Promise.all([
      axios.get(`https://api.jikan.moe/v4/characters/${id}/full`),
      axios.get(`https://api.jikan.moe/v4/characters/${id}/anime`)
    ])
    .then(([charRes, animeRes]) => {
      setCharacter(charRes.data.data);
      setAppearances(animeRes.data.data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error fetching character data:", error);
      setLoading(false);
    });
  }, [id]); 

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="text-2xl font-bold animate-pulse text-purple-400">Loading Databanks...</div>
    </div>
  );
  
  if (!character) return <div className="text-center p-20 text-red-500">Character data not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 mt-6 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 mb-10">
      <Link to="/characters" className="text-purple-400 hover:text-purple-300 mb-8 inline-flex items-center gap-2 font-bold transition group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Roster
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/3 shrink-0">
          <img 
            src={character.images.jpg.image_url} 
            alt={character.name} 
            className="w-full rounded-2xl shadow-2xl shadow-black/50 border border-slate-600 object-cover"
          />
          <div className="mt-4 bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 text-center">
             <span className="text-slate-400 text-sm uppercase tracking-wider font-bold">Total Favorites</span>
             <h3 className="text-2xl font-black text-purple-400 mt-1">❤️ {character.favorites.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-white leading-tight">
            {character.name}
          </h1>
          {character.name_kanji && (
            <h2 className="text-2xl text-slate-400 mb-8 font-semibold">{character.name_kanji}</h2>
          )}

          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-purple-500 rounded-full"></span> Biography & Feats
            </h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg font-light">
              {character.about ? character.about : "No biography data available in the archives."}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Anime Section */}
      {appearances.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-700/50">
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span> Featured In Anime
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {appearances.map((appearance) => (
              <Link 
                to={`/anime/${appearance.anime.mal_id}`} 
                key={appearance.anime.mal_id} 
                className="group relative bg-slate-900 rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-lg border border-slate-700/50 block"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={appearance.anime.images.jpg.image_url} 
                    alt={appearance.anime.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-xs text-indigo-400 font-bold uppercase block mb-1">{appearance.role}</span>
                  <h4 className="font-bold text-sm leading-tight line-clamp-2 text-white group-hover:text-indigo-400 transition-colors">
                    {appearance.anime.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}