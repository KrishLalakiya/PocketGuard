import { useContext, useEffect, useState } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import axios from 'axios';

// Basic currency formatter without conversion for simplicity, 
// using ExchangeRate-API for fetching current rates if required.
export const useCurrency = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useCurrency must be used within a FinanceProvider');
  }

  const { currency, setCurrency } = context;
  const [exchangeRates, setExchangeRates] = useState(null);

  // You can replace this API key with your own from exchangerate-api.com
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const fetchRates = async (baseCurrency = 'USD') => {
    try {
        // ExchangeRate-API free endpoint
        const response = await axios.get(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        if (response.data && response.data.rates) {
            setExchangeRates(response.data.rates);
        }
    } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
    }
  };

  useEffect(() => {
     fetchRates(currency);
  }, [currency]);

  return {
    currency,
    setCurrency,
    formatCurrency,
    exchangeRates
  };
};
