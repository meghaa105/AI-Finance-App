
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

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatCategoryDisplay = (category: string) => {
    if (!category) return 'Other';
    const enumValues = Object.values(TransactionCategory);
    if (enumValues.includes(category as any)) return category;
    let formatted = category.replace(/[_-]/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    formatted = formatted.replace(/\bAnd\b/g, 'and');
    return formatted;
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500" onClick={() => setActiveMenuId(null)}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h2>
          <p className="text-slate-500 font-medium mt-1">Audit and manage the core historical database.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            {/* Control Bar */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="relative w-full md:w-80">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Search Ledger</label>
                  <input 
                    type="text"
                    placeholder="Search merchant or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Transaction Type</label>
                  <div className="flex bg-slate-200/50 p-1 rounded-xl shrink-0 border border-slate-200/50 shadow-inner">
                    {(['all', 'expense', 'income'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFilter(opt)}
                        className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          filter === opt ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Filters Row */}
              <div className="flex flex-wrap items-end gap-6 pt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Start Date</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">End Date</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>
                {(startDate || endDate) && (
                  <button 
                    onClick={clearDates}
                    className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl hover:bg-rose-100 transition-all mb-[1px]"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto min-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5 border-b border-slate-100">Date</th>
                    <th className="px-8 py-5 border-b border-slate-100">Type</th>
                    <th className="px-8 py-5 border-b border-slate-100">Status</th>
                    <th className="px-8 py-5 border-b border-slate-100">Merchant</th>
                    <th className="px-8 py-5 border-b border-slate-100 text-right">Volume</th>
                    <th className="px-8 py-5 border-b border-slate-100"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length > 0 ? filteredTransactions.map((t, idx) => (
                    <tr 
                      key={t.id} 
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} 
                        hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:z-10
                        transition-all duration-200 group relative border-l-4 border-l-transparent hover:border-l-blue-600 cursor-default`}
                    >
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600 transition-colors">{t.date}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block whitespace-nowrap ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {formatCategoryDisplay(t.category)}
                        </span>
                      </td>
                      <td className="px-8 py-6 relative">
                        <div 
                          className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === t.id ? null : t.id); }}
                        >
                          {t.auditStatus === 'verified' ? (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[8px] font-black uppercase tracking-tighter border border-emerald-200">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                              Verified
                            </span>
                          ) : t.auditStatus === 'flagged' ? (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[8px] font-black uppercase tracking-tighter border border-amber-200">
                              Flagged
                            </span>
                          ) : (
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                              Pending
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3"/></svg>
                            </span>
                          )}
                        </div>
                        {activeMenuId === t.id && (
                          <div className="absolute left-8 top-full z-[60] mt-1 w-32 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                            <button onClick={() => handleStatusUpdate(t.id, 'verified')} className="w-full px-4 py-2 text-[10px] font-bold text-left hover:bg-emerald-50 text-emerald-600">Verify</button>
                            <button onClick={() => handleStatusUpdate(t.id, 'flagged')} className="w-full px-4 py-2 text-[10px] font-bold text-left hover:bg-amber-50 text-amber-600">Flag</button>
                            <button onClick={() => handleStatusUpdate(t.id, 'pending')} className="w-full px-4 py-2 text-[10px] font-bold text-left hover:bg-slate-50 text-slate-500">Reset</button>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t.description}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`text-sm font-black tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-rose-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500">No transactions match your audit parameters</p>
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
