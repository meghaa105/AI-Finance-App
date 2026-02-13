import React, { useState } from 'react';
import { Transaction, Budget, TransactionCategory } from '../types';

interface BudgetTrackerProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddBudget: (category: TransactionCategory | string, limit: number) => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ transactions, budgets, onAddBudget }) => {
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState('');

  const getCategorySpend = (category: TransactionCategory | string) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  const handleAdjust = (budget: Budget) => {
    const limit = parseFloat(adjustValue);
    if (!isNaN(limit) && limit > 0) {
      onAddBudget(budget.category, limit);
    }
    setAdjustingId(null);
    setAdjustValue('');
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-white uppercase italic">Guardrails</h3>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Budget Enforcement</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {budgets.length === 0 ? (
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center py-8 opacity-40">No caps active. High risk energy.</p>
        ) : (
          budgets.map(budget => {
            const spend = getCategorySpend(budget.category);
            const percentage = Math.min((spend / budget.limit) * 100, 100);
            const isOver = spend > budget.limit;
            const isAdjusting = adjustingId === budget.id;
            
            return (
              <div key={budget.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">{budget.category}</span>
                    <span className="text-[9px] font-bold text-slate-500">{Math.round(percentage)}% Depleted</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-black tabular-nums ${isOver ? 'text-rose-500' : 'text-white'}`}>₹{formatCurrency(spend)}</span>
                       <span className="text-[10px] text-slate-600 font-bold">/ ₹{formatCurrency(budget.limit)}</span>
                    </div>
                    {!isAdjusting && (
                      <button 
                        onClick={() => { setAdjustingId(budget.id); setAdjustValue(budget.limit.toString()); }}
                        className="text-[7px] font-black uppercase text-blue-500 hover:text-blue-400 underline mt-1"
                      >
                        Adjust Cap
                      </button>
                    )}
                  </div>
                </div>

                {isAdjusting ? (
                  <div className="flex gap-2 p-2 bg-white/5 rounded-xl border border-white/10 animate-in fade-in duration-200">
                    <input 
                      type="number" 
                      value={adjustValue} 
                      onChange={(e) => setAdjustValue(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-1 text-xs text-white"
                      autoFocus
                    />
                    <button onClick={() => handleAdjust(budget)} className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg">Save</button>
                    <button onClick={() => setAdjustingId(null)} className="px-3 py-1 bg-white/10 text-slate-400 text-[8px] font-black uppercase rounded-lg">Cancel</button>
                  </div>
                ) : (
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${
                        percentage > 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 
                        percentage > 70 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 
                        'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;