
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

    // 2. Weekend Splurge & Peak Day
    const dayMap = expenses.reduce((acc: Record<number, number>, t) => {
      const day = new Date(t.date).getDay();
      acc[day] = (acc[day] || 0) + t.amount;
      return acc;
    }, {});
    const weekend = expenses.filter(t => [0, 6].includes(new Date(t.date).getDay()));
    const weekday = expenses.filter(t => ![0, 6].includes(new Date(t.date).getDay()));
    const avgWeekend = weekend.length > 0 ? weekend.reduce((s, t) => s + t.amount, 0) / weekend.length : 0;
    const avgWeekday = weekday.length > 0 ? weekday.reduce((s, t) => s + t.amount, 0) / weekday.length : 0;
    const splurgeFactor = avgWeekday > 0 ? (avgWeekend / avgWeekday).toFixed(1) : '1.0';

    // 3. Merchant Density & Concentration
    const freq = expenses.reduce((acc: Record<string, {count: number, total: number}>, t) => {
      if (!acc[t.description]) acc[t.description] = { count: 0, total: 0 };
      acc[t.description].count++;
      acc[t.description].total += t.amount;
      return acc;
    }, {});
    
    let topMerchants = Object.entries(freq)
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

    // 5. Leak Score Calculation
    const microCount = expenses.filter(t => t.amount < 1000).length;
    const outlierCount = expenses.filter(t => t.amount > avgExp * 2).length;
    let leakScore = 100 - (microCount * 4) - (outlierCount * 8) - (recurring.length * 2);
    leakScore = Math.max(5, Math.min(100, leakScore));

    return {
      expenses,
      totalExp,
      recurring,
      annualRecurringDrain,
      splurgeFactor,
      topMerchants,
      leakScore,
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
      case 'microspends': return 'Microspends Audit';
      case 'recurring': return 'Subscription Audit';
      case 'weekend': return 'Temporal Splurge';
      case 'outliers': return 'Anomaly Audit';
      case 'velocity': return 'Velocity Audit';
      case 'concentration': return 'Ecosystem Audit';
      default: return 'Forensic Audit';
    }
  }, [focus]);

  const InfoIcon = ({ text }: { text: string }) => (
    <div className="group/info relative">
      <div className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[8px] font-black cursor-help hover:border-blue-500 hover:text-blue-500 transition-colors">i</div>
      <div className="absolute right-0 top-6 w-48 p-3 bg-slate-900/95 backdrop-blur-md text-white text-[9px] font-medium leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all z-[100] border border-white/10 translate-y-2 group-hover/info:translate-y-0">
        {text}
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Intelligence Hub</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Behavioral forensic audit and cash-flow velocity.</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
          {(['current-month', 'last-30', 'all'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => { setTimeFrame(opt); setFocus('none'); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                timeFrame === opt ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {opt.replace('-', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Security Gauge */}
        <div className="lg:col-span-4 bg-[#05070a] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center border border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.15)_0%,_transparent_70%)]"></div>
          
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-900" />
              <circle 
                cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="10" fill="transparent" 
                strokeDasharray={527} 
                strokeDashoffset={527 - (527 * analysis.leakScore) / 100}
                strokeLinecap="round"
                className={`${analysis.leakScore > 75 ? 'text-emerald-500' : analysis.leakScore > 40 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-6xl font-bold tracking-tighter tabular-nums">{Math.round(analysis.leakScore)}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-[-4px]">Efficiency</span>
            </div>
          </div>
          
          <div className="relative z-10 px-4 max-w-[260px]">
             <p className="text-base font-semibold text-slate-200 leading-snug">
              {analysis.leakScore > 80 ? "Structural integrity is high." : "Moderate spend velocity detected. Review leaks."}
             </p>
          </div>
        </div>

        {/* Secondary Dashboard Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Velocity Card */}
          <button onClick={() => setFocus('velocity')} className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between relative group ${focus === 'velocity' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-200 transition-colors">Burn Velocity</span>
              <InfoIcon text="Measures current daily spending speed against your historical average to detect inflation." />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{Math.round(analysis.currentDailyAvg)}<span className="text-xs font-medium text-slate-400 ml-1">/day</span></p>
              <p className={`text-[10px] font-bold mt-1 ${analysis.velocityTrend > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {analysis.velocityTrend > 0 ? '↑' : '↓'} {Math.abs(Math.round(analysis.velocityTrend))}% vs historical
              </p>
            </div>
          </button>

          {/* Concentration Card */}
          <button onClick={() => setFocus('concentration')} className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between relative group ${focus === 'concentration' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-200 transition-colors">Ecosystem Load</span>
              <InfoIcon text="The percentage of total expenses flowing into your single most-used merchant or platform." />
            </div>
            <div>
              <p className="text-2xl font-bold">{analysis.concentrationIndex}%</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Top Merchant Weight</p>
            </div>
          </button>

          {/* Splurge Card */}
          <button onClick={() => setFocus('weekend')} className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between relative group ${focus === 'weekend' ? 'bg-amber-600 text-white border-amber-500' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-200 transition-colors">Temporal Splurge</span>
              <InfoIcon text="Weekend spending volume relative to weekday average. High values indicate leisure impulsivity." />
            </div>
            <div>
              <p className="text-2xl font-bold">{analysis.splurgeFactor}x</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Weekend intensity</p>
            </div>
          </button>

          {/* Recurring Card */}
          <button onClick={() => setFocus('recurring')} className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between relative group ${focus === 'recurring' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">Fixed Drain</span>
              <InfoIcon text="Aggregate monthly leakage from recurring commitments, subscriptions, and fixed bills." />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{formatCurrency(Math.round(analysis.annualRecurringDrain / 12))}<span className="text-xs font-medium text-slate-400 ml-1">/mo</span></p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Est. Monthly Leak</p>
            </div>
          </button>

          {/* Leakage Card */}
          <button onClick={() => setFocus('microspends')} className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between relative group ${focus === 'microspends' ? 'bg-[#009a69] text-white border-[#009a69]' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-200 transition-colors">Micro Leaks</span>
              <InfoIcon text="High-frequency, low-value UPI interactions that often aggregate into major monthly leakage." />
            </div>
            <div>
              <p className="text-2xl font-bold">{analysis.microSpends.length}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">UPI Interactions</p>
            </div>
          </button>

          {/* Anomaly Card */}
          <button onClick={() => setFocus('outliers')} className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between relative group ${focus === 'outliers' ? 'bg-rose-600 text-white border-rose-500' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-rose-200 transition-colors">Anomalies</span>
              <InfoIcon text="Statistical outliers—transactions that are at least 2x larger than your category average." />
            </div>
            <div>
              <p className="text-2xl font-bold">{analysis.outliers.length}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Structural Outliers</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Merchant Density */}
        <div className="lg:col-span-5">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[460px] flex flex-col">
            <h3 className="text-lg font-bold mb-8 text-slate-900 tracking-tight flex items-center gap-3">
              Merchant Density
              <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase font-bold tracking-widest">Priority 5</span>
            </h3>
            <div className="space-y-6 flex-1">
              {analysis.topMerchants.map(([name, data]) => {
                const percentage = analysis.totalExp > 0 ? (data.total / analysis.totalExp) * 100 : 0;
                return (
                  <div key={name} className="space-y-2.5 group">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{name}</span>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{data.count} Interactions</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">₹{formatCurrency(data.total)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${Math.max(4, percentage)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Focus Audit List */}
        <div className="lg:col-span-7">
          <div className={`bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all h-full min-h-[460px] flex flex-col ${focus === 'none' ? 'opacity-60' : 'opacity-100'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {focusTitle}
              </h3>
              {focus !== 'none' && (
                <button 
                  onClick={() => setFocus('none')} 
                  className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Clear Audit
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {displayedList.length > 0 ? displayedList.map(t => (
                <div key={t.id} className="p-5 bg-slate-50/70 rounded-[1.5rem] border border-slate-100 flex justify-between items-center hover:bg-white hover:shadow-lg transition-all group border-l-[4px] border-l-transparent hover:border-l-blue-600">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{t.description}</span>
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">{t.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900 tabular-nums">₹{formatCurrency(t.amount)}</span>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-200 border border-slate-100">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[200px]">
                    Select a tactical metric to begin forensic itemization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicIntelligence;
