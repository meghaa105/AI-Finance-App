
import React from 'react';
import { SavingsGoal } from '../types';

interface SavingsGoalTrackerProps {
  goals: SavingsGoal[];
  onAddGoal: () => void;
}

const SavingsGoalTracker: React.FC<SavingsGoalTrackerProps> = ({ goals, onAddGoal }) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Savings Goals</h3>
        <button 
          onClick={onAddGoal}
          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{goal.name}</h4>
                  <p className="text-xs text-slate-500">Target: ₹{formatCurrency(goal.targetAmount)}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-100">
                <div 
                  className="h-full bg-blue-600 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                ₹{formatCurrency(goal.currentAmount)} saved
              </p>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-sm text-slate-400">No active goals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoalTracker;
