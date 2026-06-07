import { useState } from 'react';
import axios from 'axios';

export default function AIRecommender() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/ai/recommend', { prompt });
      setResponse(res.data.recommendation);
    } catch (error) {
      setResponse("Failed to reach the AI. Make sure your backend is running!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-indigo-400">AI Anime Matchmaker</h2>
        <p className="text-gray-400 mb-6">Describe your mood, favorite tropes, or a show you loved.</p>

        <form onSubmit={askAI} className="flex gap-4 mb-6">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. I want a dark fantasy with a smart protagonist..." 
            className="flex-1 p-3 rounded bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded font-bold transition disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {response && (
          <div className="p-4 bg-gray-700 rounded border border-gray-600 whitespace-pre-wrap">
            {response}
          </div>
        )}
      </div>
    </div>
  );
}