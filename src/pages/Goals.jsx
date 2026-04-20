import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useCurrency } from '../hooks/useCurrency';
import { MdAddCircle, MdCheckCircle, MdWarning, MdSchedule, MdArchive, MdAdd, MdTrackChanges } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const getGoalColor = (percent) => {
   if (percent >= 100) return '#00d2aa';
   if (percent >= 50) return '#f1c40f';
   return '#6c5dd3';
};

export const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal, totalSaved, totalTarget, monthlySavingsPotential } = useGoals();
  const { formatCurrency } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const countCompleted = goals.filter(g => (g.current / g.target) >= 1).length;
  const countActive = goals.length - countCompleted;

  const onAddSubmit = (data) => {
    addGoal({
      name: data.name,
      target: parseFloat(data.target),
      current: parseFloat(data.current || 0),
      color: data.color
    });
    toast.success("Goal added!");
    setIsAdding(false);
    reset();
  };

  const handleDeposit = (id) => {
    const amt = prompt("Enter amount to deposit:");
    if (amt && !isNaN(parseFloat(amt)) && parseFloat(amt) > 0) {
      const goal = goals.find(g => g.id === id);
      updateGoal(id, goal.current + parseFloat(amt));
      toast.success("Deposit successful!");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Archive this goal?")) {
      deleteGoal(id);
      toast.success("Goal archived.");
    }
  };

  return (
    <div className="goals-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="title" style={{ margin: 0 }}>Savings Goals</h1>
        <button className="btn-primary" onClick={() => setIsAdding(!isAdding)}>
          <MdAddCircle style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          {isAdding ? 'Cancel' : 'Create Goal'}
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: '30px' }}>
        <div className="card">
          <p className="text-muted">Total Saved</p>
          <h2 style={{ fontSize: '28px', marginTop: '10px' }}>{formatCurrency(totalSaved)}</h2>
        </div>
        <div className="card">
          <p className="text-muted">Total Target</p>
          <h2 style={{ fontSize: '28px', marginTop: '10px' }}>{formatCurrency(totalTarget)}</h2>
        </div>
        <div className="card">
          <p className="text-muted">Goal Health</p>
          <h2 style={{ fontSize: '20px', marginTop: '10px' }}>
             <span className="text-success">{countCompleted} Complete</span> <span className="text-muted" style={{ fontSize: '15px' }}>• {countActive} Active</span>
          </h2>
        </div>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '30px', border: '1px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '15px' }}>New Savings Goal</h3>
          <form onSubmit={handleSubmit(onAddSubmit)} className="grid-3">
             <div>
                <input className="form-input" placeholder="Goal Name (e.g. New Car)" {...register('name', { required: true })} />
             </div>
             <div>
                <input className="form-input" type="number" placeholder="Target Amount" {...register('target', { required: true })} />
             </div>
             <div>
                <input className="form-input" type="number" placeholder="Initial Saved (Optional)" {...register('current')} />
             </div>
             <div>
                <select className="form-input" {...register('color', { required: true })}>
                  <option value="#6c5dd3">Purple</option>
                  <option value="#00d2aa">Green</option>
                  <option value="#ff754c">Orange</option>
                  <option value="#3f8cff">Blue</option>
                </select>
             </div>
             <button type="submit" className="btn-primary">Save Goal</button>
          </form>
        </div>
      )}

      <div className="grid-2">
        {goals.map(g => {
          const rawPercent = g.target > 0 ? (g.current / g.target) * 100 : 0;
          const displayPercent = Math.round(rawPercent);
          const activeColor = getGoalColor(displayPercent);
          const diff = g.current - g.target;
          
          let insight = null;
          if (diff < 0) {
            if (monthlySavingsPotential > 0) {
                const monthsToGoal = Math.ceil(Math.abs(diff) / monthlySavingsPotential);
                insight = <span style={{ color: 'var(--text-white)' }}><MdSchedule /> Reach in ~{monthsToGoal} mo. at current pace</span>;
            } else {
                insight = <span className="text-danger"><MdWarning /> Improve cash flow to reach faster</span>;
            }
          } else {
            insight = <span className="text-success" style={{ color: activeColor }}><MdCheckCircle /> Completed!</span>;
          }

          return (
            <div className="card" key={g.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#1c1c24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <MdTrackChanges size={24} color={activeColor} />
                   </div>
                   <div>
                     <h3 style={{ margin: 0 }}>{g.name}</h3>
                     <small className="text-muted">Target: {formatCurrency(g.target)}</small>
                   </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: 0, color: activeColor }}>{displayPercent}%</h3>
                  {displayPercent >= 100 && <span style={{ fontSize: '12px', color: activeColor }}>Completed!</span>}
                </div>
              </div>

              <div style={{ height: '10px', background: '#25252b', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                 <div style={{ height: '100%', width: `${Math.min(100, displayPercent)}%`, background: activeColor }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500', marginBottom: '15px' }}>
                 <span>{formatCurrency(g.current)} Saved</span>
                 <span className="text-muted" style={{ color: displayPercent >= 100 ? activeColor : 'var(--text-muted)' }}>
                    {diff >= 0 ? `${formatCurrency(diff)} over target` : `${formatCurrency(Math.abs(diff))} left`}
                 </span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 {insight}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                 <button className="btn-primary" style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }} onClick={() => handleDeposit(g.id)}>
                   <MdAdd /> Deposit
                 </button>
                 <button className="btn-danger" style={{ padding: '10px 15px' }} onClick={() => handleDelete(g.id)}>
                   <MdArchive />
                 </button>
              </div>
            </div>
          )
        })}
        {goals.length === 0 && !isAdding && (
           <p className="text-muted">No goals created yet. Set a savings target to begin!</p>
        )}
      </div>
    </div>
  );
};
