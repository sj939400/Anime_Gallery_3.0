import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import VaultModal from '../components/VaultModal';

export default function AnimeDetail() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [recs, setRecs] = useState([]);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [castLoading, setCastLoading] = useState(true);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCastLoading(true);
    setCast([]);
    setRecs([]);

    axios.get(`https://api.jikan.moe/v4/anime/${id}/full`)
      .then(res => {
        setAnime(res.data.data);
        setLoading(false);

        setTimeout(() => {
          axios.get(`https://api.jikan.moe/v4/anime/${id}/characters`)
            .then(castRes => {
              setCast(castRes.data.data?.slice(0, 10) || []);
              setCastLoading(false);
            })
            .catch(() => setCastLoading(false));
            
          axios.get(`https://api.jikan.moe/v4/anime/${id}/recommendations`)
            .then(recRes => {
              setRecs(recRes.data.data?.slice(0, 5) || []);
            })
            .catch(err => console.error(err));
        }, 500); 
      })
      .catch((error) => {
        console.error("Critical error loading anime:", error);
        setAnime(null);
        setLoading(false);
      });
  }, [id]);

  const handleOpenVaultModal = () => {
    if (!localStorage.getItem('anime_user')) return alert("Please sign in first!");
    setIsVaultModalOpen(true);
  };

  const getCrunchyrollLink = () => {
    if (!anime?.streaming) return null;
    const cr = anime.streaming.find(s => s.name.toLowerCase().includes("crunchyroll"));
    return cr ? cr.url : (anime.streaming[0]?.url || null);
  };

  if (loading) return <div className="text-white p-20 text-center text-xl animate-pulse">Loading Anime Databanks...</div>;
  if (!anime) return <div className="text-white p-20 text-center text-xl">Anime not found. The API might be temporarily overloaded.</div>;

  return (<div className="px-10 pt-28 pb-20 bg-slate-950 min-h-screen text-white max-w-7xl mx-auto">
    
      <h1 className="text-6xl font-extrabold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        {anime.title}
      </h1>
      
      <div className="grid md:grid-cols-3 gap-12">
        <img src={anime.images.jpg.large_image_url} className="rounded-3xl w-full shadow-2xl shadow-indigo-500/20 border border-slate-800" alt={anime.title} />
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-3 mb-6">
            {anime.genres?.map(g => (
              <span key={g.mal_id} className="bg-slate-800 border border-indigo-500/30 px-5 py-2 rounded-full text-sm font-semibold text-indigo-300 shadow-inner">
                {g.name}
              </span>
            ))}
          </div>
          <p className="text-slate-300 mb-10 text-lg leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            {anime.synopsis || "No synopsis available."}
          </p>
          
          <div className="flex gap-4">
            <button onClick={handleOpenVaultModal} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1">
              + Add to Vault
            </button>
            {getCrunchyrollLink() && (
              <a href={getCrunchyrollLink()} target="_blank" rel="noreferrer" className="bg-orange-600 hover:bg-orange-500 px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1">
                Watch on Crunchyroll
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-bold mb-8 border-b border-indigo-500/50 pb-3 inline-block">Cast & Characters</h2>
        
        {castLoading ? (
          <div className="text-indigo-400 animate-pulse font-medium">Fetching character database...</div>
        ) : cast.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {cast.map((c, index) => {
              const jpVA = c.voice_actors?.find(va => va.language === 'Japanese');
              return (
                <div key={index} className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col hover:-translate-y-2 transition-transform duration-300 group">
                  <div className="flex h-48">
                    <img 
                      src={c.character?.images?.jpg?.image_url} 
                      alt={c.character?.name} 
                      className="w-1/2 object-cover" 
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/150x200?text=No+Image'}}
                    />
                    {jpVA ? (
                      <img 
                        src={jpVA.person?.images?.jpg?.image_url} 
                        alt={jpVA.person?.name} 
                        className="w-1/2 object-cover" 
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/150x200?text=No+VA'}}
                      />
                    ) : (
                      <div className="w-1/2 bg-slate-800 flex items-center justify-center text-xs text-slate-500 text-center p-2 font-medium">No VA Info</div>
                    )}
                  </div>
                  <div className="p-4 text-sm flex-1 flex flex-col justify-between bg-slate-800/50">
                    <div>
                      <p className="font-bold text-indigo-300 line-clamp-1" title={c.character?.name}>
                         <Link to={`/character/${c.character?.mal_id}`} className="hover:underline">{c.character?.name}</Link>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{c.role}</p>
                    </div>
                    {jpVA && (
                      <div className="mt-3 pt-3 border-t border-slate-700 text-right">
                        <p className="font-bold text-white line-clamp-1" title={jpVA.person?.name}>{jpVA.person?.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Japanese VA</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-500 italic bg-slate-900 p-6 rounded-xl border border-slate-800">No character data available for this anime.</div>
        )}
      </div>

      {anime.trailer?.embed_url && (
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 border-b border-indigo-500/50 pb-3 inline-block">Official Trailer</h2>
          <iframe 
            src={anime.trailer.embed_url} 
            className="w-full h-[600px] rounded-3xl shadow-2xl border border-slate-800 bg-black" 
            allowFullScreen 
            title={`${anime.title} Trailer`} 
          />
        </div>
      )}

      {recs.length > 0 && (
        <div className="mt-24 border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-bold mb-10 border-b border-indigo-500/50 pb-3 inline-block">
            If you liked {anime.title}, you'll love these:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {recs.map(rec => (
              <Link to={`/anime/${rec.entry?.mal_id}`} key={rec.entry?.mal_id} className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="overflow-hidden h-64">
                  <img src={rec.entry?.images?.jpg?.image_url} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt={rec.entry?.title} />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-center text-slate-300 group-hover:text-indigo-400 transition line-clamp-2">{rec.entry?.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <VaultModal 
        isOpen={isVaultModalOpen} 
        onClose={() => setIsVaultModalOpen(false)} 
        anime={anime} 
      />
    </div>
  );
}