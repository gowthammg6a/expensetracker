import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';

export default function AddExpenseModal({ onClose }) {
  const { categories, accounts, addExpense, language } = useApp();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(accounts.find(a => a.active)?.id || accounts[0]?.id || 'current');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;
    if (!name.trim()) return;

    // ✅ FIX: Store with correct LOCAL time (not UTC midnight)
    const [year, month, day] = date.split('-').map(Number);
    const todayStr = new Date().toISOString().split('T')[0];
    let finalDate;
    if (date === todayStr) {
      // Today → use current local time
      finalDate = new Date().toISOString();
    } else {
      // Other date → use noon of that day in local time (avoids timezone issues)
      finalDate = new Date(year, month - 1, day, 12, 0, 0).toISOString();
    }

    addExpense({
      amount: parseFloat(amount),
      name: name.trim(),
      category,
      date: finalDate,
      note: note.trim(),
      accountId,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={t(language, 'addExpense')}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title">{t(language, 'addExpense')}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t(language, 'amount')} (₹)</label>
            <input
              id="expense-amount"
              className="form-input form-input-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t(language, 'expenseName')}</label>
            <input
              id="expense-name"
              className="form-input"
              type="text"
              placeholder={t(language, 'expenseNamePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t(language, 'category')}</label>
            <select
              id="expense-category"
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deduct From</label>
            <select
              id="expense-account"
              className="form-select"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.emoji} {a.name} (₹{a.balance.toLocaleString('en-IN')})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t(language, 'date')}</label>
            <input
              id="expense-date"
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t(language, 'note')}</label>
            <input
              id="expense-note"
              className="form-input"
              type="text"
              placeholder={t(language, 'addNote')}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <button id="submit-expense" type="submit" className="btn-primary">
            {t(language, 'addExpense')}
          </button>
        </form>
      </div>
    </div>
  );
}
