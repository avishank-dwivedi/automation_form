import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Users,
  Plus,
  RefreshCw,
  Monitor,
  Wifi,
  Battery,
  ShieldCheck,
  FileEdit
} from 'lucide-react';

export default function MobileViewShell({ children }) {
  const {
    activeTab,
    setActiveTab,
    setDeviceView,
    syncStatus,
    lastSyncTime,
    setIsSyncModalOpen,
    openEWayBill,
    setIsQuotationOpen,
    setIsChecklistOpen,
    businessProfile,
    language
  } = useApp();

  const isHindi = language === 'hi';

  const navItems = [
    { id: 'dashboard', label: isHindi ? 'होम' : 'Home', icon: LayoutDashboard },
    { id: 'billing', label: isHindi ? 'बिल' : 'Bills', icon: ReceiptText },
    { id: 'scratchpad', label: isHindi ? 'कच्चा' : 'Rough', icon: FileEdit },
    { id: 'inventory', label: isHindi ? 'स्टॉक' : 'Stock', icon: Package },
    { id: 'parties', label: isHindi ? 'खाता' : 'Khata', icon: Users }
  ];

  return (
    <div className="mobile-simulator-container">
      {/* Control Banner Above Phone */}
      <div style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '6px 16px',
        borderRadius: '999px',
        color: '#ffffff',
        fontSize: '0.82rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        <span>📱 <strong>Mobile Simulation Active</strong></span>
        <button
          onClick={() => setDeviceView('pc')}
          className="btn-primary"
          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
        >
          <Monitor size={13} /> Switch back to PC View
        </button>
      </div>

      {/* Realistic Smartphone Hardware Frame */}
      <div className="mobile-phone-frame">
        {/* Smartphone Notch & Status Bar */}
        <div className="phone-notch-bar">
          <span>12:48</span>
          <div style={{
            width: '120px',
            height: '18px',
            background: '#090e17',
            borderRadius: '0 0 12px 12px'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>5G</span>
            <Wifi size={12} />
            <Battery size={13} />
          </div>
        </div>

        {/* Mobile Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--primary-800)',
          color: '#ffffff',
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={businessProfile.logoUrl || "/logo.jpg"}
              alt="Logo"
              style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.1 }}>
                {isHindi ? 'जय किसान व्यापार' : 'Jai Kisan Vyapar'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>
                {businessProfile.name}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSyncModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 700
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Sync
          </button>
        </div>

        {/* Mobile Quick Action Strip */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '6px 12px',
          background: 'var(--bg-surface-alt, #f8fafc)',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <button
            onClick={() => setActiveTab('scratchpad')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #f59e0b',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#b45309',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📝 {isHindi ? 'स्क्रैचपैड' : 'Scratchpad'}
          </button>
          <button
            onClick={() => openEWayBill()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #10b981',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#065f46',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🚛 E-Way Bill
          </button>
          <button
            onClick={() => setIsQuotationOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #3b82f6',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#1e40af',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📋 Quotation
          </button>
          <button
            onClick={() => setIsChecklistOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #64748b',
              background: 'rgba(100, 116, 139, 0.12)',
              color: '#334155',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ✅ Checklist
          </button>
        </div>

        {/* Smartphone Screen Scrollable Content */}
        <div className="phone-screen" style={{ paddingBottom: '70px' }}>
          {children}
        </div>

        {/* Mobile Bottom Navigation Dock */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '62px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 50,
          boxShadow: '0 -4px 10px rgba(0,0,0,0.06)'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  flex: 1
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Quick Center + Bill Floating Action Button */}
          <button
            onClick={() => setActiveTab('billing')}
            style={{
              position: 'absolute',
              top: '-18px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(15, 81, 50, 0.4)',
              border: '3px solid var(--bg-surface)'
            }}
            title="Create New Bill"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
