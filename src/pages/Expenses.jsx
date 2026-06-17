import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import AddExpenseModal from '../components/AddExpenseModal';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import SwipeableExpenseItem from '../components/SwipeableExpenseItem';
import ReceiptScannerModal from '../components/ReceiptScannerModal';
import { t } from '../i18n/translations';

export default function Expenses() {
  const { expenses, categories, language } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (activeCategory !== 'all') list = list.filter(e => e.category === activeCategory);
    if (search) list = list.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.note && e.note.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === 'newest') list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sort === 'oldest') list.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === 'highest') list.sort((a, b) => b.amount - a.amount);
    else if (sort === 'lowest') list.sort((a, b) => a.amount - b.amount);
    return list;
  }, [expenses, activeCategory, search, sort]);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">{t(language, 'expenses')}</h1>
        <select
          id="sort-expenses"
          className="sort-select"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="newest">{t(language, 'newestFirst')}</option>
          <option value="oldest">{t(language, 'oldestFirst')}</option>
          <option value="highest">{t(language, 'highestFirst')}</option>
          <option value="lowest">{t(language, 'lowestFirst')}</option>
        </select>
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          id="search-expenses"
          type="text"
          placeholder={t(language, 'searchExpenses')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div className="filter-row">
        <button id="filter-all" className={`chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
          ⭐ {t(language, 'all')}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            id={`filter-${cat.id}`}
            className={`chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Swipe hint - mobile only */}
      {filtered.length > 0 && (
        <div className="swipe-hint-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t(language, 'swipeHint')}
        </div>
      )}

      {/* Expense List */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <p>{t(language, 'noExpensesFound')}</p>
          </div>
        </div>
      ) : (
        <div className="expense-list" style={{ gap: 0 }}>
          {filtered.map(exp => (
            <SwipeableExpenseItem
              key={exp.id}
              expense={exp}
              onOpen={(e) => setSelectedExpense(e)}
            />
          ))}
        </div>
      )}

      {/* Scanner FAB */}
      <button 
        id="fab-scan-receipt-page" 
        className="fab" 
        onClick={() => setShowScanModal(true)} 
        aria-label="Scan Receipt"
        style={{
          right: 80,
          background: 'linear-gradient(135deg, #1a8fa0, #4ecdc4)',
          boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: 20 }}>📷</span>
      </button>

      {/* FAB */}
      <button id="fab-add-expense-page" className="fab" onClick={() => setShowAddModal(true)} aria-label={t(language, 'addExpense')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} />}
      {showScanModal && <ReceiptScannerModal onClose={() => setShowScanModal(false)} />}
      {selectedExpense && (
        <ExpenseDetailModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
      )}
    </div>
  );
}
