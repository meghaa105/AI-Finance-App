import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionCategory, Budget, SavingsGoal, AuditStatus } from './types';
import { INITIAL_TRANSACTIONS } from './constants';
import DashboardCharts from './components/DashboardCharts';
import AIAdvisor from './components/AIAdvisor';
import BudgetTracker from './components/BudgetTracker';
import SavingsGoalTracker from './components/SavingsGoalTracker';
import ForensicIntelligence from './components/ForensicIntelligence';
import HistoricalLedger from './components/HistoricalLedger';
import FloatingChat from './components/FloatingChat';
import { UserProfile } from './services/geminiService';

type View = 'dashboard' | 'vibe-check' | 'receipts' | 'sensei';
type TimeFrame = 'current-month' | 'last-30' | 'all';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('current-month');
  
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
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Emergency Fund', targetAmount: 300000, currentAmount: 85000 },
      { id: '2', name: 'New iPhone 16 Pro', targetAmount: 120000, currentAmount: 15000 }
    ];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finvue_profile');
    return saved ? JSON.parse(saved) : {
      goal: 'Financial Freedom',
      riskAppetite: 'Moderate',
      lifeStage: 'Working Professional'
    };
  });

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

    return { 
      income, 
      expenses, 
      balance: totalIncome - totalExpense,
      periodLabel: timeFrame === 'current-month' ? 'This Month' : 
                   timeFrame === 'last-30' ? 'Last 30 Days' : 'All Time'
    };
  }, [filteredTransactions, transactions, timeFrame]);

  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  const addTransaction = (t: Transaction) => setTransactions(prev => [{...t, auditStatus: 'pending'}, ...prev]);
  const addBulkTransactions = (ts: Transaction[]) => setTransactions(prev => [...ts.map(t => ({...t, auditStatus: t.auditStatus || 'pending'})), ...prev]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const updateTransactionStatus = (id: string, status: AuditStatus) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, auditStatus: status } : t));
  const addBudget = (category: TransactionCategory | string, limit: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setBudgets(prev => [...prev.filter(b => b.category !== category), { id, category, limit }]);
  };
  const addGoal = () => {
    const name = prompt('Goal name (e.g., Sneakers, Trip):');
    const target = prompt('Target amount in ₹:');
    if (name && target) {
      setGoals(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        name,
        targetAmount: parseFloat(target),
        currentAmount: 0
      }]);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Sidebar */}
      <nav className="w-20 lg:w-64 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center lg:items-stretch p-4 lg:p-6 shrink-0 z-[60]">
        <div className="mb-10 flex items-center gap-3 lg:px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-110 transition-transform cursor-pointer">FV</div>
          <h1 className="hidden lg:block text-xl font-black text-white tracking-tighter uppercase italic">Finvue<span className="text-blue-500">.</span>Ai</h1>
        </div>

        <div className="space-y-2 flex-1 w-full">
          {[
            { id: 'dashboard', label: 'Dash', icon: '🏠' },
            { id: 'vibe-check', label: 'Vibe Check', icon: '🔋' },
            { id: 'receipts', label: 'Receipts', icon: '🧾' },
            { id: 'sensei', label: 'Wealth Sensei', icon: '🧘' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all group ${currentView === item.id ? 'bg-white/10 text-white shadow-xl shadow-black/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-800/30 rounded-2xl hidden lg:block border border-white/5 mt-auto">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Bag</p>
          <p className="text-lg font-black text-white">₹{formatCurrency(stats.balance)}</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-6 lg:pt-0">
        {currentView === 'dashboard' && (
          <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-5xl font-black text-white tracking-tighter italic">DASHBOARD</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 text-[10px]">Real-time spending overview // {stats.periodLabel}</p>
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
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-4">Savings Cap</span>
                <p className="text-3xl font-black text-white">₹{formatCurrency(Math.max(0, stats.income - stats.expenses))}</p>
              </div>
            </div>

            <DashboardCharts transactions={filteredTransactions} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BudgetTracker transactions={filteredTransactions} budgets={budgets} onAddBudget={addBudget} />
              <SavingsGoalTracker goals={goals} onAddGoal={addGoal} />
            </div>
          </div>
        )}

        {currentView === 'vibe-check' && <ForensicIntelligence transactions={transactions} />}
        {currentView === 'receipts' && (
          <HistoricalLedger 
            transactions={transactions} 
            onDelete={deleteTransaction} 
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
      </main>

      <FloatingChat transactions={transactions} budgets={budgets} goals={goals} profile={profile} />
    </div>
  );
};

export default App;
