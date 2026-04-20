import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useInvestments = () => {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useInvestments must be used within a FinanceProvider');
  }

  const { investments, addInvestment, updateInvestment, deleteInvestment } = context;

  const totalInvested = useMemo(() => {
     return investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  }, [investments]);

  const totalValue = useMemo(() => {
     return investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue || 0), 0);
  }, [investments]);

  const totalGainLoss = totalValue - totalInvested;
  
  const totalROI = totalInvested > 0 
     ? ((totalGainLoss / totalInvested) * 100).toFixed(2) 
     : 0;

  return {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    totalInvested,
    totalValue,
    totalGainLoss,
    totalROI
  };
};
