import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import PixelIcon from './PixelIcon';

interface SavingsGoalTrackerProps {
  goals: SavingsGoal[];
  onAddGoal: (name: string, target: number) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

const SavingsGoalTracker: React.FC<SavingsGoalTrackerProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalForm, setNewGoalForm] = useState({ name: '', target: '' });
  const [editForm, setEditForm] = useState<{ name: string, targetAmount: string }>({ name: '', targetAmount: '' });
  const [contributionFormId, setContributionFormId] = useState<string | null>(null);
  const [contributionValue, setContributionValue] = useState('');

  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  const startEditing = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setEditForm({ name: goal.name, targetAmount: goal.targetAmount.toString() });
  };

  const handleSave = (id: string) => {
    const target = parseFloat(editForm.targetAmount);
    if (editForm.name.trim() && !isNaN(target) && target > 0) {
      onUpdateGoal(id, { name: editForm.name.trim(), targetAmount: target });
      setEditingId(null);
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalForm.target);
    if (newGoalForm.name.trim() && !isNaN(target) && target > 0) {
      onAddGoal(newGoalForm.name.trim(), target);
      setIsAdding(false);
      setNewGoalForm({ name: '', target: '' });
    }
  };

  const handleContribution = (id: string) => {
    const amount = parseFloat(contributionValue);
    if (!isNaN(amount) && amount > 0) {
      const goal = goals.find(g => g.id === id);
      if (goal) {
        onUpdateGoal(id, { currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) });
      }
    }
    setContributionFormId(null);
    setContributionValue('');
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-white uppercase italic">Side Quests</h3>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wealth Milestones</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-lg group ${isAdding ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}
        >
          {isAdding ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateGoal} className="mb-6 p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-pixel text-blue-400 uppercase">QUEST_NAME</label>
              <input 
                type="text" 
                value={newGoalForm.name}
                onChange={(e) => setNewGoalForm({...newGoalForm, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
                placeholder="e.g. Dream Car"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-pixel text-blue-400 uppercase">TARGET_LOOT (₹)</label>
              <input 
                type="number" 
                value={newGoalForm.target}
                onChange={(e) => setNewGoalForm({...newGoalForm, target: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white font-pixel text-[8px] rounded-xl hover:bg-blue-700 transition-all">ESTABLISH_QUEST</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {goals.map(goal => {
          const isEditing = editingId === goal.id;
          const isDeleting = deletingId === goal.id;
          const isContributing = contributionFormId === goal.id;
          const targetAmount = goal.targetAmount || 1;
          const progress = Math.min(100, (goal.currentAmount / targetAmount) * 100);
          const isComplete = progress >= 100;

          if (isDeleting) {
            return (
              <div key={goal.id} className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">🚨 PURGE_GOAL: "{goal.name}"?</p>
                <div className="flex gap-4 w-full">
                  <button onClick={() => onDeleteGoal(goal.id)} className="flex-1 py-2 bg-rose-600 text-white font-pixel text-[8px] rounded-xl">CONFIRM</button>
                  <button onClick={() => setDeletingId(null)} className="flex-1 py-2 bg-white/5 text-slate-400 font-pixel text-[8px] rounded-xl">ABORT</button>
                </div>
              </div>
            );
          }

          return (
            <div key={goal.id} className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${isEditing ? 'bg-blue-600/5 border-blue-500/40' : isComplete ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-pixel text-blue-400 uppercase">QUEST_NAME</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-pixel text-blue-400 uppercase">TARGET_LOOT</label>
                    <input type="number" value={editForm.targetAmount} onChange={(e) => setEditForm({...editForm, targetAmount: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(goal.id)} className="flex-1 py-2 bg-blue-600 text-white font-pixel text-[8px] rounded-xl">SAVE</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-white/5 text-slate-400 font-pixel text-[8px] rounded-xl">CANCEL</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isComplete ? 'text-emerald-400' : 'text-slate-200'}`}>{goal.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Goal: ₹{formatCurrency(goal.targetAmount)}</p>
                    </div>
                    <span className={`text-2xl font-black tracking-tighter tabular-nums ${isComplete ? 'text-emerald-500' : 'text-blue-500'}`}>{Math.round(progress)}%</span>
                  </div>

                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                    <div className={`h-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
                  </div>

                  {isContributing ? (
                    <div className="flex gap-2 animate-in fade-in duration-300">
                      <input 
                        type="number" 
                        value={contributionValue} 
                        onChange={(e) => setContributionValue(e.target.value)} 
                        placeholder="Amount"
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white"
                        autoFocus
                      />
                      <button onClick={() => handleContribution(goal.id)} className="px-3 bg-blue-600 text-white font-pixel text-[6px] rounded-lg">ADD</button>
                      <button onClick={() => setContributionFormId(null)} className="px-3 bg-white/5 text-slate-400 font-pixel text-[6px] rounded-lg">X</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 font-black uppercase italic">₹{formatCurrency(goal.currentAmount)} Secured</span>
                      <div className="flex gap-2">
                        <button onClick={() => setContributionFormId(goal.id)} className="text-[7px] font-pixel bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/20 transition-all">ADD_XP</button>
                        <button onClick={() => startEditing(goal)} className="text-[7px] font-pixel bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded-lg border border-white/5 transition-all">EDIT</button>
                        <button onClick={() => setDeletingId(goal.id)} className="text-[7px] font-pixel bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg border border-rose-500/20 transition-all">DEL</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="text-center py-10 opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-[8px] font-pixel text-white uppercase tracking-widest">No Active Quests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoalTracker;