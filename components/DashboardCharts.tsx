import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction } from '../types';

interface ChartsProps {
  transactions: Transaction[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = payload[0].payload.fill || COLORS[0];
    return (
      <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.name}</span>
          <span className="text-sm font-black text-white">₹{data.value.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardCharts: React.FC<ChartsProps> = ({ transactions }) => {
  // Memoize category data calculation - Ensure we only count expenses
  const { categoryData, totalExpense } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryMap: Record<string, number> = {};
    expenses.forEach(t => {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    const data = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    return { 
      categoryData: data.sort((a, b) => b.value - a.value), 
      totalExpense: total 
    };
  }, [transactions]);

  // Memoize timeline data calculation
  const timelineData = useMemo(() => {
    const dailyMap: Record<string, { date: string, income: number, expense: number }> = {};
    
    transactions.forEach(curr => {
      if (!dailyMap[curr.date]) {
        dailyMap[curr.date] = { date: curr.date, income: 0, expense: 0 };
      }
      if (curr.type === 'income') dailyMap[curr.date].income += curr.amount;
      else dailyMap[curr.date].expense += curr.amount;
    });

    return Object.values(dailyMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all hover:border-white/10 group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Category Split</h3>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expense Concentration</span>
        </div>
        <div className="h-72">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <span className="text-5xl mb-4">📉</span>
               <p className="text-[10px] font-black uppercase tracking-widest">No Expense Data</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all hover:border-white/10 group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Cash Velocity</h3>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Flow Timeline</span>
        </div>
        <div className="h-72">
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  fontSize={9} 
                  tickMargin={12} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontWeight: 900 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  fontSize={9} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontWeight: 900 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                  contentStyle={{ 
                    backgroundColor: '#020617',
                    borderRadius: '1.5rem', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={16} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <span className="text-5xl mb-4">📊</span>
               <p className="text-[10px] font-black uppercase tracking-widest">No Timeline Data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;