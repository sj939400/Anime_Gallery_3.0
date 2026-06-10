import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 
  const [userInitial, setUserInitial] = useState('?');
  const [profilePic, setProfilePic] = useState(''); // Added profile pic state
  
  const isAuth = localStorage.getItem('anime_user');

  const fetchUserData = () => {
    if (isAuth) {
      axios.get(`http://localhost:8000/api/user/${isAuth}`)
        .then(res => {
          const nameToUse = res.data.username || isAuth;
          setUserInitial(nameToUse.charAt(0).toUpperCase());
          setProfilePic(res.data.profile_pic || ''); // Set the image URL
        })
        .catch(() => {
          setUserInitial(isAuth.charAt(0).toUpperCase());
        });
    }
  };

  useEffect(() => {
    fetchUserData();
    window.addEventListener('profileUpdated', fetchUserData);
    return () => window.removeEventListener('profileUpdated', fetchUserData);
  }, [isAuth]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.removeItem('anime_user');
    window.location.href = '/'; 
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Link to="/" className="text-3xl font-bold tracking-tight shrink-0 ml-4">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AnimeNexus
          </span>
        </Link>
        
        <div className="hidden md:flex gap-6 items-center font-semibold text-slate-300 text-sm tracking-wide shrink-0 mr-4">
          <Link to="/categories" className="hover:text-indigo-400 transition">Categories</Link>
          <Link to="/manga" className="hover:text-indigo-400 transition">Manga</Link>
          <Link to="/characters" className="hover:text-indigo-400 transition">Characters</Link>
          <Link to="/collection" className="hover:text-indigo-400 transition">Vault</Link>
          
          {isAuth ? (
            <div className="flex items-center gap-3 ml-2 border-l border-slate-700 pl-4">
               <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 border border-indigo-400/20 hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                  title="View Profile"
               >
                  {/* Show Profile Image if exists, else show initial */}
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    userInitial
                  )}
               </button>
               <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 transition uppercase tracking-wider font-bold">Log Out</button>
            </div>
          ) : (
            <Link to="/auth" className="ml-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}