
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction } from '../types';

interface ChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const DashboardCharts: React.FC<ChartsProps> = ({ transactions }) => {
  // Memoize category data calculation
  const { categoryData, totalExpense } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const data = expenses.reduce((acc: any[], curr) => {
      const existing = acc.find(a => a.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []);

    return { categoryData: data, totalExpense: total };
  }, [transactions]);

  // Memoize timeline data calculation
  const timelineData = useMemo(() => {
    return transactions.reduce((acc: any[], curr) => {
      const existing = acc.find(a => a.date === curr.date);
      if (existing) {
        if (curr.type === 'income') existing.income += curr.amount;
        else existing.expense += curr.amount;
      } else {
        acc.push({
          date: curr.date,
          income: curr.type === 'income' ? curr.amount : 0,
          expense: curr.type === 'expense' ? curr.amount : 0
        });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <h3 className="text-xl font-black mb-6 text-slate-900 tracking-tight">Expenses by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
                formatter={(value: number, name: string) => {
                  const percent = ((value / totalExpense) * 100).toFixed(1);
                  return [
                    <span className="text-slate-900">{formatCurrency(value)} ({percent}%)</span>,
                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">{name}</span>
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <h3 className="text-xl font-black mb-6 text-slate-900 tracking-tight">Cash Flow Timeline</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                fontSize={10} 
                tickMargin={10} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontWeight: 700 }}
              />
              <YAxis 
                fontSize={10} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontWeight: 700 }}
                tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
