import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CharacterDetail() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [animeography, setAnimeography] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secondaryLoading, setSecondaryLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSecondaryLoading(true);
    setAnimeography([]);
    setVoices([]);

    // 1. Fetch Main Character Data
    axios.get(`https://api.jikan.moe/v4/characters/${id}/full`)
      .then(res => {
        setCharacter(res.data.data);
        setLoading(false);

        // 2. Stagger secondary requests
        setTimeout(() => {
          axios.get(`https://api.jikan.moe/v4/characters/${id}/anime`)
            .then(animeRes => setAnimeography(animeRes.data.data?.slice(0, 10) || []))
            .catch(err => console.error(err));

          axios.get(`https://api.jikan.moe/v4/characters/${id}/voices`)
            .then(voiceRes => {
              const sortedVoices = voiceRes.data.data?.sort((a, b) => 
                a.language === 'Japanese' ? -1 : 1
              ).slice(0, 5) || [];
              setVoices(sortedVoices);
              setSecondaryLoading(false);
            })
            .catch(() => setSecondaryLoading(false));
        }, 600);
      })
      .catch((error) => {
        console.error("Critical error loading character:", error);
        setCharacter(null);
        setLoading(false);
      });
  }, [id]);

  // --- Advanced Text Parser ---
  const processCharacterLore = (aboutText) => {
    if (!aboutText) return { facts: [], lore: "UNKNOWN" };
    
    const lines = aboutText.split('\n').map(line => line.trim());
    const facts = [];
    const loreLines = [];

    lines.forEach(line => {
      if (line && line.includes(':') && line.split(' ').length < 15 && !line.endsWith('.')) {
        facts.push(line);
      } else if (line) {
        loreLines.push(line);
      }
    });

    return { 
      facts, 
      lore: loreLines.length > 0 ? loreLines.join('\n\n') : "UNKNOWN" 
    };
  };

  if (loading) return <div className="text-white p-20 text-center text-xl animate-pulse">Accessing Character Databanks...</div>;
  if (!character) return <div className="text-white p-20 text-center text-xl">UNKNOWN Data / API Error</div>;

  const { facts, lore } = processCharacterLore(character.about);

  return (
    <div className="px-10 pt-28 pb-20 bg-slate-950 min-h-screen text-white max-w-7xl mx-auto">
      
      {/* Header & Main Info Section */}
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        
        {/* Character Image */}
        <div className="md:col-span-1">
          <img 
            src={character.images?.jpg?.image_url} 
            className="rounded-3xl w-full shadow-2xl shadow-indigo-500/20 border border-slate-800 sticky top-24" 
            alt={character.name || "UNKNOWN"} 
            onError={(e) => {e.target.src = 'https://via.placeholder.com/300x450?text=UNKNOWN'}}
          />
        </div>

        {/* Character Details */}
        <div className="md:col-span-3 flex flex-col">
          <h1 className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {character.name || "UNKNOWN"}
          </h1>
          <h2 className="text-2xl text-slate-400 font-medium tracking-wide mb-8">
            {character.name_kanji || "UNKNOWN"}
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Basic Facts Card */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-inner h-fit">
              <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
                📋 Basic Facts
              </h3>
              <ul className="space-y-3 text-slate-300 font-medium text-sm">
                <li className="flex items-start">
                  <span className="text-slate-500 w-28 shrink-0">Also Known As:</span> 
                  <span className="text-white">
                    {character.nicknames?.length > 0 ? character.nicknames.join(', ') : "UNKNOWN"}
                  </span>
                </li>
                
                <li className="flex items-start">
                  <span className="text-slate-500 w-28 shrink-0">MAL Favorites:</span> 
                  <span className="text-white">
                    {character.favorites != null ? `${character.favorites.toLocaleString()} users` : "UNKNOWN"}
                  </span>
                </li>

                {facts.map((fact, i) => {
                  const [key, ...valueArr] = fact.split(':');
                  const value = valueArr.join(':').trim();
                  return (
                    <li key={i} className="flex items-start">
                      <span className="text-slate-500 w-28 shrink-0">{key.trim() || "UNKNOWN"}:</span> 
                      <span className="text-white">{value || "UNKNOWN"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Personality & Combat Feats Card */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-inner">
              <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
                ⚔️ Personality & Feats
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {lore}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animeography (Anime they appear in) */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8 border-b border-indigo-500/50 pb-3 inline-block">Notable Appearances</h2>
        
        {secondaryLoading ? (
          <div className="text-indigo-400 animate-pulse font-medium">Scanning anime archives...</div>
        ) : animeography.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {animeography.map((item, index) => (
              <Link to={`/anime/${item.anime?.mal_id}`} key={index} className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all hover:-translate-y-2 shadow-lg">
                <div className="overflow-hidden h-64 relative">
                  <img 
                    src={item.anime?.images?.jpg?.image_url} 
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
                    alt={item.anime?.title || "UNKNOWN"} 
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/300x450?text=UNKNOWN'}}
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-300">
                    {item.role || "UNKNOWN"}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-center text-slate-300 group-hover:text-indigo-400 transition line-clamp-2">
                    {item.anime?.title || "UNKNOWN"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic bg-slate-900 p-6 rounded-xl border border-slate-800 text-center font-bold">
            UNKNOWN
          </div>
        )}
      </div>

      {/* Voice Actors Section */}
      <div className="mt-20 border-t border-slate-800 pt-16">
        <h2 className="text-3xl font-bold mb-8 border-b border-indigo-500/50 pb-3 inline-block">Voice Actors</h2>
        
        {secondaryLoading ? (
          <div className="text-indigo-400 animate-pulse font-medium">Fetching voice actor data...</div>
        ) : voices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {voices.map((va, index) => (
              <div key={index} className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col hover:-translate-y-1 transition-transform duration-300">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={va.person?.images?.jpg?.image_url} 
                    alt={va.person?.name || "UNKNOWN"} 
                    className="w-full h-full object-cover"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/200x300?text=UNKNOWN'}}
                  />
                </div>
                <div className="p-4 text-center bg-slate-800/50 flex-1 flex flex-col justify-center">
                  <p className="font-bold text-white mb-1 line-clamp-1" title={va.person?.name}>
                    {va.person?.name || "UNKNOWN"}
                  </p>
                  <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs text-indigo-400 font-medium">
                    {va.language || "UNKNOWN"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic bg-slate-900 p-6 rounded-xl border border-slate-800 text-center font-bold">
            UNKNOWN
          </div>
        )}
      </div>

    </div>
  );
}