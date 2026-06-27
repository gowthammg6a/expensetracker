import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';

function fmt(n) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CATEGORY_COLORS = {
  food: '#ff6b6b', transport: '#4ecdc4', entertainment: '#45b7d1',
  shopping: '#96ceb4', health: '#ff9a9e', other: '#a8edea',
};

export default function ExpenseDetailModal({ expense, onClose }) {
  const { categories, deleteExpense, language } = useApp();

  const cat = categories.find(c => c.id === expense.category) || { emoji: '📦', name: 'Other' };
  const bg = CATEGORY_COLORS[expense.category] || '#a8edea';

  const d = new Date(expense.date);

  // ✅ FIX: Use toLocaleDateString with explicit locale options (correct timezone)
  const dateStr = d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // ✅ FIX: Display local time correctly
  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const handleDelete = () => {
    deleteExpense(expense.id);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Expense Details."
    >
      <div className="modal expense-detail-modal">
        <div className="modal-handle" />

        {/* Header with big icon */}
        <div className="expense-detail-header" style={{ background: bg + '22' }}>
          <button className="modal-close expense-detail-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div
            className="expense-detail-icon"
            style={{ background: bg + '40', boxShadow: `0 8px 24px ${bg}60` }}
          >
            {cat.emoji}
          </div>
          <div className="expense-detail-name">{expense.name}</div>
          <div className="expense-detail-amount">-₹{fmt(expense.amount)}</div>
          <div className="expense-detail-cat">
            <span
              className="expense-detail-cat-badge"
              style={{ background: bg + '30', color: '#0f172a' }}
            >
              {cat.emoji} {cat.name}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="expense-detail-body">
          <div className="expense-detail-row">
            <div className="expense-detail-row-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {t(language, 'date')}
            </div>
            <div className="expense-detail-row-value">{dateStr}</div>
          </div>

          <div className="expense-detail-row">
            <div className="expense-detail-row-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {t(language, 'time')}
            </div>
            {/* ✅ Show local time correctly */}
            <div className="expense-detail-row-value">{timeStr}</div>
          </div>

          <div className="expense-detail-row">
            <div className="expense-detail-row-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              {t(language, 'amount')}
            </div>
            <div className="expense-detail-row-value" style={{ color: 'var(--danger)', fontWeight: 700 }}>
              ₹{fmt(expense.amount)}
            </div>
          </div>

          <div className="expense-detail-row">
            <div className="expense-detail-row-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              {t(language, 'category')}
            </div>
            <div className="expense-detail-row-value">{cat.emoji} {cat.name}</div>
          </div>

          {expense.note && (
            <div className="expense-detail-row">
              <div className="expense-detail-row-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {t(language, 'note').replace(' (optional)', '')}
              </div>
              <div className="expense-detail-row-value">{expense.note}</div>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <div style={{ padding: '0 22px 24px' }}>
          <button
            id={`delete-expense-${expense.id}`}
            className="btn-delete-expense"
            onClick={handleDelete}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {t(language, 'deleteExpense')}
          </button>
        </div>
      </div>
    </div>
  );
}
