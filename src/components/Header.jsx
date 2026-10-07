import React from 'react';
import { useApp } from '../context/AppContext';
import {
  RefreshCw,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  PlusCircle,
  ShieldCheck,
  Languages,
  Database,
  FileEdit
} from 'lucide-react';

export default function Header() {
  const {
    businessProfile,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    deviceView,
    setDeviceView,
    syncStatus,
    lastSyncTime,
    setIsSyncModalOpen,
    setActiveTab
  } = useApp();

  const isHindi = language === 'hi';

  return (
    <header className="app-header glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Brand & Store Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src={businessProfile.logoUrl || "/logo.jpg"}
          alt="Jai Kisan Vyapar"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              {isHindi ? 'जय किसान व्यापार' : 'Jai Kisan Vyapar'}
            </h1>
            <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
              <ShieldCheck size={11} /> GST Ready
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
            {businessProfile.name} • <span className="font-mono">{businessProfile.gstin}</span>
          </p>
        </div>
      </div>

      {/* Center / Right Control Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Real-time PC & Mobile Sync Button */}
        <button
          onClick={() => setIsSyncModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: syncStatus === 'syncing' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${syncStatus === 'syncing' ? 'var(--gold-400)' : 'var(--primary-400)'}`,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Click to manage PC & Mobile Sync"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: syncStatus === 'syncing' ? 'var(--gold-500)' : '#10b981',
              boxShadow: syncStatus === 'syncing' ? '0 0 8px var(--gold-500)' : '0 0 8px #10b981',
              display: 'inline-block'
            }}
          />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: syncStatus === 'syncing' ? 'var(--gold-600)' : 'var(--primary-700)' }}>
              {syncStatus === 'syncing' ? 'Syncing...' : (isHindi ? '🟢 PC + मोबाइल सिंक' : '🟢 PC + Mobile Synced')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {isHindi ? `समय: ${lastSyncTime}` : `Live: ${lastSyncTime}`}
            </div>
          </div>
          <RefreshCw size={13} className={syncStatus === 'syncing' ? 'animate-spin' : ''} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Device View Toggle (PC Mode vs Mobile Simulator) */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-alt)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '2px'
        }}>
          <button
            onClick={() => setDeviceView('pc')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: deviceView === 'pc' ? '#ffffff' : 'var(--text-muted)',
              background: deviceView === 'pc' ? 'var(--primary-700)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
            title="Desktop PC Full View"
          >
            <Monitor size={15} /> PC View
          </button>
          <button
            onClick={() => setDeviceView('mobile_sim')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: deviceView === 'mobile_sim' ? '#ffffff' : 'var(--text-muted)',
              background: deviceView === 'mobile_sim' ? 'var(--primary-700)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
            title="Mobile Phone Experience Simulator"
          >
            <Smartphone size={15} /> Mobile View
          </button>
        </div>

        {/* Pre-made Scratchpad Quick Button */}
        <button
          onClick={() => setActiveTab('scratchpad')}
          className="btn-secondary"
          style={{
            padding: '8px 12px',
            fontSize: '0.86rem',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid #f59e0b',
            color: '#b45309',
            fontWeight: 700
          }}
          title="Open Pre-made Scratchpad (Rough bill & calculation pad)"
        >
          <FileEdit size={16} style={{ color: '#d97706' }} />
          <span>{isHindi ? 'कच्चा स्क्रैचपैड' : 'Scratchpad'}</span>
        </button>

        {/* Quick New Sale Bill Button */}
        <button
          onClick={() => setActiveTab('billing')}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.86rem' }}
        >
          <PlusCircle size={16} />
          <span>{isHindi ? '+ नया बिल बनाएं' : '+ New Bill (F2)'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="btn-icon"
          title="Toggle English / हिन्दी"
          style={{ border: '1px solid var(--border-color)', padding: '7px 10px', fontSize: '0.8rem', fontWeight: 700 }}
        >
          <Languages size={15} style={{ marginRight: '4px' }} />
          {language === 'en' ? 'हिन्दी' : 'EN'}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title="Toggle Dark / Light Theme"
          style={{ border: '1px solid var(--border-color)', padding: '7px' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} style={{ color: '#fbbf24' }} />}
        </button>
      </div>
    </header>
  );
}
