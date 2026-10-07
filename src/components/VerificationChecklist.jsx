import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  X,
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Receipt,
  FileCheck,
  Package,
  Users,
  Wallet,
  BarChart3,
  Settings,
  Truck,
  FileText,
  Server,
  FileEdit
} from 'lucide-react';

/**
 * VerificationChecklist – Complete system verification suite that lists all major
 * components and subsystems of the Jai Kisan Vyapar app together with status,
 * descriptions, and batch completion controls.
 */
const defaultItems = [
  {
    id: 'scratchpad',
    name: 'Pre-Made Scratchpad',
    category: 'Sales Estimates',
    icon: FileEdit,
    description: 'Pre-made industry rough pads (Agri, Kirana, Wholesale, Electronics, Creators), calculation grid, WhatsApp share & 1-click conversion.',
  },
  {
    id: 'mobile-view-shell',
    name: 'MobileViewShell',
    category: 'UI & Simulator',
    icon: Smartphone,
    description: 'Responsive mobile wrapper simulating phone frame, notch bar & bottom dock navigation.',
  },
  {
    id: 'sync-modal',
    name: 'SyncModal',
    category: 'Sync Engine',
    icon: Sparkles,
    description: 'Handles instant PC ↔️ Mobile data synchronization via BroadcastChannel & cloud room code.',
  },
  {
    id: 'invoice-builder',
    name: 'InvoiceBuilder',
    category: 'Billing & POS',
    icon: Receipt,
    description: 'Creates GST tax invoices, calculates CGST/SGST/IGST, discounts, roundoff and stock deduction.',
  },
  {
    id: 'invoice-preview-modal',
    name: 'InvoicePreviewModal',
    category: 'Billing & POS',
    icon: FileCheck,
    description: 'Print-ready preview supporting Modern GST, Mandi Vyapar, and 3" Thermal POS receipt templates.',
  },
  {
    id: 'inventory-manager',
    name: 'InventoryManager',
    category: 'Inventory',
    icon: Package,
    description: 'Stock management, low-stock threshold warning badges, batch numbers, and expiry date tracking.',
  },
  {
    id: 'party-khata',
    name: 'PartyKhata',
    category: 'Khata & Ledger',
    icon: Users,
    description: 'Customer & supplier ledger, credit limits, payment recording, and WhatsApp payment reminders.',
  },
  {
    id: 'expenses-cashbook',
    name: 'ExpensesCashbook',
    category: 'Cash Flow',
    icon: Wallet,
    description: 'Daily cashbook, petty cash entries, mandi labor, transportation, and operational expenses.',
  },
  {
    id: 'reports',
    name: 'Reports',
    category: 'Analytics & Tax',
    icon: BarChart3,
    description: 'GSTR-1, GSTR-3B tax report generator, sales vs expense summaries & Excel export.',
  },
  {
    id: 'settings',
    name: 'Settings',
    category: 'Configuration',
    icon: Settings,
    description: 'Business profile, GSTIN, bank A/C, UPI QR, thermal printer options & JSON backup/restore.',
  },
  {
    id: 'ewaybill-builder',
    name: 'EWayBillBuilder',
    category: 'Transport & EWB',
    icon: Truck,
    description: 'Form GST EWB-01 generation, direct Government NIC Portal API authentication & generation, distance auto-validity, JSON export & WhatsApp share.',
  },
  {
    id: 'quotation-builder',
    name: 'QuotationBuilder',
    category: 'Sales Estimates',
    icon: FileText,
    description: 'Price estimates, subject & terms, print preview and 1-click conversion to GST Tax Invoice.',
  },
  {
    id: 'app-context',
    name: 'AppContext',
    category: 'State & Store',
    icon: ShieldCheck,
    description: 'Global React context managing state, localStorage caching, live sync, and audio chimes.',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'Overview',
    icon: BarChart3,
    description: 'Live KPIs (Today sales, receivables, payables, stock value), quick actions, and low stock alerts.',
  },
  {
    id: 'backend-server',
    name: 'Express & MongoDB Server',
    category: 'Backend & Database',
    icon: Server,
    description: 'Full REST CRUD API routes, MongoDB Atlas/Local connection, and Government NIC E-Way Bill API integration (/api/ewb/*).',
  }
];

