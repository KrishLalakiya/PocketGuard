import React, { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCurrency } from '../hooks/useCurrency';
import { useBudget } from '../hooks/useBudget';
import { useGoals } from '../hooks/useGoals';
import { Link, useNavigate } from 'react-router-dom';
import { MdArrowUpward, MdArrowDownward, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const getGoalColor = (percent) => {
   if (percent >= 100) return '#00d2aa';
   if (percent >= 50) return '#f1c40f';
   return '#6c5dd3';
};

export const Dashboard = () => {
  const { transactions, balance, totalIncome, totalExpense } = useTransactions();
  const { formatCurrency } = useCurrency();
  const { monthlyBudget, percentageUsed } = useBudget();
  const { goals } = useGoals();
  const navigate = useNavigate();

  // Carousel Logic for Goals
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  useEffect(() => {
    if (goals.length <= 1) return;
    const interval = setInterval(() => {
       setCurrentGoalIndex(prev => (prev + 1) % goals.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [goals]);

  const rotateGoal = (dir) => {
    if (goals.length === 0) return;
    let newIdx = currentGoalIndex + dir;
    if (newIdx < 0) newIdx = goals.length - 1;
    if (newIdx >= goals.length) newIdx = 0;
    setCurrentGoalIndex(newIdx);
  };

  const activeGoal = goals[currentGoalIndex] || null;

  // Chart Logic
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += parseFloat(t.amount);
      } else {
        acc.push({ name: t.category, value: parseFloat(t.amount) });
      }
      return acc;
    }, []);

  const COLORS = ['#6c5dd3', '#00d2aa', '#ff754c', '#3f8cff', '#f1c40f', '#e74c3c'];

  const currentYear = new Date().getFullYear();
  const yearlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      Expense: 0,
      Income: 0
  }));

  transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === currentYear) {
          if (t.type === 'expense') {
              yearlyData[d.getMonth()].Expense += parseFloat(t.amount);
          } else {
              yearlyData[d.getMonth()].Income += parseFloat(t.amount);
          }
      }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* ----------------- TOP ROW ----------------- */}
      <div className="top-row" style={{ margin: 0 }}>
         
         {/* Balance Card Section */}
         <div className="card balance-card-top">
            <div className="balance-info-left">
               <small className="label-text">Total Balance</small>
               <div className="amount-row">
                  <h2 id="total-balance-display">{formatCurrency(balance)}</h2>
                  <span className="tag positive">
                     ↑ 0%
                  </span>
               </div>
            </div>
            <div className="balance-action-right">
               <Link to="/transactions/new" className="add-txn-btn compact-btn" style={{ textDecoration: 'none' }}>
                  + Add Transaction
               </Link>
            </div>
         </div>

         {/* Survival Card Section */}
         <div className="card survival-card">
            <div className="card-header" style={{ marginBottom: '10px' }}>
               <h3>Monthly Survival Status</h3>
               <span id="survival-text" style={{ fontWeight: '600' }}>{100 - Math.round(percentageUsed)}% Left</span>
            </div>

            <div className="progress-bg" style={{ height: '12px', background: '#25252b', borderRadius: '6px', width: '100%', marginBottom: '15px' }}>
               <div className="progress-bar" id="survival-bar" style={{ height: '100%', borderRadius: '6px', width: `${Math.max(0, 100 - percentageUsed)}%`, background: percentageUsed > 85 ? 'var(--danger)' : 'var(--success)' }}></div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
               <div style={{ fontStyle: '13px', color: '#808191' }}>
                  Target Budget: <span id="budget-display" style={{ color: 'white', fontWeight: '600' }}>{formatCurrency(monthlyBudget)}</span>
               </div>
               <button id="setBudgetBtn" onClick={() => navigate('/budget')} style={{ background: 'rgba(108, 93, 211, 0.1)', color: '#6c5dd3', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}>
                  Set Budget
               </button>
            </div>
         </div>
      </div>

      {/* ----------------- DASHBOARD GRID ----------------- */}
      <div className="dashboard-grid">
         
         {/* Left Column */}
         <div className="left-column">
            
            <div className="card actions-card">
               <div className="middle-stats-row">
                  <div className="card mid-card balance-month">
                     <small className="text-muted" style={{ fontSize: '14px' }}>Your Net Balance for this Month</small>
                     <div className="mid-amount-wrapper">
                        <h3 id="monthly-balance-display">{formatCurrency(balance)}</h3>
                        <span id="monthly-balance-percent" className="tag positive mini">↑ 0%</span>
                     </div>
                  </div>

                  <div className="card mid-card income-month">
                     <div className="icon-circle down"><MdArrowDownward /></div>
                     <div className="mid-info">
                        <small className="text-muted">Income</small>
                        <h3 id="total-income-display">{formatCurrency(totalIncome)}</h3>
                        <span className="tag positive badge">0%</span>
                     </div>
                  </div>

                  <div className="card mid-card expense-month">
                     <div className="icon-circle up"><MdArrowUpward /></div>
                     <div className="mid-info">
                        <small className="text-muted">Expense</small>
                        <h3 id="total-expense-display">{formatCurrency(totalExpense)}</h3>
                        <span className="tag negative badge">0%</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card">
               <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Cash Flow Analytics</h3>
                  <div className="chart-legend" style={{ display: 'flex', gap: '15px' }}>
                     <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <div className="dot" style={{ background: '#6c5dd3', width: '8px', height: '8px', borderRadius: '50%' }}></div> Income
                     </div>
                     <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <div className="dot" style={{ background: '#3f8cff', width: '8px', height: '8px', borderRadius: '50%' }}></div> Expense
                     </div>
                  </div>
               </div>
               <div className="chart-container" style={{ position: 'relative', height: '250px', width: '100%', marginTop: '20px' }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#3f8cff" stopOpacity={0.4}/>
                                 <stop offset="95%" stopColor="#3f8cff" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                           <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                           <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                           <Tooltip contentStyle={{ background: '#18181c', border: 'none', borderRadius: '12px', color: 'white' }} itemStyle={{ color: 'white' }} formatter={(val) => `$${val}`} />
                           <Area type="monotone" dataKey="Expense" stroke="#3f8cff" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 6 }} />
                        </AreaChart>
                     </ResponsiveContainer>
               </div>
            </div>

         </div>

         {/* Right Column */}
         <div className="right-column">
            
            <div className="card">
               <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Spending</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>This Month ⌄</span>
               </div>
               <div className="spending-chart-wrapper" style={{ position: 'relative', height: '220px', width: '100%' }}>
                  {expenseData.length > 0 && (
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Tooltip content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                 return (
                                    <div style={{ background: '#111114', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                                       <div style={{ fontWeight: '700', marginBottom: '5px', fontSize: '14px' }}>{payload[0].name}</div>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                                          <div style={{ width: '14px', height: '14px', background: payload[0].payload.fill, border: '2px solid white', borderRadius: '2px' }}></div>
                                          {payload[0].value}
                                       </div>
                                    </div>
                                 );
                              }
                              return null;
                           }} />
                           <Pie data={[{value: 1}]} cx="50%" cy="50%" innerRadius={85} outerRadius={105} fill="#25252b" stroke="none" isAnimationActive={false} startAngle={90} endAngle={-270} />
                           <Pie data={expenseData} cx="50%" cy="50%" innerRadius={85} outerRadius={105} paddingAngle={2} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                              {expenseData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                  )}
                  <div className="spending-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                     <h3 id="spending-total" style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{formatCurrency(totalExpense).split('.')[0]}</h3>
                     <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Total Spent</p>
                  </div>
               </div>
               
               {/* ----------------- LEGEND ----------------- */}
               <div className="category-list" id="spending-legend" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {expenseData.map((entry, index) => (
                     <div key={`legend-${index}`} className="cat-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="square" style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[index % COLORS.length] }}></div>
                        {entry.name}
                     </div>
                  ))}
               </div>
            </div>

            <div className="card">
               <div className="savings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Savings Goal</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <MdChevronLeft style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px' }} onClick={() => rotateGoal(-1)} />
                     <MdChevronRight style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px' }} onClick={() => rotateGoal(1)} />
                  </div>
               </div>

               {activeGoal ? (
                  <div id="savings-goal-content">
                     <small className="text-muted" id="dash-goal-name">{activeGoal.name}</small>
                     <h2 className="savings-amount" id="dash-goal-amount" style={{ fontSize: '24px', margin: '10px 0', fontWeight: '700' }}>
                        {formatCurrency(activeGoal.current)} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>/ {formatCurrency(activeGoal.target)}</span>
                     </h2>
                     <div className="progress-bg" style={{ height: '10px', background: '#25252b', borderRadius: '5px', margin: '15px 0', overflow: 'hidden' }}>
                        <div className="progress-bar" id="dash-goal-bar" style={{ height: '100%', borderRadius: '5px', width: `${Math.min(100, Math.round((activeGoal.current/activeGoal.target)*100))}%`, background: getGoalColor(Math.round((activeGoal.current/activeGoal.target)*100)) }}></div>
                     </div>
                     <div className="savings-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span id="dash-goal-target">Target: {formatCurrency(activeGoal.target)}</span>
                        <span id="dash-goal-percent" style={{ color: getGoalColor(Math.round((activeGoal.current/activeGoal.target)*100)) }}>{Math.min(100, Math.round((activeGoal.current/activeGoal.target)*100))}%</span>
                     </div>
                  </div>
               ) : (
                  <div id="savings-goal-content">
                     <small className="text-muted" id="dash-goal-name">No Goals Set</small>
                     <h2 className="savings-amount" id="dash-goal-amount" style={{ fontSize: '24px', margin: '10px 0', fontWeight: '700' }}>
                        $0.00 <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>/ $0.00</span>
                     </h2>
                     <div className="progress-bg" style={{ height: '10px', background: '#25252b', borderRadius: '5px', margin: '15px 0' }}></div>
                     <div className="savings-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span id="dash-goal-target">Target: -</span>
                        <span id="dash-goal-percent">0%</span>
                     </div>
                  </div>
               )}
            </div>

         </div>
      </div>
    </div>
  );
};
