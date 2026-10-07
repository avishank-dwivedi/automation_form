import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Trash2,
  Printer,
  Share2,
  CheckCircle2,
  Eye,
  Search,
  ArrowLeft,
  Download,
  Truck
} from 'lucide-react';

export default function InvoiceBuilder({ onOpenPreview }) {
  const {
    products,
    parties,
    invoices,
    addInvoice,
    deleteInvoice,
    businessProfile,
    openEWayBill,
    language,
    scratchpadToConvert,
    setScratchpadToConvert
  } = useApp();

  const isHindi = language === 'hi';

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create'
  
  // Consume Scratchpad conversion if triggered
  useEffect(() => {
    if (scratchpadToConvert) {
      setViewMode('create');
      if (scratchpadToConvert.customerName) setCustomerName(scratchpadToConvert.customerName);
      if (scratchpadToConvert.customerPhone) setCustomerPhone(scratchpadToConvert.customerPhone);
      if (scratchpadToConvert.notes) setNotes(scratchpadToConvert.notes);

      if (scratchpadToConvert.items && scratchpadToConvert.items.length) {
        const converted = scratchpadToConvert.items.map(it => {
          const matchedProd = products.find(p => p.name.toLowerCase() === (it.name || '').toLowerCase());
          const qty = Number(it.quantity) || 1;
          const rate = Number(it.rate) || 0;
          const disc = Number(it.discount) || 0;
          const gst = Number(it.gstRate !== undefined ? it.gstRate : (matchedProd ? matchedProd.gstRate : 5));
          const gross = qty * rate;
          const discAmount = gross - (gross * disc) / 100;
          const taxable = (discAmount * 100) / (100 + gst);
          const totalTax = discAmount - taxable;

          return {
            productId: matchedProd ? matchedProd.id : '',
            name: it.name || '',
            hsn: matchedProd ? (matchedProd.hsn || '') : '3105',
            quantity: qty,
            unit: it.unit || (matchedProd ? matchedProd.unit : 'Bags'),
            rate: rate,
            discount: disc,
            gstRate: gst,
            taxableAmount: Number(taxable.toFixed(2)),
            cgst: Number((totalTax / 2).toFixed(2)),
            sgst: Number((totalTax / 2).toFixed(2)),
            igst: 0,
            total: Number(discAmount.toFixed(2))
          };
        });
        setLineItems(converted);
      }

      setScratchpadToConvert(null);
    }
  }, [scratchpadToConvert, products, setScratchpadToConvert]);
  
  // Invoice form state
  const nextInvoiceNumber = `INV-${1000 + invoices.length + 1}`;
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');

  // Line items state
  const [lineItems, setLineItems] = useState([
    {
      productId: '',
      name: '',
      hsn: '',
      quantity: 1,
      unit: 'Bags',
      rate: 0,
      discount: 0,
      gstRate: 5,
      taxableAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0
    }
  ]);

  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // 'Paid' | 'Unpaid'
  const [notes, setNotes] = useState('Thank you for your business! Jai Kisan.');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Paid' | 'Unpaid'

  // When party dropdown changes
  const handlePartyChange = (partyId) => {
    setSelectedPartyId(partyId);
    if (!partyId) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerGstin('');
      return;
    }
    const found = parties.find((p) => p.id === partyId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone || '');
      setCustomerAddress(found.city ? `${found.city}, ${found.state || ''}` : '');
      setCustomerGstin(found.gstin || '');
    }
  };

  // Add line item row
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        productId: '',
        name: '',
        hsn: '',
        quantity: 1,
        unit: 'Bags',
        rate: 0,
        discount: 0,
        gstRate: 5,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0
      }
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Line item change calculation
  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    // If selecting a product from dropdown
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        item.name = prod.name;
        item.hsn = prod.hsn || '';
        item.unit = prod.unit || 'Pcs';
        item.rate = Number(prod.sellingPrice) || 0;
        item.gstRate = Number(prod.gstRate) || 0;
      }
    }

    // Recalculate taxes
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discPercent = Number(item.discount) || 0;
    const gstPct = Number(item.gstRate) || 0;

    const grossAmount = qty * rate;
    const discountedAmount = grossAmount - (grossAmount * discPercent) / 100;

    // Standard Indian GST calculation:
    // If rate is inclusive or exclusive: here we treat rate as selling price (taxable + tax)
    const taxable = (discountedAmount * 100) / (100 + gstPct);
    const totalTax = discountedAmount - taxable;

    // Check if intra-state (Haryana to Haryana = CGST + SGST) or inter-state (IGST)
    const isInterState = customerAddress.toLowerCase().includes('delhi') || customerAddress.toLowerCase().includes('punjab') || customerAddress.toLowerCase().includes('rajasthan');

    item.taxableAmount = Number(taxable.toFixed(2));
    if (isInterState) {
      item.igst = Number(totalTax.toFixed(2));
      item.cgst = 0;
      item.sgst = 0;
    } else {
      item.cgst = Number((totalTax / 2).toFixed(2));
      item.sgst = Number((totalTax / 2).toFixed(2));
      item.igst = 0;
    }
    item.total = Number(discountedAmount.toFixed(2));

    updated[index] = item;
    setLineItems(updated);
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.taxableAmount) || 0), 0);
  const totalTax = lineItems.reduce((sum, item) => sum + (Number(item.cgst) + Number(item.sgst) + Number(item.igst) || 0), 0);
  const rawGrandTotal = lineItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));
  const paidAmount = paymentStatus === 'Paid' ? roundedGrandTotal : 0;
  const balanceDue = roundedGrandTotal - paidAmount;

  // Submit invoice
  const handleSaveInvoice = (andPrint = false) => {
    if (lineItems.length === 0 || !lineItems[0].name) {
      alert('Please select at least one item.');
      return;
    }

    const newInv = {
      invoiceNumber,
      date: invoiceDate,
      dueDate,
      partyId: selectedPartyId || null,
      partyName: customerName || 'Cash Sale / नकद ग्राहक',
      partyPhone: customerPhone,
      partyGstin: customerGstin,
      partyAddress: customerAddress,
      items: lineItems,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      roundOff,
      grandTotal: roundedGrandTotal,
      paidAmount,
      balanceDue,
      status: paymentStatus,
      paymentMode,
      notes
    };

    const created = addInvoice(newInv);

    if (andPrint && onOpenPreview) {
      onOpenPreview(created);
    }

    // Reset Form
    setViewMode('list');
    setInvoiceNumber(`INV-${1000 + invoices.length + 2}`);
    setLineItems([
      {
        productId: '',
        name: '',
        hsn: '',
        quantity: 1,
        unit: 'Bags',
        rate: 0,
        discount: 0,
        gstRate: 5,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0
      }
    ]);
  };

  // Export all invoices to CSV
  const handleExportInvoicesCSV = () => {
    let csv = "Invoice Number,Date,Due Date,Customer Name,Phone,GSTIN,Address,Payment Mode,Status,Taxable Amount,Total Tax,Round Off,Grand Total,Paid Amount,Balance Due\n";
    invoices.forEach(inv => {
      csv += `"${inv.invoiceNumber}","${inv.date}","${inv.dueDate || ''}","${inv.partyName || 'Cash Sale'}","${inv.partyPhone || ''}","${inv.partyGstin || ''}","${(inv.partyAddress || '').replace(/"/g, '""')}","${inv.paymentMode}","${inv.status}",${inv.subtotal},${inv.totalTax},${inv.roundOff || 0},${inv.grandTotal},${inv.paidAmount || 0},${inv.balanceDue || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoices_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery = (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.partyName && inv.partyName.toLowerCase().includes(q)) ||
      inv.status.toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            {isHindi ? 'बिक्री बिलिंग व GST इनवॉइस' : 'Sales Invoices & GST Billing'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isHindi ? 'पक्के GST बिल बनाएं, प्रिंट करें और तुरंत व्हाट्सएप पर भेजें' : 'Create GST compliant tax invoices, thermal bills, and share on WhatsApp'}
          </p>
        </div>

        {viewMode === 'list' ? (
          <button
            onClick={() => setViewMode('create')}
            className="btn-primary"
            style={{ padding: '10px 18px' }}
          >
            <Plus size={18} />
            {isHindi ? '+ नया बिल बनाएं (F2)' : '+ Create New Invoice'}
          </button>
        ) : (
          <button
            onClick={() => setViewMode('list')}
            className="btn-secondary"
            style={{ padding: '8px 14px' }}
          >
            <ArrowLeft size={16} />
            {isHindi ? 'बिल सूची पर वापस' : 'Back to Invoices List'}
          </button>
        )}
      </div>

      {viewMode === 'create' ? (
        /* ================= INVOICE CREATION FORM ================= */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Invoice Metadata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            paddingBottom: '18px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isHindi ? 'बिल नंबर (Invoice No)' : 'Invoice Number'}
              </label>
              <input
                type="text"
                className="font-mono"
                style={{ width: '100%', fontWeight: 700 }}
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isHindi ? 'बिल दिनांक (Date)' : 'Invoice Date'}
              </label>
              <input
                type="date"
                style={{ width: '100%' }}
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isHindi ? 'अंतिम देय तिथि (Due Date)' : 'Due Date'}
              </label>
              <input
                type="date"
                style={{ width: '100%' }}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Customer / Party Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            background: 'var(--bg-surface-alt)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isHindi ? 'ग्राहक चुनें (Select Party)' : 'Select Customer / Farmer'}
              </label>
              <select
                style={{ width: '100%' }}
                value={selectedPartyId}
                onChange={(e) => handlePartyChange(e.target.value)}
              >
                <option value="">-- Cash / Walk-in Customer --</option>
                {parties.filter((p) => p.type === 'customer').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city}) {p.balance > 0 ? `[Pending: ₹${p.balance}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isHindi ? 'ग्राहक का नाम' : 'Customer Name'}
              </label>
              <input
                type="text"
                placeholder="Farmer / Shop Name"
                style={{ width: '100%' }}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isHindi ? 'मोबाइल नंबर (व्हाट्सएप हेतु)' : 'Phone Number'}
              </label>
              <input
                type="text"
                placeholder="+91 98..."
                style={{ width: '100%' }}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isHindi ? 'स्थान / गांव / शहर' : 'Address / Village'}
              </label>
              <input
                type="text"
                placeholder="Village, District"
                style={{ width: '100%' }}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Items Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '2px solid var(--border-color)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>#</th>
                  <th style={{ padding: '10px 12px', width: '32%' }}>{isHindi ? 'सामान / उत्पाद' : 'Item Description'}</th>
                  <th style={{ padding: '10px 12px' }}>HSN</th>
                  <th style={{ padding: '10px 12px', width: '100px' }}>{isHindi ? 'मात्रा' : 'Qty'}</th>
                  <th style={{ padding: '10px 12px', width: '90px' }}>{isHindi ? 'इकाई' : 'Unit'}</th>
                  <th style={{ padding: '10px 12px', width: '110px' }}>{isHindi ? 'दर (₹)' : 'Rate (₹)'}</th>
                  <th style={{ padding: '10px 12px', width: '80px' }}>{isHindi ? 'छूट %' : 'Disc %'}</th>
                  <th style={{ padding: '10px 12px', width: '90px' }}>GST %</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>{isHindi ? 'कुल (₹)' : 'Total (₹)'}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const selProd = products.find((p) => p.id === item.productId);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <select
                          style={{ width: '100%', marginBottom: '4px' }}
                          value={item.productId}
                          onChange={(e) => updateLineItem(idx, 'productId', e.target.value)}
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stock} {p.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Or type custom item name"
                          style={{ width: '100%', fontSize: '0.85rem' }}
                          value={item.name}
                          onChange={(e) => updateLineItem(idx, 'name', e.target.value)}
                        />
                        {selProd && selProd.stock <= 10 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--gold-600)', marginTop: '2px' }}>
                            ⚠️ Only {selProd.stock} {selProd.unit} left in inventory
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          style={{ width: '85px', fontSize: '0.85rem' }}
                          value={item.hsn}
                          onChange={(e) => updateLineItem(idx, 'hsn', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="number"
                          min="1"
                          style={{ width: '85px', fontWeight: 600 }}
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <select
                          style={{ width: '90px' }}
                          value={item.unit}
                          onChange={(e) => updateLineItem(idx, 'unit', e.target.value)}
                        >
                          <option value="Bags">Bags</option>
                          <option value="Kg">Kg</option>
                          <option value="Qtl">Qtl</option>
                          <option value="Ltr">Ltr</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Roll">Roll</option>
                          <option value="Box">Box</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="number"
                          style={{ width: '100px', fontWeight: 600 }}
                          value={item.rate}
                          onChange={(e) => updateLineItem(idx, 'rate', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          style={{ width: '70px' }}
                          value={item.discount}
                          onChange={(e) => updateLineItem(idx, 'discount', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <select
                          style={{ width: '85px' }}
                          value={item.gstRate}
                          onChange={(e) => updateLineItem(idx, 'gstRate', e.target.value)}
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeLineItem(idx)}
                          className="btn-icon"
                          style={{ color: 'var(--danger-500)' }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={addLineItem}
              className="btn-outline-primary"
              style={{ padding: '7px 14px', fontSize: '0.85rem' }}
            >
              <Plus size={15} /> {isHindi ? '+ और सामान जोड़ें' : '+ Add Another Item'}
            </button>
          </div>

          {/* Bottom Summary & Payment Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            paddingTop: '16px',
            borderTop: '2px solid var(--border-color)'
          }}>
            {/* Payment Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', margin: 0 }}>
                {isHindi ? 'भुगतान विवरण (Payment Details)' : 'Payment Status & Mode'}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'भुगतान स्थिति' : 'Payment Status'}
                  </label>
                  <select
                    style={{ width: '100%', fontWeight: 700 }}
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Paid">Paid (नकद / पूरा जमा)</option>
                    <option value="Unpaid">Unpaid (उधार / Credit)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'भुगतान माध्यम' : 'Payment Mode'}
                  </label>
                  <select
                    style={{ width: '100%' }}
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="Cash">Cash (नकद)</option>
                    <option value="UPI / QR">UPI / QR Code</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Credit / Udhaar">Credit / Udhaar (उधार)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'बिल पर टिप्पणी / नियम' : 'Invoice Notes'}
                </label>
                <textarea
                  rows={2}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{
              background: 'var(--bg-surface-alt)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isHindi ? 'कर योग्य मूल्य (Taxable)' : 'Taxable Subtotal'}:</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isHindi ? 'कुल GST कर' : 'Total GST (CGST+SGST/IGST)'}:</span>
                <span className="font-mono">₹{totalTax.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isHindi ? 'राउंड ऑफ' : 'Round Off'}:</span>
                <span className="font-mono">{roundOff >= 0 ? `+₹${roundOff}` : `-₹${Math.abs(roundOff)}`}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '2px solid var(--border-color)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--primary-700)'
              }}>
                <span>{isHindi ? 'अंतिम राशि (Grand Total)' : 'Grand Total'}:</span>
                <span>₹{roundedGrandTotal.toLocaleString('en-IN')}</span>
              </div>

              {paymentStatus === 'Unpaid' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'var(--gold-100)',
                  color: 'var(--gold-600)',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}>
                  <span>{isHindi ? 'उधार शेष (Balance Due)' : 'Pending Udhaar'}:</span>
                  <span>₹{roundedGrandTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => setViewMode('list')}
              className="btn-secondary"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              onClick={() => handleSaveInvoice(false)}
              className="btn-outline-primary"
            >
              <CheckCircle2 size={16} />
              {isHindi ? 'केवल बिल सेव करें' : 'Save Invoice'}
            </button>

            <button
              onClick={() => handleSaveInvoice(true)}
              className="btn-primary"
            >
              <Printer size={16} />
              {isHindi ? 'बिल सेव करें व प्रिंट/व्हाट्सएप देखें' : 'Save & Preview / Print'}
            </button>
          </div>
        </div>
      ) : (
        /* ================= INVOICES HISTORY LIST ================= */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={isHindi ? 'बिल नंबर, ग्राहक नाम या स्टेटस से खोजें...' : 'Search by invoice #, customer name, status...'}
                style={{ width: '100%', paddingLeft: '36px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Status Filter */}
              <div style={{ display: 'flex', background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                <button
                  onClick={() => setStatusFilter('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: statusFilter === 'all' ? 'var(--primary-700)' : 'transparent',
                    color: statusFilter === 'all' ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {isHindi ? 'सभी' : 'All'}
                </button>
                <button
                  onClick={() => setStatusFilter('Paid')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: statusFilter === 'Paid' ? '#16a34a' : 'transparent',
                    color: statusFilter === 'Paid' ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {isHindi ? 'नकद (Paid)' : 'Paid'}
                </button>
                <button
                  onClick={() => setStatusFilter('Unpaid')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: statusFilter === 'Unpaid' ? '#d97706' : 'transparent',
                    color: statusFilter === 'Unpaid' ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {isHindi ? 'उधार (Unpaid)' : 'Unpaid'}
                </button>
              </div>

              {/* Download Invoices CSV */}
              <button
                onClick={handleExportInvoicesCSV}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
                title="Download all sales invoices to CSV"
              >
                <Download size={14} />
                {isHindi ? 'CSV डाउनलोड' : 'Download CSV'}
              </button>

              <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                {filteredInvoices.length} {isHindi ? 'बिल' : 'Invoices'}
              </span>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '2px solid var(--border-color)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>{isHindi ? 'बिल क्रमांक' : 'Invoice #'}</th>
                  <th style={{ padding: '12px' }}>{isHindi ? 'दिनांक' : 'Date'}</th>
                  <th style={{ padding: '12px' }}>{isHindi ? 'ग्राहक / पार्टी' : 'Customer Name'}</th>
                  <th style={{ padding: '12px' }}>{isHindi ? 'माध्यम' : 'Mode'}</th>
                  <th style={{ padding: '12px' }}>{isHindi ? 'स्थिति' : 'Status'}</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>{isHindi ? 'राशि (₹)' : 'Amount (₹)'}</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>{isHindi ? 'कार्य' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }} className="font-mono">
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {inv.date}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inv.partyName || 'Cash Sale'}</div>
                      {inv.partyPhone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.partyPhone}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {inv.paymentMode}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.status === 'Paid' ? 'Paid' : 'Unpaid (उधार)'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800 }}>
                      ₹{Number(inv.grandTotal).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => onOpenPreview && onOpenPreview(inv)}
                          className="btn-icon"
                          title="View & Print GST Invoice (Ctrl+P / PDF)"
                          style={{ padding: '6px', color: 'var(--primary-700)' }}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => onOpenPreview && onOpenPreview(inv)}
                          className="btn-icon"
                          title="Preview Bill"
                          style={{ padding: '6px', color: '#0284c7' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEWayBill && openEWayBill(inv)}
                          className="btn-icon"
                          title="Generate GST E-Way Bill for this invoice"
                          style={{ padding: '6px', color: '#0f5132' }}
                        >
                          <Truck size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const msg = `*Jai Kisan Krishi Kendra - Bill Summary*\nInvoice: ${inv.invoiceNumber}\nDate: ${inv.date}\nCustomer: ${inv.partyName}\nTotal Amount: Rs. ${inv.grandTotal}\nStatus: ${inv.status}\nUPI: ${businessProfile.upiId}\nThank you!`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="btn-icon"
                          title="Send on WhatsApp"
                          style={{ padding: '6px', color: '#16a34a' }}
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete invoice ${inv.invoiceNumber}? Stock will be restored.`)) {
                              deleteInvoice(inv.id);
                            }
                          }}
                          className="btn-icon"
                          title="Delete Invoice"
                          style={{ padding: '6px', color: 'var(--danger-500)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
