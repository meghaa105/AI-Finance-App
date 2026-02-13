
import React, { useState, useRef, useMemo } from 'react';
import { Transaction, TransactionCategory } from '../types';

interface TransactionFormProps {
  onAdd?: (transaction: Transaction) => void;
  onBulkAdd: (transactions: Transaction[]) => void;
}

type ImportStage = 'idle' | 'mapping' | 'preview';

interface MappingState {
  date: number;
  description: number;
  amount: number;
  type: number;
  category: number;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onBulkAdd }) => {
  // CSV Import State
  const [importStage, setImportStage] = useState<ImportStage>('idle');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<MappingState>({
    date: 0,
    description: 1,
    amount: 2,
    type: 3,
    category: 4
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single transaction form state
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: TransactionCategory.OTHER,
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income'
  });

  const parseCSVDate = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    // Clean quotes and spaces
    let cleanStr = dateStr.trim().replace(/^"|"$/g, '');
    
    // Handle DD-MM-YYYY (Common in Indian Bank CSVs)
    const dmyMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }

    // Fallback to standard JS parsing
    try {
      const date = new Date(cleanStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // Continue to fallback
    }
    
    return new Date().toISOString().split('T')[0];
  };

  const mapCategory = (cat: string): string => {
    const raw = cat?.trim() || '';
    const normalized = raw.toLowerCase().replace('_', ' ');
    
    // Check for enum matches first by name or label
    for (const [key, value] of Object.entries(TransactionCategory)) {
      if (value.toLowerCase() === normalized || key.toLowerCase() === normalized) return value;
    }

    // Specific mapping for common snake_case labels
    if (normalized === 'food dining') return TransactionCategory.FOOD;
    if (normalized === 'banking finance') return TransactionCategory.BANKING;
    if (normalized === 'sports fitness') return TransactionCategory.HEALTH;

    // Return properly formatted string if not in enum (types.ts allows string)
    return raw.charAt(0).toUpperCase() + raw.slice(1).replace('_', ' ');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        alert("CSV file seems empty or missing data.");
        return;
      }

      const parseLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
      };

      const headers = parseLine(lines[0]);
      const dataRows = lines.slice(1).map(line => parseLine(line));

      setCsvHeaders(headers);
      setCsvRows(dataRows);
      
      const newMapping = { ...mapping };
      headers.forEach((h, idx) => {
        const lower = h.toLowerCase();
        if (lower === 'date') newMapping.date = idx;
        if (lower.includes('desc')) newMapping.description = idx;
        if (lower === 'amount') newMapping.amount = idx;
        if (lower === 'type') newMapping.type = idx;
        if (lower === 'category') newMapping.category = idx;
      });
      setMapping(newMapping);
      setImportStage('mapping');
    };
    reader.readAsText(file);
  };

  const previewData = useMemo(() => {
    return csvRows.slice(0, 5).map(row => {
      const rawDateValue = row[mapping.date] || '';
      const parsedDate = parseCSVDate(rawDateValue);
      
      return {
        date: parsedDate,
        description: row[mapping.description] || 'N/A',
        amount: parseFloat((row[mapping.amount] || '0').replace(/[^0-9.]/g, '')),
        type: (row[mapping.type] || '').toLowerCase().includes('income') ? 'income' : 'expense' as 'income' | 'expense',
        category: mapCategory(row[mapping.category] || '')
      };
    });
  }, [csvRows, mapping]);

  const finalizeImport = () => {
    const finalTransactions: Transaction[] = csvRows.map(row => {
      const amountStr = (row[mapping.amount] || '0').replace(/[^0-9.]/g, '');
      const amount = parseFloat(amountStr);
      return {
        id: Math.random().toString(36).substr(2, 9),
        date: parseCSVDate(row[mapping.date] || ''),
        description: (row[mapping.description] || 'N/A').trim(),
        amount: isNaN(amount) ? 0 : amount,
        type: (row[mapping.type] || '').toLowerCase() === 'income' ? 'income' : 'expense' as 'income' | 'expense',
        category: mapCategory(row[mapping.category] || ''),
        auditStatus: 'pending'
      };
    });

    onBulkAdd(finalTransactions);
    setImportStage('idle');
    setCsvRows([]);
    setCsvHeaders([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert(`INGESTION_COMPLETE: ${finalTransactions.length} records processed.`);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    if (onAdd) {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
        type: formData.type,
        auditStatus: 'pending'
      });
      setFormData({
        amount: '',
        description: '',
        category: TransactionCategory.OTHER,
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
      setShowSingleForm(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-50 rounded-full opacity-50 transition-transform group-hover:scale-150 duration-700"></div>
      
      <div className="relative z-10">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Statement Ingestion</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Direct Data Stream</p>
          </div>
          <button 
            onClick={() => setShowSingleForm(!showSingleForm)}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showSingleForm ? 'BULK_UPLOAD' : 'MANUAL_ENTRY'}
          </button>
        </div>

        {!showSingleForm ? (
          <div className="space-y-6">
            {importStage === 'idle' && (
              <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center text-center transition-all hover:border-blue-300 hover:bg-blue-50/20 group/drop">
                <div className="w-16 h-16 bg-white shadow-xl shadow-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover/drop:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-800">Upload Data.csv</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports DD-MM-YYYY format</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  SELECT_SOURCE
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
              </div>
            )}

            {importStage === 'mapping' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 gap-4">
                  {(Object.keys(mapping) as Array<keyof MappingState>).map(key => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{key.toUpperCase()}_COL</label>
                      <select 
                        value={mapping[key]}
                        onChange={(e) => setMapping({...mapping, [key]: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                      >
                        {csvHeaders.map((h, i) => (
                          <option key={i} value={i}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setImportStage('preview')}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
                >
                  VERIFY_SYNC_PREVIEW
                </button>
              </div>
            )}

            {importStage === 'preview' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {previewData.map((p, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-800 truncate max-w-[150px]">{p.description}</span>
                        <span className="text-[8px] text-slate-400">{p.date} • {p.category}</span>
                      </div>
                      <span className={`text-xs font-black ${p.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                        {p.type === 'income' ? '+' : '-'}₹{p.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setImportStage('mapping')}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    RESET_MAPPING
                  </button>
                  <button 
                    onClick={finalizeImport}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
                  >
                    CONFIRM_INGESTION
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSingleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Amount (₹)</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'expense' | 'income'})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Description</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                placeholder="Merchant or label"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as TransactionCategory})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
              >
                {Object.values(TransactionCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              RECORD_ENTRY
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;
