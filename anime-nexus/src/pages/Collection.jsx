import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Removed useNavigate
import axios from 'axios';

export default function Collection() {
  const userEmail = localStorage.getItem('anime_user');
  const [vaultItems, setVaultItems] = useState([]);
  const [collections, setCollections] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If there is no user, just stop here. Do NOT auto-redirect anymore.
    if (!userEmail) {
      return;
    }
    fetchVaultData();
  }, [userEmail]);

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

  // ==========================================
  //        UNAUTHENTICATED LOCKED STATE
  // ==========================================
  if (!userEmail) {
    return (
      <div className="px-10 pt-32 pb-20 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl dark:shadow-none hover:-translate-y-2 transition-transform duration-500">
          <div className="text-7xl mb-6 drop-shadow-lg">🔒</div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
            Vault Locked
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium text-lg leading-relaxed">
            You must register or sign in before using the Vault feature to save your personal collections.
          </p>
          <Link 
            to="/auth" 
            className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.99] text-lg uppercase tracking-wider"
          >
            Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  //        AUTHENTICATED VAULT STATE
  // ==========================================
  return (
    <div className="px-10 pt-28 pb-20 min-h-screen max-w-7xl mx-auto transition-colors duration-300">
      
      <div className="mb-12">
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent inline-block mb-4 uppercase tracking-tight">
          Personal Vault
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Manage your custom collections and watchlists.</p>
      </div>

      {loading ? (
        <div className="text-indigo-600 dark:text-indigo-400 animate-pulse text-xl font-bold">Decrypting Vault Data...</div>
      ) : vaultItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-xl dark:shadow-none">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Vault is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Start exploring and save items to custom collections!</p>
          <Link to="/" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all inline-block">
            Discover Material
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {Object.keys(collections).map(colName => (
              <button
                key={colName}
                onClick={() => setActiveTab(colName)}
                className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-300 border ${
                  activeTab === colName 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800'
                }`}
              >
                {colName} <span className="ml-2 bg-slate-100 dark:bg-black/30 px-2 py-0.5 rounded text-xs text-slate-600 dark:text-slate-400">{collections[colName].length}</span>
              </button>
            ))}
          </div>

          {activeTab && collections[activeTab] && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {collections[activeTab].map((item) => (
                <div key={item._id} className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:-translate-y-2 transition-all duration-300 shadow-md dark:shadow-none hover:shadow-xl">
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
                    <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-3 leading-tight">{item.title}</p>
                    <button 
                      onClick={() => handleRemove(item.anime_id, item.collection_name)}
                      className="w-full text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-400/10 hover:bg-red-600 hover:text-white dark:hover:bg-red-400/20 py-2 rounded-lg transition-colors border border-red-200 dark:border-red-400/20"
                    >
                      Remove
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