import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import { useTransactions } from './useTransactions';

export const useGoals = () => {
  const context = useContext(FinanceContext);
  const { totalIncome, totalExpense } = useTransactions();

  if (!context) {
    throw new Error('useGoals must be used within a FinanceProvider');
  }

  const { goals, addGoal, updateGoal, deleteGoal } = context;

  // Monthly Savings Potential (AI factor)
  const monthlySavingsPotential = useMemo(() => {
     return Math.max(0, totalIncome - totalExpense);
  }, [totalIncome, totalExpense]);

  const totalSaved = useMemo(() => {
     return goals.reduce((sum, g) => sum + parseFloat(g.current || 0), 0);
  }, [goals]);

  const totalTarget = useMemo(() => {
     return goals.reduce((sum, g) => sum + parseFloat(g.target || 0), 0);
  }, [goals]);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    totalSaved,
    totalTarget,
    monthlySavingsPotential
  };
};
