import React, { useMemo, useState } from 'react';
import { Transaction, TransactionCategory, AuditStatus } from '../types';
import TransactionForm from './TransactionForm';

interface HistoricalLedgerProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onAdd: (t: Transaction) => void;
  onBulkAdd: (ts: Transaction[]) => void;
  onUpdateStatus?: (id: string, status: AuditStatus) => void;
}

const HistoricalLedger: React.FC<HistoricalLedgerProps> = ({ transactions, onDelete, onAdd, onBulkAdd, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesFilter = filter === 'all' || t.type === filter;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStartDate = !startDate || t.date >= startDate;
      const matchesEndDate = !endDate || t.date <= endDate;
      return matchesFilter && matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [transactions, filter, searchTerm, startDate, endDate]);

  const handleStatusUpdate = (id: string, status: AuditStatus) => {
    onUpdateStatus?.(id, status);
    setActiveMenuId(null);
  };

  const formatCategoryDisplay = (category: string) => {
    if (!category) return 'OTHER';
    return category.replace(/[_-]/g, ' ').toUpperCase();
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700" onClick={() => setActiveMenuId(null)}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">The Receipts 🧾</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 text-[10px]">Your financial source of truth</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="relative w-full md:w-80">
                  <input 
                    type="text"
                    placeholder="Search the archives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
                
                <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                  {(['all', 'expense', 'income'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilter(opt)}
                      className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === opt ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">From</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">To</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500/50" />
                </div>
                {(startDate || endDate) && (
                  <button onClick={() => {setStartDate(''); setEndDate('');}} className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors py-2 px-4">Clear Filter</button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto min-h-[500px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5 border-b border-white/5">Date</th>
                    <th className="px-8 py-5 border-b border-white/5">Merchant</th>
                    <th className="px-8 py-5 border-b border-white/5">Category</th>
                    <th className="px-8 py-5 border-b border-white/5 text-right">Amount</th>
                    <th className="px-8 py-5 border-b border-white/5 text-center">Status</th>
                    <th className="px-8 py-5 border-b border-white/5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-all group border-l-4 border-l-transparent hover:border-l-blue-500 cursor-default">
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors">{t.date}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">{t.description}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest inline-block ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/10 text-slate-400'}`}>
                          {formatCategoryDisplay(t.category)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`text-sm font-black tabular-nums ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === t.id ? null : t.id); }}
                          className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${
                            t.auditStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                            t.auditStatus === 'flagged' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'text-slate-600 bg-white/5'
                          }`}
                        >
                          {t.auditStatus || 'Pending'}
                        </button>
                        {activeMenuId === t.id && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full z-[70] mt-1 w-32 bg-slate-900 border border-white/10 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-3xl">
                            <button onClick={() => handleStatusUpdate(t.id, 'verified')} className="w-full px-5 py-3 text-[9px] font-black uppercase tracking-widest text-left hover:bg-emerald-500/10 text-emerald-500">Verify</button>
                            <button onClick={() => handleStatusUpdate(t.id, 'flagged')} className="w-full px-5 py-3 text-[9px] font-black uppercase tracking-widest text-left hover:bg-amber-500/10 text-amber-500">Flag</button>
                            <button onClick={() => handleStatusUpdate(t.id, 'pending')} className="w-full px-5 py-3 text-[9px] font-black uppercase tracking-widest text-left hover:bg-white/5 text-slate-500">Reset</button>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-10">
                          <span className="text-8xl">🌫️</span>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">No records found in this universe</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 h-fit sticky top-10">
          <TransactionForm onAdd={onAdd} onBulkAdd={onBulkAdd} />
        </div>
      </div>
    </div>
  );
};

export default HistoricalLedger;
