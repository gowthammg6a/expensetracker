import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n/translations';

export default function Settings() {
  const { user, signOut } = useAuth();
  const {
    notificationsEnabled, setNotificationsEnabled,
    darkMode, setDarkMode, language, setLanguage,
    monthlyBudget, setMonthlyBudget,
    categories, addCategory, removeCategory,
    expenses, clearAllData, exportData, importData,
    addToast,
    categoryBudgets, setCategoryBudgets,
    isCategoryBudgetEnabled, setIsCategoryBudgetEnabled,
  } = useApp();

  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [newCatName, setNewCatName] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [openGuide, setOpenGuide] = useState(null);
  const importRef = useRef(null);

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (val > 0) {
      setMonthlyBudget(val);
      addToast(t(language, 'save') + ' ✅');
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), emoji: '🚀' });
    setNewCatName('');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) importData(file);
    e.target.value = '';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      addToast('Error signing out', 'error');
    }
  };

  const toggleNotifications = (e) => {
    const enable = e.target.checked;
    setNotificationsEnabled(enable);
    if (enable) {
      addToast('In-App Notifications Enabled! 🔔');
    } else {
      addToast('Notifications Disabled');
    }
  };

  const handleCategoryBudgetChange = (catId, val) => {
    const amount = val === '' ? 0 : parseFloat(val) || 0;
    setCategoryBudgets(prev => ({
      ...prev,
      [catId]: amount
    }));
  };

  const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada'];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">⚙️ {t(language, 'settings')}</h1>
      </div>

      {/* Account Settings */}
      <div className="settings-section">
        <div className="settings-section-title">Account</div>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-item-left">
              <span>👤</span> {user?.user_metadata?.full_name || user?.email?.split('@')[0]} <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>({user?.email})</span>
            </span>
            <button
              onClick={handleSignOut}
              style={{
                border: '1px solid var(--danger)', background: 'var(--danger-light)', 
                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'appInformation')}</div>
        <div className="settings-card">
          <div className="settings-item" style={{ cursor: 'default' }}>
            <span className="settings-item-left">{t(language, 'appVersion')}</span>
            <span className="settings-item-right">1.0.9</span>
          </div>
          <div className="settings-item" style={{ cursor: 'default' }}>
            <span className="settings-item-left">{t(language, 'totalExpenses')}</span>
            <span className="settings-item-right">{expenses.length}</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'appearance')}</div>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-item-left">
              <span>🌙</span> {t(language, 'darkMode')}
            </span>
            <label className="toggle-wrap" aria-label="Toggle dark mode">
              <input
                id="toggle-dark-mode"
                type="checkbox"
                checked={darkMode}
                onChange={e => setDarkMode(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-item">
            <span className="settings-item-left">
              <span>🌐</span> {t(language, 'language')}
            </span>
            <select
              id="select-language"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                border: 'none', background: 'none', fontSize: 13,
                color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                outline: 'none', textAlign: 'right',
              }}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'notifications')}</div>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-left">
              <span>🔔</span> 
              <div>
                <div style={{ marginBottom: 2 }}>{t(language, 'enableNotifications')}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t(language, 'notificationsDesc')}</div>
              </div>
            </div>
            <label className="toggle-wrap" aria-label="Toggle notifications">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={toggleNotifications}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'budgetSettings')}</div>
        <div className="settings-card">
          <div style={{ padding: '14px 16px' }}>
            <div className="budget-input-row">
              <div className="budget-input-wrap">
                <span className="budget-input-prefix">₹</span>
                <input
                  id="budget-input"
                  type="number"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  placeholder="10000"
                  min="1"
                />
              </div>
              <button id="save-budget" className="btn-save" onClick={handleSaveBudget}>
                {t(language, 'save')}
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {t(language, 'setMonthlyLimit')}
            </div>
          </div>
        </div>
      </div>

      {/* Category-Wise Budgets */}
      <div className="settings-section">
        <div className="settings-section-title">Category-Wise Budgets</div>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-item-left">
              <span>📊</span> Enable Category Budgets
            </span>
            <label className="toggle-wrap" aria-label="Toggle category budgets">
              <input
                type="checkbox"
                checked={isCategoryBudgetEnabled}
                onChange={e => setIsCategoryBudgetEnabled(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {isCategoryBudgetEnabled && (
            <div style={{ padding: '10px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                Set monthly limits for individual categories:
              </div>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </div>
                  <div className="budget-input-wrap" style={{ width: 120, margin: 0 }}>
                    <span className="budget-input-prefix">₹</span>
                    <input
                      type="number"
                      value={categoryBudgets[cat.id] || ''}
                      onChange={e => handleCategoryBudgetChange(cat.id, e.target.value)}
                      placeholder="No limit"
                      style={{ padding: '6px 10px 6px 20px', fontSize: 13 }}
                      min="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Currency */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'currency')}</div>
        <div className="settings-card">
          <div className="settings-item" style={{ cursor: 'default' }}>
            <div>
              <div className="settings-item-left" style={{ marginBottom: 2 }}>{t(language, 'defaultCurrency')}</div>
            </div>
            <span className="settings-item-right">₹ INR</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'categories')}</div>
        <div className="settings-card">
          <div className="category-tags">
            {categories.map(cat => (
              <div key={cat.id} className="category-tag">
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                <button
                  className="category-tag-remove"
                  onClick={() => removeCategory(cat.id)}
                  aria-label={`Remove ${cat.name}`}
                >×</button>
              </div>
            ))}
          </div>
          <div className="new-category-row">
            <span style={{ fontSize: 20 }}>🚀</span>
            <input
              id="new-category-input"
              type="text"
              placeholder={t(language, 'newCategory')}
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              id="add-category-btn"
              className="btn-icon-add"
              onClick={handleAddCategory}
              aria-label="Add category"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'dataManagement')}</div>
        <div className="settings-card">
          <div className="settings-item" onClick={exportData} id="export-btn">
            <span className="settings-item-left">
              <span>📤</span> {t(language, 'exportBackup')}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div className="settings-item" onClick={() => importRef.current?.click()} id="import-btn">
            <span className="settings-item-left">
              <span>📥</span> {t(language, 'importBackup')}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          <div
            className="settings-item danger-item"
            onClick={() => setShowClearConfirm(true)}
            id="clear-data-btn"
          >
            <span className="settings-item-left" style={{ color: 'var(--danger)' }}>
              <span>🗑️</span> {t(language, 'clearAllData')}
            </span>
          </div>
        </div>
      </div>

      {/* User Guide */}

      <div className="settings-section">
        <div className="settings-section-title">📖 User Guide</div>
        <div className="settings-card">
          {[
            {
              id: 'expenses',
              icon: '💸',
              title: 'How to Add Expenses',
              content: [
                '1. Click the \u002B (plus) button at the bottom-right of the Home or Expenses page.',
                '2. Enter the Amount (₹), Expense Name (e.g. Lunch, Petrol).',
                '3. Choose a Category (Food, Transport, Shopping, etc.).',
                '4. Select which account to deduct from (Savings or Current).',
                '5. Pick the date and add an optional note.',
                '6. Tap "Add Expense" to save.',
              ]
            },
            {
              id: 'scanner',
              icon: '📷',
              title: 'How to Scan a Receipt / Bill',
              content: [
                '1. Click the 📷 (camera) button next to the \u002B button on Home or Expenses.',
                '2. Upload a photo of your receipt or bill.',
                '3. Watch the laser scanning animation process your receipt.',
                '4. Fill in the expense details (Amount, Name, Category, Account).',
                '5. Tap "Save Expense" to add it to your tracker.',
              ]
            },
            {
              id: 'accounts',
              icon: '🏦',
              title: 'How to Manage Accounts',
              content: [
                '1. Go to the Accounts page from the sidebar.',
                '2. You have two default accounts: Savings 💰 and Current 💳.',
                '3. Click "+ Add" to deposit money into an account.',
                '4. Click "Transfer" to move money between accounts.',
                '5. Click "— Remove Money" to withdraw from an account.',
                '6. Click "Select" to set an account as your active (default) account.',
                'Note: Expenses are automatically deducted from your chosen account.',
              ]
            },
            {
              id: 'budget',
              icon: '📊',
              title: 'How to Set a Budget',
              content: [
                '1. Scroll to "Budget Settings" on this Settings page.',
                '2. Enter your monthly spending limit in ₹.',
                '3. Tap "Save" to apply.',
                '4. You will receive alerts when you cross 80% and 100% of your budget.',
                '5. View your budget progress on the Summary page.',
                'Tip: Enable "Category-Wise Budgets" below Budget Settings for per-category limits!',
              ]
            },
            {
              id: 'catbudget',
              icon: '🗂️',
              title: 'Category-Wise Budgets',
              content: [
                '1. Scroll to "Category-Wise Budgets" on this Settings page.',
                '2. Toggle the switch ON to enable category budgets.',
                '3. Enter monthly limits for each category (e.g. Food: ₹3000, Transport: ₹1500).',
                '4. Leave a category blank to set no limit for it.',
                '5. Alerts will fire when spending crosses 80% or 100% of any category limit.',
                '6. View category progress bars on the Summary page.',
              ]
            },
            {
              id: 'analytics',
              icon: '📈',
              title: 'How to Use Analytics',
              content: [
                '1. Go to the Analytics page from the sidebar.',
                '2. Use the first dropdown to filter by date: Last 7 Days, This Month, Last 30 Days, or All Time.',
                '3. Use the second dropdown to filter by account (All, Savings, or Current).',
                '4. View the Cumulative Spending Area Chart (spending growth over time).',
                '5. View the Doughnut Chart showing spending % by category.',
                '6. Check Top 3 metrics: Total Spend, Daily Average, and Top Category.',
              ]
            },
            {
              id: 'subscriptions',
              icon: '🔁',
              title: 'How to Manage Subscriptions',
              content: [
                '1. Go to the Subscriptions page from the sidebar.',
                '2. Click the \u002B button to add a new subscription.',
                '3. Enter the service name, amount, billing cycle (Monthly/Yearly/Weekly), and next billing date.',
                '4. You will receive in-app alerts when a subscription is due Today or Tomorrow.',
                '5. View total monthly subscription cost at the top of the Subscriptions page.',
              ]
            },
            {
              id: 'notifications',
              icon: '🔔',
              title: 'How to Use Notifications',
              content: [
                '1. Click the 🔔 bell icon in the top bar to view all alerts.',
                '2. Alerts are generated automatically for:',
                '   • Budget usage crossing 80% and 100%.',
                '   • Category budget limits (if enabled).',
                '   • Subscriptions due today or tomorrow.',
                '3. A red badge on the bell shows the count of unread alerts.',
                '4. Click "Mark all read" or "Clear" to manage notifications.',
                '5. You can disable all notifications from the Notifications toggle on this Settings page.',
              ]
            },
            {
              id: 'data',
              icon: '💾',
              title: 'Data Backup & Restore',
              content: [
                '1. Your data is automatically synced to the cloud (Supabase) when you are logged in.',
                '2. Logging in on another device will show the same data instantly.',
                '3. To export a local backup: go to Data Management → Export Backup (saves a .json file).',
                '4. To restore from backup: go to Data Management → Import Backup and select your .json file.',
                '5. "Clear All Data" will permanently delete all your expenses and reset accounts.',
              ]
            },
          ].map(guide => (
            <div key={guide.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{guide.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{guide.title}</span>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"
                  style={{ transform: openGuide === guide.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s', flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openGuide === guide.id && (
                <div style={{ padding: '4px 16px 16px 46px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {guide.content.map((line, i) => (
                    <div key={i} style={{ fontSize: 13, color: line.startsWith('Tip') || line.startsWith('Note') ? 'var(--primary)' : 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <div className="settings-section-title">{t(language, 'about')}</div>
        <div className="settings-card">
          <div style={{ padding: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Expense Tracker</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
              {language === 'Tamil'
                ? 'உங்கள் தினசரி செலவுகளை கண்காணிக்கவும், வகைப்படுத்தவும், செலவு சுருக்கங்களை பார்க்கவும் ஒரு எளிய மற்றும் நேர்த்தியான செயலி.'
                : language === 'Hindi'
                ? 'अपने दैनिक खर्चों को ट्रैक करने, वर्गीकृत करने और खर्च सारांश देखने के लिए एक सरल और सुंदर ऐप।'
                : language === 'Telugu'
                ? 'మీ రోజువారీ ఖర్చులను ట్రాక్ చేయడానికి, వర్గీకరించడానికి మరియు ఖర్చు సారాంశాలను చూడడానికి ఒక సరళమైన మరియు సుందరమైన యాప్.'
                : language === 'Kannada'
                ? 'ನಿಮ್ಮ ದೈನಂದಿನ ಖರ್ಚುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ವರ್ಗೀಕರಿಸಲು ಮತ್ತು ಖರ್ಚಿನ ಸಾರಾಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಒಂದು ಸರಳ ಮತ್ತು ಸುಂದರ ಅಪ್ಲಿಕೇಶನ್.'
                : 'A simple and elegant app to track your daily expenses, categorize them, and view spending summaries.'
              }
            </div>
            <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>
              {t(language, 'createdBy')}
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: 'var(--danger)' }}>⚠️ {t(language, 'clearAllData')}</h2>
              <button className="modal-close" onClick={() => setShowClearConfirm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                {language === 'Tamil'
                  ? 'இது அனைத்து செலவுகளையும் நிரந்தரமாக நீக்கி, கணக்குகளை இயல்புநிலைக்கு மீட்டமைக்கும். இந்த செயலை மீளாக்க முடியாது.'
                  : 'This will permanently delete all expenses, reset accounts to defaults, and clear all subscriptions. This action cannot be undone.'
                }
              </p>
              <button
                id="confirm-clear"
                className="btn-danger"
                onClick={() => { clearAllData(); setShowClearConfirm(false); }}
              >
                {language === 'Tamil' ? 'ஆம், எல்லாவற்றையும் அழி' : language === 'Hindi' ? 'हाँ, सब हटाएं' : 'Yes, Clear Everything'}
              </button>
              <button
                className="btn-primary"
                style={{ marginTop: 8, background: 'var(--bg)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}
                onClick={() => setShowClearConfirm(false)}
              >
                {t(language, 'cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
