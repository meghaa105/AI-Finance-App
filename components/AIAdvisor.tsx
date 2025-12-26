import React, { useState } from 'react';
import { Transaction, FinancialAnalysis, Budget, SavingsGoal, TransactionCategory } from '../types';
import { geminiService, UserProfile } from '../services/geminiService';

interface AIAdvisorProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
  onProfileUpdate: (p: UserProfile) => void;
}

type Mode = 'selection' | 'profiling' | 'portfolio' | 'audit' | 'category_audit';

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, budgets, goals, profile, onProfileUpdate }) => {
  const [mode, setMode] = useState<Mode>('selection');
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetCategory, setTargetCategory] = useState<TransactionCategory>(TransactionCategory.FOOD);
  const [rawText, setRawText] = useState('');

  const handleModeSelect = (newMode: Mode) => {
    setPendingMode(newMode);
    setMode('profiling');
  };

  const startAnalysis = async () => {
    setLoading(true);
    setMode(pendingMode || 'selection');
    try {
      let result = "";
      if (pendingMode === 'portfolio') {
        const contextStr = `Txs: ${transactions.length}, Budgets: ${budgets.length}, Goals: ${goals.length}`;
        result = await geminiService.analyzeRawData(`Audit my entire bag: ${JSON.stringify({transactions, budgets, goals})}`, profile);
      } else if (pendingMode === 'category_audit') {
        const filtered = transactions.filter(t => t.category === targetCategory);
        result = await geminiService.askFinanceQuestion(`Audit my **${targetCategory}** spending. Be real with me. Is it valid or an L?`, filtered, profile);
      } else if (pendingMode === 'audit') {
        result = await geminiService.analyzeRawData(rawText, profile);
      }
      setReport(result);
    } catch (e) {
      setReport("Total failure in the matrix. Try again.");
    }
    setLoading(false);
  };

  const parseMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-blue-400 font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderReportContent = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('###')) {
        return <h3 key={index} className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mt-10 mb-6 border-b border-white/5 pb-2">{parseMarkdown(trimmedLine.replace('###', ''))}</h3>;
      }
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        return <div key={index} className="flex gap-4 mb-3 items-start"><span className="w-1.5 h-1.5 mt-1.5 bg-blue-600 rounded-full shrink-0"></span><div className="text-slate-300 text-sm font-medium leading-relaxed">{parseMarkdown(trimmedLine.replace(/^[-*]+/, ''))}</div></div>;
      }
      return <p key={index} className="text-slate-400 text-sm leading-relaxed mb-4">{parseMarkdown(trimmedLine)}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden animate-in fade-in duration-1000">
      <header className="px-8 py-8 border-b border-white/5 bg-slate-950/60 backdrop-blur-3xl sticky top-0 z-[50]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl shadow-2xl">🧘</div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter">Wealth Sensei</h2>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mt-0.5">Zen Wealth Strategy</p>
            </div>
          </div>
          <button onClick={() => {setMode('selection'); setReport(null);}} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">Back to Temple</button>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {mode === 'selection' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              {[
                { id: 'portfolio', title: 'The Full Audit', desc: 'Savage pulse check on all your assets.', emoji: '📈', color: 'blue' },
                { id: 'category_audit', title: 'Category Heat', desc: 'Is your lifestyle inflation valid?', emoji: '🔥', color: 'indigo' },
                { id: 'audit', title: 'Text Forensic', desc: 'Dump raw data, get the truth.', emoji: '🧾', color: 'emerald' }
              ].map((card) => (
                <button 
                  key={card.id}
                  onClick={() => {
                    if (card.id === 'category_audit' || card.id === 'audit') handleModeSelect(card.id as Mode);
                    else handleModeSelect('portfolio');
                  }}
                  className="group p-10 bg-slate-900/40 border border-white/5 rounded-[3rem] text-left hover:border-blue-500/40 transition-all shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">{card.emoji}</div>
                  <div className="text-4xl mb-8">{card.emoji}</div>
                  <h3 className="text-xl font-black mb-3">{card.title}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{card.desc}</p>
                </button>
              ))}
            </div>
          )}

          {mode === 'profiling' && (
            <div className="max-w-xl mx-auto pt-10">
              <div className="bg-slate-900/60 border border-white/5 rounded-[3rem] p-12 space-y-10 shadow-2xl backdrop-blur-3xl">
                <h2 className="text-3xl font-black tracking-tighter">Strategic Intent 🎯</h2>
                
                {pendingMode === 'category_audit' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Target Sector</label>
                    <select value={targetCategory} onChange={(e) => setTargetCategory(e.target.value as TransactionCategory)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-500/50">
                      {Object.values(TransactionCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                )}

                {pendingMode === 'audit' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Raw Data Dump</label>
                    <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste statement text here..." className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-bold outline-none focus:border-blue-500/50" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Energy</label>
                    <select value={profile.riskAppetite} onChange={(e) => onProfileUpdate({...profile, riskAppetite: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none">
                      <option value="Conservative">Safe Bet</option>
                      <option value="Moderate">Balanced</option>
                      <option value="Aggressive">High Stakes</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Era</label>
                    <select value={profile.lifeStage} onChange={(e) => onProfileUpdate({...profile, lifeStage: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none">
                      <option value="Student">Learning</option>
                      <option value="Professional">Hustling</option>
                      <option value="Family">Settled</option>
                    </select>
                  </div>
                </div>

                <button onClick={startAnalysis} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Manifest Results</button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-slate-900/60 rounded-full flex items-center justify-center border-4 border-blue-500/20 border-t-blue-500 animate-spin mb-10"></div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Consulting the Oracle...</p>
            </div>
          )}

          {!loading && report && (
            <div className="max-w-4xl mx-auto bg-slate-900/40 border border-white/5 rounded-[4rem] p-16 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-10 duration-1000">
              <div className="prose prose-invert max-w-none">
                {renderReportContent(report)}
              </div>
              <div className="mt-16 flex gap-6">
                <button onClick={() => {navigator.clipboard.writeText(report); alert("Report Secured.");}} className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Save Wisdom</button>
                <button onClick={() => {setMode('selection'); setReport(null);}} className="flex-1 py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">New Quest</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIAdvisor;
