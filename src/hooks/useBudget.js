import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useBudget = () => {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useBudget must be used within a FinanceProvider');
  }

  const { transactions, budget, updateCategoryLimit } = context;

  const { totalBudget, categoryExpenses, currentMonthExpenses } = useMemo(() => {
    const limits = budget?.categoryLimits || {};
    
    let tBudget = 0;
    Object.values(limits).forEach(val => {
       if (val !== null && !isNaN(val)) tBudget += val;
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expensesDict = {
        Shopping: 0, Food: 0, Transport: 0, Fun: 0, Utilities: 0, Entertainment: 0, Health: 0, Investments: 0, Other: 0
    };

    let tExpenses = 0;

    transactions.forEach(t => {
       if (t.type === 'expense') {
          const d = new Date(t.date);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
             const amt = parseFloat(t.amount);
             if (expensesDict[t.category] !== undefined) {
                 expensesDict[t.category] += amt;
             } else {
                 expensesDict.Other += amt;
             }
             tExpenses += amt;
          }
       }
    });

    return {
       totalBudget: tBudget,
       categoryExpenses: expensesDict,
       currentMonthExpenses: tExpenses
    };
  }, [transactions, budget]);

  const remainingBudget = totalBudget - currentMonthExpenses;
  const percentageUsed = totalBudget > 0 
      ? Math.min((currentMonthExpenses / totalBudget) * 100, 100)
      : (currentMonthExpenses > 0 ? 100 : 0);

  return {
    totalBudget,
    updateCategoryLimit,
    currentMonthExpenses,
    remainingBudget,
    percentageUsed,
    categoryLimits: budget?.categoryLimits || {},
    categoryExpenses
  };
};
