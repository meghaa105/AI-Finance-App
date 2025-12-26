import React from 'react';
import { Transaction, Budget, TransactionCategory } from '../types';

interface BudgetTrackerProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddBudget: (category: TransactionCategory | string, limit: number) => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ transactions, budgets, onAddBudget }) => {
  const getCategorySpend = (category: TransactionCategory | string) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-white uppercase italic">Guardrails</h3>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Budget Enforcement</p>
        </div>
        <button 
          onClick={() => {
            const limit = prompt('Set monthly cap (₹):');
            if (limit) onAddBudget(TransactionCategory.FOOD, parseFloat(limit));
          }}
          className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl border border-white/5 transition-all"
        >
          Adjust
        </button>
      </div>
      
      <div className="space-y-6">
        {budgets.length === 0 ? (
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center py-8 opacity-40">No caps active. High risk energy.</p>
        ) : (
          budgets.map(budget => {
            const spend = getCategorySpend(budget.category);
            const percentage = Math.min((spend / budget.limit) * 100, 100);
            const isOver = spend > budget.limit;
            
            return (
              <div key={budget.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">{budget.category}</span>
                    <span className="text-[9px] font-bold text-slate-500">{Math.round(percentage)}% Depleted</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black tabular-nums ${isOver ? 'text-rose-500' : 'text-white'}`}>₹{formatCurrency(spend)}</span>
                    <span className="text-[10px] text-slate-600 ml-1 font-bold">/ ₹{formatCurrency(budget.limit)}</span>
                  </div>
                </div>
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;