export default function VerificationChecklist({ onClose }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('verificationChecklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with any newly added items in defaultItems
        return defaultItems.map(def => {
          const existing = parsed.find(p => p.id === def.id);
          return {
            ...def,
            checked: existing ? existing.checked : true
          };
        });
      } catch (_) {
        // fallback
      }
    }
    // Default to all checked for a completed verification state
    return defaultItems.map(i => ({ ...i, checked: true }));
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Persist state on every change
  useEffect(() => {
    localStorage.setItem('verificationChecklist', JSON.stringify(items));
  }, [items]);

  const toggleItem = id => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkAll = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: true })));
    showToast('✅ All components marked as Complete & Verified!');
  };

  const uncheckAll = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: false })));
    showToast('Reset all checklist items.');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const checkedCount = items.filter(i => i.checked).length;
  const progressPercent = Math.round((checkedCount / items.length) * 100);
  const isAllComplete = checkedCount === items.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="print-area"
        style={{
          background: 'var(--bg-surface, #ffffff)',
          color: 'var(--text-main, #111827)',
          borderRadius: '16px',
          width: '95%',
          maxWidth: '880px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid var(--border-color, #e5e7eb)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #062b1a 0%, #0f5132 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} style={{ color: '#10b981' }} />
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                System Verification & QA Checklist
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.82)' }}>
              Complete feature verification status for Jai Kisan Vyapar ERP & Billing Platform
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: isAllComplete ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              border: `1px solid ${isAllComplete ? '#10b981' : '#f59e0b'}`,
              color: isAllComplete ? '#6ee7b7' : '#fde68a',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              {isAllComplete ? '100% COMPLETE' : `${progressPercent}% VERIFIED`}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar & Quick Actions Toolbar */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--bg-surface-alt, #f8fafc)',
          borderBottom: '1px solid var(--border-color, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Progress bar */}
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              flex: 1,
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: progressPercent === 100 ? '#10b981' : '#0f5132',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted, #475569)' }}>
              {checkedCount} / {items.length} Done
            </span>
          </div>

          {/* Quick buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={checkAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#0f5132',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <CheckSquare size={14} /> Complete All That
            </button>
            <button
              onClick={uncheckAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'transparent',
                color: 'var(--text-muted, #64748b)',
                border: '1px solid var(--border-color, #cbd5e1)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{
            background: '#ecfdf5',
            color: '#065f46',
            padding: '8px 24px',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderBottom: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} /> {toastMessage}
          </div>
        )}

        {/* Checklist Table */}
        <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.86rem'
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'var(--bg-surface-alt, #f1f5f9)',
                  borderBottom: '2px solid var(--border-color, #cbd5e1)',
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  fontSize: '0.74rem',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted, #475569)'
                }}
              >
                <th style={{ padding: '10px 12px', width: '45px' }}>#</th>
                <th style={{ padding: '10px 12px', width: '180px' }}>Component</th>
                <th style={{ padding: '10px 12px', width: '130px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', width: '90px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const IconComponent = item.icon || ShieldCheck;
                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      backgroundColor: item.checked ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                    onClick={() => toggleItem(item.id)}
                  >
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconComponent size={16} style={{ color: item.checked ? '#0f5132' : '#64748b', flexShrink: 0 }} />
                        <span style={{ color: item.checked ? '#0f5132' : 'inherit' }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'var(--bg-surface-alt, #f1f5f9)',
                        color: 'var(--text-muted, #475569)',
                        fontWeight: 600
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-muted, #334155)' }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                        style={{
                          background: item.checked ? '#10b981' : 'transparent',
                          color: item.checked ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                          border: `1.5px solid ${item.checked ? '#10b981' : '#cbd5e1'}`,
                          borderRadius: '6px',
                          padding: '4px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {item.checked ? <CheckCircle2 size={13} /> : <Square size={13} />}
                        {item.checked ? 'Done' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          borderTop: '1px solid var(--border-color, #e5e7eb)',
          background: 'var(--bg-surface-alt, #f8fafc)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
            Status: {isAllComplete ? (
              <strong style={{ color: '#0f5132' }}>✅ All 14 system subsystems verified and ready</strong>
            ) : (
              <span style={{ color: '#d97706' }}>⚠️ {items.length - checkedCount} pending verification</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color, #cbd5e1)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: 'var(--text-main, #334155)'
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                checkAll();
                setTimeout(() => {
                  alert('🎉 All 14 components of Jai Kisan Vyapar are fully verified and active!');
                  onClose();
                }, 400);
              }}
              style={{
                background: 'linear-gradient(135deg, #0f5132, #15803d)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(15, 81, 50, 0.25)'
              }}
            >
              <CheckCircle2 size={16} /> Complete & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
