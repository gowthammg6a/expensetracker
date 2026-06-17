import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area
} from 'recharts';

function fmt(n) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const COLORS = ['#1a8fa0', '#4ecdc4', '#ff6b6b', '#96ceb4', '#ffd93d', '#ff9a9e', '#a8edea', '#c3cfe2'];

export default function Analytics() {
  const { expenses, categories, accounts } = useApp();
  const [dateFilter, setDateFilter] = useState('this_month');
  const [accountFilter, setAccountFilter] = useState('all');

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    let list = [...expenses];
    
    // 1. Filter by account
    if (accountFilter !== 'all') {
      list = list.filter(e => e.accountId === accountFilter);
    }
    
    // 2. Filter by date range
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter === 'last_7_days') {
      const limit = new Date(todayMidnight);
      limit.setDate(limit.getDate() - 6);
      list = list.filter(e => new Date(e.date) >= limit);
    } else if (dateFilter === 'this_month') {
      const limit = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter(e => new Date(e.date) >= limit);
    } else if (dateFilter === 'last_30_days') {
      const limit = new Date(todayMidnight);
      limit.setDate(limit.getDate() - 29);
      list = list.filter(e => new Date(e.date) >= limit);
    }
    
    return list;
  }, [expenses, dateFilter, accountFilter]);

  // Days in range
  const daysInRange = useMemo(() => {
    if (dateFilter === 'last_7_days') return 7;
    if (dateFilter === 'last_30_days') return 30;
    if (dateFilter === 'this_month') {
      return new Date().getDate();
    }
    if (filteredExpenses.length === 0) return 1;
    const dates = filteredExpenses.map(e => new Date(e.date).getTime());
    const oldest = Math.min(...dates);
    const diff = Date.now() - oldest;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(days, 1);
  }, [filteredExpenses, dateFilter]);

  // Key Metrics
  const totalSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const dailyAverage = useMemo(() => {
    return totalSpend / daysInRange;
  }, [totalSpend, daysInRange]);

  const highestCategory = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    let maxVal = 0;
    let maxCatId = null;
    Object.entries(totals).forEach(([catId, amount]) => {
      if (amount > maxVal) {
        maxVal = amount;
         maxCatId = catId;
       }
    });
    const catObj = categories.find(c => c.id === maxCatId);
    return {
      name: catObj ? catObj.name : 'None',
      emoji: catObj ? catObj.emoji : '📊',
      amount: maxVal
    };
  }, [filteredExpenses, categories]);

  // Spending by category
  const categoryData = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return categories
      .map(cat => ({
        ...cat,
        total: totals[cat.id] || 0,
        value: totals[cat.id] || 0 // Recharts requires 'value'
      }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .map(c => ({ ...c, pct: totalSpend > 0 ? (c.total / totalSpend) * 100 : 0 }));
  }, [filteredExpenses, categories, totalSpend]);

  // Trend data
  const trendChartData = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let daysToGenerate = 7;
    let startDate = new Date(todayMidnight);
    
    if (dateFilter === 'last_7_days') {
      daysToGenerate = 7;
      startDate.setDate(startDate.getDate() - 6);
    } else if (dateFilter === 'last_30_days') {
      daysToGenerate = 30;
      startDate.setDate(startDate.getDate() - 29);
    } else if (dateFilter === 'this_month') {
      daysToGenerate = now.getDate();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      const datesList = filteredExpenses.map(e => new Date(e.date).toDateString());
      const uniqueDates = Array.from(new Set(datesList)).sort((a,b) => new Date(a) - new Date(b));
      
      let cumulative = 0;
      return uniqueDates.map(dStr => {
        const dailyTotal = filteredExpenses
          .filter(e => new Date(e.date).toDateString() === dStr)
          .reduce((sum, e) => sum + e.amount, 0);
        cumulative += dailyTotal;
        return {
          label: new Date(dStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          amount: dailyTotal,
          cumulative: cumulative
        };
      });
    }

    let cumulative = 0;
    const chartData = [];
    for (let i = 0; i < daysToGenerate; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dStr = currentDate.toDateString();
      
      const dailyTotal = filteredExpenses
        .filter(e => new Date(e.date).toDateString() === dStr)
        .reduce((sum, e) => sum + e.amount, 0);
      cumulative += dailyTotal;
      
      chartData.push({
        label: currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: dailyTotal,
        cumulative: cumulative
      });
    }
    return chartData;
  }, [filteredExpenses, dateFilter]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '8px 12px', fontSize: 13,
          boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
          <div style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{fmt(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ paddingBottom: 12 }}>
        <h1 className="page-title">Analytics</h1>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <select 
          value={dateFilter} 
          onChange={e => setDateFilter(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}
        >
          <option value="last_7_days">Last 7 Days</option>
          <option value="this_month">This Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="all_time">All Time</option>
        </select>
        <select 
          value={accountFilter} 
          onChange={e => setAccountFilter(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All Accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
          ))}
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
        <div className="stat-card" style={{ padding: '12px 10px' }}>
          <div className="stat-label" style={{ fontSize: 11 }}>Total Spend</div>
          <div className="stat-value" style={{ fontSize: 14, wordBreak: 'break-all' }}>
            ₹{totalSpend >= 100000 ? (totalSpend/1000).toFixed(0)+'k' : fmt(totalSpend)}
          </div>
          <div className="stat-sub" style={{ fontSize: 10 }}>Filtered total</div>
        </div>
        <div className="stat-card" style={{ padding: '12px 10px' }}>
          <div className="stat-label" style={{ fontSize: 11 }}>Daily Avg</div>
          <div className="stat-value" style={{ fontSize: 14 }}>
            ₹{dailyAverage >= 100000 ? (dailyAverage/1000).toFixed(0)+'k' : fmt(dailyAverage)}
          </div>
          <div className="stat-sub" style={{ fontSize: 10 }}>Per day avg</div>
        </div>
        <div className="stat-card" style={{ padding: '12px 10px' }}>
          <div className="stat-label" style={{ fontSize: 11 }}>Top Category</div>
          <div className="stat-value" style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {highestCategory.amount > 0 ? `${highestCategory.emoji} ${highestCategory.name}` : 'None'}
          </div>
          <div className="stat-sub" style={{ fontSize: 10 }}>
            {highestCategory.amount > 0 ? `₹${fmt(highestCategory.amount)}` : 'No spend'}
          </div>
        </div>
      </div>

      {/* Spending Trend (Area Chart) */}
      <div className="card card-padded analytics-card">
        <div className="analytics-card-title">Spending Trend (Cumulative)</div>
        <div style={{ height: 180 }}>
          {filteredExpenses.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
              No data available for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: 'var(--text-muted)' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumulative" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Breakdown (Doughnut Chart + Bar List) */}
      <div className="card card-padded analytics-card">
        <div className="analytics-card-title">Spending by Category</div>
        {categoryData.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '24px 0' }}>
            No data available.
          </div>
        ) : (
          <div>
            {/* Doughnut Chart */}
            <div style={{ height: 160, marginBottom: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="total"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${fmt(value)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed bars list */}
            <div>
              {categoryData.map((cat, i) => (
                <div key={cat.id} className="category-bar-item">
                  <div className="category-bar-label">
                    <span>{cat.emoji}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${cat.pct}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <div className="category-bar-amount">
                    {cat.pct.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 75, textAlign: 'right', flexShrink: 0 }}>
                    ₹{cat.total >= 1000 ? (cat.total / 1000).toFixed(1) + 'k' : fmt(cat.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
