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
    <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-white uppercase italic">Side Quests</h3>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wealth Milestones</p>
        </div>
        <button 
          onClick={onAddGoal}
          className="w-10 h-10 flex items-center justify-center bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl border border-blue-500/20 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-tight group-hover:text-white transition-colors">{goal.name}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Goal: ₹{formatCurrency(goal.targetAmount)}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-500 tracking-tighter italic">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  style={{ width: `${Math.max(5, progress)}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">₹{formatCurrency(goal.currentAmount)} Secured</span>
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">In Progress</span>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
            <span className="text-4xl block mb-4">🎯</span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Manifest your first goal</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoalTracker;
