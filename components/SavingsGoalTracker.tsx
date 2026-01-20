
import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import PixelIcon from './PixelIcon';

interface SavingsGoalTrackerProps {
  goals: SavingsGoal[];
  onAddGoal: () => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

const SavingsGoalTracker: React.FC<SavingsGoalTrackerProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string, targetAmount: string }>({ name: '', targetAmount: '' });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-IN');
  };

  const startEditing = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setEditForm({ name: goal.name, targetAmount: goal.targetAmount.toString() });
  };

  const handleSave = (id: string) => {
    const target = parseFloat(editForm.targetAmount);
    if (editForm.name.trim() && !isNaN(target) && target > 0) {
      onUpdateGoal(id, {
        name: editForm.name.trim(),
        targetAmount: target
      });
      setEditingId(null);
    } else {
      alert("Please enter a valid name and target amount.");
    }
  };

  const handleContribute = (goal: SavingsGoal) => {
    const amount = prompt(`Contribute to "${goal.name}" (₹):`);
    if (amount && !isNaN(parseFloat(amount))) {
      const newAmount = goal.currentAmount + parseFloat(amount);
      onUpdateGoal(goal.id, { currentAmount: Math.min(newAmount, goal.targetAmount) });
    }
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
          className="w-10 h-10 flex items-center justify-center bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl border border-blue-500/20 transition-all shadow-lg shadow-blue-500/5 group"
          title="New Quest"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.map(goal => {
          const isEditing = editingId === goal.id;
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isComplete = progress >= 100;

          return (
            <div key={goal.id} className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${isEditing ? 'bg-blue-600/5 border-blue-500/40 ring-1 ring-blue-500/20' : isComplete ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
              
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-pixel text-blue-400 uppercase">QUEST_NAME</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                      placeholder="e.g. iPhone 16 Pro"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-pixel text-blue-400 uppercase">TARGET_LOOT (₹)</label>
                    <input 
                      type="number" 
                      value={editForm.targetAmount}
                      onChange={(e) => setEditForm({...editForm, targetAmount: e.target.value})}
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handleSave(goal.id)}
                      className="flex-1 py-2 bg-blue-600 text-white font-pixel text-[8px] rounded-xl hover:bg-blue-700 transition-all"
                    >
                      SAVE_CHANGES
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-white/5 text-slate-400 font-pixel text-[8px] rounded-xl hover:bg-white/10 transition-all"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isComplete && (
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <PixelIcon type="trophy" size={32} className="text-emerald-500" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-black uppercase tracking-tight transition-colors ${isComplete ? 'text-emerald-400' : 'text-slate-200'}`}>{goal.name}</h4>
                        {isComplete && <span className="font-pixel text-[6px] bg-emerald-500 text-black px-1 py-0.5 rounded">DONE</span>}
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Target: ₹{formatCurrency(goal.targetAmount)}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`text-2xl font-black tracking-tighter italic tabular-nums ${isComplete ? 'text-emerald-500' : 'text-blue-500'}`}>{Math.round(progress)}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 mb-4">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
                      style={{ width: `${Math.max(2, progress)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">₹{formatCurrency(goal.currentAmount)} Secured</span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleContribute(goal)}
                        className="text-[8px] font-pixel bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-600/20 transition-all"
                        title="Add XP"
                      >
                        ADD_XP
                      </button>
                      <button 
                        onClick={() => startEditing(goal)}
                        className="text-[8px] font-pixel bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-[8px] font-pixel bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all"
                      >
                        DEL
                      </button>
                    </div>
                  </div>
                </>
              )}
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
