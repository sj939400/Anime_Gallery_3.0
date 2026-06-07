import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function MangaDetail() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    axios.get(`https://api.jikan.moe/v4/manga/${id}`)
    .then(response => {
      setManga(response.data.data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error fetching manga data:", error);
      setLoading(false);
    });
  }, [id]); 

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="text-2xl font-bold animate-pulse text-emerald-400">Unearthing Tomes...</div>
    </div>
  );
  
  if (!manga) return <div className="text-center p-20 text-red-500">Manga data not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 mt-6 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 mb-10">
      <Link to="/manga" className="text-emerald-400 hover:text-emerald-300 mb-8 inline-flex items-center gap-2 font-bold transition group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Manga
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/3 shrink-0">
          <img 
            src={manga.images.jpg.large_image_url} 
            alt={manga.title} 
            className="w-full rounded-2xl shadow-2xl shadow-black/50 border border-slate-600 object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-white leading-tight">
            {manga.title}
          </h1>
          {manga.title_english && (
            <h2 className="text-xl text-slate-400 mb-6 font-semibold">{manga.title_english}</h2>
          )}
          
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-inner">
              ⭐ {manga.score || 'N/A'} Score
            </span>
            <span className="bg-slate-700/50 text-slate-300 border border-slate-600 px-4 py-1.5 rounded-full text-sm font-medium">
              {manga.status}
            </span>
            <span className="bg-slate-700/50 text-slate-300 border border-slate-600 px-4 py-1.5 rounded-full text-sm font-medium">
              {manga.chapters ? `${manga.chapters} Chapters` : 'Ongoing Chapters'}
            </span>
            <span className="bg-slate-700/50 text-slate-300 border border-slate-600 px-4 py-1.5 rounded-full text-sm font-medium">
              {manga.volumes ? `${manga.volumes} Volumes` : 'Ongoing Volumes'}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed mb-8 whitespace-pre-line text-lg font-light">
            {manga.synopsis}
          </p>
        </div>
      </div>
    </div>
  );
}