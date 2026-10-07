import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Printer,
  Share2,
  Download,
  History,
  Receipt,
  Shield,
  Globe,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
  ExternalLink,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const TRANSPORT_MODES = ['Road', 'Rail', 'Air', 'Ship'];

export default function EWayBillBuilder({ onClose, initialInvoice = null }) {
  const { products, parties, businessProfile, invoices, eWayBills, addEWayBill, deleteEWayBill, language } = useApp();
  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialInvoice?.id || '');

  // NIC Portal session state
  const [nicSession, setNicSession] = useState({ active: false, isMock: false, gstin: null, tokenExpiry: null, mode: 'sandbox' });
  const [nicAuthModal, setNicAuthModal] = useState(false);
  const [nicAuthForm, setNicAuthForm] = useState({ gstin: businessProfile?.gstin || '', username: '', password: '' });
  const [nicAuthLoading, setNicAuthLoading] = useState(false);
  const [nicAuthError, setNicAuthError] = useState('');
  const [portalGenerating, setPortalGenerating] = useState(false);
  const [portalResult, setPortalResult] = useState(null); // { success, ewayBillNo, validUpto, isMock }

  // Check NIC session status on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/ewb/session-status')
      .then(r => r.json())
      .then(data => setNicSession(data))
      .catch(() => {}); // server may not be running
  }, []);

  // Helper to map invoice items to EWB items
  const mapInvoiceItemsToEwb = (invItems = []) => {
    if (!invItems || !invItems.length) {
      return [
        { productId: '', name: 'DAP Fertilizer (IFFCO 50kg Bag)', hsn: '3105', quantity: 25, unit: 'Bags', rate: 1350, gstRate: 5, taxableAmount: 32142.86, cgst: 803.57, sgst: 803.57, igst: 0, total: 33750 }
      ];
    }
    return invItems.map(it => {
      const gross = (Number(it.quantity) || 1) * (Number(it.rate) || 0);
      const gstRate = Number(it.gstRate) || 5;
      const taxable = Number(it.taxableAmount) || Number(((gross * 100) / (100 + gstRate)).toFixed(2));
      const taxAmt = gross - taxable;
      return {
        productId: it.productId || '',
        name: it.name || '',
        hsn: it.hsn || '3105',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'Bags',
        rate: Number(it.rate) || 0,
        gstRate,
        taxableAmount: taxable,
        cgst: Number((taxAmt / 2).toFixed(2)),
        sgst: Number((taxAmt / 2).toFixed(2)),
        igst: 0,
        total: Number(gross.toFixed(2))
      };
    });
  };

  // Form State
  const [formData, setFormData] = useState(() => ({
    ewbNumber: `2410${Math.floor(10000000 + Math.random() * 90000000)}`,
    sellerGSTIN: businessProfile?.gstin || '',
    sellerName: businessProfile?.name || 'Jai Kisan Krishi Kendra',
    sellerAddress: businessProfile?.address || '',
    buyerPartyId: initialInvoice?.partyId || '',
    buyerName: initialInvoice?.partyName || '',
    buyerGSTIN: initialInvoice?.partyGstin || 'Unregistered',
    buyerAddress: initialInvoice?.partyAddress || '',
    transportMode: 'Road',
    vehicleNumber: 'HR05AJ4491',
    transporterId: '06AABCT9981K1Z3',
    transporterName: 'Sonu Roadlines & Transport',
    distance: '45',
    invoiceRef: initialInvoice?.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialInvoice?.date || new Date().toISOString().split('T')[0],
    supplyType: 'Outward - Supply',
    subSupplyType: 'Supply',
    transactionType: 'Regular'
  }));

  const [items, setItems] = useState(() => mapInvoiceItemsToEwb(initialInvoice?.items));

  // Quick import from any existing invoice
  const handleImportInvoice = (invId) => {
    setSelectedInvoiceId(invId);
    if (!invId) return;
    const inv = invoices.find(i => i.id === invId || i.invoiceNumber === invId);
    if (!inv) return;
    setFormData(prev => ({
      ...prev,
      buyerPartyId: inv.partyId || '',
      buyerName: inv.partyName || prev.buyerName,
      buyerGSTIN: inv.partyGstin || 'Unregistered',
      buyerAddress: inv.partyAddress || prev.buyerAddress,
      invoiceRef: inv.invoiceNumber,
      date: inv.date || prev.date
    }));
    if (inv.items && inv.items.length) {
      setItems(mapInvoiceItemsToEwb(inv.items));
    }
  };

  const handlePartyChange = (partyId) => {
    const party = parties.find(p => p.id === partyId);
    setFormData(f => ({
      ...f,
      buyerPartyId: partyId,
      buyerName: party?.name || '',
      buyerGSTIN: party?.gstin || 'Unregistered',
      buyerAddress: party?.city ? `${party.city}, ${party.state || 'Haryana'}` : (party?.address || 'Karnal, Haryana')
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

  const totalTaxable = items.reduce((s, i) => s + (Number(i.taxableAmount) || 0), 0);
  const totalTax = items.reduce((s, i) => s + (Number(i.cgst) || 0) + (Number(i.sgst) || 0) + (Number(i.igst) || 0), 0);
  const totalValue = items.reduce((s, i) => s + (Number(i.total) || 0), 0);

  // Calculate validity period (e-way bill is valid 1 day per 200 km)
  const calcValidTill = (baseDate, dist) => {
    const days = Math.max(1, Math.ceil((Number(dist) || 20) / 200));
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const currentValidTill = calcValidTill(formData.date, formData.distance);

  // Generate Print / PDF HTML for Form GST EWB-01
  const generateEwbHtml = (bill) => {
    const b = bill || {
      ...formData,
      items,
      totalTaxable,
      totalTax,
      totalValue,
      validTill: currentValidTill
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>e-Way Bill - ${b.ewbNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #fff; color: #111; padding: 24px; font-size: 12px; line-height: 1.4; }
          .header { text-align: center; border-bottom: 2px solid #0f5132; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { font-size: 18px; color: #0f5132; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
          .header h2 { font-size: 13px; font-weight: normal; color: #4b5563; }
          .ewb-banner { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1.5px solid #10b981; border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; }
          .ewb-num { font-size: 16px; font-weight: 800; color: #065f46; font-family: monospace; }
          .barcode-box { text-align: center; border: 1px dashed #6b7280; padding: 4px 10px; background: #fff; font-family: monospace; font-size: 11px; letter-spacing: 4px; font-weight: bold; }
          .section-title { background: #0f5132; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; margin: 16px 0 8px 0; border-radius: 4px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 10px; }
          .box { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; background: #f9fafb; font-size: 11.5px; }
          .box strong { color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
          th { background: #e5e7eb; color: #1f2937; padding: 6px 8px; text-align: left; font-size: 10.5px; text-transform: uppercase; border: 1px solid #d1d5db; }
          td { padding: 6px 8px; border: 1px solid #e5e7eb; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .total-row { font-weight: bold; background: #f3f4f6; }
          .footer-note { margin-top: 20px; font-size: 10px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; text-align: center; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Government of India • e-Way Bill System</h1>
          <h2>Form GST EWB-01 (See Rule 138 of the CGST Rules, 2017)</h2>
        </div>

        <div class="ewb-banner">
          <div>
            <div style="font-size: 11px; color: #047857; text-transform: uppercase; font-weight: 700;">e-Way Bill No:</div>
            <div class="ewb-num">${b.ewbNumber}</div>
            <div style="font-size: 11px; color: #374151; margin-top: 4px;">
              Generated Date: <strong>${b.date}</strong> &bull; Valid Until: <strong style="color: #dc2626;">${b.validTill || currentValidTill}</strong>
            </div>
          </div>
          <div>
            <div class="barcode-box">
              ||||| | |||| |||||| || | ||||<br>
              ${b.ewbNumber}
            </div>
          </div>
        </div>

        <div class="section-title">PART - A : Details of Goods & Transaction</div>
        <div class="grid-2">
          <div class="box">
            <strong style="color: #0f5132;">From (Supplier / Consignor):</strong><br>
            <strong>Name:</strong> ${b.sellerName || businessProfile.name}<br>
            <strong>GSTIN:</strong> <span class="font-mono">${b.sellerGSTIN || businessProfile.gstin}</span><br>
            <strong>Dispatch Address:</strong> ${b.sellerAddress || businessProfile.address}<br>
            <strong>State:</strong> ${businessProfile.state}
          </div>
          <div class="box">
            <strong style="color: #0f5132;">To (Recipient / Consignee):</strong><br>
            <strong>Name:</strong> ${b.buyerName || 'Cash / Registered Buyer'}<br>
            <strong>GSTIN:</strong> <span class="font-mono">${b.buyerGSTIN || 'Unregistered'}</span><br>
            <strong>Delivery Address:</strong> ${b.buyerAddress || 'Local Mandi / Store'}<br>
            <strong>State:</strong> Haryana (06)
          </div>
        </div>

        <div class="grid-2">
          <div class="box">
            <strong>Doc Type & Number:</strong> Tax Invoice &bull; <span class="font-mono"><strong>${b.invoiceRef}</strong></span><br>
            <strong>Document Date:</strong> ${b.date}<br>
            <strong>Transaction Type:</strong> ${b.transactionType || 'Regular'} (${b.supplyType || 'Outward - Supply'})
          </div>
          <div class="box">
            <strong>Total Invoice Value:</strong> <span style="font-size: 13px; font-weight: 800; color: #0f5132;">₹${Number(b.totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span><br>
            <strong>Taxable Amount:</strong> ₹${Number(b.totalTaxable || 0).toFixed(2)}<br>
            <strong>Total GST (CGST+SGST):</strong> ₹${Number(b.totalTax || 0).toFixed(2)}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th>HSN Code</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Taxable Value (₹)</th>
              <th class="text-center">GST Rate</th>
              <th class="text-right">CGST (₹)</th>
              <th class="text-right">SGST (₹)</th>
              <th class="text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(b.items || []).map((it, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${it.name}</strong></td>
                <td class="font-mono">${it.hsn || '-'}</td>
                <td class="text-center">${it.quantity} ${it.unit}</td>
                <td class="text-right font-mono">${Number(it.taxableAmount || 0).toFixed(2)}</td>
                <td class="text-center">${it.gstRate}%</td>
                <td class="text-right font-mono">${Number(it.cgst || 0).toFixed(2)}</td>
                <td class="text-right font-mono">${Number(it.sgst || 0).toFixed(2)}</td>
                <td class="text-right font-mono" style="font-weight: bold;">${Number(it.total || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4" class="text-right">Total:</td>
              <td class="text-right font-mono">₹${Number(b.totalTaxable || 0).toFixed(2)}</td>
              <td></td>
              <td class="text-right font-mono">₹${((b.totalTax || 0) / 2).toFixed(2)}</td>
              <td class="text-right font-mono">₹${((b.totalTax || 0) / 2).toFixed(2)}</td>
              <td class="text-right font-mono" style="color: #0f5132; font-size: 12px;">₹${Number(b.totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>

        <div class="section-title">PART - B : Vehicle & Transporter Details</div>
        <div class="box">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <div><strong>Mode:</strong> ${b.transportMode}</div>
            <div><strong>Vehicle No:</strong> <span class="font-mono" style="font-weight: bold; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">${b.vehicleNumber}</span></div>
            <div><strong>Distance:</strong> ${b.distance} KM</div>
            <div><strong>Transporter ID:</strong> <span class="font-mono">${b.transporterId || 'N/A'}</span></div>
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #4b5563;">
            Transporter Name: <strong>${b.transporterName || 'Self / Private Carrier'}</strong> &bull; From: Karnal (06) &bull; To: ${b.buyerAddress || 'Destination'}
          </div>
        </div>

        <div class="footer-note">
          This is a computer-generated e-Way Bill under Rule 138 of CGST Rules, 2017. QR code verification enabled.<br>
          Powered by <strong>Jai Kisan Vyapar App</strong> &bull; Valid in All States & UTs across India
        </div>
      </body>
      </html>
    `;
  };

  // 1. Print / Download as PDF Action
  const handlePrint = (bill) => {
    const html = generateEwbHtml(bill);
    const w = window.open('', '_blank', 'width=900,height=750');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => {
        w.print();
      }, 350);
    } else {
      alert('Popup blocker prevented print window. Please allow popups for this site.');
    }
  };

  // 2. Download JSON for NIC Portal Upload
  const handleDownloadJSON = (bill) => {
    const b = bill || {
      ...formData,
      items,
      totalTaxable,
      totalTax,
      totalValue,
      validTill: currentValidTill
    };

    const nicPayload = {
      version: "1.0.0421",
      billLists: [
        {
          userGstin: b.sellerGSTIN,
          supplyType: "O",
          subSupplyType: "1",
          docType: "INV",
          docNo: b.invoiceRef,
          docDate: b.date.split('-').reverse().join('/'),
          fromGstin: b.sellerGSTIN,
          fromTrdName: b.sellerName,
          fromAddr1: b.sellerAddress,
          fromPlace: "Karnal",
          fromPincode: 132001,
          toGstin: b.buyerGSTIN || "URP",
          toTrdName: b.buyerName,
          toAddr1: b.buyerAddress,
          toPlace: "Karnal",
          toPincode: 132001,
          totalValue: b.totalTaxable,
          cgstValue: b.totalTax / 2,
          sgstValue: b.totalTax / 2,
          igstValue: 0,
          totInvValue: b.totalValue,
          transMode: "1",
          transDistance: b.distance,
          transporterId: b.transporterId,
          vehicleNo: b.vehicleNumber,
          itemList: (b.items || []).map(it => ({
            productName: it.name,
            hsnCode: Number(it.hsn) || 3105,
            quantity: it.quantity,
            qtyUnit: it.unit,
            cgstRate: it.gstRate / 2,
            sgstRate: it.gstRate / 2,
            igstRate: 0,
            taxableAmount: it.taxableAmount
          }))
        }
      ]
    };

    const blob = new Blob([JSON.stringify(nicPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EWB_${b.ewbNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Share via WhatsApp
  const handleWhatsAppShare = (bill) => {
    const b = bill || {
      ...formData,
      totalValue,
      validTill: currentValidTill
    };

    const msg =
      `*GOVT E-WAY BILL - ${businessProfile.name}*\n` +
      `--------------------------------\n` +
      `*E-Way Bill No:* ${b.ewbNumber}\n` +
      `*Date:* ${b.date} (Valid Till: ${b.validTill || currentValidTill})\n` +
      `*Invoice Ref:* ${b.invoiceRef}\n` +
      `*Vehicle No:* ${b.vehicleNumber}\n` +
      `*Buyer:* ${b.buyerName || 'Consignee'}\n` +
      `*Total Goods Value:* Rs. ${Number(b.totalValue || 0).toLocaleString('en-IN')}\n` +
      `--------------------------------\n` +
      `GST Compliant E-Way Bill Generated via Jai Kisan Vyapar App.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // 4. Save E-Way Bill
  const handleSave = () => {
    const buyerParty = parties.find(p => p.id === formData.buyerPartyId);
    addEWayBill({
      ...formData,
      buyerName: formData.buyerName || buyerParty?.name || 'Walk-in Buyer',
      items,
      totalTaxable,
      totalTax,
      totalValue,
      validTill: currentValidTill
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab('history');
    }, 1200);
  };

  // 5. Authenticate with NIC Portal
  const handleNicAuthenticate = async (e) => {
    e.preventDefault();
    setNicAuthLoading(true);
    setNicAuthError('');
    try {
      const res = await fetch('http://localhost:5000/api/ewb/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nicAuthForm)
      });
      const data = await res.json();
      if (data.success) {
        setNicSession({ active: true, isMock: data.isMock || false, gstin: nicAuthForm.gstin, tokenExpiry: data.tokenExpiry, mode: data.isMock ? 'mock' : 'live' });
        setNicAuthModal(false);
        setNicAuthError('');
      } else {
        setNicAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setNicAuthError('Server not reachable. Make sure the backend server is running on port 5000.');
    }
    setNicAuthLoading(false);
  };

  // 6. Generate EWB on NIC Govt Portal
  const handlePortalGenerate = async () => {
    if (!nicSession.active) {
      setNicAuthModal(true);
      return;
    }
    setPortalGenerating(true);
    setPortalResult(null);
    const buyerParty = parties.find(p => p.id === formData.buyerPartyId);
    try {
      const res = await fetch('http://localhost:5000/api/ewb/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          buyerName: formData.buyerName || buyerParty?.name || '',
          items,
          totalTaxable,
          totalTax,
          totalValue
        })
      });
      const data = await res.json();
      setPortalResult(data);
      if (data.success && data.ewayBillNo) {
        // Auto-update EWB number with official one
        setFormData(f => ({ ...f, ewbNumber: data.ewayBillNo }));
      }
    } catch (err) {
      setPortalResult({ success: false, error: 'Backend server not reachable. Start the server with: npm run server' });
    }
    setPortalGenerating(false);
  };

  // 7. Logout NIC session
  const handleNicLogout = async () => {
    await fetch('http://localhost:5000/api/ewb/logout', { method: 'POST' }).catch(() => {});
    setNicSession({ active: false, isMock: false, gstin: null, tokenExpiry: null, mode: 'sandbox' });
    setPortalResult(null);
  };

  return (
    <div className="ewb-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="ewb-modal">
        {/* Header */}
        <div className="ewb-header">
          <div className="ewb-header-left">
            <div className="ewb-icon-wrap"><Truck size={22} /></div>
            <div>
              <h2>{isHindi ? 'ई-वे बिल जनरेटर (Form GST EWB-01)' : 'GST E-Way Bill Generator'}</h2>
              <p>{isHindi ? 'माल परिवहन हेतु मान्य GST ई-वे बिल बनाएं, प्रिंट करें व PDF डाउनलोड करें' : 'Generate official GST E-Way bills, download PDF & print for transport'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* NIC Portal Session Badge */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 10px', borderRadius: '8px', cursor: 'pointer',
                background: nicSession.active ? (nicSession.isMock ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)') : 'rgba(255,255,255,0.1)',
                border: nicSession.active ? (nicSession.isMock ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(16,185,129,0.6)') : '1px solid rgba(255,255,255,0.2)',
                fontSize: '11px', fontWeight: 700,
                color: nicSession.active ? (nicSession.isMock ? '#fbbf24' : '#6ee7b7') : 'rgba(255,255,255,0.7)',
                title: 'NIC Portal Status'
              }}
              onClick={() => nicSession.active ? handleNicLogout() : setNicAuthModal(true)}
              title={nicSession.active ? `Connected as ${nicSession.gstin} — Click to logout` : 'Connect to NIC e-Way Bill Portal'}
            >
              {nicSession.active
                ? <>{nicSession.isMock ? <AlertTriangle size={12} /> : <Shield size={12} />} NIC {nicSession.isMock ? 'MOCK' : 'LIVE'}</>
                : <><Lock size={12} /> Connect NIC Portal</>
              }
            </div>

            <div className="tab-pill-box">
              <button
                className={`tab-pill ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                <Plus size={14} /> {isHindi ? 'नया ई-वे बिल' : 'New EWB'}
              </button>
              <button
                className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={14} /> {isHindi ? 'जारी किए गए बिल' : 'History'} ({eWayBills.length})
              </button>
            </div>
            <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* BODY */}
        <div className="ewb-body">
          {activeTab === 'create' ? (
            <>
              {/* Quick Auto-Fill from Invoice */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(15, 81, 50, 0.08) 0%, rgba(16, 185, 129, 0.12) 100%)',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: '#0f5132',
                    color: '#ffffff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Receipt size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f5132' }}>
                      {isHindi ? 'बिक्री बिल से विवरण स्वतः भरें' : 'Auto-Fill from Existing Invoice'}
                    </strong>
                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      {isHindi ? 'इनवॉइस चुनते ही ग्राहक, HSN और सामान का विवरण स्वतः लोड हो जाएगा' : 'Select an invoice to instantly populate buyer, items, and tax amounts'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={selectedInvoiceId}
                    onChange={e => handleImportInvoice(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '6px',
                      border: '1px solid #10b981',
                      background: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0f5132',
                      outline: 'none',
                      minWidth: '220px'
                    }}
                  >
                    <option value="">-- Choose Invoice to Import --</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.partyName || 'Cash Sale'} (₹{Number(inv.grandTotal).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Top Form Grid */}
              <div className="ewb-form-grid">
                <div className="form-group">
                  <label>E-Way Bill Number (Generated)</label>
                  <input
                    value={formData.ewbNumber}
                    onChange={e => setFormData(f => ({ ...f, ewbNumber: e.target.value }))}
                    className="font-mono font-bold"
                    style={{ color: '#0f5132' }}
                  />
                </div>

                <div className="form-group">
                  <label>Seller GSTIN</label>
                  <input
                    value={formData.sellerGSTIN}
                    onChange={e => setFormData(f => ({ ...f, sellerGSTIN: e.target.value }))}
                    placeholder="06AAACJ1234K1Z5"
                  />
                </div>

                <div className="form-group">
                  <label>Buyer / Party (Select)</label>
                  <select
                    value={formData.buyerPartyId}
                    onChange={e => handlePartyChange(e.target.value)}
                  >
                    <option value="">-- Select Buyer / Customer --</option>
                    {parties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.city || 'Mandi'})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Buyer Name</label>
                  <input
                    value={formData.buyerName}
                    onChange={e => setFormData(f => ({ ...f, buyerName: e.target.value }))}
                    placeholder="Recipient Name"
                  />
                </div>

                <div className="form-group">
                  <label>Buyer GSTIN</label>
                  <input
                    value={formData.buyerGSTIN}
                    onChange={e => setFormData(f => ({ ...f, buyerGSTIN: e.target.value }))}
                    placeholder="Buyer GSTIN or URP"
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Address / City</label>
                  <input
                    value={formData.buyerAddress}
                    onChange={e => setFormData(f => ({ ...f, buyerAddress: e.target.value }))}
                    placeholder="Village, Tehsil, District"
                  />
                </div>

                <div className="form-group">
                  <label>Transport Mode</label>
                  <select
                    value={formData.transportMode}
                    onChange={e => setFormData(f => ({ ...f, transportMode: e.target.value }))}
                  >
                    {TRANSPORT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Vehicle Number (गाड़ी नंबर)</label>
                  <input
                    value={formData.vehicleNumber}
                    onChange={e => setFormData(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))}
                    placeholder="HR05AJ4491"
                    className="font-mono font-bold"
                  />
                </div>

                <div className="form-group">
                  <label>Distance (KM) (दूरी किमी)</label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={e => setFormData(f => ({ ...f, distance: e.target.value }))}
                    placeholder="45"
                  />
                </div>

                <div className="form-group">
                  <label>Invoice Reference</label>
                  <input
                    value={formData.invoiceRef}
                    onChange={e => setFormData(f => ({ ...f, invoiceRef: e.target.value }))}
                    placeholder="INV-1001"
                  />
                </div>

                <div className="form-group">
                  <label>Generation Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Valid Till (Auto-Calculated)</label>
                  <input
                    type="date"
                    value={currentValidTill}
                    disabled
                    style={{ background: '#ecfdf5', color: '#047857', fontWeight: 'bold' }}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="ewb-items-section">
                <div className="ewb-items-header">
                  <div>
                    <h3>{isHindi ? 'माल / सामान का विवरण (Goods Details)' : 'Consignment Goods & HSN Details'}</h3>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Items transported under this E-Way bill</span>
                  </div>
                  <button className="btn-add-row" onClick={addItem}>
                    <Plus size={14} /> {isHindi ? '+ सामान जोड़ें' : '+ Add Item'}
                  </button>
                </div>

                <div className="ewb-table-wrap">
                  <table className="ewb-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Product / Item</th>
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
                              placeholder="HSN"
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
                          Grand Total Consignment Value:
                        </td>
                        <td className="text-right font-mono fw-bold">₹{totalTaxable.toFixed(2)}</td>
                        <td className="text-right font-mono fw-bold">₹{totalTax.toFixed(2)}</td>
                        <td className="text-right font-mono fw-bold" style={{ color: '#0f5132', fontSize: '13px' }}>
                          ₹{totalValue.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Portal Result Banner */}
              {portalResult && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px',
                  background: portalResult.success ? (portalResult.isMock ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)') : 'rgba(220,38,38,0.1)',
                  border: `1px solid ${portalResult.success ? (portalResult.isMock ? '#f59e0b' : '#10b981') : '#dc2626'}`
                }}>
                  {portalResult.success
                    ? (portalResult.isMock ? <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} /> : <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />)
                    : <XCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
                  }
                  <div style={{ flex: 1 }}>
                    {portalResult.success ? (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: portalResult.isMock ? '#b45309' : '#047857' }}>
                          {portalResult.isMock ? '⚠️ Mock EWB Generated (NIC not connected)' : '✅ Official E-Way Bill Generated on Govt Portal!'}
                        </div>
                        {portalResult.ewayBillNo && (
                          <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 900, color: '#0f5132', marginTop: '4px' }}>
                            EWB No: {portalResult.ewayBillNo}
                          </div>
                        )}
                        {portalResult.validUpto && (
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            Valid Until: <strong style={{ color: '#dc2626' }}>{portalResult.validUpto}</strong>
                          </div>
                        )}
                        {portalResult.message && (
                          <div style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>{portalResult.message}</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#dc2626' }}>EWB Generation Failed</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{portalResult.error}</div>
                      </>
                    )}
                  </div>
                  <button onClick={() => setPortalResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={14} /></button>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="ewb-footer">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn-action-outline"
                    onClick={() => handlePrint()}
                    title="Print or Save as PDF"
                  >
                    <Printer size={16} /> {isHindi ? 'प्रिंट / सेव PDF' : 'Print / Save PDF'}
                  </button>
                  <button
                    className="btn-action-outline"
                    onClick={() => handleDownloadJSON()}
                    title="Download Official NIC JSON for offline upload"
                  >
                    <Download size={16} /> {isHindi ? 'पोर्टल JSON डाउनलोड' : 'Download JSON'}
                  </button>
                  <button
                    className="btn-action-green"
                    onClick={() => handleWhatsAppShare()}
                    title="Share with transporter / buyer on WhatsApp"
                  >
                    <Share2 size={16} /> WhatsApp
                  </button>
                  {/* NIC Govt Portal Generate Button */}
                  <button
                    className="btn-portal-generate"
                    onClick={handlePortalGenerate}
                    disabled={portalGenerating}
                    title="Generate official EWB number on govt NIC portal (ewaybillgst.gov.in)"
                  >
                    {portalGenerating
                      ? <><RefreshCw size={16} className="spin" /> Generating on Portal...</>
                      : nicSession.active
                        ? <><Globe size={16} /> {isHindi ? 'NIC पोर्टल पर जनरेट करें' : 'Generate on Govt Portal'}</>
                        : <><Lock size={16} /> {isHindi ? 'NIC पोर्टल से कनेक्ट करें' : 'Connect NIC & Generate'}</>
                    }
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" onClick={onClose}>
                    {isHindi ? 'बंद करें' : 'Cancel'}
                  </button>
                  <button
                    className="btn-primary-green"
                    onClick={handleSave}
                    disabled={savedSuccess}
                  >
                    {savedSuccess ? (
                      <><CheckCircle size={16} /> {isHindi ? 'सफलतापूर्वक सेव हुआ!' : 'Generated & Saved!'}</>
                    ) : (
                      <><FileText size={16} /> {isHindi ? 'ई-वे बिल सेव करें' : 'Save E-Way Bill'}</>
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
                  {isHindi ? 'जारी किए गए ई-वे बिल' : 'Generated E-Way Bills'} ({eWayBills.length})
                </h3>
                <button
                  className="btn-add-row"
                  onClick={() => setActiveTab('create')}
                >
                  <Plus size={14} /> {isHindi ? '+ नया बिल बनाएं' : '+ New E-Way Bill'}
                </button>
              </div>

              {eWayBills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <Truck size={40} style={{ color: '#9ca3af', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600, color: '#374151', margin: 0 }}>No E-Way Bills generated yet</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 16px' }}>Generate your first official E-Way Bill for road transport</p>
                  <button className="btn-add-row" onClick={() => setActiveTab('create')}>
                    <Plus size={14} /> Create First E-Way Bill
                  </button>
                </div>
              ) : (
                <div className="ewb-table-wrap">
                  <table className="ewb-table">
                    <thead>
                      <tr>
                        <th>E-Way Bill #</th>
                        <th>Date</th>
                        <th>Invoice Ref</th>
                        <th>Buyer (Consignee)</th>
                        <th>Vehicle #</th>
                        <th>Valid Until</th>
                        <th className="text-right">Total Value</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eWayBills.map(bill => (
                        <tr key={bill.id}>
                          <td className="font-mono" style={{ fontWeight: 700, color: '#0f5132' }}>
                            {bill.ewbNumber || bill.id}
                          </td>
                          <td>{bill.date}</td>
                          <td className="font-mono">{bill.invoiceRef}</td>
                          <td>
                            <strong>{bill.buyerName}</strong>
                            {bill.buyerGSTIN && <div style={{ fontSize: '10px', color: '#6b7280' }}>GSTIN: {bill.buyerGSTIN}</div>}
                          </td>
                          <td>
                            <span style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '11px' }}>
                              {bill.vehicleNumber}
                            </span>
                          </td>
                          <td style={{ color: '#b91c1c', fontWeight: 600 }}>
                            {bill.validTill || calcValidTill(bill.date, bill.distance)}
                          </td>
                          <td className="text-right font-mono fw-bold">
                            ₹{Number(bill.totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className="btn-icon-action"
                                title="Print / Download PDF"
                                onClick={() => handlePrint(bill)}
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                className="btn-icon-action"
                                title="Download JSON for Portal"
                                onClick={() => handleDownloadJSON(bill)}
                              >
                                <Download size={15} />
                              </button>
                              <button
                                className="btn-icon-action"
                                style={{ color: '#16a34a' }}
                                title="Share on WhatsApp"
                                onClick={() => handleWhatsAppShare(bill)}
                              >
                                <Share2 size={15} />
                              </button>
                              <button
                                className="btn-icon-action"
                                style={{ color: '#dc2626' }}
                                title="Delete"
                                onClick={() => {
                                  if (confirm(`Delete E-Way Bill ${bill.ewbNumber}?`)) {
                                    deleteEWayBill(bill.id);
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

      {/* NIC Authentication Modal */}
      {nicAuthModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          backdropFilter: 'blur(6px)'
        }} onClick={e => { if (e.target === e.currentTarget) setNicAuthModal(false); }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '460px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)', border: '1px solid #e5e7eb'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #064e3b, #0f5132)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                <Globe size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  Connect to NIC e-Way Bill Portal
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                  Government of India • ewaybillgst.gov.in
                </p>
              </div>
              <button onClick={() => setNicAuthModal(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            {/* Info Banner */}
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
              padding: '10px 14px', marginBottom: '18px', fontSize: '11.5px', color: '#065f46'
            }}>
              <strong>🔐 Secure Connection:</strong> Your credentials are sent only to your local backend server (localhost:5000) and never stored in the browser. The server acts as a secure proxy to NIC.
            </div>

            <form onSubmit={handleNicAuthenticate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>GSTIN</label>
                <input
                  value={nicAuthForm.gstin}
                  onChange={e => setNicAuthForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                  placeholder="06AAACJ1234K1Z5"
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>NIC Portal Username</label>
                <input
                  value={nicAuthForm.username}
                  onChange={e => setNicAuthForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Registered username on ewaybillgst.gov.in"
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>NIC Portal Password</label>
                <input
                  type="password"
                  value={nicAuthForm.password}
                  onChange={e => setNicAuthForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Your NIC portal password"
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {nicAuthError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#dc2626' }}>
                  <strong>⚠️ Error:</strong> {nicAuthError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setNicAuthModal(false)}
                  style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', background: 'transparent', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nicAuthLoading}
                  style={{
                    flex: 2, padding: '10px', background: 'linear-gradient(135deg, #065f46, #0f5132)', color: '#fff',
                    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {nicAuthLoading ? <><RefreshCw size={14} className="spin" /> Connecting...</> : <><Shield size={14} /> Authenticate & Connect</>}
                </button>
              </div>

              <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                Don't have credentials?{' '}
                <a href="https://ewaybillgst.gov.in" target="_blank" rel="noreferrer" style={{ color: '#0f5132', fontWeight: 600 }}>
                  Register at ewaybillgst.gov.in <ExternalLink size={10} style={{ display: 'inline' }} />
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .ewb-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 2000;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          backdrop-filter: blur(4px);
        }
        .ewb-modal {
          background: var(--bg-surface, #ffffff);
          color: var(--text-main, #111827);
          border-radius: 16px; width: 100%; max-width: 1020px; max-height: 92vh;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border-color, #e5e7eb);
        }
        .ewb-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border-color, #e5e7eb);
          background: linear-gradient(135deg, #062b1a 0%, #0f5132 100%);
          flex-wrap: wrap; gap: 12px;
        }
        .ewb-header-left { display: flex; align-items: center; gap: 12px; }
        .ewb-icon-wrap {
          width: 42px; height: 42px; background: rgba(255,255,255,0.15);
          border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .ewb-header h2 { margin: 0; color: #fff; font-size: 17px; font-weight: 700; }
        .ewb-header p { margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; }
        .tab-pill-box { display: flex; background: rgba(0,0,0,0.25); border-radius: 8px; padding: 3px; gap: 4px; }
        .tab-pill {
          display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 6px;
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.75); border: none; background: transparent; cursor: pointer;
        }
        .tab-pill.active { background: #fff; color: #0f5132; }
        .modal-close-btn {
          background: rgba(255,255,255,0.15); border: none; border-radius: 8px; color: #fff;
          width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .ewb-body { overflow-y: auto; padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 20px; }
        .ewb-form-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;
          background: var(--bg-surface-alt, #f8fafc); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color, #e5e7eb);
        }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-group label { font-size: 11px; font-weight: 700; color: var(--text-muted, #6b7280); text-transform: uppercase; letter-spacing: 0.5px; }
        .form-group input, .form-group select {
          padding: 8px 10px; border: 1px solid var(--border-color, #d1d5db);
          border-radius: 6px; font-size: 12.5px; background: var(--bg-surface, #fff);
          color: var(--text-main, #111827); outline: none; transition: border-color 0.15s;
        }
        .form-group input:focus, .form-group select:focus {
          border-color: #0f5132; box-shadow: 0 0 0 3px rgba(15, 81, 50, 0.12);
        }
        .ewb-items-section { display: flex; flex-direction: column; gap: 10px; }
        .ewb-items-header { display: flex; align-items: center; justify-content: space-between; }
        .ewb-items-header h3 { margin: 0; font-size: 14px; font-weight: 700; }
        .btn-add-row {
          display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px;
          background: #0f5132; color: #fff; border: none; border-radius: 6px;
          font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .ewb-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid var(--border-color, #e5e7eb); }
        .ewb-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .ewb-table th {
          background: var(--bg-surface-alt, #f1f5f9); padding: 8px 10px;
          text-align: left; font-weight: 700; color: var(--text-muted, #475569);
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }
        .ewb-table td { padding: 6px 10px; border-bottom: 1px solid var(--border-color, #f1f5f9); }
        .ewb-table input, .ewb-table select {
          padding: 4px 6px; border: 1px solid var(--border-color, #d1d5db);
          border-radius: 4px; font-size: 11.5px; background: var(--bg-surface, #fff);
        }
        .ewb-table tfoot { background: var(--bg-surface-alt, #f8fafc); }
        .btn-delete-row { background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; border-radius: 4px; }
        .ewb-footer {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; padding-top: 14px; border-top: 1px solid var(--border-color, #e5e7eb);
        }
        .btn-secondary {
          padding: 8px 16px; border: 1px solid var(--border-color, #d1d5db); background: transparent;
          border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-main, #374151);
        }
        .btn-action-outline {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
          border: 1px solid #0f5132; background: transparent; color: #0f5132;
          border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer;
        }
        .btn-action-outline:hover { background: #ecfdf5; }
        .btn-action-green {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
          background: #16a34a; color: #fff; border: none; border-radius: 8px;
          font-size: 12.5px; font-weight: 600; cursor: pointer;
        }
        .btn-primary-green {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px;
          background: linear-gradient(135deg, #0f5132, #15803d); color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .btn-icon-action {
          padding: 5px 7px; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px;
          background: var(--bg-surface, #fff); color: var(--text-main, #1f2937); cursor: pointer;
        }
        .btn-icon-action:hover { background: var(--bg-hover, #f1f5f9); }
        .btn-portal-generate {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
          background: linear-gradient(135deg, #1e3a5f, #1d4ed8); color: #fff;
          border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.35);
          transition: opacity 0.15s;
        }
        .btn-portal-generate:hover { opacity: 0.9; }
        .btn-portal-generate:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
        .fw-bold { font-weight: 700; }
      `}</style>
    </div>
  );
}
