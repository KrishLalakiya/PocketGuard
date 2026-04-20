const DB_KEY = 'pocketguard_db';

// Initialize DB if empty
export const initDB = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  }
};

// Get all data
export const getData = () => {
  return JSON.parse(localStorage.getItem(DB_KEY));
};

// Add a Transaction
export const addTransaction = (transaction) => {
  const data = getData();
  const newTx = { ...transaction, id: Date.now() }; // Simple unique ID
  data.transactions.push(newTx);
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  return data; // Return updated data to update State
};