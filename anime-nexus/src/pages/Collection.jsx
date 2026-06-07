import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Collection() {
  const navigate = useNavigate();
  const isAuth = localStorage.getItem('anime_user');

  useEffect(() => {
    if (!isAuth) {
      navigate('/auth');
    }
  }, [isAuth, navigate]);

  if (!isAuth) return null;

  return (
    <div className="p-10 min-h-screen bg-slate-900 text-white">
      <h1 className="text-4xl font-bold border-b border-indigo-500 pb-2 inline-block">Your Personal Vault</h1>
      <p className="mt-6 text-slate-300">Welcome back, {isAuth}. Your saved collection will appear here.</p>
    </div>
  );
}