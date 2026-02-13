import React, { useState } from 'react';
import { Transaction, FinancialAnalysis, Budget, SavingsGoal, TransactionCategory } from '../types';
import { geminiService, UserProfile } from '../services/geminiService';
import PixelIcon from './PixelIcon';

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
        result = await geminiService.analyzeRawData(`Audit my entire bag. I have ${transactions.length} transactions, ${budgets.length} budgets, and active side quests: ${goals.map(g => g.name).join(', ')}. Details: ${JSON.stringify({transactions, budgets, goals})}`, profile);
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
        return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderTable = (rows: string[], key: number) => {
    const tableData = rows.map(r => r.split('|').map(cell => cell.trim()).filter(Boolean));
    const header = tableData[0];
    const body = tableData.slice(1).filter(r => !r.every(c => c.includes('---')));

    return (
      <div key={key} className="my-8 overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                {header.map((h, i) => (
                  <th key={i} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {body.map((row, ri) => (
                <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                  {row.map((cell, ci) => {
                    const isUsage = header[ci]?.toLowerCase().includes('usage') || cell.includes('%');
                    const isPositive = cell.includes('✅') || (isUsage && parseInt(cell) < 80);
                    const isNegative = cell.includes('❌') || (isUsage && parseInt(cell) > 100) || cell.includes('Sus');
                    
                    return (
                      <td key={ci} className={`px-6 py-4 text-xs font-bold ${isUsage ? 'tabular-nums' : ''} ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'}`}>
                        {parseMarkdown(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReportContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTableRows: string[] = [];

    const flushTable = () => {
      if (currentTableRows.length > 0) {
        elements.push(renderTable(currentTableRows, elements.length));
        currentTableRows = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('|')) {
        currentTableRows.push(trimmedLine);
        return;
      } else {
        flushTable();
      }

      if (!trimmedLine) return;

      // Special handling for the Quest Reality Check section
      if (trimmedLine.toUpperCase().includes('QUEST_REALITY_CHECK') || trimmedLine.includes('Side Quests')) {
        elements.push(
          <div key={index} className="my-10 p-8 bg-blue-600/5 border-2 border-blue-500/20 rounded-[3rem] relative overflow-hidden group shadow-[0_0_50px_rgba(37,99,235,0.1)]">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <PixelIcon type="quest" size={64} className="text-blue-500" />
            </div>
            <h3 className="text-blue-400 font-black text-sm uppercase tracking-[0.5em] mb-6 flex items-center gap-4">
              <PixelIcon type="sparkle" size={20} className="animate-pulse" />
              {parseMarkdown(trimmedLine.replace(/^#+\s*/, ''))}
            </h3>
          </div>
        );
        return;
      }

      // Detect Summary Stat Cards (Total In, Total Out, Surplus)
      const statMatch = trimmedLine.match(/^(Total In|Total Out|Surplus).*?:\s*\*\*(.*?)\*\*(.*)/i);
      if (statMatch) {
        const label = statMatch[1];
        const value = statMatch[2];
        const extra = statMatch[3];
        const isSurplus = label.toLowerCase().includes('surplus');
        const isOut = label.toLowerCase().includes('out');

        elements.push(
          <div key={index} className={`my-4 p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${
            isSurplus ? 'bg-emerald-500/5 border-emerald-500/10' : 
            isOut ? 'bg-rose-500/5 border-rose-500/10' : 'bg-slate-900/40 border-white/5'
          }`}>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
              <span className={`text-2xl font-black italic tracking-tighter ${
                isSurplus ? 'text-emerald-400' : isOut ? 'text-rose-400' : 'text-white'
              }`}>{value}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 italic max-w-[200px] text-right">{parseMarkdown(extra)}</p>
          </div>
        );
        return;
      }

      if (trimmedLine.startsWith('###')) {
        const isAnomalies = trimmedLine.toUpperCase().includes('ANOMALIES') || trimmedLine.includes('L" MOVES');
        elements.push(
          <h3 key={index} className={`font-black text-[10px] uppercase tracking-[0.5em] mt-12 mb-8 border-b pb-4 transition-colors ${
            isAnomalies ? 'text-rose-500 border-rose-500/20' : 'text-blue-500 border-white/5'
          }`}>
            {parseMarkdown(trimmedLine.replace('###', ''))}
          </h3>
        );
        return;
      }

      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        elements.push(
          <div key={index} className="flex gap-4 mb-4 items-start group">
            <span className="w-1.5 h-1.5 mt-2 bg-blue-600 rounded-full shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
            <div className="text-slate-300 text-sm font-medium leading-relaxed group-hover:text-slate-100 transition-colors">
              {parseMarkdown(trimmedLine.replace(/^[-*]+\s*/, ''))}
            </div>
          </div>
        );
        return;
      }

      elements.push(
        <p key={index} className="text-slate-400 text-sm leading-relaxed mb-6 last:mb-0">
          {parseMarkdown(trimmedLine)}
        </p>
      );
    });

    flushTable();
    return elements;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden animate-in fade-in duration-1000">
      <header className="px-8 py-8 border-b border-white/5 bg-slate-950/60 backdrop-blur-3xl sticky top-0 z-[50]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <PixelIcon type="sensei" size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter italic uppercase">{profile.name || 'Wealth'} Sensei</h2>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mt-0.5">Zen Strategy Audit</p>
            </div>
          </div>
          <button onClick={() => {setMode('selection'); setReport(null);}} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">Back to Temple</button>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.03)_0%,_transparent_100%)]">
        <div className="max-w-6xl mx-auto">
          {mode === 'selection' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              {[
                { id: 'portfolio', title: 'High-Fidelity Audit', desc: 'Savage pulse check on all your assets.', type: 'chart' as const, color: 'blue' },
                { id: 'category_audit', title: 'Category Heat', desc: 'Is your lifestyle inflation valid?', type: 'sparkle' as const, color: 'indigo' },
                { id: 'audit', title: 'Statement Forensic', desc: 'Dump raw data, get the truth.', type: 'ledger' as const, color: 'emerald' }
              ].map((card) => (
                <button 
                  key={card.id}
                  onClick={() => {
                    if (card.id === 'category_audit' || card.id === 'audit') handleModeSelect(card.id as Mode);
                    else handleModeSelect('portfolio');
                  }}
                  className="group p-10 bg-slate-900/40 border border-white/5 rounded-[3rem] text-left hover:border-blue-500/40 transition-all shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <PixelIcon type={card.type} size={128} className="text-white" />
                  </div>
                  <div className="mb-8">
                    <PixelIcon type={card.type} size={48} className={`text-${card.color}-500`} />
                  </div>
                  <h3 className="text-xl font-black mb-3">{card.title}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{card.desc}</p>
                </button>
              ))}
            </div>
          )}

          {mode === 'profiling' && (
            <div className="max-w-xl mx-auto pt-10">
              <div className="bg-slate-900/60 border border-white/5 rounded-[3rem] p-12 space-y-10 shadow-2xl backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black tracking-tighter">Strategic Intent</h2>
                  <PixelIcon type="trophy" size={24} className="text-amber-500" />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Holder Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => onProfileUpdate({...profile, name: e.target.value})} 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                  />
                </div>

                {pendingMode === 'category_audit' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Sector</label>
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
              <div className="w-20 h-20 bg-slate-900/60 rounded-full flex items-center justify-center border-4 border-blue-500/20 border-t-blue-500 animate-spin mb-10">
                <PixelIcon type="sensei" size={32} className="text-blue-500" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Consulting the Oracle...</p>
            </div>
          )}

          {!loading && report && (
            <div className="max-w-4xl mx-auto bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 lg:p-20 shadow-2xl backdrop-blur-3xl animate-in slide-in-bottom-10 duration-1000 relative">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <PixelIcon type="sensei" size={300} className="text-white" />
               </div>
              <div className="relative z-10">
                {renderReportContent(report)}
              </div>
              <div className="mt-20 flex flex-col md:flex-row gap-6 relative z-10">
                <button onClick={() => {navigator.clipboard.writeText(report); alert("Report Secured.");}} className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Export Wisdom</button>
                <button onClick={() => {setMode('selection'); setReport(null);}} className="flex-1 py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">Start New Quest</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIAdvisor;