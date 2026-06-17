import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ReceiptScannerModal({ onClose }) {
  const { categories, accounts, addExpense, addToast } = useApp();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'food');
  const [accountId, setAccountId] = useState(accounts.find(a => a.active)?.id || accounts[0]?.id || 'current');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleFileUpload = (e) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setPreviewUrl(URL.createObjectURL(uploaded));
    setShowForm(false);
    setScanProgress(0);
    setScanning(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    setFile(dropped);
    setPreviewUrl(URL.createObjectURL(dropped));
    setShowForm(false);
    setScanProgress(0);
    setScanning(true);
  };

  // Scan progress animation
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 8;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [scanning]);

  // When scan completes, show form
  useEffect(() => {
    if (scanning && scanProgress >= 100) {
      setTimeout(() => {
        setScanning(false);
        setShowForm(true);
        addToast('Receipt scanned! Fill in the details 📝');
      }, 400);
    }
  }, [scanning, scanProgress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;
    if (!name.trim()) return;

    const [year, month, day] = date.split('-').map(Number);
    const finalDate = new Date(year, month - 1, day, 12, 0, 0).toISOString();

    addExpense({
      amount: parseFloat(amount),
      name: name.trim(),
      category,
      date: finalDate,
      note: note.trim(),
      accountId,
    });
    addToast('Expense saved from receipt! 💸');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460, width: '94%' }} role="dialog" aria-modal="true">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title">📷 Scan Receipt / Bill</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '82vh', overflowY: 'auto', padding: '16px 20px 24px' }}>

          {/* Step 1: Upload Area */}
          {!file && !scanning && !showForm && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                border: '2px dashed var(--primary)',
                borderRadius: 18,
                padding: '40px 20px',
                textAlign: 'center',
                background: 'var(--primary-light)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%', height: '100%',
                  opacity: 0, cursor: 'pointer'
                }}
              />
              <div style={{ fontSize: 52, marginBottom: 14 }}>🧾</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', marginBottom: 6 }}>
                Upload Receipt / Bill Photo
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Tap to select or drag & drop your bill image here
              </div>
              <div style={{
                display: 'inline-block',
                background: 'var(--primary)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                marginTop: 4
              }}>
                Choose File
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                Supports PNG, JPG, HEIC up to 10MB
              </div>
            </div>
          )}

          {/* Step 2: Scanning Animation */}
          {scanning && previewUrl && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: 180,
                height: 240,
                margin: '0 auto 20px',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                border: '3px solid var(--primary)',
              }}>
                {/* Receipt image preview */}
                <img
                  src={previewUrl}
                  alt="Receipt"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Scanning overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(26, 143, 160, 0.08)',
                }} />
                {/* Laser line */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: 'rgba(255, 0, 60, 0.9)',
                  boxShadow: '0 0 8px #ff003c, 0 0 20px #ff003c',
                  top: `${scanProgress}%`,
                  transition: 'top 0.15s linear',
                }} />
                {/* Corner markers */}
                {[
                  { top: 6, left: 6, borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)' },
                  { top: 6, right: 6, borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)' },
                  { bottom: 6, left: 6, borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)' },
                  { bottom: 6, right: 6, borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)' },
                ].map((style, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: 18, height: 18,
                    ...style
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                Scanning receipt... {scanProgress}%
              </div>
              <div className="progress-bar-wrap" style={{ height: 8, maxWidth: 280, margin: '0 auto' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${scanProgress}%`, height: 8, transition: 'width 0.15s' }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Expense Entry Form (after scan) */}
          {showForm && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Success badge */}
              <div style={{
                background: '#ebfbee',
                border: '1px solid #2b8a3e',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#2b8a3e',
              }}>
                <span>✅</span> Receipt scanned! Fill in the expense details:
              </div>

              {/* Scanned image thumbnail */}
              {previewUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <img
                    src={previewUrl}
                    alt="Receipt thumbnail"
                    style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 6 }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {file?.name || 'Receipt'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {file?.size ? `${Math.round(file.size / 1024)} KB` : ''} · Scanned
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input
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

              {/* Expense Name */}
              <div className="form-group">
                <label className="form-label">Expense Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Swiggy order, Petrol bill..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Deduct From Account */}
              <div className="form-group">
                <label className="form-label">Deduct From</label>
                <select
                  className="form-select"
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.emoji} {a.name} (₹{a.balance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              {/* Note */}
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Add any additional details..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null); setShowForm(false); setScanProgress(0); }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)',
                    background: 'var(--bg)', color: 'var(--text-secondary)', fontWeight: 600,
                    cursor: 'pointer', fontSize: 14
                  }}
                >
                  ↩ Re-scan
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, margin: 0 }}>
                  Save Expense 💸
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
