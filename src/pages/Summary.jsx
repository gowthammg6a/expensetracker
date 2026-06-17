import React from 'react';
import { useApp } from '../context/AppContext';

function fmt(n) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Summary() {
  const { thisMonthTotal, thisMonthExpenses, monthlyBudget, isCategoryBudgetEnabled, categoryBudgets, categories } = useApp();

  const now = new Date();
  const monthName = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const pct = monthlyBudget > 0 ? Math.min((thisMonthTotal / monthlyBudget) * 100, 100) : 0;
  const isWarning = pct >= 80 && pct < 100;
  const isDanger = pct >= 100;

  // Group by week
  const weeks = [0, 0, 0, 0];
  thisMonthExpenses.forEach(e => {
    const day = new Date(e.date).getDate();
    const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
    weeks[weekIdx] += e.amount;
  });

  const maxWeek = Math.max(...weeks, 1);

  // Breakdown by day of month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="summary-hero">
        <div className="summary-month">{monthName}</div>
        <div className="summary-amount">₹{fmt(thisMonthTotal)}</div>
        <div className="summary-count">{thisMonthExpenses.length} expense{thisMonthExpenses.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Budget Progress */}
      <div className="budget-card card card-padded" style={{ margin: '16px 16px 0' }}>
        <div className="budget-header">
          <span className="budget-label">Monthly Budget</span>
        </div>
        <div className="budget-meta">
          <span>₹{fmt(thisMonthTotal)} spent</span>
          <span>₹{fmt(monthlyBudget)} limit</span>
        </div>
        <div className="progress-bar-wrap">
          <div
            className={`progress-bar-fill ${isWarning ? 'warning' : isDanger ? 'danger' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className={`on-track ${isDanger ? 'over-budget' : ''}`}>
          {isDanger
            ? `⚠️ Over budget by ₹${fmt(thisMonthTotal - monthlyBudget)}`
            : isWarning
            ? `⚠️ ₹${fmt(monthlyBudget - thisMonthTotal)} remaining`
            : "You're on track! ✅"}
        </div>
      </div>

      {/* Category Budgets */}
      {isCategoryBudgetEnabled && Object.values(categoryBudgets).some(b => b > 0) && (
        <div className="card card-padded" style={{ margin: '12px 16px 0' }}>
          <div className="analytics-card-title" style={{ marginBottom: 14 }}>Category Budgets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categories
              .filter(cat => categoryBudgets[cat.id] > 0)
              .map(cat => {
                const limit = categoryBudgets[cat.id];
                const catExpenses = thisMonthExpenses.filter(e => e.category === cat.id);
                const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
                const pct = Math.min((spent / limit) * 100, 100);
                const isWarn = pct >= 80 && pct < 100;
                const isDanger = pct >= 100;

                return (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{fmt(spent)}</span> / ₹{fmt(limit)}
                      </div>
                    </div>
                    <div className="progress-bar-wrap" style={{ height: 6 }}>
                      <div
                        className={`progress-bar-fill ${isWarn ? 'warning' : isDanger ? 'danger' : ''}`}
                        style={{ width: `${pct}%`, height: 6 }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Weekly Breakdown */}
      <div className="card card-padded" style={{ margin: '12px 16px 0' }}>
        <div className="analytics-card-title">Weekly Breakdown</div>
        {weeks.every(w => w === 0) ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '16px 0' }}>No data for this month</div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 100, paddingBottom: 8 }}>
            {weeks.map((w, i) => {
              const h = maxWeek > 0 ? (w / maxWeek) * 80 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {w > 0 ? `₹${w >= 1000 ? (w/1000).toFixed(1)+'k' : Math.round(w)}` : ''}
                  </div>
                  <div style={{
                    width: '100%', height: Math.max(h, 4),
                    background: i === 0 ? 'var(--primary)' : i === 1 ? '#4ecdc4' : i === 2 ? '#96ceb4' : '#a8edea',
                    borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease',
                  }} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>W{i + 1}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day counter */}
      <div className="card card-padded" style={{ margin: '12px 16px 16px' }}>
        <div className="analytics-card-title">Month Progress</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
          <span>Day {today} of {daysInMonth}</span>
          <span>{Math.round((today / daysInMonth) * 100)}% of month</span>
        </div>
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${(today / daysInMonth) * 100}%`, background: 'linear-gradient(90deg, var(--primary), #4ecdc4)' }}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
          Daily avg: <strong style={{ color: 'var(--text-primary)' }}>
            ₹{fmt(today > 0 ? thisMonthTotal / today : 0)}
          </strong>
          {' '}· Projected: <strong style={{ color: 'var(--text-primary)' }}>
            ₹{fmt(today > 0 ? (thisMonthTotal / today) * daysInMonth : 0)}
          </strong>
        </div>
      </div>
    </div>
  );
}
