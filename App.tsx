
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionCategory, Budget, SavingsGoal, AuditStatus } from './types';
import { INITIAL_TRANSACTIONS } from './constants';
import TransactionForm from './components/TransactionForm';
import DashboardCharts from './components/DashboardCharts';
import AIAdvisor from './components/AIAdvisor';
import BudgetTracker from './components/BudgetTracker';
import SavingsGoalTracker from './components/SavingsGoalTracker';
import ForensicIntelligence from './components/ForensicIntelligence';
import HistoricalLedger from './components/HistoricalLedger';
import FloatingChat from './components/FloatingChat';
import { UserProfile } from './services/geminiService';

type View = 'dashboard' | 'intelligence' | 'ledger' | 'advisor';
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
      { id: '2', name: 'Home Downpayment', targetAmount: 1000000, currentAmount: 150000 }
    ];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finvue_profile');
    return saved ? JSON.parse(saved) : {
      goal: '',
      riskAppetite: 'Moderate',
      lifeStage: 'Working Professional'
    };
  });

  useEffect(() => {
    localStorage.setItem('finvue_transactions', JSON.stringify(transactions));
    localStorage.setItem('finvue_budgets', JSON.stringify(budgets));
    localStorage.setItem('finvue_goals', JSON.stringify(goals));
    localStorage.setItem('finvue_profile', JSON.stringify(profile));
  }, [transactions, budgets, goals, profile]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const filteredActivity = transactions.filter(t => {
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

    const income = filteredActivity
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredActivity
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return { 
      income, 
      expenses, 
      balance: totalIncome - totalExpense,
      periodLabel: timeFrame === 'current-month' ? now.toLocaleString('default', { month: 'long' }) : 
                   timeFrame === 'last-30' ? 'Last 30 Days' : 'All Time'
    };
  }, [transactions, timeFrame]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-IN');
  };

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [{...t, auditStatus: 'pending'}, ...prev]);
  };

  const addBulkTransactions = (ts: Transaction[]) => {
    setTransactions(prev => [...ts.map(t => ({...t, auditStatus: t.auditStatus || 'pending'})), ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransactionStatus = (id: string, status: AuditStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, auditStatus: status } : t));
  };

  const addBudget = (category: TransactionCategory | string, limit: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setBudgets(prev => [...prev.filter(b => b.category !== category), { id, category, limit }]);
  };

  const addGoal = () => {
    const name = prompt('Goal name (e.g., Vacation, Bike):');
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
    <div className="flex min-h-screen bg-[#f8fafc]">
      <nav className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col items-center lg:items-stretch p-4 lg:p-6 shrink-0 z-50">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">V</div>
          <h1 className="hidden lg:block text-xl font-black text-slate-900 tracking-tight">FinVue India<span className="text-blue-600">.</span></h1>
        </div>

        <div className="space-y-2 flex-1">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="hidden lg:block">Dashboard</span>
          </button>

          <button 
            onClick={() => setCurrentView('intelligence')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'intelligence' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <span className="hidden lg:block">Intelligence</span>
          </button>

          <button 
            onClick={() => setCurrentView('ledger')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'ledger' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            <span className="hidden lg:block">Historical Ledger</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('advisor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'advisor' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            <span className="hidden lg:block">AI Wealth Advisor</span>
          </button>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-auto">
          <div className="hidden lg:block bg-slate-50 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Balance</p>
            <p className="text-lg font-black text-slate-900">₹{formatCurrency(stats.balance)}</p>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto relative">
        {currentView === 'dashboard' ? (
          <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h2>
                <div className="flex items-center gap-3 mt-2">
                   <p className="text-slate-500 font-medium">Tracking activity for</p>
                   <div className="flex bg-slate-200/50 p-1 rounded-xl">
                      {(['current-month', 'last-30', 'all'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setTimeFrame(opt)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            timeFrame === opt ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {opt.replace('-', ' ')}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Total Net Assets</p>
                    <p className="text-3xl font-black text-blue-600">₹{formatCurrency(stats.balance)}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-12 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100/30 flex flex-col justify-between group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 relative overflow-hidden">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Income</p>
                      <p className="text-3xl font-black text-emerald-900">₹{formatCurrency(stats.income)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-rose-100/30 flex flex-col justify-between group hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500 relative overflow-hidden">
                    <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-rose-500/20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">Expenses</p>
                      <p className="text-3xl font-black text-rose-900">₹{formatCurrency(stats.expenses)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100/30 flex flex-col justify-between group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 relative overflow-hidden">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Net Flow</p>
                      <p className="text-3xl font-black text-blue-900">₹{formatCurrency(stats.income - stats.expenses)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BudgetTracker transactions={transactions} budgets={budgets} onAddBudget={addBudget} />
                  <SavingsGoalTracker goals={goals} onAddGoal={addGoal} />
                </div>

                <DashboardCharts transactions={transactions} />
              </div>
            </div>
          </div>
        ) : currentView === 'intelligence' ? (
          <ForensicIntelligence transactions={transactions} />
        ) : currentView === 'ledger' ? (
          <HistoricalLedger 
            transactions={transactions} 
            onDelete={deleteTransaction} 
            onAdd={addTransaction}
            onBulkAdd={addBulkTransactions}
            onUpdateStatus={updateTransactionStatus}
          />
        ) : (
          <AIAdvisor 
            transactions={transactions} 
            budgets={budgets} 
            goals={goals} 
            profile={profile}
            onProfileUpdate={setProfile}
          />
        )}
        
        <FloatingChat 
          transactions={transactions} 
          budgets={budgets} 
          goals={goals} 
          profile={profile} 
        />
      </main>
    </div>
  );
};

export default App;
