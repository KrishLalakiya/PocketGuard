import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  // Load initial data from localStorage or set defaults
  const [transactions, setTransactions] = useState(() => {
    const localData = localStorage.getItem('pocketguard_transactions');
    return localData ? JSON.parse(localData) : [];
  });

  const [budget, setBudget] = useState(() => {
    const localData = localStorage.getItem('pocketguard_budget');
    const defaultData = {
      categoryLimits: {
        Shopping: null,
        Food: null,
        Transport: null,
        Fun: null,
        Utilities: null,
        Entertainment: null,
        Health: null,
        Investments: null,
        Other: null
      }
    };
    if (localData) {
       const parsed = JSON.parse(localData);
       if (parsed.monthlyBudget !== undefined && !parsed.categoryLimits) {
          return defaultData;
       }
       return parsed;
    }
    return defaultData;
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('pocketguard_currency_code') || 'USD';
  });

  const [goals, setGoals] = useState(() => {
    const localData = localStorage.getItem('pocketguard_goals');
    return localData ? JSON.parse(localData) : [];
  });

  const [investments, setInvestments] = useState(() => {
    const localData = localStorage.getItem('pocketguard_investments');
    return localData ? JSON.parse(localData) : [];
  });

  const [userProfile, setUserProfile] = useState(() => {
    const localData = localStorage.getItem('pocketguard_profile');
    return localData ? JSON.parse(localData) : { name: 'Alex Johnson', email: 'student@example.com', avatar: 'https://i.pravatar.cc/150?img=11' };
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('pocketguard_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pocketguard_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('pocketguard_currency_code', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('pocketguard_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('pocketguard_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('pocketguard_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateProfile = (profileData) => {
    setUserProfile((prev) => ({ ...prev, ...profileData }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setTransactions([]);
    setBudget({
      categoryLimits: { Shopping: null, Food: null, Transport: null, Fun: null, Utilities: null, Entertainment: null, Health: null, Investments: null, Other: null }
    });
    setCurrency('USD');
    setGoals([]);
    setInvestments([]);
    setUserProfile({ name: 'Alex Johnson', email: 'student@example.com', avatar: 'https://i.pravatar.cc/150?img=11' });
  };

  // Transaction Actions
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: uuidv4(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions((prev) =>
      prev.map((txn) => (txn.id === id ? { ...txn, ...updatedData } : txn))
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((txn) => txn.id !== id));
  };

  // Budget Actions
  const updateCategoryLimit = (category, limit) => {
    setBudget(prev => ({
      ...prev,
      categoryLimits: {
        ...prev.categoryLimits,
        [category]: limit === null || limit === '' ? null : parseFloat(limit)
      }
    }));
  };

  // Goal Actions
  const addGoal = (goal) => {
    const newGoal = { ...goal, id: uuidv4() };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const updateGoal = (id, currentSaved) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, current: currentSaved } : g))
    );
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Investment Actions
  const addInvestment = (inv) => {
    const newInv = { ...inv, id: uuidv4() };
    setInvestments((prev) => [newInv, ...prev]);
  };

  const updateInvestment = (id, updatedData) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updatedData } : inv))
    );
  };

  const deleteInvestment = (id) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        budget,
        updateCategoryLimit,
        currency,
        setCurrency,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        investments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        userProfile,
        updateProfile,
        resetAllData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
