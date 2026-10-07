import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Users,
  WalletCards,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  AlertCircle,
  Truck,
  FileText,
  FileEdit
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    language,
    products,
    eWayBills,
    quotations,
    openEWayBill,
    setIsQuotationOpen,
    setIsSyncModalOpen,
    exportDataToJson
  } = useApp();

  const isHindi = language === 'hi';

  // Count low stock items for badge notification
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const navItems = [
    {
      id: 'dashboard',
      label: isHindi ? 'डैशबोर्ड' : 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'billing',
      label: isHindi ? 'बिक्री व बिलिंग' : 'Sales & Invoices',
      icon: ReceiptText,
      badge: 'F2'
    },
    {
      id: 'scratchpad',
      label: isHindi ? 'स्क्रैचपैड (कच्चा)' : 'Scratchpad (Rough)',
      icon: FileEdit,
      badge: 'PRE-MADE'
    },
    {
      id: 'inventory',
      label: isHindi ? 'स्टॉक / इन्वेंटरी' : 'Stock & Items',
      icon: Package,
      alertCount: lowStockCount > 0 ? lowStockCount : null
    },
    {
      id: 'parties',
      label: isHindi ? 'पार्टी / खाता' : 'Parties & Khata',
      icon: Users
    },
    {
      id: 'expenses',
      label: isHindi ? 'खर्चे व रोकड़' : 'Expenses & Cash',
      icon: WalletCards
    },
    {
      id: 'reports',
      label: isHindi ? 'GST व रिपोर्ट्स' : 'GST & Reports',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: isHindi ? 'व्यापार सेटिंग्स' : 'Business Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="app-sidebar no-print" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 12px',
      height: 'calc(100vh - 65px)',
      position: 'sticky',
      top: '65px'
    }}>
      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{
          padding: '4px 12px 10px',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-light)'
        }}>
          {isHindi ? 'मुख्य मेन्यू' : 'MAIN MENU'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-main)',
                backgroundColor: isActive ? 'var(--primary-700)' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon
                  size={19}
                  style={{
                    color: isActive ? '#ffffff' : 'var(--primary-600)',
                    flexShrink: 0
                  }}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface-alt)',
                    color: isActive ? '#ffffff' : 'var(--text-light)',
                    fontWeight: 700
                  }}
                >
                  {item.badge}
                </span>
              )}

              {item.alertCount && (
                <span
                  className="badge badge-warning"
                  style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                  title={`${item.alertCount} items are low in stock`}
                >
                  <AlertCircle size={10} /> {item.alertCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Tools: E-Way Bill & Quotation */}
        <div style={{
          padding: '12px 12px 6px',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-light)',
          marginTop: '4px'
        }}>
          {isHindi ? 'त्वरित सेवाएं' : 'SERVICES & E-WAY'}
        </div>

        <button
          onClick={() => openEWayBill()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            fontWeight: 500,
            color: 'var(--text-main)',
            backgroundColor: 'transparent',
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={18} style={{ color: '#0f5132', flexShrink: 0 }} />
            <span>{isHindi ? 'ई-वे बिल (EWB)' : 'E-Way Bills'}</span>
          </div>
          <span style={{
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '999px',
            background: 'rgba(15, 81, 50, 0.12)',
            color: '#0f5132',
            fontWeight: 700
          }}>
            {eWayBills.length}
          </span>
        </button>

        <button
          onClick={() => setIsQuotationOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            fontWeight: 500,
            color: 'var(--text-main)',
            backgroundColor: 'transparent',
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={18} style={{ color: '#1e3a5f', flexShrink: 0 }} />
            <span>{isHindi ? 'कोटेशन / एस्टीमेट' : 'Quotations'}</span>
          </div>
          <span style={{
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '999px',
            background: 'rgba(30, 58, 95, 0.12)',
            color: '#1e3a5f',
            fontWeight: 700
          }}>
            {quotations.length}
          </span>
        </button>
      </div>

      {/* Bottom Sync Status Card & Quick Backup */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-color)'
      }}>
        {/* Sync Status Banner */}
        <div
          onClick={() => setIsSyncModalOpen(true)}
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 81, 50, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>
              {isHindi ? '📱 मोबाइल सिंक केंद्र' : '📱 PC & Mobile Sync'}
            </span>
            <RefreshCw size={12} style={{ color: 'var(--primary-600)' }} />
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
            {isHindi ? '2 डिवाइस जुड़े हैं। क्लिक करके सिंक कोड देखें।' : '2 Active Devices. Tap to pair phone or backup.'}
          </p>
        </div>

        {/* Quick Backup Button */}
        <button
          onClick={exportDataToJson}
          className="btn-secondary"
          style={{ width: '100%', fontSize: '0.78rem', padding: '7px 10px', gap: '6px' }}
        >
          <Download size={13} /> {isHindi ? 'डेटा बैकअप (JSON)' : 'Quick Backup (JSON)'}
        </button>
      </div>
    </aside>
  );
}
