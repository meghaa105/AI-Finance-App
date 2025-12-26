
import React from 'react';
import { Transaction, Budget, TransactionCategory } from '../types';

interface BudgetTrackerProps {
  transactions: Transaction[];
  budgets: Budget[];
  // Widened type to accept string for custom categories from CSV imports
  onAddBudget: (category: TransactionCategory | string, limit: number) => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ transactions, budgets, onAddBudget }) => {
  // Widened parameter type to accept string for flexibility with custom categories
  const getCategorySpend = (category: TransactionCategory | string) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Monthly Budgets</h3>
        <button 
          onClick={() => {
            const limit = prompt('Enter monthly limit in ₹:');
            if (limit) onAddBudget(TransactionCategory.FOOD, parseFloat(limit));
          }}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Manage
        </button>
      </div>
      
      <div className="space-y-5">
        {budgets.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-4">No budgets set. Set limits to track spending.</p>
        ) : (
          budgets.map(budget => {
            // Fix: budget.category is typed as TransactionCategory | string, 
            // and getCategorySpend now accepts this union type.
            const spend = getCategorySpend(budget.category);
            const percentage = Math.min((spend / budget.limit) * 100, 100);
            const isOver = spend > budget.limit;
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{budget.category}</span>
                  <span className="text-slate-500">
                    <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-700'}>₹{formatCurrency(spend)}</span>
                    <span className="text-slate-400 ml-1">/ ₹{formatCurrency(budget.limit)}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-blue-500'
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
