import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VaultModal({ isOpen, onClose, anime }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('Favorites');
  const [newCollection, setNewCollection] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [status, setStatus] = useState('');

  const userEmail = localStorage.getItem('anime_user');

  useEffect(() => {
    if (isOpen && userEmail) {
      axios.get(`http://localhost:8000/api/vault/collections/${userEmail}`)
        .then(res => {
          if (res.data.length > 0) {
            setCollections(res.data);
            setSelectedCollection(res.data[0]);
          } else {
            setCollections(['Favorites', 'Watchlist']); // Defaults
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!userEmail) return alert("Please sign in first!");
    setStatus('Saving...');
    
    const finalCollection = isCreatingNew && newCollection ? newCollection : selectedCollection;

    try {
      await axios.post('http://localhost:8000/api/vault/add', {
        user_email: userEmail,
        anime_id: anime.mal_id,
        title: anime.title,
        img_url: anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url,
        collection_name: finalCollection
      });
      setStatus('Saved successfully!');
      setTimeout(() => {
        setStatus('');
        onClose();
      }, 1500);
    } catch (e) {
      setStatus(e.response?.data?.detail || "Error saving to Vault.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-5 text-slate-400 hover:text-white font-bold text-xl">&times;</button>
        
        <h2 className="text-2xl font-bold text-white mb-2">Save to Vault</h2>
        <p className="text-indigo-400 font-medium mb-6 line-clamp-1">{anime.title}</p>

        {isCreatingNew ? (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Collection Name</label>
            <input 
              type="text" 
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              placeholder="e.g., Action Binge"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <button onClick={() => setIsCreatingNew(false)} className="text-xs text-slate-500 mt-2 hover:text-white">Cancel</button>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Collection</label>
            <select 
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {collections.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setIsCreatingNew(true)} className="text-xs text-indigo-400 mt-2 hover:text-indigo-300 font-bold">+ Create New Collection</button>
          </div>
        )}

        <button 
          onClick={handleSave} 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          {status || 'Save Anime'}
        </button>
      </div>
    </div>
  );
}