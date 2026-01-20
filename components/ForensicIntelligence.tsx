import React, { useMemo, useState } from 'react';
import { Transaction, TransactionCategory } from '../types';

interface ForensicIntelligenceProps {
  transactions: Transaction[];
}

type TimeFrame = 'current-month' | 'last-30' | 'all';
type AnalysisFocus = 'none' | 'recurring' | 'weekend' | 'microspends' | 'outliers' | 'velocity' | 'concentration';

const ForensicIntelligence: React.FC<ForensicIntelligenceProps> = ({ transactions }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all');
  const [focus, setFocus] = useState<AnalysisFocus>('none');

  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  const analysis = useMemo(() => {
    const now = new Date();
    const filtered = transactions.filter(t => {
      if (timeFrame === 'all') return true;
      const tDate = new Date(t.date);
      if (timeFrame === 'current-month') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      if (timeFrame === 'last-30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return tDate >= thirtyDaysAgo;
      }
      return true;
    });

    const expenses = filtered.filter(t => t.type === 'expense');
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const avgExp = totalExp / (expenses.length || 1);

    // 1. Recurring
    const subMap: Record<string, Set<number>> = {};
    expenses.forEach(t => {
      const key = `${t.description.toLowerCase()}_${t.amount}`;
      const month = new Date(t.date).getMonth();
      if (!subMap[key]) subMap[key] = new Set();
      subMap[key].add(month);
    });
    const recurring = expenses.filter(t => {
      const key = `${t.description.toLowerCase()}_${t.amount}`;
      return subMap[key] && subMap[key].size >= 2;
    });
    
    const annualRecurringDrain = recurring.length > 0 
      ? (recurring.reduce((s, t) => s + t.amount, 0) / Math.max(1, expenses.length)) * 12 
      : 0;

    // 2. Weekend Splurge
    const weekend = expenses.filter(t => [0, 6].includes(new Date(t.date).getDay()));
    const weekday = expenses.filter(t => ![0, 6].includes(new Date(t.date).getDay()));
    const avgWeekend = weekend.length > 0 ? weekend.reduce((s, t) => s + t.amount, 0) / weekend.length : 0;
    const avgWeekday = weekday.length > 0 ? weekday.reduce((s, t) => s + t.amount, 0) / weekday.length : 0;
    const splurgeFactor = avgWeekday > 0 ? (avgWeekend / avgWeekday).toFixed(1) : '1.0';

    // 3. Concentration
    // Fixed: Explicitly type the reduce accumulator for frequency calculation and merchant sorting to resolve TS errors.
    const freq = expenses.reduce((acc: Record<string, {count: number, total: number}>, t: Transaction) => {
      const desc = t.description;
      if (!acc[desc]) acc[desc] = { count: 0, total: 0 };
      acc[desc].count++;
      acc[desc].total += t.amount;
      return acc;
    }, {} as Record<string, {count: number, total: number}>);
    
    // Explicitly cast entries to handle case where Object.entries defaults to unknown values in some environments.
    const topMerchants = (Object.entries(freq) as [string, {count: number, total: number}][])
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    const topMerchantSpend = topMerchants.length > 0 ? topMerchants[0][1].total : 0;
    const concentrationIndex = totalExp > 0 ? ((topMerchantSpend / totalExp) * 100).toFixed(0) : '0';

    // 4. Burn Velocity
    const allExpenses = transactions.filter(t => t.type === 'expense');
    const uniqueDays = new Set(allExpenses.map(t => t.date)).size || 1;
    const historicalDailyAvg = allExpenses.reduce((s, t) => s + t.amount, 0) / uniqueDays;
    
    const currentUniqueDays = new Set(expenses.map(t => t.date)).size || 1;
    const currentDailyAvg = totalExp / currentUniqueDays;
    const velocityTrend = historicalDailyAvg > 0 ? ((currentDailyAvg / historicalDailyAvg) - 1) * 100 : 0;

    // 5. Efficiency Score
    const microCount = expenses.filter(t => t.amount < 1000).length;
    const outlierCount = expenses.filter(t => t.amount > avgExp * 2).length;
    let efficiencyScore = 100 - (microCount * 3) - (outlierCount * 10) - (recurring.length * 5);
    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

    return {
      expenses,
      totalExp,
      recurring,
      annualRecurringDrain,
      splurgeFactor,
      topMerchants,
      efficiencyScore,
      concentrationIndex,
      velocityTrend,
      currentDailyAvg,
      microSpends: expenses.filter(t => t.amount < 1000),
      outliers: expenses.filter(t => t.amount > avgExp * 2),
      periodLabel: timeFrame === 'current-month' ? 'Current Month' : timeFrame === 'last-30' ? 'Last 30 Days' : 'Historical'
    };
  }, [transactions, timeFrame]);

  const displayedList = useMemo(() => {
    if (focus === 'none') return [];
    if (focus === 'recurring') return analysis.recurring;
    if (focus === 'weekend') return analysis.expenses.filter(t => [0, 6].includes(new Date(t.date).getDay()));
    if (focus === 'microspends') return analysis.microSpends;
    if (focus === 'outliers') return analysis.outliers;
    if (focus === 'velocity') return analysis.expenses.sort((a,b) => b.amount - a.amount).slice(0, 10);
    if (focus === 'concentration') return analysis.expenses.filter(t => t.description === analysis.topMerchants[0]?.[0]);
    return [];
  }, [analysis, focus]);

  const focusTitle = useMemo(() => {
    switch (focus) {
      case 'microspends': return 'Micro-Leak Audit';
      case 'recurring': return 'Subscription Fatigue';
      case 'weekend': return 'Temporal Vibes';
      case 'outliers': return 'Anomaly Alert';
      case 'velocity': return 'Burn Speed Audit';
      case 'concentration': return 'Ecosystem Deep-Dive';
      default: return 'Vibe Audit';
    }
  }, [focus]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Vibe Check 🔋</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 text-[10px]">Behavioral spend forensics</p>
        </div>
        <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
          {(['current-month', 'last-30', 'all'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => { setTimeFrame(opt); setFocus('none'); }}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeFrame === opt ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-400'}`}
            >
              {opt.replace('-', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Gauge */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <span className="text-9xl">💎</span>
          </div>
          
          <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
              <circle 
                cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={628} 
                strokeDashoffset={628 - (628 * analysis.efficiencyScore) / 100}
                strokeLinecap="round"
                className={`${analysis.efficiencyScore > 80 ? 'text-emerald-500' : analysis.efficiencyScore > 50 ? 'text-blue-500' : 'text-rose-500'} transition-all duration-1000 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-7xl font-black tracking-tighter tabular-nums text-white">{Math.round(analysis.efficiencyScore)}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-0.5">Efficiency</span>
            </div>
          </div>
          
          <p className="text-sm font-black text-slate-200 leading-tight">
            {analysis.efficiencyScore > 80 ? "Main character energy. Your bag is secure." : "Moderate leakage detected. Audit the receipts."}
          </p>
        </div>

        {/* Tactical Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'velocity', label: 'Cash Speed', val: `₹${Math.round(analysis.currentDailyAvg)}`, sub: `${analysis.velocityTrend > 0 ? '↑' : '↓'} ${Math.abs(Math.round(analysis.velocityTrend))}%`, color: 'blue', focusId: 'velocity' },
            { id: 'concentration', label: 'Ecosystem Load', val: `${analysis.concentrationIndex}%`, sub: 'Top Merchant Weight', color: 'indigo', focusId: 'concentration' },
            { id: 'weekend', label: 'Weekend Vibe', val: `${analysis.splurgeFactor}x`, sub: 'Impulse Multiplier', color: 'amber', focusId: 'weekend' },
            { id: 'recurring', label: 'Ghost Subs', val: `₹${formatCurrency(Math.round(analysis.annualRecurringDrain / 12))}`, sub: 'Monthly Drain', color: 'slate', focusId: 'recurring' },
            { id: 'microspends', label: 'UPI Leaks', val: `${analysis.microSpends.length}`, sub: 'Small Interactions', color: 'emerald', focusId: 'microspends' },
            { id: 'outliers', label: 'Anomalies', val: `${analysis.outliers.length}`, sub: 'Big Deviations', color: 'rose', focusId: 'outliers' }
          ].map((card) => (
            <button 
              key={card.id}
              onClick={() => setFocus(card.focusId as AnalysisFocus)}
              className={`p-6 rounded-[2.5rem] border transition-all text-left flex flex-col justify-between group ${focus === card.focusId ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest ${focus === card.focusId ? 'text-black/40' : 'text-slate-500'}`}>{card.label}</span>
              <div>
                <p className="text-2xl font-black">{card.val}</p>
                <p className={`text-[9px] font-black mt-1 uppercase tracking-wider ${focus === card.focusId ? 'text-black/60' : 'text-slate-400'}`}>{card.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5">
          <h3 className="text-lg font-black mb-8 text-white tracking-tight flex items-center gap-3">
            Top Outflows
            <span className="text-[9px] bg-white/5 text-slate-400 px-3 py-1 rounded-lg uppercase font-black tracking-widest">Global Density</span>
          </h3>
          <div className="space-y-6">
            {analysis.topMerchants.map(([name, data]) => {
              const percentage = analysis.totalExp > 0 ? (data.total / analysis.totalExp) * 100 : 0;
              return (
                <div key={name} className="space-y-3 group cursor-pointer">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-200 group-hover:text-blue-400 transition-colors">{name}</span>
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{data.count} hits</span>
                    </div>
                    <span className="text-sm font-black text-white">₹{formatCurrency(data.total)}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, percentage)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white tracking-tighter">{focusTitle}</h3>
            {focus !== 'none' && (
              <button onClick={() => setFocus('none')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {displayedList.length > 0 ? displayedList.map(t => (
              <div key={t.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex justify-between items-center hover:bg-white/10 transition-all group">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">{t.description}</span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">{t.date}</span>
                </div>
                <span className="text-sm font-black text-white tabular-nums">₹{formatCurrency(t.amount)}</span>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 py-20">
                <span className="text-6xl">🔍</span>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Select a metric to audit the vibe</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicIntelligence;