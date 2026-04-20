import React, { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { useCurrency } from '../hooks/useCurrency';
import { MdEdit, MdAdd, MdRefresh } from 'react-icons/md';

const CategoryIcons = {
  Shopping: '🛍️', Food: '🍔', Transport: '🚌', Fun: '🎮', 
  Utilities: '🔌', Entertainment: '📽️', Health: '💊', Investments: '💼', Other: '⚙️'
};

export const Budget = () => {
  const { totalBudget, currentMonthExpenses, remainingBudget, percentageUsed, categoryLimits, categoryExpenses, updateCategoryLimit } = useBudget();
  const { formatCurrency } = useCurrency();

  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');

  const categories = Object.keys(categoryLimits);

  const handleSaveLimit = (cat) => {
     updateCategoryLimit(cat, editValue);
     setEditingCategory(null);
  };

  const handleResetAll = () => {
     if (window.confirm('Are you sure you want to revert all category limits to zero?')) {
        categories.forEach(cat => updateCategoryLimit(cat, null));
     }
  };

  return (
    <div className="budget-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
         <h1 className="title" style={{ margin: 0 }}>Budget Planner</h1>
         <button className="btn-secondary" style={{ background: 'rgba(255, 117, 76, 0.1)', color: '#ff754c', border: '1px solid rgba(255,117,76,0.2)', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }} onClick={handleResetAll}>
            <MdRefresh size={16} /> Reset All
         </button>
      </div>

      {/* Main Budget Card */}
      <div className="card" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px' }}>
         <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Monthly Budget</div>
            <h1 style={{ fontSize: '38px', margin: '0 0 15px 0', color: 'white' }}>{formatCurrency(totalBudget)}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
               Spent: <span style={{ color: 'white' }}>{formatCurrency(currentMonthExpenses)}</span> • Remaining: <span style={{ color: remainingBudget < 0 ? '#ff754c' : '#ff754c' }}>{remainingBudget < 0 ? '-' : ''}{formatCurrency(Math.abs(remainingBudget))}</span>
            </div>
         </div>
         {/* Circular Gauge */}
         <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', background: `conic-gradient(#ff754c ${percentageUsed}%, #25252b 0)`, border: '4px solid #18181c' }}>
            <div style={{ position: 'absolute', inset: '6px', background: '#1c1c24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
               {Math.round(percentageUsed)}%
            </div>
         </div>
      </div>

      {/* Category Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
         {categories.map(cat => {
            const limit = categoryLimits[cat];
            const spent = categoryExpenses[cat];
            const hasLimit = limit !== null && limit > 0;
            
            const pctUsed = hasLimit ? Math.min((spent / limit) * 100, 100) : (spent > 0 ? 100 : 0);
            const pctLeft = hasLimit ? Math.max(100 - pctUsed, 0) : (spent > 0 ? 0 : 100);
            const overAmt = hasLimit && spent > limit ? spent - limit : null;

            return (
               <div key={cat} className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                           {CategoryIcons[cat] || '🏷️'}
                        </div>
                        <div>
                           <h3 style={{ margin: 0, fontSize: '16px' }}>{cat}</h3>
                           <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{hasLimit ? formatCurrency(limit) : 'No Limit'}</div>
                        </div>
                     </div>
                     <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '6px' }} onClick={() => { setEditingCategory(cat); setEditValue(hasLimit ? limit : ''); }}>
                           <MdAdd size={16} />
                        </button>
                        <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '6px' }} onClick={() => { setEditingCategory(cat); setEditValue(hasLimit ? limit : ''); }}>
                           <MdEdit size={16} />
                        </button>
                     </div>
                  </div>

                  {editingCategory === cat ? (
                     <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input type="number" className="form-input" style={{ width: '100%', padding: '8px 12px' }} placeholder="Set limit..." value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                        <button className="btn-primary" style={{ padding: '8px 15px', borderRadius: '8px' }} onClick={() => handleSaveLimit(cat)}>Save</button>
                        <button className="btn-secondary" style={{ padding: '8px 15px', borderRadius: '8px' }} onClick={() => setEditingCategory(null)}>Cancel</button>
                     </div>
                  ) : null}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>
                     <span style={{ color: 'white' }}>{formatCurrency(spent)} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>spent</span></span>
                     <span style={{ color: 'var(--text-muted)' }}>{Math.round(pctLeft)}% Left</span>
                  </div>

                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                     <div style={{ width: `${pctUsed}%`, height: '100%', background: overAmt ? '#ff754c' : (hasLimit ? '#ff754c' : 'rgba(255,255,255,0.1)') }}></div>
                  </div>

                  <div style={{ fontSize: '13px', color: overAmt ? '#ff754c' : 'var(--text-muted)' }}>
                     {hasLimit ? (overAmt ? `Over by ${formatCurrency(overAmt)}` : '') : 'Set a limit to track'}
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );
};
