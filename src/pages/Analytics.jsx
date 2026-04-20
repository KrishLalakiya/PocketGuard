import React, { useMemo, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCurrency } from '../hooks/useCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MdSavings } from 'react-icons/md';

export const Analytics = () => {
  const { transactions } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  const { monthlyData, stats } = useMemo(() => {
     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
     const data = months.map(m => ({ name: m, income: 0, expense: 0, net: 0 }));
     
     let totalInc = 0;
     let totalExp = 0;
     
     transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === selectedYear) {
           const mIdx = d.getMonth();
           const amt = parseFloat(t.amount);
           if (t.type === 'income') {
              data[mIdx].income += amt;
              totalInc += amt;
           } else {
              data[mIdx].expense += amt;
              totalExp += amt;
           }
        }
     });

     let maxIncMonth = null;
     let maxIncVal = 0;
     let maxExpMonth = null;
     let maxExpVal = 0;
     
     let activeMonths = 0;

     data.forEach(m => {
        m.net = m.income - m.expense;
        if (m.income > maxIncVal) { maxIncVal = m.income; maxIncMonth = m.name; }
        if (m.expense > maxExpVal) { maxExpVal = m.expense; maxExpMonth = m.name; }
        if (m.income > 0 || m.expense > 0) activeMonths++;
     });

     const netVal = totalInc - totalExp;
     const savingsRate = totalInc > 0 ? ((netVal / totalInc) * 100).toFixed(0) : 0;
     const avgInc = activeMonths > 0 ? (totalInc / activeMonths) : 0;
     const avgExp = activeMonths > 0 ? (totalExp / activeMonths) : 0;

     return {
        monthlyData: data,
        stats: {
           totalIncome: totalInc,
           totalExpense: totalExp,
           net: netVal,
           savingsRate,
           highestEarning: maxIncMonth ? `${maxIncMonth} (${formatCurrency(maxIncVal)})` : '- ($--)',
           highestSpending: maxExpMonth ? `${maxExpMonth} (${formatCurrency(maxExpVal)})` : '- ($--)',
           avgIncome: avgInc,
           avgExpense: avgExp
        }
     }
  }, [transactions, selectedYear, formatCurrency]);

  const dailyData = useMemo(() => {
     if (!selectedMonth) return [];
     const monthIdx = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(selectedMonth);
     const daysInMonth = new Date(selectedYear, monthIdx + 1, 0).getDate();
     
     const data = Array.from({length: daysInMonth}, (_, i) => ({
        day: i + 1,
        income: 0,
        expense: 0
     }));

     transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === selectedYear && d.getMonth() === monthIdx) {
           const dayIdx = d.getDate() - 1;
           if (t.type === 'income') data[dayIdx].income += parseFloat(t.amount);
           else data[dayIdx].expense += parseFloat(t.amount);
        }
     });
     return data;
  }, [transactions, selectedYear, selectedMonth]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#18181c', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '12px' }}>
          <p style={{ margin: 0, marginBottom: '8px', color: 'white', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
             <p key={index} style={{ color: entry.fill, margin: '4px 0', fontSize: '14px' }}>
                {entry.name}: {formatCurrency(entry.value)}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-page">
      <h1 className="title" style={{ marginBottom: '30px' }}>Cash Flow Analytics</h1>

      {/* TOP METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
         <div className="card" style={{ padding: '20px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Total Income</span>
            <h2 style={{ margin: 0, fontSize: '26px' }}>{formatCurrency(stats.totalIncome)}</h2>
         </div>
         <div className="card" style={{ padding: '20px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Total Expenses</span>
            <h2 style={{ margin: 0, fontSize: '26px' }}>{formatCurrency(stats.totalExpense)}</h2>
         </div>
         <div className="card" style={{ padding: '20px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Net Cash Flow</span>
            <h2 style={{ margin: 0, fontSize: '26px', color: stats.net >= 0 ? (stats.net === 0 ? 'white' : '#00d2aa') : '#ff754c' }}>
               {stats.net < 0 ? '-' : ''}{formatCurrency(Math.abs(stats.net))}
            </h2>
            <span style={{ marginTop: '8px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', width: 'fit-content' }}>
               {stats.net > 0 ? 'Positive' : (stats.net < 0 ? 'Negative' : 'Neutral')}
            </span>
         </div>
         <div className="card" style={{ padding: '20px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            <MdSavings style={{ position: 'absolute', right: '20px', top: '25px', color: '#6c5dd3', opacity: 0.5 }} size={32} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Savings Rate</span>
            <h2 style={{ margin: 0, fontSize: '26px' }}>{stats.savingsRate}%</h2>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
         <div className="card" style={{ padding: '15px 20px', minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Highest Earning Month</span>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#00d2aa' }}>{stats.highestEarning}</div>
         </div>
         <div className="card" style={{ padding: '15px 20px', minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Highest Spending Month</span>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#ff754c' }}>{stats.highestSpending}</div>
         </div>
         <div className="card" style={{ padding: '15px 20px', minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Avg. Monthly Income</span>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{formatCurrency(stats.avgIncome)}</div>
         </div>
         <div className="card" style={{ padding: '15px 20px', minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Avg. Monthly Expense</span>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{formatCurrency(stats.avgExpense)}</div>
         </div>
      </div>

      {/* YEARLY CHART */}
      <div className="card" style={{ marginBottom: '30px', position: 'relative' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <h3 style={{ margin: 0 }}>Yearly Overview</h3>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '18px', height: '6px', background: '#6c5dd3', borderRadius: '4px' }}></div> Income</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '18px', height: '6px', background: '#ff754c', borderRadius: '4px' }}></div> Expense</div>
               </div>
               
               <select className="form-input" style={{ width: '100px', padding: '6px 15px', height: 'auto', background: '#222228', outline: 'none' }} value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2025}>2025</option>
               </select>
            </div>
         </div>
         
         <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#808191', fontSize: 13 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: '#808191', fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="income" name="Income" fill="#6c5dd3" radius={[4, 4, 0, 0]} cursor="pointer" barSize={35} onClick={(data) => { if(data && data.name) setSelectedMonth(data.name); }} />
                  <Bar dataKey="expense" name="Expense" fill="#ff754c" radius={[4, 4, 0, 0]} cursor="pointer" barSize={35} onClick={(data) => { if(data && data.name) setSelectedMonth(data.name); }} />
               </BarChart>
            </ResponsiveContainer>
         </div>
         <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: '20px 0 0 0' }}>
           👆 Click on any month bar to see daily breakdown
         </p>
      </div>

      {/* DAILY DRILL-DOWN CHART */}
      {selectedMonth && (
         <div className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
               <h3 style={{ margin: 0 }}>{selectedMonth} {selectedYear} - Daily Breakdown</h3>
               <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                   <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '18px', height: '6px', background: '#6c5dd3', borderRadius: '4px' }}></div> Income</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '18px', height: '6px', background: '#ff754c', borderRadius: '4px' }}></div> Expense</div>
                   </div>
                   <button onClick={() => setSelectedMonth(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>✕ Close</button>
               </div>
            </div>
            <div style={{ height: '350px' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis dataKey="day" tick={{ fill: '#808191', fontSize: 13 }} axisLine={false} tickLine={false} dy={10} />
                     <YAxis tick={{ fill: '#808191', fontSize: 13 }} axisLine={false} tickLine={false} dx={-10} />
                     <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                     <Bar dataKey="income" name="Income" fill="#6c5dd3" radius={[2, 2, 0, 0]} />
                     <Bar dataKey="expense" name="Expense" fill="#ff754c" radius={[2, 2, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      )}

    </div>
  );
};
