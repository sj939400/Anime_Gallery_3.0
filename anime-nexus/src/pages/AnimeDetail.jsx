import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function AnimeDetail() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`https://api.jikan.moe/v4/anime/${id}/full`),
      axios.get(`https://api.jikan.moe/v4/anime/${id}/recommendations`)
    ])
    .then(([res1, res2]) => {
      setAnime(res1.data.data);
      setRecs(res2.data.data.slice(0, 5));
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [id]);

  const addToVault = async () => {
    const userEmail = localStorage.getItem('anime_user');
    if (!userEmail) return alert("Please sign in first!");
    
    try {
      await axios.post('http://localhost:8000/api/vault/add', {
        user_email: userEmail,
        anime_id: anime.mal_id,
        title: anime.title,
        img_url: anime.images.jpg.image_url
      });
      alert("Successfully added to your personal Vault!");
    } catch (e) {
      alert(e.response?.data?.detail || "Error saving to Vault.");
    }
  };

  const getCrunchyrollLink = () => {
    if (!anime?.streaming) return null;
    const cr = anime.streaming.find(s => s.name.toLowerCase().includes("crunchyroll"));
    return cr ? cr.url : (anime.streaming[0]?.url || null);
  };

  if (loading) return <div className="text-white p-20 text-center text-xl">Loading your anime data...</div>;

  return (
    <div className="p-10 bg-slate-900 min-h-screen text-white max-w-6xl mx-auto">
      <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        {anime.title}
      </h1>
      
      <div className="grid md:grid-cols-3 gap-10">
        <img src={anime.images.jpg.large_image_url} className="rounded-3xl w-full shadow-2xl shadow-indigo-500/20" />
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres.map(g => (
              <span key={g.mal_id} className="bg-slate-800 border border-indigo-500/30 px-4 py-1.5 rounded-full text-sm font-medium text-indigo-300">
                {g.name}
              </span>
            ))}
          </div>
          <p className="text-slate-300 mb-8 text-lg leading-relaxed">{anime.synopsis}</p>
          
          <div className="flex gap-4">
            <button onClick={addToVault} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-full font-bold shadow-lg shadow-indigo-500/30 transition">
              + Add to Vault
            </button>
            {getCrunchyrollLink() && (
              <a href={getCrunchyrollLink()} target="_blank" rel="noreferrer" className="bg-orange-600 hover:bg-orange-500 px-8 py-4 rounded-full font-bold transition">
                Watch on Crunchyroll
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Section with Underline */}
      {anime.trailer?.embed_url && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6 border-b border-indigo-500/50 pb-2 inline-block">Official Trailer</h2>
          <iframe src={anime.trailer.embed_url} className="w-full h-[500px] rounded-3xl" allowFullScreen />
        </div>
      )}

      {/* Recommendations Section with Underline */}
      <div className="mt-20 border-t border-slate-800 pt-12">
        <h2 className="text-3xl font-bold mb-8 border-b border-indigo-500/50 pb-2 inline-block">
          If you liked {anime.title}, you'll love these:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {recs.map(rec => (
            <Link to={`/anime/${rec.entry.mal_id}`} key={rec.entry.mal_id} className="group">
              <img src={rec.entry.images.jpg.image_url} className="rounded-2xl h-60 w-full object-cover transition group-hover:scale-105" />
              <p className="mt-3 font-semibold text-center group-hover:text-indigo-400 transition">{rec.entry.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}