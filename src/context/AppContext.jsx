import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const AppContext = createContext(null);

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', emoji: '🍔' },
  { id: 'transport', name: 'Transport', emoji: '🚗' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎮' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'health', name: 'Health', emoji: '❤️' },
  { id: 'other', name: 'Other', emoji: '📦' },
];

const DEFAULT_ACCOUNTS = [
  { id: 'savings', name: 'Savings', emoji: '💰', type: 'Savings', balance: 0, active: false },
  { id: 'current', name: 'Current', emoji: '💳', type: 'Current', balance: 0, active: true },
];

function loadState(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch { return defaultValue; }
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  
  // App States
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [monthlyBudget, setMonthlyBudget] = useState(10000);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [isCategoryBudgetEnabled, setIsCategoryBudgetEnabled] = useState(false);
  const [inAppNotifs, setInAppNotifs] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Ref to prevent initial fetch from overwriting db with defaults
  const isFetched = useRef(false);

  // Fetch Data from Supabase
  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      setIsLoadingData(true);
      const { data, error } = await supabase.from('user_data').select('*').eq('id', user.id).single();
      if (data) {
        setExpenses(data.expenses || []);
        setAccounts((data.accounts && data.accounts.length > 0) ? data.accounts : DEFAULT_ACCOUNTS);
        setSubscriptions(data.subscriptions || []);
        setCategories((data.categories && data.categories.length > 0) ? data.categories : DEFAULT_CATEGORIES);
        setMonthlyBudget(data.monthly_budget || 10000);
        if (data.settings) {
          setDarkMode(data.settings.darkMode ?? false);
          setLanguage(data.settings.language ?? 'English');
          setNotificationsEnabled(data.settings.notificationsEnabled ?? true);
          setCategoryBudgets(data.settings.categoryBudgets || {});
          setIsCategoryBudgetEnabled(data.settings.isCategoryBudgetEnabled ?? false);
        }
      } else if (error && error.code === 'PGRST116') {
        // Row doesn't exist, create it
        await supabase.from('user_data').insert([{ id: user.id }]);
      }
      isFetched.current = true;
      setIsLoadingData(false);
    }
    fetchData();
  }, [user]);

  // Sync to Supabase when state changes
  useEffect(() => {
    if (!user || !isFetched.current) return;
    const updateDB = setTimeout(async () => {
      await supabase.from('user_data').update({
        expenses,
        accounts,
        subscriptions,
        categories,
        monthly_budget: monthlyBudget,
        settings: { darkMode, language, notificationsEnabled, categoryBudgets, isCategoryBudgetEnabled }
      }).eq('id', user.id);
    }, 1000); // Debounce to prevent spamming DB

    return () => clearTimeout(updateDB);
  }, [expenses, accounts, subscriptions, categories, monthlyBudget, darkMode, language, notificationsEnabled, categoryBudgets, isCategoryBudgetEnabled, user]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const addNotification = useCallback((title, body, icon = '🔔') => {
    setInAppNotifs(prev => {
      // Avoid duplicate notifications with same title/body within last 24hrs
      const isDup = prev.some(n => n.title === title && (Date.now() - n.id < 86400000));
      if (isDup) return prev;
      return [{ id: Date.now(), title, body, icon, read: false }, ...prev];
    });
  }, []);

  const clearNotifications = useCallback(() => setInAppNotifs([]), []);
  const markNotificationsAsRead = useCallback(() => {
    setInAppNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Check Subscription Notifications on Load
  useEffect(() => {
    if (isLoadingData) return; // Wait for data to load
    if (notificationsEnabled && subscriptions.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      subscriptions.forEach(sub => {
        const nextDate = new Date(sub.nextDate);
        nextDate.setHours(0,0,0,0);
        if (nextDate.getTime() === today.getTime()) {
          addNotification(`${sub.name} Due Today!`, `Your ${sub.name} bill for ₹${sub.amount} is due today.`, sub.emoji);
        } else if (nextDate.getTime() === tomorrow.getTime()) {
          addNotification(`${sub.name} Upcoming`, `Your ${sub.name} bill for ₹${sub.amount} is due tomorrow.`, sub.emoji);
        }
      });
    }
  }, [user, notificationsEnabled, subscriptions, addNotification]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const addExpense = useCallback((expense) => {
    const activeAcc = accounts.find(a => a.active) || accounts[0];
    const newExp = { 
      ...expense, 
      id: Date.now().toString(), 
      date: expense.date || new Date().toISOString(),
      accountId: expense.accountId || activeAcc?.id
    };
    
    // Check Budget Notification
    if (notificationsEnabled) {
      const now = new Date(newExp.date);
      const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const previousTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
      const totalSpent = previousTotal + newExp.amount;
      
      if (previousTotal <= monthlyBudget && totalSpent > monthlyBudget) {
        addNotification('Budget Exceeded! ⚠️', `You've crossed your monthly limit of ₹${monthlyBudget}.`, '🔴');
      } else if (previousTotal <= (monthlyBudget * 0.8) && totalSpent > (monthlyBudget * 0.8) && totalSpent <= monthlyBudget) {
        addNotification('Budget Alert 📊', `You've used 80% of your monthly budget. Only ₹${monthlyBudget - totalSpent} remaining.`, '🟡');
      }

      // Check Category Budget Notification
      if (isCategoryBudgetEnabled && categoryBudgets[newExp.category]) {
        const catLimit = categoryBudgets[newExp.category];
        const categoryExpenses = currentMonthExpenses.filter(e => e.category === newExp.category);
        const previousCatTotal = categoryExpenses.reduce((s, e) => s + e.amount, 0);
        const totalCatSpent = previousCatTotal + newExp.amount;
        
        const catObj = categories.find(c => c.id === newExp.category);
        const catName = catObj ? `${catObj.emoji} ${catObj.name}` : newExp.category;

        if (previousCatTotal <= catLimit && totalCatSpent > catLimit) {
          addNotification(`${catName} Budget Exceeded! ⚠️`, `You've crossed your ${catObj?.name || newExp.category} category limit of ₹${catLimit}.`, '🔴');
        } else if (previousCatTotal <= (catLimit * 0.8) && totalCatSpent > (catLimit * 0.8) && totalCatSpent <= catLimit) {
          addNotification(`${catName} Budget Alert 📊`, `You've used 80% of your ${catObj?.name || newExp.category} budget. Only ₹${catLimit - totalCatSpent} remaining.`, '🟡');
        }
      }
    }

    setExpenses(prev => [newExp, ...prev]);
    // Deduct from target account
    setAccounts(prev => prev.map(a => a.id === newExp.accountId ? { ...a, balance: a.balance - expense.amount } : a));
    addToast('Expense added! 💸');
  }, [addToast, expenses, accounts, monthlyBudget, notificationsEnabled, isCategoryBudgetEnabled, categoryBudgets, categories, addNotification]);

  const deleteExpense = useCallback((id) => {
    const exp = expenses.find(e => e.id === id);
    if (exp) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      const targetAccId = exp.accountId || (accounts.find(a => a.active) || accounts[0])?.id;
      setAccounts(prev => prev.map(a => a.id === targetAccId ? { ...a, balance: a.balance + exp.amount } : a));
      addToast('Expense deleted');
    }
  }, [expenses, accounts, addToast]);

  const addMoneyToAccount = useCallback((accountId, amount) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance + amount } : a));
    addToast(`₹${amount.toLocaleString()} added! ✅`);
  }, [addToast]);

  const removeMoneyFromAccount = useCallback((accountId, amount) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: Math.max(0, a.balance - amount) } : a));
    addToast(`₹${amount.toLocaleString()} removed`);
  }, [addToast]);

  const transferBetweenAccounts = useCallback((fromId, toId, amount) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === fromId) return { ...a, balance: Math.max(0, a.balance - amount) };
      if (a.id === toId) return { ...a, balance: a.balance + amount };
      return a;
    }));
    addToast('Transfer successful! 🔄');
  }, [addToast]);

  const setActiveAccount = useCallback((id) => {
    setAccounts(prev => prev.map(a => ({ ...a, active: a.id === id })));
  }, []);

  const addSubscription = useCallback((sub) => {
    setSubscriptions(prev => [...prev, { ...sub, id: Date.now().toString() }]);
    addToast('Subscription added! 🔁');
  }, [addToast]);

  const deleteSubscription = useCallback((id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    addToast('Subscription removed');
  }, [addToast]);

  const addCategory = useCallback((cat) => {
    const newCat = { id: Date.now().toString(), name: cat.name, emoji: cat.emoji || '🚀' };
    setCategories(prev => [...prev, newCat]);
    addToast('Category added!');
  }, [addToast]);

  const removeCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearAllData = useCallback(() => {
    setExpenses([]);
    setAccounts(DEFAULT_ACCOUNTS);
    setSubscriptions([]);
    setCategories(DEFAULT_CATEGORIES);
    setMonthlyBudget(10000);
    addToast('All data cleared');
  }, [addToast]);

  const exportData = useCallback(() => {
    const data = { expenses, accounts, subscriptions, categories, monthlyBudget };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mg-expense-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported! 📁');
  }, [expenses, accounts, subscriptions, categories, monthlyBudget, addToast]);

  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.expenses) setExpenses(data.expenses);
        if (data.accounts) setAccounts(data.accounts);
        if (data.subscriptions) setSubscriptions(data.subscriptions);
        if (data.categories) setCategories(data.categories);
        if (data.monthlyBudget) setMonthlyBudget(data.monthlyBudget);
        addToast('Data imported! ✅');
      } catch { addToast('Import failed! Invalid file.'); }
    };
    reader.readAsText(file);
  }, [addToast]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeAccount = accounts.find(a => a.active) || accounts[0];

  const now = new Date();
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);

  const todayExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);

  const totalMonthlySubs = subscriptions.reduce((s, sub) => {
    if (sub.cycle === 'yearly') return s + sub.amount / 12;
    return s + sub.amount;
  }, 0);

  return (
    <AppContext.Provider value={{
      user,
      isLoadingData,
      notificationsEnabled, setNotificationsEnabled,
      inAppNotifs, clearNotifications, markNotificationsAsRead, addNotification,
      expenses, accounts, subscriptions, categories, monthlyBudget, setMonthlyBudget,
      darkMode, setDarkMode, language, setLanguage,
      categoryBudgets, setCategoryBudgets, isCategoryBudgetEnabled, setIsCategoryBudgetEnabled,
      totalBalance, activeAccount, thisMonthExpenses, thisMonthTotal,
      todayExpenses, todayTotal, totalMonthlySubs,
      toasts,
      addExpense, deleteExpense,
      addMoneyToAccount, removeMoneyFromAccount, transferBetweenAccounts, setActiveAccount,
      addSubscription, deleteSubscription,
      addCategory, removeCategory,
      clearAllData, exportData, importData,
      addToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
