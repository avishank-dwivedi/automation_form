import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Share2,
  X,
  FileCheck,
  Receipt,
  ScanBarcode,
  Download,
  Truck
} from 'lucide-react';

export default function InvoicePreviewModal({ invoice, onClose, onGenerateEWayBill }) {
  const { businessProfile, language } = useApp();
  const [template, setTemplate] = useState('modern'); // 'modern' | 'mandi' | 'thermal'

  if (!invoice) return null;

  const isHindi = language === 'hi';

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*GST TAX INVOICE - ${businessProfile.name}*\n` +
      `--------------------------------\n` +
      `Bill No: ${invoice.invoiceNumber}\n` +
      `Date: ${invoice.date}\n` +
      `Customer: ${invoice.partyName || 'Cash Sale'}\n` +
      `Items: ${invoice.items?.map((it) => `${it.name} (${it.quantity} ${it.unit}) - Rs.${it.total}`).join('\n')}\n` +
      `--------------------------------\n` +
      `*Grand Total: Rs. ${Number(invoice.grandTotal).toLocaleString('en-IN')}*\n` +
      `Status: ${invoice.status}\n` +
      `Pay via UPI: ${businessProfile.upiId}\n\n` +
      `Thank you for trusting Jai Kisan Vyapar!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadInvoiceJSON = () => {
    const jsonStr = JSON.stringify(invoice, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay print-active-modal">
      <div className="modal-content" style={{
        maxWidth: template === 'thermal' ? '460px' : '880px',
        width: '95%',
        padding: '0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'var(--bg-surface-alt)',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Template Switcher */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setTemplate('modern')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: template === 'modern' ? '#ffffff' : 'var(--text-muted)',
                background: template === 'modern' ? 'var(--primary-700)' : 'transparent'
              }}
            >
              <FileCheck size={14} /> Modern GST
            </button>
            <button
              onClick={() => setTemplate('mandi')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: template === 'mandi' ? '#ffffff' : 'var(--text-muted)',
                background: template === 'mandi' ? 'var(--primary-700)' : 'transparent'
              }}
            >
              <Receipt size={14} /> Mandi Bill
            </button>
            <button
              onClick={() => setTemplate('thermal')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: template === 'thermal' ? '#ffffff' : 'var(--text-muted)',
                background: template === 'thermal' ? 'var(--primary-700)' : 'transparent'
              }}
            >
              <ScanBarcode size={14} /> 3" Thermal POS
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onGenerateEWayBill && (
              <button
                onClick={() => onGenerateEWayBill(invoice)}
                className="btn-primary"
                style={{ background: '#0f5132', padding: '7px 12px', fontSize: '0.82rem', gap: '5px' }}
                title={isHindi ? 'इस इनवॉइस के लिए GST ई-वे बिल बनाएं' : 'Generate official E-Way Bill for this invoice'}
              >
                <Truck size={15} /> {isHindi ? 'ई-वे बिल' : 'E-Way Bill'}
              </button>
            )}
            <button
              onClick={handleWhatsAppShare}
              className="btn-primary"
              style={{ background: '#16a34a', padding: '7px 12px', fontSize: '0.82rem' }}
            >
              <Share2 size={15} /> WhatsApp
            </button>
            <button
              onClick={handleDownloadInvoiceJSON}
              className="btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              title={isHindi ? 'डिजिटल इनवॉइस JSON डाउनलोड करें' : 'Download Invoice JSON Record'}
            >
              <Download size={14} /> JSON
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              title={isHindi ? 'प्रिंट करें या PDF के रूप में सेव करें' : 'Print or Save as PDF (in print dialog select Destination -> Save as PDF)'}
            >
              <Printer size={15} /> {isHindi ? 'प्रिंट / सेव PDF' : 'Print / Save PDF'}
            </button>
            <button
              onClick={onClose}
              className="btn-icon"
              style={{ padding: '6px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div style={{ padding: template === 'thermal' ? '16px' : '28px', maxHeight: '78vh', overflowY: 'auto', background: '#ffffff', color: '#111827' }}>
          
          {/* ================= FORMAT 1: MODERN GST TAX INVOICE ================= */}
          {template === 'modern' && (
            <div className="print-area" style={{ fontFamily: 'Inter, sans-serif' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f5132', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <img
                    src={businessProfile.logoUrl || "/logo.jpg"}
                    alt="Logo"
                    style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f5132', margin: 0 }}>
                      {businessProfile.name}
                    </h2>
                    <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#4b5563' }}>
                      {businessProfile.tagline}
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#374151' }}>
                      {businessProfile.address}
                    </p>
                    <p style={{ margin: '2px 0', fontSize: '0.82rem', fontWeight: 600 }}>
                      GSTIN: <span style={{ fontFamily: 'monospace' }}>{businessProfile.gstin}</span> • State: {businessProfile.state}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#0f5132',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    TAX INVOICE
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    Invoice No: <span style={{ fontFamily: 'monospace' }}>{invoice.invoiceNumber}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#4b5563' }}>
                    Date: {invoice.date}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#4b5563' }}>
                    Due Date: {invoice.dueDate || invoice.date}
                  </div>
                </div>
              </div>

              {/* Bill To / Buyer Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f9fafb', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#6b7280' }}>
                    Billed To (Buyer):
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
                    {invoice.partyName || 'Cash Sale'}
                  </div>
                  {invoice.partyAddress && (
                    <div style={{ fontSize: '0.82rem', color: '#4b5563' }}>{invoice.partyAddress}</div>
                  )}
                  {invoice.partyPhone && (
                    <div style={{ fontSize: '0.82rem', color: '#4b5563' }}>Phone: {invoice.partyPhone}</div>
                  )}
                  {invoice.partyGstin && (
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>GSTIN: {invoice.partyGstin}</div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#6b7280' }}>
                    Payment Status:
                  </span>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: invoice.status === 'Paid' ? '#d1fae5' : '#fef3c7',
                      color: invoice.status === 'Paid' ? '#065f46' : '#92400e'
                    }}>
                      {invoice.status === 'Paid' ? 'PAID / नकद प्राप्त' : 'UNPAID / उधारी'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#4b5563', marginTop: '4px' }}>
                    Mode: {invoice.paymentMode}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    <th style={{ padding: '8px 10px', width: '35px' }}>#</th>
                    <th style={{ padding: '8px 10px' }}>Item Description</th>
                    <th style={{ padding: '8px 10px' }}>HSN</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>GST %</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>CGST (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>SGST (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Taxable</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 10px', color: '#6b7280' }}>{i + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{it.name}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{it.hsn || '-'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{it.quantity} {it.unit}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{it.rate}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{it.gstRate}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{it.cgst}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{it.sgst}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{it.taxableAmount || it.total}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{Number(it.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Calculations & Bank Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
                {/* Bank Details & QR Code */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>
                    Bank & UPI Payment Details
                  </div>
                  <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e5e7eb' }}>
                    <div><strong>Bank:</strong> {businessProfile.bankName}</div>
                    <div><strong>A/C No:</strong> <span style={{ fontFamily: 'monospace' }}>{businessProfile.accountNumber}</span></div>
                    <div><strong>IFSC:</strong> {businessProfile.ifsc} • <strong>Branch:</strong> {businessProfile.branch}</div>
                    <div><strong>UPI ID:</strong> <span style={{ color: '#0f5132', fontWeight: 700 }}>{businessProfile.upiId}</span></div>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.4 }}>
                    <strong>Terms & Conditions:</strong><br />
                    {businessProfile.termsAndConditions}
                  </div>
                </div>

                {/* Amount Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Taxable Amount:</span>
                    <span style={{ fontFamily: 'monospace' }}>₹{Number(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Total GST Tax:</span>
                    <span style={{ fontFamily: 'monospace' }}>₹{Number(invoice.totalTax).toFixed(2)}</span>
                  </div>
                  {invoice.roundOff !== 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                      <span>Round Off:</span>
                      <span style={{ fontFamily: 'monospace' }}>{invoice.roundOff > 0 ? `+₹${invoice.roundOff}` : `-₹${Math.abs(invoice.roundOff)}`}</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderTop: '2px solid #111827',
                    borderBottom: '2px solid #111827',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#0f5132'
                  }}>
                    <span>Grand Total:</span>
                    <span>₹{Number(invoice.grandTotal).toLocaleString('en-IN')}</span>
                  </div>

                  {invoice.balanceDue > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 700 }}>
                      <span>Balance Due (उधार):</span>
                      <span>₹{Number(invoice.balanceDue).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Signatory */}
                  <div style={{ marginTop: '28px', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>For {businessProfile.name}</div>
                    <div style={{ marginTop: '28px', borderTop: '1px dashed #9ca3af', display: 'inline-block', minWidth: '150px', fontSize: '0.75rem', fontWeight: 600 }}>
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= FORMAT 2: MANDI / VYAPAR BILL ================= */}
          {template === 'mandi' && (
            <div className="print-area" style={{ border: '2px solid #1f2937', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>।। श्री गणेशाय नमः ।। जय किसान ।।</div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '2px 0', color: '#0f5132' }}>{businessProfile.name}</h2>
                <div style={{ fontSize: '0.85rem' }}>कृषि उपज मंडी समिति, {businessProfile.address}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>मो.: {businessProfile.phone} • GSTIN: {businessProfile.gstin}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px' }}>
                <div>
                  <strong>क्रेता का नाम (Buyer):</strong> {invoice.partyName || 'नकद ग्राहक'}<br />
                  <strong>पता (Village):</strong> {invoice.partyAddress || 'लोकल'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>बिल नं.:</strong> {invoice.invoiceNumber}<br />
                  <strong>दिनांक:</strong> {invoice.date}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1f2937', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #1f2937' }}>
                    <th style={{ border: '1px solid #1f2937', padding: '6px' }}>क्र.</th>
                    <th style={{ border: '1px solid #1f2937', padding: '6px' }}>जिंस / सामान का नाम</th>
                    <th style={{ border: '1px solid #1f2937', padding: '6px' }}>नग / बोरी</th>
                    <th style={{ border: '1px solid #1f2937', padding: '6px' }}>दर (भाव)</th>
                    <th style={{ border: '1px solid #1f2937', padding: '6px', textAlign: 'right' }}>कुल रकम (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((it, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #1f2937', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ border: '1px solid #1f2937', padding: '6px', fontWeight: 600 }}>{it.name}</td>
                      <td style={{ border: '1px solid #1f2937', padding: '6px', textAlign: 'center' }}>{it.quantity} {it.unit}</td>
                      <td style={{ border: '1px solid #1f2937', padding: '6px', textAlign: 'center' }}>₹{it.rate}</td>
                      <td style={{ border: '1px solid #1f2937', padding: '6px', textAlign: 'right', fontWeight: 700 }}>₹{it.total}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid #1f2937', padding: '8px', textAlign: 'right', fontWeight: 800 }}>
                      कुल योग (Grand Total):
                    </td>
                    <td style={{ border: '1px solid #1f2937', padding: '8px', textAlign: 'right', fontWeight: 900, fontSize: '1rem', color: '#0f5132' }}>
                      ₹{Number(invoice.grandTotal).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.8rem' }}>
                <div>
                  स्थिति: <strong>{invoice.status === 'Paid' ? 'नकद प्राप्त (PAID)' : 'उधार (CREDIT)'}</strong><br />
                  भुगतान UPI: {businessProfile.upiId}
                </div>
                <div style={{ textAlign: 'center' }}>
                  हस्ताक्षर विक्रेता / मुनीम
                </div>
              </div>
            </div>
          )}

          {/* ================= FORMAT 3: 3-INCH THERMAL POS BILL ================= */}
          {template === 'thermal' && (
            <div className="print-area thermal-receipt" style={{ margin: '0 auto', padding: '8px', fontSize: '12px', lineHeight: 1.35, color: '#000000' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 900, fontSize: '14px' }}>{businessProfile.name}</div>
                <div>{businessProfile.address}</div>
                <div>Mob: {businessProfile.phone}</div>
                <div>GSTIN: {businessProfile.gstin}</div>
                <div style={{ margin: '4px 0', borderBottom: '1px dashed #000' }}></div>
                <div style={{ fontWeight: 700 }}>CASH / CREDIT RECEIPT</div>
                <div>Bill No: {invoice.invoiceNumber} • Date: {invoice.date}</div>
                <div>Customer: {invoice.partyName || 'Cash Sale'}</div>
                <div style={{ margin: '4px 0', borderBottom: '1px dashed #000' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '3px' }}>
                <span>Item</span>
                <span>Qty x Rate</span>
                <span>Total</span>
              </div>

              {invoice.items?.map((it, i) => (
                <div key={i} style={{ padding: '3px 0', borderBottom: '1px dotted #ccc' }}>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.quantity} {it.unit} @ ₹{it.rate}</span>
                    <span style={{ fontWeight: 700 }}>₹{it.total}</span>
                  </div>
                </div>
              ))}

              <div style={{ margin: '6px 0', borderBottom: '1px dashed #000' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px' }}>
                <span>TOTAL AMOUNT:</span>
                <span>₹{Number(invoice.grandTotal).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '3px' }}>
                <span>Status:</span>
                <span>{invoice.status} ({invoice.paymentMode})</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px' }}>
                <div>Scan UPI: {businessProfile.upiId}</div>
                <div>*** Thank You! Visit Again ***</div>
                <div>Powered by Jai Kisan Vyapar</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
