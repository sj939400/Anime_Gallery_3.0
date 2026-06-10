import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProfileModal({ isOpen, onClose }) {
  const userEmail = localStorage.getItem('anime_user');
  
  const [formData, setFormData] = useState({ username: '', phone: '', bio: '', location: '', profile_pic: '' });
  const [vaultCount, setVaultCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');

  const displayInitial = formData.username 
    ? formData.username.charAt(0).toUpperCase() 
    : (userEmail ? userEmail.charAt(0).toUpperCase() : '?');

  useEffect(() => {
    if (isOpen && userEmail) {
      setLoading(true);
      
      Promise.all([
        axios.get(`http://localhost:8000/api/user/${userEmail}`),
        axios.get(`http://localhost:8000/api/vault/${userEmail}`)
      ])
      .then(([userRes, vaultRes]) => {
        setFormData({
          username: userRes.data.username || '',
          phone: userRes.data.phone || '',
          bio: userRes.data.bio || '',
          location: userRes.data.location || '',
          profile_pic: userRes.data.profile_pic || ''
        });
        setVaultCount(vaultRes.data.length);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setStatus("Error loading profile data");
        setLoading(false);
      });
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'phone') {
      if (value && value.replace(/\D/g, '').length !== 10) {
        setPhoneWarning('Phone number must be exactly 10 digits');
      } else {
        setPhoneWarning('');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.phone && formData.phone.replace(/\D/g, '').length !== 10) {
      setStatus("Please fix your phone number before saving.");
      return;
    }

    setStatus('Saving...');
    try {
      await axios.put(`http://localhost:8000/api/user/${userEmail}`, formData);
      setStatus('Profile updated successfully!');
      window.dispatchEvent(new Event('profileUpdated'));
      
      setTimeout(() => {
        setStatus('');
        onClose();
      }, 1500);
    } catch (e) {
      setStatus(e.response?.data?.detail || "Error updating profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-6 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-2xl transition-colors">&times;</button>
        
        <div className="text-center mb-6">
          {/* Avatar Rendering: Image if URL exists, else Initial */}
          <div className="mx-auto w-24 h-24 mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 border-2 border-indigo-400/20 overflow-hidden">
            {formData.profile_pic ? (
              <img src={formData.profile_pic} alt="Profile" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
            ) : (
              <span className="text-4xl font-bold text-white">{displayInitial}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{userEmail}</p>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">📁 Vault Size:</span>
            <span className="text-slate-900 dark:text-white font-bold">{vaultCount} items saved</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-indigo-600 dark:text-indigo-400 animate-pulse py-10">Accessing secure records...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Profile Picture URL Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Profile Picture (Image URL)</label>
              <input 
                type="text" name="profile_pic" value={formData.profile_pic} onChange={handleInputChange} placeholder="https://example.com/my-avatar.jpg"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Nickname"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location</label>
                <input 
                  type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, Country"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* About Yourself (Bio) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">About Yourself</label>
              <textarea 
                name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about your favorite anime..." rows="3"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit mobile number"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              {phoneWarning && <p className="text-xs text-pink-600 dark:text-pink-400 font-medium mt-1 animate-pulse">⚠️ {phoneWarning}</p>}
            </div>

            {status && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center border ${status.includes('success') ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30'}`}>
                {status}
              </div>
            )}

            <button type="submit" className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-[0.99]">
              Save Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
}