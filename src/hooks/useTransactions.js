import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useTransactions = () => {
  const context = useContext(FinanceContext);
  
  if (!context) {
    throw new Error('useTransactions must be used within a FinanceProvider');
  }

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = context;

  // Calculates total income
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [transactions]);

  // Calculates total expense
  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [transactions]);

  // Current balance
  const balance = totalIncome - totalExpense;

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
  };
};
