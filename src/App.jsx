import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Expenses from './pages/Expenses';
import Summary from './pages/Summary';
import Analytics from './pages/Analytics';
import Accounts from './pages/Accounts';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { t } from './i18n/translations';


const NAV_ITEMS = [
  {
    id: 'home', label: 'Home',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    id: 'expenses', label: 'Expenses',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    )
  },
  {
    id: 'summary', label: 'Summary',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
      </svg>
    )
  },
  {
    id: 'analytics', label: 'Analytics',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  },
  {
    id: 'accounts', label: 'Accounts',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )
  },
  {
    id: 'subs', label: 'Subscriptions',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    )
  },
  {
    id: 'settings', label: 'Settings',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )
  },
];

const PAGE_TITLES = {
  home: 'Dashboard',
  expenses: 'Expenses',
  summary: 'Summary',
  analytics: 'Analytics',
  accounts: 'Accounts',
  subs: 'Subscriptions',
  settings: 'Settings',
};

function Toast({ toasts }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  );
}

function Sidebar({ activePage, onNavigate }) {
  const { language } = useApp();
  const { user } = useAuth();

  const NAV_LABELS = {
    home: t(language, 'home'),
    expenses: t(language, 'expenses'),
    summary: t(language, 'summary'),
    analytics: t(language, 'analytics'),
    accounts: t(language, 'accounts'),
    subs: t(language, 'subscriptions'),
    settings: t(language, 'settings'),
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💰</div>
        <div className="sidebar-logo-name">Expense Tracker</div>
        <div className="sidebar-logo-sub">v1.0.9</div>
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={`sidebar-${item.id}`}
            className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            {item.icon(activePage === item.id)}
            {NAV_LABELS[item.id]}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-name">👤 {(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '').split(' ')[0]}</div>
      </div>
    </aside>
  );
}

import NotificationModal from './components/NotificationModal';

function Topbar({ activePage }) {
  const { user } = useAuth();
  const { totalBalance, language, inAppNotifs } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const PAGE_TITLE_KEYS = {
    home: 'dashboard', expenses: 'expenses', summary: 'summary',
    analytics: 'analytics', accounts: 'accounts', subs: 'subscriptions', settings: 'settings',
  };

  function fmt(n) {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const unreadCount = inAppNotifs.filter(n => !n.read).length;

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      <h1 className="topbar-title">{t(language, PAGE_TITLE_KEYS[activePage])}</h1>
      <div className="topbar-right">
        {/* Notification Bell */}
        <button 
          onClick={() => setShowNotifs(!showNotifs)}
          style={{
            position: 'relative', background: 'var(--bg)', border: '1px solid var(--border)',
            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)'
          }}
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2, background: 'var(--danger)',
              color: 'white', fontSize: 10, fontWeight: 800, width: 18, height: 18,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifs && <NotificationModal onClose={() => setShowNotifs(false)} />}

        <div className="topbar-user" style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)',
          padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--primary)'
        }}>
          <span style={{ fontSize: 16 }}>👤</span> {(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '').split(' ')[0]}
        </div>
        <span className="topbar-date">{dateStr}</span>
        <div className="topbar-balance">💰 ₹{fmt(totalBalance)}</div>
      </div>
    </header>
  );
}

function AppInner() {
  const [page, setPage] = useState('home');
  const { toasts } = useApp();

  const pages = {
    home: <Home onNavigate={setPage} />,
    expenses: <Expenses />,
    summary: <Summary />,
    analytics: <Analytics />,
    accounts: <Accounts />,
    subs: <Subscriptions />,
    settings: <Settings />,
  };

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar activePage={page} onNavigate={setPage} />

      {/* Main Area */}
      <div className="main-area">
        {/* Desktop Topbar */}
        <Topbar activePage={page} />

        {/* Page Content */}
        <main className="content-area" id="main-content" role="main">
          {pages[page]}
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav activePage={page} onNavigate={setPage} />
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}

function AppContainer() {
  const { user } = useAuth();
  if (!user) return <Auth />;
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContainer />
    </AuthProvider>
  );
}
