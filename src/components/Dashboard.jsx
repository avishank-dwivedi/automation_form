import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Wallet,
  AlertTriangle,
  PlusCircle,
  Share2,
  Printer,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  Clock,
  Send,
  Truck,
  FileText
} from 'lucide-react';

export default function Dashboard({ onOpenInvoicePreview, onOpenPaymentModal, onOpenReminderModal, onOpenEWayBill, onOpenQuotation }) {
  const {
    invoices,
    products,
    parties,
    expenses,
    language,
    setActiveTab,
    setIsSyncModalOpen
  } = useApp();

  const isHindi = language === 'hi';

  // 1. Calculate Today's Sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter((inv) => inv.date === todayStr || inv.date === '2026-09-22');
  const todaySalesTotal = todayInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

  // 2. Total Receivables (Customers who owe money - Udhaar)
  const totalReceivables = parties
    .filter((p) => p.balance > 0)
    .reduce((sum, p) => sum + Number(p.balance), 0);

  // 3. Total Payables (Suppliers we owe money to)
  const totalPayables = parties
    .filter((p) => p.balance < 0)
    .reduce((sum, p) => sum + Math.abs(Number(p.balance)), 0);

  // 4. Total Stock Asset Value
  const totalStockValue = products.reduce(
    (sum, p) => sum + Number(p.stock) * Number(p.purchasePrice || p.sellingPrice),
    0
  );

  // 5. Cash in Hand & Bank estimation
  const totalCashCollected = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + Number(i.paidAmount || i.grandTotal), 0);
  const totalExpensesSum = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const estimatedLiquidBalance = Math.max(15400, totalCashCollected - totalExpensesSum + 25000);

  // Low stock items filter
  const lowStockItems = products.filter((p) => p.stock <= p.minStock);

  // Parties with pending balance for quick reminder
  const overdueParties = parties.filter((p) => p.balance > 0);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome & Quick Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '18px 24px',
        background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-700) 100%)',
        borderRadius: 'var(--radius-lg)',
        color: '#ffffff',
        boxShadow: '0 8px 20px rgba(15, 81, 50, 0.25)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {isHindi ? 'नमस्ते, आज का व्यापार अवलोकन' : "Welcome back, Today's Business Overview"}
            </h2>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
            {isHindi
              ? 'जीएसटी बिलिंग, स्टॉक अपडेट और मोबाइल सिंक पूरी तरह चालू है।'
              : 'GST Billing, Live Stock alerts, and PC-Mobile Sync are actively running.'}
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('billing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: 'var(--primary-800)',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            <PlusCircle size={17} style={{ color: 'var(--primary-600)' }} />
            {isHindi ? 'नया बिक्री बिल (F2)' : '+ Create Sale Bill (F2)'}
          </button>

          <button
            onClick={() => setActiveTab('parties')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            <ArrowDownLeft size={16} />
            {isHindi ? 'भुगतान लें / जमा' : 'Record Payment (F4)'}
          </button>

          {onOpenEWayBill && (
            <button
              onClick={onOpenEWayBill}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
              title="Generate Official GST E-Way Bill"
            >
              <Truck size={16} />
              {isHindi ? 'ई-वे बिल' : 'E-Way Bill'}
            </button>
          )}

          {onOpenQuotation && (
            <button
              onClick={onOpenQuotation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
              title="Create Quotation / Price Estimate"
            >
              <FileText size={16} />
              {isHindi ? 'कोटेशन' : 'Quotation'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Today's Sales */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {isHindi ? 'आज की बिक्री' : "Today's Sales"}
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              ₹{todaySalesTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {todayInvoices.length} {isHindi ? 'बिल बने' : 'invoices issued'}
            </div>
          </div>
        </div>

        {/* Card 2: Receivables (Udhaar Lena Hai) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {isHindi ? 'कुल उधारी (लेना है)' : 'Total Receivables (To Receive)'}
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--gold-100)', color: 'var(--gold-600)' }}>
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gold-600)', letterSpacing: '-0.02em' }}>
              ₹{totalReceivables.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {overdueParties.length} {isHindi ? 'किसानों / ग्राहकों से' : 'farmers / parties'}
            </div>
          </div>
        </div>

        {/* Card 3: Payables (Dena Hai) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {isHindi ? 'कुल देनदारी (देना है)' : 'Total Payables (To Pay)'}
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--danger-100)', color: 'var(--danger-600)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--danger-600)', letterSpacing: '-0.02em' }}>
              ₹{totalPayables.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isHindi ? 'कंपनियों / डिस्ट्रीब्यूटर्स को' : 'to distributors / companies'}
            </div>
          </div>
        </div>

        {/* Card 4: Inventory Asset Value */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {isHindi ? 'गोदाम स्टॉक मूल्य' : 'Warehouse Stock Value'}
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--info-100)', color: 'var(--info-600)' }}>
              <Package size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              ₹{Math.round(totalStockValue).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {products.length} {isHindi ? 'कुल उत्पाद सूचीबद्ध' : 'items catalogued'}
            </div>
          </div>
        </div>

        {/* Card 5: Estimated Cash & Bank Balance */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {isHindi ? 'रोकड़ व बैंक शेष' : 'Cash & Bank In Hand'}
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-600)' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-700)', letterSpacing: '-0.02em' }}>
              ₹{Math.round(estimatedLiquidBalance).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              SBI Bank + {isHindi ? 'गल्ला कैश' : 'Drawer Cash'}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Notification Banner (If Any) */}
      {lowStockItems.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.18) 100%)',
          border: '1.5px solid var(--gold-400)',
          borderRadius: 'var(--radius-lg)',
          gap: '14px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'var(--gold-500)',
              color: '#ffffff',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold-600)' }}>
                {isHindi ? `चेतावनी: ${lowStockItems.length} उत्पादों का स्टॉक खत्म होने वाला है!` : `Low Stock Alert: ${lowStockItems.length} items need replenishment!`}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {lowStockItems.map((p) => `${p.name} (${p.stock} ${p.unit} बचे)`).join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="btn-primary"
            style={{
              background: 'var(--gold-500)',
              color: '#ffffff',
              fontSize: '0.85rem',
              padding: '7px 14px'
            }}
          >
            {isHindi ? 'स्टॉक देखें व मंगाएं' : 'View Low Stock Items'}
          </button>
        </div>
      )}

      {/* Two Column Section: Recent Invoices & Udhaar Follow-up */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {/* Column 1: Recent Invoices */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              {isHindi ? 'हाल के बिक्री बिल' : 'Recent Sales Invoices'}
            </h3>
            <button
              onClick={() => setActiveTab('billing')}
              style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              {isHindi ? 'सभी देखें' : 'View All'} <ChevronRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-color)',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {inv.partyName || 'Cash Sale / नकद ग्राहक'}
                    </span>
                    <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {inv.status === 'Paid' ? 'Paid' : 'Unpaid (उधार)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span className="font-mono">{inv.invoiceNumber}</span> • {inv.date} • {inv.items?.length || 0} items
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      ₹{Number(inv.grandTotal).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {inv.paymentMode}
                    </div>
                  </div>

                  {/* Actions: View/Print & WhatsApp */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => onOpenInvoicePreview && onOpenInvoicePreview(inv)}
                      className="btn-icon"
                      title="View & Print Invoice"
                      style={{ padding: '6px' }}
                    >
                      <Printer size={15} style={{ color: 'var(--primary-600)' }} />
                    </button>
                    <button
                      onClick={() => {
                        const msg = `*Jai Kisan Krishi Kendra - Bill Summary*\nInvoice: ${inv.invoiceNumber}\nDate: ${inv.date}\nCustomer: ${inv.partyName}\nTotal Amount: Rs. ${inv.grandTotal}\nStatus: ${inv.status}\nThank you for choosing Jai Kisan Vyapar!`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="btn-icon"
                      title="Share Invoice on WhatsApp"
                      style={{ padding: '6px', color: '#16a34a' }}
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Udhaar Khata / Overdue Payment Follow-ups */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              {isHindi ? 'उधारी वसूली व तकाजा (Follow-ups)' : 'Pending Receivables (Follow-ups)'}
            </h3>
            <button
              onClick={() => setActiveTab('parties')}
              style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              {isHindi ? 'खाता देखें' : 'View Khata'} <ChevronRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overdueParties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                  {isHindi ? 'बहुत बढ़िया! कोई उधारी बकाया नहीं है।' : 'All receivables cleared! No overdue amounts.'}
                </p>
              </div>
            ) : (
              overdueParties.map((party) => (
                <div
                  key={party.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {party.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {party.phone} • {party.city}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--gold-600)' }}>
                        ₹{party.balance.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                        {isHindi ? 'लेना है' : 'Pending'}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenReminderModal && onOpenReminderModal(party)}
                      className="btn-primary"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        gap: '4px',
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                      }}
                      title="Send WhatsApp Payment Reminder"
                    >
                      <Send size={12} />
                      {isHindi ? 'तकाजा भेजें' : 'WhatsApp'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
