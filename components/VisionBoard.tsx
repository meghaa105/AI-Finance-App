
import React, { useState, useEffect } from 'react';
import { geminiService, ImageSize } from '../services/geminiService';

const VisionBoard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{url: string, prompt: string}[]>(() => {
    const saved = localStorage.getItem('finvue_vision_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('finvue_vision_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const url = await geminiService.generateGoalVisual(prompt, size);
    if (url) {
      setHistory(prev => [{ url, prompt }, ...prev]);
    } else {
      alert("Failed to synthesize your vision. Ensure you have selected a valid paid API key.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Manifest Your Wealth 🔮</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI Visualization Core // Powered by Nano Banana Pro</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <span className="text-6xl">✨</span>
            </div>
            
            <h3 className="text-lg font-black text-white mb-6">Prompt Your Future</h3>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A sleek glass penthouse in Mumbai overlooking the Arabian sea at twilight..."
              className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-slate-300 outline-none focus:border-blue-500/50 transition-all mb-6 placeholder:text-slate-600"
            />
            
            <div className="space-y-4 mb-8">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synthesis Fidelity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${size === s ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Synthesizing...' : 'Generate Vision'}
            </button>
          </div>

          <div className="p-8 border border-white/5 rounded-[2.5rem] bg-slate-900/20">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Pro Tip</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
              "Visualization is 50% of the hustle. See it, save for it, secure it."
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && (
              <div className="aspect-video bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Generating 8K Reality...</p>
              </div>
            )}
            {history.map((item, i) => (
              <div key={i} className="group relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl hover:border-blue-500/40 transition-all">
                <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                   <p className="text-xs font-bold text-white line-clamp-2">{item.prompt}</p>
                   <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = item.url;
                      link.download = `vision-${i}.png`;
                      link.click();
                    }}
                    className="mt-4 w-fit px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all"
                   >
                     Download 4K
                   </button>
                </div>
              </div>
            ))}
            {history.length === 0 && !loading && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                <span className="text-6xl">🏞️</span>
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Your vision board is empty.<br/>Start manifesting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionBoard;
