
import React, { useState, useEffect, useRef } from 'react';
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
  
  // Category Deep-Dive State
  const [targetCategory, setTargetCategory] = useState<TransactionCategory>(TransactionCategory.FOOD);
  const [timeRange, setTimeRange] = useState<number>(3); // months

  // Forensic Audit State
  const [rawText, setRawText] = useState('');

  const handleModeSelect = (newMode: Mode) => {
    setPendingMode(newMode);
    setMode('profiling');
  };

  const startAnalysis = async () => {
    if (pendingMode === 'portfolio') {
      await runPortfolioIntelligence();
    } else if (pendingMode === 'audit') {
      await runForensicAudit();
    } else if (pendingMode === 'category_audit') {
      await runCategoryAudit();
    }
  };

  const runPortfolioIntelligence = async () => {
    setLoading(true);
    setMode('portfolio');
    try {
      const contextStr = `
        Transactions: ${JSON.stringify(transactions)}
        Budgets: ${JSON.stringify(budgets)}
        Goals: ${JSON.stringify(goals)}
      `;
      const result = await geminiService.analyzeRawData(contextStr, profile);
      setReport(result);
    } catch (e) {
      setReport("Failed to generate portfolio intelligence.");
    }
    setLoading(false);
  };

  const runCategoryAudit = async () => {
    setLoading(true);
    setMode('category_audit');
    
    const thresholdDate = new Date();
    thresholdDate.setMonth(thresholdDate.getMonth() - timeRange);
    const thresholdStr = thresholdDate.toISOString().split('T')[0];

    const filteredTransactions = transactions.filter(t => 
      t.category === targetCategory && t.date >= thresholdStr
    );

    const prompt = `Analyze my spending patterns for the category "**${targetCategory}**" over the last **${timeRange} months**. 
    
    Specific Data Points:
    - Target Category: ${targetCategory}
    - Analysis Window: Last ${timeRange} months (since ${thresholdStr})
    - Transactions Count: ${filteredTransactions.length}
    - Total Data Context: ${JSON.stringify(filteredTransactions)}

    Please provide:
    1. A trend analysis.
    2. Specific "Merchant Clusters".
    3. An "Efficiency Audit".
    4. 2 Actionable strategies to reduce outflow by 15%.`;

    try {
      const result = await geminiService.askFinanceQuestion(prompt, { transactions: filteredTransactions, budgets, goals }, profile);
      setReport(result);
    } catch (e) {
      setReport("Failed to generate category audit.");
    }
    setLoading(false);
  };

  const runForensicAudit = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setMode('audit');
    const result = await geminiService.analyzeRawData(rawText, profile);
    setReport(result);
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

  const renderReportContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[][] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('###')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mt-12 mb-6 pb-2 border-b border-slate-800/60">
            {parseMarkdown(trimmedLine.replace('###', '').trim())}
          </h3>
        );
      } else if (trimmedLine.startsWith('|') || (trimmedLine.includes('|') && trimmedLine.split('|').length > 2)) {
        if (trimmedLine.match(/^[|\s:-]+$/)) return;
        const cells = trimmedLine.split('|').filter((_, i, arr) => {
           if (i === 0 && trimmedLine.startsWith('|')) return false;
           if (i === arr.length - 1 && trimmedLine.endsWith('|')) return false;
           return true;
        }).map(c => c.trim());
        if (cells.length > 0) currentTable.push(cells);
      } else if (trimmedLine === '' && currentTable.length > 0) {
        const table = [...currentTable];
        currentTable = [];
        elements.push(
          <div key={`table-wrapper-${index}`} className="my-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80">
                  {table[0].map((cell, i) => (
                    <th key={`th-${i}`} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800">{parseMarkdown(cell)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {table.slice(1).map((row, ri) => (
                  <tr key={`tr-${ri}`} className="hover:bg-slate-800/20 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={`td-${ci}`} className="px-6 py-4 text-sm font-medium text-slate-300">
                        {cell.includes('₹') ? <span className="font-bold text-emerald-400">{parseMarkdown(cell)}</span> : parseMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else if (trimmedLine.startsWith('>')) {
        elements.push(
          <blockquote key={`bq-${index}`} className="my-8 pl-8 pr-10 py-6 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-3xl italic text-blue-200">
            {parseMarkdown(trimmedLine.replace('>', '').trim())}
          </blockquote>
        );
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const content = trimmedLine.replace(/^[-*]+/, '').trim();
        if (!content || content === '--') return;
        elements.push(
          <div key={`li-${index}`} className="flex gap-4 mb-4 items-start group">
            <span className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full shrink-0 group-hover:scale-125 transition-transform"></span>
            <div className="text-slate-300 text-sm font-medium leading-relaxed">{parseMarkdown(content)}</div>
          </div>
        );
      } else if (trimmedLine !== '') {
        elements.push(<p key={`p-${index}`} className="text-slate-400 text-sm leading-relaxed mb-4">{parseMarkdown(trimmedLine)}</p>);
      }
    });
    return elements;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
      <header className="relative z-50 px-8 py-8 border-b border-slate-800/40 bg-slate-950/60 backdrop-blur-3xl sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setMode('selection'); setReport(null); setPendingMode(null); }}
              className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-3xl shadow-2xl hover:scale-105 transition-all"
            >
              ✨
            </button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                Bharat AI Advisor
                <span className="text-[10px] font-black px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md uppercase tracking-[0.2em]">{mode}</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={() => { setMode('selection'); setReport(null); setPendingMode(null); }}
            className="px-5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            Hub
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          {mode === 'selection' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              <button onClick={() => handleModeSelect('portfolio')} className="group p-8 bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] text-left hover:border-blue-500/40 transition-all">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-black mb-2">Portfolio Pulse</h3>
                <p className="text-slate-500 text-xs">Full audit of live assets.</p>
              </button>

              <div className="group p-8 bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] flex flex-col hover:border-indigo-500/40 transition-all">
                <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-xl font-black mb-2">Category Deep-Dive</h3>
                <select value={targetCategory} onChange={(e) => setTargetCategory(e.target.value as TransactionCategory)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] mb-4 outline-none">
                  {Object.values(TransactionCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button onClick={() => handleModeSelect('category_audit')} className="mt-auto py-3 bg-indigo-600/20 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest">Execute</button>
              </div>

              <div className="group p-8 bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] flex flex-col hover:border-amber-500/40 transition-all">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h3 className="text-xl font-black mb-2">Forensic Import</h3>
                <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste statement..." className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-[9px] mb-4 outline-none text-slate-400" />
                <button onClick={() => handleModeSelect('audit')} disabled={!rawText.trim()} className="mt-auto py-3 bg-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest">Scan</button>
              </div>
            </div>
          )}

          {mode === 'profiling' && (
            <div className="max-w-xl mx-auto pt-10">
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-[3rem] p-10 space-y-8">
                <h2 className="text-2xl font-black">Strategic Context</h2>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Goal</label>
                  <input type="text" value={profile.goal} onChange={(e) => onProfileUpdate({...profile, goal: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk</label>
                      <select value={profile.riskAppetite} onChange={(e) => onProfileUpdate({...profile, riskAppetite: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm">
                        <option value="Conservative">Conservative</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</label>
                      <select value={profile.lifeStage} onChange={(e) => onProfileUpdate({...profile, lifeStage: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm">
                        <option value="Student">Student</option>
                        <option value="Working Professional">Professional</option>
                        <option value="Family">Family</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={startAnalysis} className="w-full py-4 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Generate Strategy</button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Running Simulation</p>
            </div>
          )}

          {!loading && report && (
            <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
              {renderReportContent(report)}
              <div className="mt-12 flex gap-4">
                <button onClick={() => { navigator.clipboard.writeText(report); alert("Copied"); }} className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest">Copy Report</button>
                <button onClick={() => setMode('selection')} className="flex-1 py-4 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest">Return to Hub</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIAdvisor;
