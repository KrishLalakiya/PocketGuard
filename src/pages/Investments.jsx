import React, { useState } from 'react';
import { useInvestments } from '../hooks/useInvestments';
import { useCurrency } from '../hooks/useCurrency';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdDownload, MdAddCircle, MdEdit, MdDelete } from 'react-icons/md';

export const Investments = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment, totalInvested, totalValue, totalGainLoss, totalROI } = useInvestments();
  const { formatCurrency } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const handleAddSubmit = (data) => {
    if (editingId) {
      updateInvestment(editingId, {
        ...data,
        amount: parseFloat(data.amount),
        currentValue: parseFloat(data.currentValue)
      });
      toast.success("Investment updated!");
      setEditingId(null);
    } else {
      addInvestment({
        name: data.name,
        type: data.type,
        amount: parseFloat(data.amount),
        currentValue: parseFloat(data.currentValue),
        date: data.date,
        notes: data.notes || ''
      });
      toast.success("Investment added!");
    }
    setIsAdding(false);
    reset();
  };

  const handleEdit = (inv) => {
    setIsAdding(true);
    setEditingId(inv.id);
    reset({
      name: inv.name,
      type: inv.type,
      amount: inv.amount,
      currentValue: inv.currentValue,
      date: inv.date,
      notes: inv.notes
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this investment?")) {
       deleteInvestment(id);
       toast.success("Investment deleted.");
    }
  };

  const exportCSV = () => {
    if (investments.length === 0) {
      return toast.warn("No investments to export");
    }
    const headers = ['Asset Name', 'Type', 'Amount Invested', 'Current Value', 'Gain/Loss %', 'Date', 'Notes'];
    let content = headers.join(',') + '\n';
    
    investments.forEach(inv => {
      const gl = inv.amount > 0 ? (((inv.currentValue - inv.amount) / inv.amount) * 100).toFixed(2) : 0;
      const row = [
        `"${inv.name}"`, inv.type, inv.amount, inv.currentValue, gl, inv.date, `"${inv.notes || ''}"`
      ];
      content += row.join(',') + '\n';
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `investments_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export successful!");
  };

  return (
    <div className="investments-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="title" style={{ margin: 0 }}>Investment Portfolio</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={exportCSV}>
             <MdDownload style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => { setEditingId(null); reset({}); setIsAdding(!isAdding); }}>
            <MdAddCircle style={{ verticalAlign: 'middle', marginRight: '5px' }} />
            {isAdding ? 'Cancel' : 'Add Asset'}
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '30px' }}>
        <div className="card">
           <p className="text-muted">Total Invested</p>
           <h2 style={{ fontSize: '28px', marginTop: '10px' }}>{formatCurrency(totalInvested)}</h2>
        </div>
        <div className="card">
           <p className="text-muted">Current Value</p>
           <h2 style={{ fontSize: '28px', marginTop: '10px' }}>{formatCurrency(totalValue)}</h2>
        </div>
        <div className="card">
           <p className="text-muted">Overall Return</p>
           <h2 className={totalGainLoss >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '20px', marginTop: '10px' }}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({totalROI >= 0 ? '+' : ''}{totalROI}%)
           </h2>
        </div>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '30px', border: '1px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '15px' }}>{editingId ? 'Edit Asset' : 'New Asset'}</h3>
          <form onSubmit={handleSubmit(handleAddSubmit)} className="grid-3">
             <input className="form-input" placeholder="Asset Name (e.g. AAPL)" {...register('name', { required: true })} />
             <select className="form-input" {...register('type', { required: true })}>
                <option value="Stock">Stock</option>
                <option value="Crypto">Crypto</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Mutual Fund">Mutual Fund</option>
                <option value="Other">Other</option>
             </select>
             <input className="form-input" type="number" step="0.01" placeholder="Amount Invested" {...register('amount', { required: true })} />
             <input className="form-input" type="number" step="0.01" placeholder="Current Value" {...register('currentValue', { required: true })} />
             <input className="form-input" type="date" {...register('date', { required: true })} defaultValue={new Date().toISOString().split('T')[0]} />
             <button type="submit" className="btn-primary" style={{ gridColumn: 'span 1' }}>Save Asset</button>
          </form>
        </div>
      )}

      <div className="card">
         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '15px' }}>Asset</th>
                <th style={{ padding: '15px' }}>Type</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Invested</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Value</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Return</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
               {investments.length > 0 ? investments.map(inv => {
                 const gl = inv.currentValue - inv.amount;
                 const glp = inv.amount > 0 ? ((gl / inv.amount) * 100).toFixed(2) : 0;
                 return (
                   <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{inv.name}</td>
                      <td style={{ padding: '15px' }}>{inv.type}</td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>{formatCurrency(inv.amount)}</td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>{formatCurrency(inv.currentValue)}</td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }} className={gl >= 0 ? 'text-success' : 'text-danger'}>
                         {gl >= 0 ? '+' : ''}{formatCurrency(gl)}<br/><small>{gl >= 0 ? '+' : ''}{glp}%</small>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                         <button className="btn-icon" onClick={() => handleEdit(inv)}><MdEdit /></button>
                         <button className="btn-icon text-danger" style={{ marginLeft: '10px' }} onClick={() => handleDelete(inv.id)}><MdDelete /></button>
                      </td>
                   </tr>
                 )
               }) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No investments recorded yet.</td></tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
