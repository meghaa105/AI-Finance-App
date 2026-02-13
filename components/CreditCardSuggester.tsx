
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionCategory } from '../types';
import { geminiService, UserProfile, CardSuggestion } from '../services/geminiService';
import PixelIcon from './PixelIcon';

interface CreditCardSuggesterProps {
  transactions: Transaction[];
  profile: UserProfile;
}

const CreditCardSuggester: React.FC<CreditCardSuggesterProps> = ({ transactions, profile }) => {
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const spendAnalysis = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [transactions]);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const cards = await geminiService.suggestCreditCards(transactions, profile);
      setSuggestions(cards);
    } catch (error) {
      console.error("Card Lab Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">CARD_LAB 💳</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 text-[10px]">Reward Yield Optimization</p>
        </div>
        <button 
          onClick={handleSuggest}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'RUNNING_SIMULATION...' : 'OPTIMIZE_STRATEGY'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Spend Density Audit</h3>
            <div className="space-y-6">
              {spendAnalysis.map(([cat, amount]) => (
                <div key={cat} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{cat}</span>
                    <span className="text-xs font-black text-blue-400">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full group-hover:bg-blue-400 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (amount / transactions.reduce((s,t) => s + t.amount, 0)) * 500)}%` }} 
                    />
                  </div>
                </div>
              ))}
              {spendAnalysis.length === 0 && (
                <p className="text-center text-[10px] text-slate-600 py-10 uppercase font-black">Waiting for transaction data...</p>
              )}
            </div>
          </div>

          <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem]">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 italic">Sensei's Logic</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-bold italic uppercase tracking-wider">
              "Most people use standard debit cards and leave 5% margin on the table. In the Card Lab, we secure the yield before the spend happens."
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.length > 0 ? suggestions.map((card, i) => (
            <div 
              key={i} 
              className="group relative bg-slate-900/60 border border-white/5 rounded-[3rem] p-8 hover:border-blue-500/40 transition-all shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <PixelIcon type="card" size={120} className="text-white" />
              </div>

              <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 inline-block">{card.bank}</span>
                    <h3 className="text-xl font-black text-white tracking-tight">{card.cardName}</h3>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                    card.tier === 'Premium' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 
                    card.tier === 'Mid' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' : 
                    'bg-slate-500/20 text-slate-500 border border-slate-500/20'
                  }`}>
                    {card.tier}_TIER
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Reward Rate</span>
                    <p className="text-xs font-black text-emerald-400">{card.rewardRate}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Annual Fee</span>
                    <p className="text-xs font-black text-white">₹{card.annualFee}</p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-8 uppercase tracking-wide">
                  {card.whyThisCard}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Est. Monthly Gain</span>
                  <span className="text-lg font-black text-white">₹{card.estMonthlyCashback}</span>
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[8px] font-black text-white uppercase tracking-[0.2em] transition-all">VIEW_DETAILS</button>
              </div>
            </div>
          )) : !loading && (
            <div className="col-span-full h-[400px] flex flex-col items-center justify-center text-center opacity-20 space-y-6">
              <span className="text-7xl">🧪</span>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Initiate Strategy Optimization<br/>to generate lab results</p>
            </div>
          )}

          {loading && (
            <div className="col-span-full h-[400px] flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Analyzing Merchant DNA...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditCardSuggester;
