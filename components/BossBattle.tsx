
import React, { useState, useEffect, useMemo } from 'react';
import { Challenge, Transaction } from '../types';
import { geminiService, UserProfile } from '../services/geminiService';
import PixelIcon from './PixelIcon';

interface BossBattleProps {
  transactions: Transaction[];
  profile: UserProfile;
}

const BossBattle: React.FC<BossBattleProps> = ({ transactions, profile }) => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [outcome, setOutcome] = useState<{ status: string, roast: string, offendingTransactionId?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingQuest, setGeneratingQuest] = useState(false);
  
  // Initialize streak from localStorage
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('finvue_boss_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Sync streak to localStorage
  useEffect(() => {
    localStorage.setItem('finvue_boss_streak', streak.toString());
  }, [streak]);

  const startChallenge = async () => {
    setGeneratingQuest(true);
    try {
      const questData = await geminiService.generatePersonalizedQuest(transactions, profile);
      setActiveChallenge({
        id: Math.random().toString(36).substr(2, 9),
        type: (questData.type as any) || 'no-spend',
        title: questData.title || 'UNKNOWN_BOSS',
        description: questData.description || 'Stay disciplined.',
        reward: questData.reward || 500,
        isActive: true,
        startDate: new Date().toISOString(),
        status: 'active'
      });
      setOutcome(null);
    } catch (err) {
      console.error("Failed to generate quest", err);
    } finally {
      setGeneratingQuest(false);
    }
  };

  const checkStatus = async () => {
    if (!activeChallenge) return;
    setLoading(true);
    try {
      // Filter transactions that happened after the quest started
      const questPeriodTransactions = transactions.filter(t => new Date(t.date) >= new Date(activeChallenge.startDate));
      const res = await geminiService.generateChallengeOutcome(activeChallenge, questPeriodTransactions);
      setOutcome(res);
      
      // Update streak based on outcome
      if (res.status === 'conquered') {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0); // Reset streak on failure
      }
    } catch (error) {
      console.error("Failed to check quest status", error);
    } finally {
      setLoading(false);
    }
  };

  const offendingTransaction = useMemo(() => {
    if (outcome?.offendingTransactionId) {
      return transactions.find(t => t.id === outcome.offendingTransactionId);
    }
    return null;
  }, [outcome, transactions]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-full flex flex-col min-h-[420px]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quests</h3>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-pixel mt-1">Boss Battles</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">
             <span className="font-pixel text-[8px] text-blue-400">STREAK:</span>
             <span className="font-pixel text-[10px] text-white">{streak}</span>
             <div className="animate-pulse">
               <PixelIcon type="sparkle" size={12} className="text-amber-500" />
             </div>
          </div>

          {!activeChallenge && !generatingQuest && (
            <button 
              onClick={startChallenge}
              className="font-pixel text-[8px] bg-blue-600 text-white px-4 py-2 pixel-border hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              START_QUEST
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {generatingQuest ? (
          <div className="text-center py-10 flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
             <p className="text-[8px] font-pixel text-slate-400 animate-pulse">SCANNING_FOR_WEAKNESSES...</p>
          </div>
        ) : activeChallenge ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="p-6 bg-black border-2 border-blue-500/30 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PixelIcon type="quest" size={64} className="text-white" />
              </div>
              <h4 className="font-pixel text-[10px] text-blue-400 mb-4">{activeChallenge.title}</h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                {activeChallenge.description}
              </p>
              
              {!outcome ? (
                <button 
                  onClick={checkStatus}
                  disabled={loading}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-pixel text-[8px] text-white hover:bg-white/10 transition-all"
                >
                  {loading ? 'CALCULATING_VIBES...' : 'CLAIM_VICTORY'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl ${outcome.status === 'conquered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-pixel text-[10px] uppercase tracking-tighter">
                        {outcome.status === 'conquered' ? 'W_STATUS_SECURED' : 'L_DETECTED'}
                      </p>
                      <PixelIcon 
                        type={outcome.status === 'conquered' ? 'trophy' : 'skull'} 
                        size={16} 
                        className={outcome.status === 'conquered' ? 'text-amber-400' : 'text-rose-400'} 
                      />
                    </div>
                    <p className="text-[10px] font-bold italic leading-relaxed">"{outcome.roast}"</p>
                  </div>

                  {outcome.status === 'failed' && offendingTransaction && (
                    <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-2xl animate-in slide-in-from-top-2 duration-500">
                      <p className="text-[8px] font-pixel text-rose-400 mb-3 uppercase">Receipt of Shame:</p>
                      <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white">{offendingTransaction.description}</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase">{offendingTransaction.date}</span>
                        </div>
                        <span className="text-xs font-black text-rose-500">₹{offendingTransaction.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setActiveChallenge(null)}
                    className="w-full mt-2 text-[8px] font-pixel text-slate-500 uppercase underline hover:text-white transition-colors"
                  >
                    Reset Quest
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 opacity-30 flex flex-col items-center">
            <PixelIcon type="quest" size={48} className="mb-6 grayscale text-white" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white font-pixel">No active quest detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossBattle;
