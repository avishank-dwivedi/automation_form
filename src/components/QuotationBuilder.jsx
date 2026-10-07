import React, { useState } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Printer,
  Share2,
  History,
  ReceiptText,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function QuotationBuilder({ onClose }) {
  const { products, parties, businessProfile, quotations, addQuotation, deleteQuotation, addInvoice, language } = useApp();
  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    quotationNumber: `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    partyId: '',
    partyName: '',
    partyAddress: '',
    partyGSTIN: '',
    partyPhone: '',
    date: new Date().toISOString().split('T')[0],
    validTill: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    terms: '1. Rate valid for 21 days from quote date.\n2. 50% advance along with confirmed order.\n3. Goods delivery subject to stock availability.',
    subject: 'Supply of Fertilizers, Hybrid Seeds & Agri Inputs',
  });

  const [items, setItems] = useState([
    { productId: '', name: 'DAP Fertilizer (IFFCO 50kg Bag)', hsn: '3105', quantity: 20, unit: 'Bags', rate: 1350, gstRate: 5, taxableAmount: 25714.29, cgst: 642.86, sgst: 642.86, igst: 0, total: 27000 },
    { productId: '', name: 'Hybrid Cotton Seed (Rasi 773 - 450g)', hsn: '1209', quantity: 15, unit: 'Pcs', rate: 860, gstRate: 0, taxableAmount: 12900, cgst: 0, sgst: 0, igst: 0, total: 12900 }
  ]);

  const handlePartyChange = (partyId) => {
    const party = parties.find(p => p.id === partyId);
    setFormData(f => ({
      ...f,
      partyId,
      partyName: party?.name || '',
      partyAddress: party?.city ? `${party.city}, ${party.state || 'Haryana'}` : (party?.address || 'Karnal'),
      partyGSTIN: party?.gstin || '',
      partyPhone: party?.phone || ''
    }));
  };

  const handleItemChange = (idx, field, val) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const newItem = { ...item, [field]: val };
      if (field === 'productId') {
        const prod = products.find(p => p.id === val);
        if (prod) {
          newItem.name = prod.name;
          newItem.hsn = prod.hsn || '';
          newItem.rate = prod.sellingPrice || 0;
          newItem.gstRate = prod.gstRate || 0;
          newItem.unit = prod.unit || 'Bags';
        }
      }
      const qty = Number(newItem.quantity) || 0;
      const rate = Number(newItem.rate) || 0;
      const gstRate = Number(newItem.gstRate) || 0;
      const gross = qty * rate;
      const taxableAmount = (gross * 100) / (100 + gstRate);
      const taxAmt = gross - taxableAmount;
      newItem.taxableAmount = Number(taxableAmount.toFixed(2));
      newItem.cgst = Number((taxAmt / 2).toFixed(2));
      newItem.sgst = Number((taxAmt / 2).toFixed(2));
      newItem.igst = 0;
      newItem.total = Number(gross.toFixed(2));
      return newItem;
    });
    setItems(updated);
  };

  const addItem = () => setItems(prev => [
    ...prev,
    { productId: '', name: '', hsn: '', quantity: 1, unit: 'Bags', rate: 0, gstRate: 5, taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
  ]);

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((s, i) => s + (Number(i.taxableAmount) || 0), 0);
  const totalTax = items.reduce((s, i) => s + (Number(i.cgst) || 0) + (Number(i.sgst) || 0), 0);
  const grandTotal = items.reduce((s, i) => s + (Number(i.total) || 0), 0);

  // Generate Print / PDF HTML
  const generateQuotationHtml = (quot) => {
    const q = quot || {
      ...formData,
      items,
      subtotal,
      totalTax,
      grandTotal
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - ${q.quotationNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #fff; color: #111; padding: 28px; font-size: 12px; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
          .brand-title { font-size: 20px; font-weight: 800; color: #1e3a5f; margin-bottom: 2px; }
          .tagline { font-size: 11.5px; color: #4b5563; margin-bottom: 4px; }
          .company-info { font-size: 11px; color: #374151; }
          .quot-badge { display: inline-block; background: #1e3a5f; color: #fff; padding: 4px 14px; border-radius: 4px; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; background: #f8fafc; font-size: 11.5px; }
          .box strong { color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #1e3a5f; color: #ffffff; padding: 7px 8px; text-align: left; font-size: 10.5px; text-transform: uppercase; border: 1px solid #1e3a5f; }
          td { padding: 7px 8px; border: 1px solid #e2e8f0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .total-row { font-weight: bold; background: #f1f5f9; }
          .grand-total-box { margin-top: 14px; display: flex; justify-content: flex-end; }
          .total-card { width: 300px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 12px; }
          .total-card-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-card-grand { display: flex; justify-content: space-between; border-top: 2px solid #1e3a5f; padding-top: 6px; font-size: 14px; font-weight: 800; color: #1e3a5f; }
          .footer-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          .terms-box { font-size: 10.5px; color: #475569; white-space: pre-line; }
          .signatory-box { text-align: right; font-size: 11px; }
          .sign-line { margin-top: 40px; border-top: 1px dashed #94a3b8; display: inline-block; min-width: 150px; text-align: center; font-size: 10.5px; font-weight: 600; padding-top: 4px; }
          @media print {
            body { padding: 12px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">${businessProfile.name}</div>
            <div class="tagline">${businessProfile.tagline}</div>
            <div class="company-info">
              ${businessProfile.address}<br>
              <strong>GSTIN:</strong> ${businessProfile.gstin} &bull; <strong>Phone:</strong> ${businessProfile.phone}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="quot-badge">QUOTATION / ESTIMATE</div>
            <div style="font-size: 12px; font-weight: bold; margin-top: 4px;">Quote No: <span class="font-mono">${q.quotationNumber}</span></div>
            <div style="font-size: 11px; color: #4b5563;">Date: <strong>${q.date}</strong></div>
            <div style="font-size: 11px; color: #b91c1c; font-weight: 600;">Valid Till: <strong>${q.validTill}</strong></div>
          </div>
        </div>

        <div class="grid-2">
          <div class="box">
            <strong style="color: #1e3a5f; text-transform: uppercase;">Quotation For (Client / Customer):</strong><br>
            <strong style="font-size: 13px;">${q.partyName || 'Customer / Trader'}</strong><br>
            ${q.partyAddress ? `Address: ${q.partyAddress}<br>` : ''}
            ${q.partyPhone ? `Phone: ${q.partyPhone}<br>` : ''}
            ${q.partyGSTIN ? `GSTIN: ${q.partyGSTIN}` : ''}
          </div>
          <div class="box">
            <strong style="color: #1e3a5f; text-transform: uppercase;">Subject / Reference:</strong><br>
            <div style="font-weight: 700; color: #1e3a5f; font-size: 12px; margin-top: 2px;">${q.subject || 'Supply Quotation'}</div>
            <div style="margin-top: 6px; font-size: 11px; color: #475569;">
              Payment Bank: <strong>${businessProfile.bankName}</strong> &bull; UPI: <strong>${businessProfile.upiId}</strong>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th>HSN</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Rate (₹)</th>
              <th class="text-center">GST%</th>
              <th class="text-right">Taxable (₹)</th>
              <th class="text-right">GST (₹)</th>
              <th class="text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(q.items || []).map((it, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${it.name}</strong></td>
                <td class="font-mono">${it.hsn || '-'}</td>
                <td class="text-center">${it.quantity} ${it.unit}</td>
                <td class="text-right font-mono">${Number(it.rate).toFixed(2)}</td>
                <td class="text-center">${it.gstRate}%</td>
                <td class="text-right font-mono">${Number(it.taxableAmount).toFixed(2)}</td>
                <td class="text-right font-mono">${Number(it.cgst + it.sgst).toFixed(2)}</td>
                <td class="text-right font-mono" style="font-weight: 700;">${Number(it.total).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="grand-total-box">
          <div class="total-card">
            <div class="total-card-row">
              <span>Taxable Subtotal:</span>
              <span class="font-mono">₹${Number(q.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="total-card-row">
              <span>Total GST Tax:</span>
              <span class="font-mono">₹${Number(q.totalTax || 0).toFixed(2)}</span>
            </div>
            <div class="total-card-grand">
              <span>Estimated Total:</span>
              <span class="font-mono">₹${Number(q.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div class="footer-grid">
          <div>
            <strong style="font-size: 11px; text-transform: uppercase; color: #1e3a5f;">Terms & Conditions:</strong>
            <div class="terms-box">${q.terms}</div>
          </div>
          <div class="signatory-box">
            <div>For <strong>${businessProfile.name}</strong></div>
            <div class="sign-line">Authorized Signatory</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Actions
  const handlePrint = (quot) => {
    const html = generateQuotationHtml(quot);
    const w = window.open('', '_blank', 'width=900,height=750');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => {
        w.print();
      }, 350);
    } else {
      alert('Popup blocker prevented print window. Please allow popups.');
    }
  };

  const handleWhatsAppShare = (quot) => {
    const q = quot || {
      ...formData,
      items,
      grandTotal
    };

    const itemsSummary = (q.items || []).map(i => `• ${i.name} (${i.quantity} ${i.unit}) - Rs. ${i.total}`).join('\n');
    const msg =
      `*PRICE ESTIMATE / QUOTATION - ${businessProfile.name}*\n` +
      `--------------------------------\n` +
      `Quote No: ${q.quotationNumber}\n` +
      `Date: ${q.date} (Valid Till: ${q.validTill})\n` +
      `Customer: ${q.partyName || 'Customer'}\n` +
      `Subject: ${q.subject}\n` +
      `--------------------------------\n` +
      `${itemsSummary}\n` +
      `--------------------------------\n` +
      `*Estimated Grand Total: Rs. ${Number(q.grandTotal || 0).toLocaleString('en-IN')}*\n` +
      `Pay UPI: ${businessProfile.upiId}\n\n` +
      `Thank you for contacting Jai Kisan Vyapar!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSave = () => {
    const buyerParty = parties.find(p => p.id === formData.partyId);
    addQuotation({
      ...formData,
      partyName: formData.partyName || buyerParty?.name || 'Walk-in Customer',
      items,
      subtotal,
      totalTax,
      roundOff: Math.round(grandTotal) - grandTotal,
      grandTotal: Math.round(grandTotal),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab('history');
    }, 1200);
  };

  const handleConvertToInvoice = (quotationToConvert) => {
    const q = quotationToConvert || {
      ...formData,
      items,
      subtotal,
      totalTax,
      grandTotal
    };

    const newInvoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      partyId: q.partyId || '',
      partyName: q.partyName || 'Cash Sale',
      partyPhone: q.partyPhone || '',
      partyAddress: q.partyAddress || '',
      partyGstin: q.partyGSTIN || '',
      items: (q.items || []).map(it => ({
        ...it,
        total: Number(it.total) || 0
      })),
      subtotal: Number(q.subtotal || subtotal),
      totalTax: Number(q.totalTax || totalTax),
      roundOff: 0,
      grandTotal: Number(q.grandTotal || grandTotal),
      paidAmount: Number(q.grandTotal || grandTotal),
      balanceDue: 0,
      paymentMode: 'Cash',
      status: 'Paid',
      notes: `Converted from Quotation ${q.quotationNumber}. Jai Kisan Vyapar.`
    };

    addInvoice(newInvoice);
    alert(`✅ Quotation ${q.quotationNumber} successfully converted to Sale Invoice ${newInvoice.invoiceNumber}!`);
    onClose?.();
  };

  return (
    <div className="quot-overlay" onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="quot-modal">
        {/* Header */}
        <div className="quot-header">
          <div className="quot-header-left">
            <div className="quot-icon-wrap"><FileText size={22} /></div>
            <div>
              <h2>{isHindi ? 'कोटेशन व मूल्य अनुमान (Quotation Maker)' : 'Quotation & Price Estimates'}</h2>
              <p>{isHindi ? 'पेशेवर कोटेशन बनाएं, PDF प्रिंट करें व व्हाट्सएप पर शेयर करें' : 'Create professional estimates, print/save PDF & share on WhatsApp'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="tab-pill-box">
              <button
                className={`tab-pill ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                <Plus size={14} /> {isHindi ? 'नया कोटेशन' : 'New Quote'}
              </button>
              <button
                className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={14} /> {isHindi ? 'पुराने कोटेशन' : 'Saved Quotes'} ({quotations.length})
              </button>
            </div>
            <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="quot-body">
          {activeTab === 'create' ? (
            <>
              {/* Form Grid */}
              <div className="quot-form-grid">
                <div className="form-group">
                  <label>Quotation Number</label>
                  <input
                    value={formData.quotationNumber}
                    onChange={e => setFormData(f => ({ ...f, quotationNumber: e.target.value }))}
                    className="font-mono font-bold"
                    style={{ color: '#1e3a5f' }}
                  />
                </div>

                <div className="form-group">
                  <label>Customer / Party</label>
                  <select
                    value={formData.partyId}
                    onChange={e => handlePartyChange(e.target.value)}
                  >
                    <option value="">-- Select Party or Type Below --</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    value={formData.partyName}
                    onChange={e => setFormData(f => ({ ...f, partyName: e.target.value }))}
                    placeholder="Customer / Farm Name"
                  />
                </div>

                <div className="form-group">
                  <label>Subject / Title</label>
                  <input
                    value={formData.subject}
                    onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Rabi Season Wheat Seed & Fertilizer Estimation"
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Valid Till</label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={e => setFormData(f => ({ ...f, validTill: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={formData.terms}
                    onChange={e => setFormData(f => ({ ...f, terms: e.target.value }))}
                    placeholder="Payment terms, delivery timeline, validity period..."
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="quot-items-section">
                <div className="quot-items-header">
                  <div>
                    <h3>{isHindi ? 'सामान / उत्पादों की सूची' : 'Items & Pricing Breakdown'}</h3>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Add estimated products and unit prices</span>
                  </div>
                  <button className="btn-add-row" onClick={addItem}>
                    <Plus size={14} /> {isHindi ? '+ सामान जोड़ें' : '+ Add Item'}
                  </button>
                </div>

                <div className="quot-table-wrap">
                  <table className="quot-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Product / Description</th>
                        <th style={{ width: '80px' }}>HSN</th>
                        <th style={{ width: '70px' }}>Qty</th>
                        <th style={{ width: '65px' }}>Unit</th>
                        <th style={{ width: '90px' }}>Rate (₹)</th>
                        <th style={{ width: '65px' }}>GST%</th>
                        <th className="text-right">Taxable (₹)</th>
                        <th className="text-right">Tax (₹)</th>
                        <th className="text-right">Total (₹)</th>
                        <th style={{ width: '35px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <select
                              value={item.productId}
                              onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                              style={{ width: '100%', marginBottom: '4px' }}
                            >
                              <option value="">-- Choose Product --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <input
                              value={item.name}
                              onChange={e => handleItemChange(idx, 'name', e.target.value)}
                              placeholder="Or type custom item name"
                              style={{ width: '100%', fontSize: '11px' }}
                            />
                          </td>
                          <td>
                            <input
                              value={item.hsn}
                              onChange={e => handleItemChange(idx, 'hsn', e.target.value)}
                              style={{ width: '75px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                              style={{ width: '65px', fontWeight: 'bold' }}
                            />
                          </td>
                          <td>
                            <input
                              value={item.unit}
                              onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                              style={{ width: '60px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.rate}
                              onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                              style={{ width: '85px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.gstRate}
                              onChange={e => handleItemChange(idx, 'gstRate', e.target.value)}
                              style={{ width: '60px' }}
                            />
                          </td>
                          <td className="text-right font-mono">₹{item.taxableAmount.toFixed(2)}</td>
                          <td className="text-right font-mono">₹{(item.cgst + item.sgst).toFixed(2)}</td>
                          <td className="text-right font-mono fw-bold">₹{item.total.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn-delete-row"
                              onClick={() => removeItem(idx)}
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={6} className="text-right fw-bold" style={{ padding: '10px 12px' }}>
                          Estimated Grand Total:
                        </td>
                        <td className="text-right font-mono fw-bold">₹{subtotal.toFixed(2)}</td>
                        <td className="text-right font-mono fw-bold">₹{totalTax.toFixed(2)}</td>
                        <td className="text-right font-mono fw-bold" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                          ₹{grandTotal.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="quot-footer">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn-action-outline-blue"
                    onClick={() => handlePrint()}
                    title="Print or Save as PDF"
                  >
                    <Printer size={16} /> {isHindi ? 'प्रिंट / सेव PDF' : 'Print / Save PDF'}
                  </button>
                  <button
                    className="btn-action-green"
                    onClick={() => handleWhatsAppShare()}
                    title="Share with client on WhatsApp"
                  >
                    <Share2 size={16} /> WhatsApp
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-action-green"
                    onClick={() => handleConvertToInvoice()}
                    title="Convert quotation to official GST Sale Invoice"
                  >
                    <Zap size={15} /> {isHindi ? 'बिक्री बिल बनाएं' : 'Convert to Bill'}
                  </button>
                  <button className="btn-secondary" onClick={onClose}>
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    className="btn-primary-blue"
                    onClick={handleSave}
                    disabled={savedSuccess}
                  >
                    {savedSuccess ? (
                      <><CheckCircle size={16} /> {isHindi ? 'सफलतापूर्वक सेव हुआ!' : 'Saved!'}</>
                    ) : (
                      <><FileText size={16} /> {isHindi ? 'कोटेशन सेव करें' : 'Save Quotation'}</>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ================= HISTORY TAB ================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>
                  {isHindi ? 'सहेजे गए कोटेशन' : 'Saved Quotations'} ({quotations.length})
                </h3>
                <button
                  className="btn-add-row-blue"
                  onClick={() => setActiveTab('create')}
                >
                  <Plus size={14} /> {isHindi ? '+ नया कोटेशन' : '+ New Quotation'}
                </button>
              </div>

              {quotations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <FileText size={40} style={{ color: '#9ca3af', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600, color: '#374151', margin: 0 }}>No Quotations created yet</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 16px' }}>Create your first estimate to send to customers</p>
                  <button className="btn-add-row-blue" onClick={() => setActiveTab('create')}>
                    <Plus size={14} /> Create First Quotation
                  </button>
                </div>
              ) : (
                <div className="quot-table-wrap">
                  <table className="quot-table">
                    <thead>
                      <tr>
                        <th>Quote #</th>
                        <th>Date</th>
                        <th>Valid Till</th>
                        <th>Customer / Client</th>
                        <th>Subject</th>
                        <th className="text-right">Grand Total</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map(q => (
                        <tr key={q.id}>
                          <td className="font-mono" style={{ fontWeight: 700, color: '#1e3a5f' }}>
                            {q.quotationNumber || q.id}
                          </td>
                          <td>{q.date}</td>
                          <td style={{ color: '#b91c1c', fontWeight: 600 }}>{q.validTill}</td>
                          <td>
                            <strong>{q.partyName}</strong>
                            {q.partyPhone && <div style={{ fontSize: '10px', color: '#6b7280' }}>Ph: {q.partyPhone}</div>}
                          </td>
                          <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.subject || '-'}
                          </td>
                          <td className="text-right font-mono fw-bold" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                            ₹{Number(q.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className="btn-icon-action"
                                style={{ color: '#0f5132' }}
                                title="Convert to Tax Invoice"
                                onClick={() => handleConvertToInvoice(q)}
                              >
                                <ReceiptText size={15} />
                              </button>
                              <button
                                className="btn-icon-action"
                                title="Print / Download PDF"
                                onClick={() => handlePrint(q)}
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                className="btn-icon-action"
                                style={{ color: '#16a34a' }}
                                title="Share on WhatsApp"
                                onClick={() => handleWhatsAppShare(q)}
                              >
                                <Share2 size={15} />
                              </button>
                              <button
                                className="btn-icon-action"
                                style={{ color: '#dc2626' }}
                                title="Delete"
                                onClick={() => {
                                  if (confirm(`Delete Quotation ${q.quotationNumber}?`)) {
                                    deleteQuotation(q.id);
                                  }
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .quot-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 2000;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          backdrop-filter: blur(4px);
        }
        .quot-modal {
          background: var(--bg-surface, #ffffff);
          color: var(--text-main, #111827);
          border-radius: 16px; width: 100%; max-width: 1020px; max-height: 92vh;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border-color, #e5e7eb);
        }
        .quot-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border-color, #e5e7eb);
          background: linear-gradient(135deg, #0f2442 0%, #1e3a5f 100%);
          flex-wrap: wrap; gap: 12px;
        }
        .quot-header-left { display: flex; align-items: center; gap: 12px; }
        .quot-icon-wrap {
          width: 42px; height: 42px; background: rgba(255,255,255,0.15);
          border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .quot-header h2 { margin: 0; color: #fff; font-size: 17px; font-weight: 700; }
        .quot-header p { margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; }
        .tab-pill-box { display: flex; background: rgba(0,0,0,0.25); border-radius: 8px; padding: 3px; gap: 4px; }
        .tab-pill {
          display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 6px;
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.75); border: none; background: transparent; cursor: pointer;
        }
        .tab-pill.active { background: #fff; color: #1e3a5f; }
        .modal-close-btn {
          background: rgba(255,255,255,0.15); border: none; border-radius: 8px; color: #fff;
          width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .quot-body { overflow-y: auto; padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 20px; }
        .quot-form-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;
          background: var(--bg-surface-alt, #f8fafc); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color, #e5e7eb);
        }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-group label { font-size: 11px; font-weight: 700; color: var(--text-muted, #6b7280); text-transform: uppercase; letter-spacing: 0.5px; }
        .form-group input, .form-group select, .form-group textarea {
          padding: 8px 10px; border: 1px solid var(--border-color, #d1d5db);
          border-radius: 6px; font-size: 12.5px; background: var(--bg-surface, #fff);
          color: var(--text-main, #111827); outline: none; transition: border-color 0.15s; font-family: inherit;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.15);
        }
        .quot-items-section { display: flex; flex-direction: column; gap: 10px; }
        .quot-items-header { display: flex; align-items: center; justify-content: space-between; }
        .quot-items-header h3 { margin: 0; font-size: 14px; font-weight: 700; }
        .btn-add-row {
          display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px;
          background: #1e3a5f; color: #fff; border: none; border-radius: 6px;
          font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .btn-add-row-blue {
          display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px;
          background: #1e3a5f; color: #fff; border: none; border-radius: 6px;
          font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .quot-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid var(--border-color, #e5e7eb); }
        .quot-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .quot-table th {
          background: var(--bg-surface-alt, #f1f5f9); padding: 8px 10px;
          text-align: left; font-weight: 700; color: var(--text-muted, #475569);
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }
        .quot-table td { padding: 6px 10px; border-bottom: 1px solid var(--border-color, #f1f5f9); }
        .quot-table input, .quot-table select {
          padding: 4px 6px; border: 1px solid var(--border-color, #d1d5db);
          border-radius: 4px; font-size: 11.5px; background: var(--bg-surface, #fff);
        }
        .quot-table tfoot { background: var(--bg-surface-alt, #f8fafc); }
        .btn-delete-row { background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; border-radius: 4px; }
        .quot-footer {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; padding-top: 14px; border-top: 1px solid var(--border-color, #e5e7eb);
        }
        .btn-secondary {
          padding: 8px 16px; border: 1px solid var(--border-color, #d1d5db); background: transparent;
          border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-main, #374151);
        }
        .btn-action-outline-blue {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
          border: 1px solid #1e3a5f; background: transparent; color: #1e3a5f;
          border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer;
        }
        .btn-action-outline-blue:hover { background: #eff6ff; }
        .btn-action-green {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
          background: #16a34a; color: #fff; border: none; border-radius: 8px;
          font-size: 12.5px; font-weight: 600; cursor: pointer;
        }
        .btn-primary-blue {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px;
          background: linear-gradient(135deg, #1e3a5f, #2563eb); color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .btn-icon-action {
          padding: 5px 7px; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px;
          background: var(--bg-surface, #fff); color: var(--text-main, #1f2937); cursor: pointer;
        }
        .btn-icon-action:hover { background: var(--bg-hover, #f1f5f9); }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
        .fw-bold { font-weight: 700; }
      `}</style>
    </div>
  );
}
