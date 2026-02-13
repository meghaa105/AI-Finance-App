import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionCategory, Budget, SavingsGoal, AuditStatus } from './types';
import { INITIAL_TRANSACTIONS } from './constants';
import DashboardCharts from './components/DashboardCharts';
import AIAdvisor from './components/AIAdvisor';
import BudgetTracker from './components/BudgetTracker';
import SavingsGoalTracker from './components/SavingsGoalTracker';
import ForensicIntelligence from './components/ForensicIntelligence';
import HistoricalLedger from './components/HistoricalLedger';
import FloatingChat from './components/FloatingChat';
import BurnTicker from './components/BurnTicker';
import PersonaAvatar from './components/PersonaAvatar';
import BossBattle from './components/BossBattle';
import PixelIcon from './components/PixelIcon';
import GameManual from './components/GameManual';
import CreditCardSuggester from './components/CreditCardSuggester';
import { UserProfile } from './services/geminiService';

type View = 'dashboard' | 'vibe-check' | 'receipts' | 'sensei' | 'manual' | 'card-lab';
type TimeFrame = 'current-month' | 'last-30' | 'all';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('current-month');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finvue_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finvue_budgets');
    return saved ? JSON.parse(saved) : [
      { id: '1', category: TransactionCategory.FOOD, limit: 12000 },
      { id: '2', category: TransactionCategory.TRANSPORT, limit: 5000 }
    ];
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('finvue_goals');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [
        { id: '1', name: 'Emergency Fund', targetAmount: 300000, currentAmount: 85000 },
        { id: '2', name: 'New iPhone 16 Pro', targetAmount: 120000, currentAmount: 15000 }
      ];
    } catch {
      return [];
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finvue_profile');
    return saved ? JSON.parse(saved) : {
      name: '',
      goal: 'Financial Freedom',
      riskAppetite: 'Moderate',
      lifeStage: 'Working Professional'
    };
  });

  useEffect(() => {
    if (!profile.name) {
      setShowOnboarding(true);
    }
  }, [profile.name]);

  useEffect(() => {
    localStorage.setItem('finvue_transactions', JSON.stringify(transactions));
    localStorage.setItem('finvue_budgets', JSON.stringify(budgets));
    localStorage.setItem('finvue_goals', JSON.stringify(goals));
    localStorage.setItem('finvue_profile', JSON.stringify(profile));
    document.body.className = "bg-[#020617] text-white antialiased selection:bg-blue-500/30";
  }, [transactions, budgets, goals, profile]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (timeFrame === 'all') return true;
      if (timeFrame === 'current-month') {
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      }
      if (timeFrame === 'last-30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return tDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [transactions, timeFrame]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const uniqueDays = new Set(filteredTransactions.filter(t => t.type === 'expense').map(t => t.date)).size || 1;
    const velocity = expenses / uniqueDays;

    const microCount = filteredTransactions.filter(t => t.type === 'expense' && t.amount < 500).length;
    let efficiency = 100 - (microCount * 2) - ((expenses / (income || 1)) * 50);
    efficiency = Math.max(10, Math.min(100, efficiency));

    const verifiedCount = transactions.filter(t => t.auditStatus === 'verified').length;
    const level = Math.floor(verifiedCount / 3) + 1;

    const merchants: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      merchants[t.description] = (merchants[t.description] || 0) + t.amount;
    });
    const topMerchant = Object.entries(merchants).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    return { 
      income, 
      expenses, 
      balance: totalIncome - totalExpense,
      velocity,
      efficiency,
      level,
      topMerchant,
      periodLabel: timeFrame === 'current-month' ? 'This Month' : 
                   timeFrame === 'last-30' ? 'Last 30 Days' : 'All Time'
    };
  }, [filteredTransactions, transactions, timeFrame]);

  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  const addTransaction = (t: Transaction) => setTransactions(prev => [{...t, auditStatus: 'pending'}, ...prev]);
  const addBulkTransactions = (ts: Transaction[]) => setTransactions(prev => [...ts.map(t => ({...t, auditStatus: t.auditStatus || 'pending'})), ...prev]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  
  const deleteAllTransactions = () => {
    // We'll trust the caller to have handled confirmation
    setTransactions([]);
  };

  const updateTransactionStatus = (id: string, status: AuditStatus) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, auditStatus: status } : t));
  
  const addBudget = useCallback((category: TransactionCategory | string, limit: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setBudgets(prev => {
      const filtered = prev.filter(b => b.category !== category);
      return [...filtered, { id, category, limit }];
    });
  }, []);

  const addGoal = useCallback((name: string, target: number) => {
    setGoals(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      targetAmount: target,
      currentAmount: 0
    }]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setGoals(prev => prev.map(g => String(g.id) === String(id) ? { ...g, ...updates } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => String(g.id) !== String(id)));
  }, []);

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameInput = (e.target as any).elements.name.value;
    if (nameInput.trim()) {
      setProfile(prev => ({ ...prev, name: nameInput.trim() }));
      setShowOnboarding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <BurnTicker velocity={stats.velocity} topMerchant={stats.topMerchant} efficiency={stats.efficiency} />

      {showOnboarding && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <PixelIcon type="sensei" size={100} className="text-white" />
             </div>
             <h2 className="text-3xl font-black italic tracking-tighter mb-4">Identify Yourself</h2>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Establish account holder identity</p>
             <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Full Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    placeholder="e.g. Megha Agarwal"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all"
                    autoFocus
                    required
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Connect Identity</button>
             </form>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Background Glows */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Sidebar */}
        <nav className="w-20 lg:w-64 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center lg:items-stretch p-4 lg:p-6 shrink-0 z-[60]">
          <div className="mb-10 flex items-center gap-3 lg:px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-110 transition-transform cursor-pointer">FV</div>
            <h1 className="hidden lg:block text-xl font-black text-white tracking-tighter uppercase italic">Finvue<span className="text-blue-500">.</span>Ai</h1>
          </div>

          <div className="space-y-2 flex-1 w-full overflow-y-auto no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dash', type: 'home' as const },
              { id: 'vibe-check', label: 'Vibe Check', type: 'vibe' as const },
              { id: 'receipts', label: 'Receipts', type: 'ledger' as const },
              { id: 'sensei', label: 'Wealth Sensei', type: 'sensei' as const },
              { id: 'card-lab', label: 'Card Lab', type: 'card' as const },
              { id: 'manual', label: 'The Manual', type: 'quest' as const }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all group ${currentView === item.id ? 'bg-white/10 text-white shadow-xl shadow-black/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <PixelIcon 
                  type={item.type} 
                  size={20} 
                  className={currentView === item.id ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'} 
                />
                <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <PersonaAvatar score={stats.efficiency} level={stats.level} />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-6 lg:pt-0">
          {currentView === 'dashboard' && (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">DASHBOARD</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 text-[10px]">Welcome back, {profile.name || 'Wealth Lord'} // {stats.periodLabel}</p>
                </div>
                <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
                  {(['current-month', 'last-30', 'all'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTimeFrame(opt)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeFrame === opt ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      {opt.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-emerald-500/30 transition-all">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-4">Cash Inflow</span>
                  <p className="text-3xl font-black text-white">₹{formatCurrency(stats.income)}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-rose-500/30 transition-all">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-4">Cash Burn</span>
                  <p className="text-3xl font-black text-white">₹{formatCurrency(stats.expenses)}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-blue-500/30 transition-all">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-4">Net Balance</span>
                  <p className="text-3xl font-black text-white">₹{formatCurrency(stats.balance)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <DashboardCharts transactions={filteredTransactions} />
                </div>
                <div className="lg:col-span-4">
                  <BossBattle transactions={filteredTransactions} profile={profile} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BudgetTracker transactions={filteredTransactions} budgets={budgets} onAddBudget={addBudget} />
                <SavingsGoalTracker 
                  goals={goals} 
                  onAddGoal={addGoal} 
                  onUpdateGoal={updateGoal} 
                  onDeleteGoal={deleteGoal} 
                />
              </div>
            </div>
          )}

          {currentView === 'vibe-check' && <ForensicIntelligence transactions={transactions} />}
          {currentView === 'receipts' && (
            <HistoricalLedger 
              transactions={transactions} 
              onDelete={deleteTransaction} 
              onDeleteAll={deleteAllTransactions}
              onAdd={addTransaction} 
              onBulkAdd={addBulkTransactions}
              onUpdateStatus={updateTransactionStatus}
            />
          )}
          {currentView === 'sensei' && (
            <AIAdvisor 
              transactions={transactions} 
              budgets={budgets} 
              goals={goals} 
              profile={profile}
              onProfileUpdate={setProfile}
            />
          )}
          {currentView === 'card-lab' && (
            <CreditCardSuggester transactions={transactions} profile={profile} />
          )}
          {currentView === 'manual' && <GameManual />}
        </main>
      </div>

      <FloatingChat transactions={transactions} budgets={budgets} goals={goals} profile={profile} />
    </div>
  );
};

export default App;