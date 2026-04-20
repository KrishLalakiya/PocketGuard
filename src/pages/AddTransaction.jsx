import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTransactions } from '../hooks/useTransactions';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Must be positive').required('Amount is required'),
  type: yup.string().oneOf(['income', 'expense']).required('Type is required'),
  category: yup.string().required('Category is required'),
  date: yup.string().required('Date is required'),
  notes: yup.string(),
  recurring: yup.boolean()
});

const expenseCategories = ["🛍️ Shopping", "🍔 Food", "🚌 Transport", "🎮 Fun", "📚 Utilities", "📽️ Entertainment", "🫀 Health", "💼 Investments", "⚙️ Other"];
const incomeCategories = ["💵 Salary", "🪙 Freelance", "💸 Investments", "💰 Pocket-Money", "🎁 Gift", "⚙️ Other"];

export const AddTransaction = () => {
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      recurring: false
    }
  });

  const selectedType = watch('type');
  const categories = selectedType === 'income' ? incomeCategories : expenseCategories;

  const onSubmit = (data) => {
    addTransaction(data);
    toast.success('Transaction added successfully!');
    navigate('/transactions');
  };

  return (
    <div className="add-transaction-page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="title">Add Transaction</h1>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <label style={{ flex: 1, padding: '15px', textAlign: 'center', background: selectedType === 'expense' ? 'rgba(255, 117, 76, 0.15)' : 'rgba(255,255,255,0.05)', color: selectedType === 'expense' ? 'var(--danger)' : 'white', borderRadius: '12px', cursor: 'pointer', border: selectedType === 'expense' ? '1px solid var(--danger)' : '1px solid transparent' }}>
              <input type="radio" value="expense" {...register('type')} style={{ display: 'none' }} />
              Expense
            </label>
            <label style={{ flex: 1, padding: '15px', textAlign: 'center', background: selectedType === 'income' ? 'rgba(0, 210, 170, 0.15)' : 'rgba(255,255,255,0.05)', color: selectedType === 'income' ? 'var(--success)' : 'white', borderRadius: '12px', cursor: 'pointer', border: selectedType === 'income' ? '1px solid var(--success)' : '1px solid transparent' }}>
              <input type="radio" value="income" {...register('type')} style={{ display: 'none' }} />
              Income
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Title</label>
            <input className="form-input" placeholder="e.g. Netflix Subscription" {...register('title')} />
            {errors.title && <p className="text-danger" style={{ fontSize: '13px', marginTop: '5px' }}>{errors.title.message}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Amount</label>
            <input className="form-input" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
            {errors.amount && <p className="text-danger" style={{ fontSize: '13px', marginTop: '5px' }}>{errors.amount.message}</p>}
          </div>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Category</label>
              <select className="form-input" {...register('category')}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-danger" style={{ fontSize: '13px', marginTop: '5px' }}>{errors.category.message}</p>}
            </div>
            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Date</label>
              <input type="date" className="form-input" {...register('date')} />
              {errors.date && <p className="text-danger" style={{ fontSize: '13px', marginTop: '5px' }}>{errors.date.message}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
             <label className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
               <input type="checkbox" {...register('recurring')} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
               Mark as Recurring Expense (e.g. Monthly Subscriptions, Rent)
             </label>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Notes (Optional)</label>
            <textarea className="form-input" rows="3" placeholder="Any additional details..." {...register('notes')}></textarea>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '16px' }}>Save Transaction</button>
        </form>
      </div>
    </div>
  );
};
