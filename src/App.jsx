import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceBuilder from './components/InvoiceBuilder';
import InvoicePreviewModal from './components/InvoicePreviewModal';
import InventoryManager from './components/InventoryManager';
import PartyKhata from './components/PartyKhata';
import ExpensesCashbook from './components/ExpensesCashbook';
import Reports from './components/Reports';
import Settings from './components/Settings';
import SyncModal from './components/SyncModal';
import MobileViewShell from './components/MobileViewShell';
import VerificationChecklist from './components/VerificationChecklist';
import EWayBillBuilder from './components/EWayBillBuilder';
import QuotationBuilder from './components/QuotationBuilder';
import Scratchpad from './components/Scratchpad';

function MainApp() {
  const {
    activeTab,
    setActiveTab,
    deviceView,
    isChecklistOpen,
    setIsChecklistOpen,
    isEWayBillOpen,
    openEWayBill,
    closeEWayBill,
    eWayBillInitialInvoice,
    isQuotationOpen,
    setIsQuotationOpen
  } = useApp();

  // Preview invoice modal state
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [selectedPartyForReminder, setSelectedPartyForReminder] = useState(null);

  // Global Keyboard Shortcuts (F2: New Bill, F3: Inventory, F4: Khata, F7: Scratchpad)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('billing');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('parties');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setActiveTab('scratchpad');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onOpenInvoicePreview={(inv) => setPreviewInvoice(inv)}
            onOpenReminderModal={(party) => {
              setSelectedPartyForReminder(party);
              setActiveTab('parties');
            }}
            onOpenEWayBill={() => openEWayBill()}
            onOpenQuotation={() => setIsQuotationOpen(true)}
          />
        );
      case 'billing':
        return (
          <InvoiceBuilder
            onOpenPreview={(inv) => setPreviewInvoice(inv)}
          />
        );
      case 'scratchpad':
        return <Scratchpad />;
      case 'inventory':
        return <InventoryManager />;
      case 'parties':
        return (
          <PartyKhata
            selectedPartyForReminder={selectedPartyForReminder}
            onCloseReminder={() => setSelectedPartyForReminder(null)}
          />
        );
      case 'expenses':
        return <ExpensesCashbook />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {deviceView === 'mobile_sim' ? (
        /* Mobile Smartphone Simulator View */
        <MobileViewShell>
          {renderTabContent()}
        </MobileViewShell>
      ) : (
        /* Desktop PC View */
        <div className="app-container">
          <Sidebar />
          <div className="app-content">
            <Header />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '4px 12px' }}>
              <button
                onClick={() => setActiveTab('scratchpad')}
                style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
              >📝 Pre-made Scratchpad (F7)</button>
              <button
                onClick={() => openEWayBill()}
                style={{ background: '#0f5132', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
              >🚛 E-Way Bill</button>
              <button
                onClick={() => setIsQuotationOpen(true)}
                style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
              >📋 Quotation</button>
              <button
                onClick={() => setIsChecklistOpen(true)}
                style={{ background: '#475569', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
              >✅ System Checklist</button>
            </div>
            <main style={{ flex: 1, paddingBottom: '32px' }}>
              {renderTabContent()}
            </main>
          </div>
        </div>
      )}

      {/* Global Invoice Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onGenerateEWayBill={(inv) => {
            openEWayBill(inv);
            setPreviewInvoice(null);
          }}
        />
      )}

      {/* PC & Mobile Sync Center Modal */}
      <SyncModal />
      {isChecklistOpen && (
        <VerificationChecklist onClose={() => setIsChecklistOpen(false)} />
      )}
      {isEWayBillOpen && (
        <EWayBillBuilder
          initialInvoice={eWayBillInitialInvoice}
          onClose={closeEWayBill}
        />
      )}
      {isQuotationOpen && (
        <QuotationBuilder onClose={() => setIsQuotationOpen(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
