import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:8000/api/login' : 'http://localhost:8000/api/register';
    const payload = { email, password, phone };

    try {
      await axios.post(url, payload);
      localStorage.setItem('anime_user', email);
      alert(isLogin ? "Welcome back!" : "Account created!");
      navigate('/collection');
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white">
        <h2 className="text-4xl font-extrabold mb-8 text-center">{isLogin ? "Sign In" : "Register"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" required className="p-4 bg-slate-900 rounded-xl" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="p-4 bg-slate-900 rounded-xl" onChange={e => setPassword(e.target.value)} />
          {!isLogin && <input type="number" placeholder="10-digit Phone" required className="p-4 bg-slate-900 rounded-xl" onChange={e => setPhone(e.target.value)} />}
          <button className="w-full py-4 bg-indigo-600 rounded-xl font-bold">{isLogin ? "Sign In" : "Register"}</button>
        </form>
        <p className="mt-6 text-center cursor-pointer text-slate-400" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </p>
      </div>
    </div>
  );
}