import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCurrency } from '../hooks/useCurrency';
import { useDebounce } from '../hooks/useDebounce';
import { MdDelete, MdSearch, MdEdit, MdDownload } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useSearchParams, Link } from 'react-router-dom';

export const Transactions = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    let result = transactions;

    // Search
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lower) || 
        (t.notes && t.notes.toLowerCase().includes(lower))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'amount') return parseFloat(b.amount) - parseFloat(a.amount);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0;
    });

    return result;
  }, [transactions, debouncedSearch, filterType, sortBy]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
      toast.success("Transaction deleted!");
    }
  };

  const exportCSV = () => {
    if (filteredData.length === 0) {
      return toast.warn("No transactions to export");
    }
    const headers = ['Date', 'Type', 'Title', 'Category', 'Amount', 'Recurring', 'Notes'];
    let content = headers.join(',') + '\n';
    
    filteredData.forEach(txn => {
      const row = [
        txn.date, txn.type, `"${txn.title}"`, `"${txn.category}"`, txn.amount, txn.recurring ? 'Yes' : 'No', `"${txn.notes || ''}"`
      ];
      content += row.join(',') + '\n';
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported!");
  };

  return (
    <div className="transactions-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="title" style={{ margin: 0 }}>Transactions</h1>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/transactions/new" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
             + Add Transaction
          </Link>

          <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center' }} onClick={exportCSV}>
             <MdDownload style={{ marginRight: '5px' }} size={20} /> Export CSV
          </button>
          
          <select 
            className="form-input" 
            style={{ width: '150px' }}
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select 
            className="form-input" 
            style={{ width: '150px' }}
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MdSearch size={22} className="text-muted" />
        <input 
          type="text" 
          placeholder="Search by title or notes..." 
          style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '15px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '15px' }}>Date</th>
                <th style={{ padding: '15px' }}>Title</th>
                <th style={{ padding: '15px' }}>Category</th>
                <th style={{ padding: '15px' }}>Notes</th>
                <th style={{ padding: '15px' }}>Amount</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map(txn => (
                <tr key={txn.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '15px' }}>{txn.date}</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {txn.recurring && <span style={{ background: 'var(--primary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Recurring</span>}
                      {txn.title}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>{txn.category}</td>
                  <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{txn.notes || '-'}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: txn.type === 'income' ? 'var(--success)' : 'white' }}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button className="btn-danger" onClick={() => handleDelete(txn.id)}>
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                     No transactions found.
                   </td>
                </tr>
              )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
