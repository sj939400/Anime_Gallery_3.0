import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Collection() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('anime_user');
  const [vaultItems, setVaultItems] = useState([]);
  const [collections, setCollections] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      navigate('/auth');
      return;
    }

    fetchVaultData();
  }, [userEmail, navigate]);

  const fetchVaultData = () => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/vault/${userEmail}`)
      .then(res => {
        const items = res.data;
        setVaultItems(items);
        
        const grouped = items.reduce((acc, item) => {
          const colName = item.collection_name || 'Favorites';
          if (!acc[colName]) acc[colName] = [];
          acc[colName].push(item);
          return acc;
        }, {});
        
        setCollections(grouped);
        
        const keys = Object.keys(grouped);
        if (keys.length > 0 && !activeTab) {
          setActiveTab(keys[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleRemove = async (animeId, collectionName) => {
    try {
      await axios.delete(`http://localhost:8000/api/vault/remove/${userEmail}/${collectionName}/${animeId}`);
      fetchVaultData(); 
    } catch (e) {
      alert("Error removing item.");
    }
  };

  if (!userEmail) return null;

  return (
    // FIX APPLIED HERE: Changed padding from 'p-10' to 'px-10 pt-28 pb-20' to clear the fixed Navbar
    <div className="px-10 pt-28 pb-20 min-h-screen bg-slate-950 text-white max-w-7xl mx-auto">
      
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent inline-block mb-4">
          Personal Vault
        </h1>
        <p className="text-slate-400 text-lg">Manage your custom collections and watchlists.</p>
      </div>

      {loading ? (
        <div className="text-indigo-400 animate-pulse text-xl font-medium">Decrypting Vault Data...</div>
      ) : vaultItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Vault is Empty</h2>
          <p className="text-slate-400 mb-8">Start exploring and save anime to custom collections!</p>
          <Link to="/" className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all">
            Discover Anime
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {Object.keys(collections).map(colName => (
              <button
                key={colName}
                onClick={() => setActiveTab(colName)}
                className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === colName 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {colName} <span className="ml-2 bg-black/30 px-2 py-0.5 rounded text-xs">{collections[colName].length}</span>
              </button>
            ))}
          </div>

          {activeTab && collections[activeTab] && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {collections[activeTab].map((item) => (
                <div key={item._id} className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:-translate-y-2 transition-all duration-300 shadow-lg">
                  <Link to={`/anime/${item.anime_id}`}>
                    <div className="h-72 overflow-hidden">
                      <img 
                        src={item.img_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="font-bold text-sm text-white line-clamp-2 mb-3 leading-tight">{item.title}</p>
                    <button 
                      onClick={() => handleRemove(item.anime_id, item.collection_name)}
                      className="w-full text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 py-2 rounded-lg transition-colors border border-red-400/20"
                    >
                      Remove from {activeTab}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}