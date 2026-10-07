import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileEdit,
  Plus,
  Trash2,
  Share2,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Save,
  ShoppingBag,
  Store,
  Truck,
  Cpu,
  Palette,
  StickyNote,
  Calculator,
  Send,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Scratchpad({ isModal = false, onClose = null }) {
  const {
    products,
    parties,
    scratchpads,
    saveScratchpad,
    deleteScratchpad,
    convertScratchpadToInvoice,
    businessProfile,
    language
  } = useApp();

  const isHindi = language === 'hi';

  // Active Scratchpad state
  const [selectedPresetId, setSelectedPresetId] = useState(scratchpads[0]?.id || 'scratch-1');
  const [title, setTitle] = useState(scratchpads[0]?.title || 'Daily Counter Estimate');
  const [customerName, setCustomerName] = useState(scratchpads[0]?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(scratchpads[0]?.customerPhone || '');
  const [businessType, setBusinessType] = useState(scratchpads[0]?.businessType || 'General Stores / Kirana');
  const [notes, setNotes] = useState(scratchpads[0]?.notes || '');
  
  // Scratchpad line items
  const [items, setItems] = useState(
    scratchpads[0]?.items || [
      { name: '', quantity: 1, unit: 'Pcs', rate: 0, discount: 0, gstRate: 5 }
    ]
  );

  // Counter Sticky Notepad state
  const [quickStickyNotes, setQuickStickyNotes] = useState(() => {
    return localStorage.getItem('jkv_sticky_notes') || 
      '• Delivery: 50 Bags Urea to Taraori farm at 3 PM\n• Call Ramesh Patel for Kharif balance settlement\n• Check basmati seed stock arrival tomorrow morning';
  });

  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Save sticky note to localStorage
  useEffect(() => {
    localStorage.setItem('jkv_sticky_notes', quickStickyNotes);
  }, [quickStickyNotes]);

  // Load a preset or saved scratchpad
  const handleSelectScratchpad = (scratch) => {
    setSelectedPresetId(scratch.id);
    setTitle(scratch.title);
    setCustomerName(scratch.customerName || '');
    setCustomerPhone(scratch.customerPhone || '');
    setBusinessType(scratch.businessType || 'General');
    setNotes(scratch.notes || '');
    setItems(scratch.items && scratch.items.length ? scratch.items : [
      { name: '', quantity: 1, unit: 'Pcs', rate: 0, discount: 0, gstRate: 5 }
    ]);
  };

  // Add line item
  const handleAddItem = () => {
    setItems([
      ...items,
      { name: '', quantity: 1, unit: 'Bags', rate: 0, discount: 0, gstRate: 5 }
    ]);
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      setItems([{ name: '', quantity: 1, unit: 'Pcs', rate: 0, discount: 0, gstRate: 5 }]);
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item field
  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    // If selected from catalog
    if (field === 'catalogProduct') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        current.name = prod.name;
        current.rate = prod.sellingPrice;
        current.unit = prod.unit;
        current.gstRate = prod.gstRate;
      }
    }

    updated[index] = current;
    setItems(updated);
  };

  // Calculation helpers
  const calculateLineTotal = (item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const disc = Number(item.discount) || 0;
    const gross = qty * rate;
    const net = gross - (gross * disc) / 100;
    return Number(net.toFixed(2));
  };

  const subtotalGross = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.rate) || 0)), 0);
  const totalDiscount = items.reduce((sum, item) => {
    const gross = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    return sum + (gross * (Number(item.discount) || 0)) / 100;
  }, 0);
  const subtotalNet = subtotalGross - totalDiscount;

  const estimatedTax = items.reduce((sum, item) => {
    const lineTotal = calculateLineTotal(item);
    const gstPct = Number(item.gstRate) || 0;
    const taxable = (lineTotal * 100) / (100 + gstPct);
    return sum + (lineTotal - taxable);
  }, 0);

  const grandTotal = Math.round(subtotalNet);

  // Save current scratchpad
  const handleSaveCurrent = () => {
    const payload = {
      id: selectedPresetId.startsWith('scratch-') ? selectedPresetId : `scratch-${Date.now().toString().slice(-6)}`,
      title: title || 'Counter Estimate',
      customerName,
      customerPhone,
      businessType,
      notes,
      items
    };
    saveScratchpad(payload);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Create new blank scratchpad
  const handleNewBlank = () => {
    const newId = `scratch-${Date.now().toString().slice(-6)}`;
    setSelectedPresetId(newId);
    setTitle('New Rough Bill');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setItems([
      { name: '', quantity: 1, unit: 'Bags', rate: 0, discount: 0, gstRate: 5 }
    ]);
  };

  // 1-Click Convert to Invoice Builder
  const handleConvertToInvoice = () => {
    const validItems = items.filter(i => i.name && i.name.trim().length > 0);
    if (!validItems.length) {
      alert('Please add at least one item description to convert to bill.');
      return;
    }

    const scratchData = {
      title,
      customerName: customerName || 'Walk-in Cash Customer',
      customerPhone,
      notes,
      items: validItems
    };

    convertScratchpadToInvoice(scratchData);
    if (onClose) onClose();
  };

  // WhatsApp formatted share text
  const getWhatsAppMessage = () => {
    let msg = `*${businessProfile.name}* - Rough Estimate / कच्चा बिल\n`;
    msg += `---------------------------------\n`;
    if (customerName) msg += `Customer: ${customerName}\n`;
    if (title) msg += `Estimate Ref: ${title}\n`;
    msg += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    msg += `*Items Details:*\n`;

    items.forEach((it, idx) => {
      if (it.name) {
        const lineVal = calculateLineTotal(it);
        msg += `${idx + 1}. ${it.name} - ${it.quantity} ${it.unit} @ ₹${it.rate} = ₹${lineVal}\n`;
      }
    });

    msg += `---------------------------------\n`;
    msg += `*Estimated Total: ₹${grandTotal.toLocaleString('en-IN')}*\n`;
    msg += `Pay via UPI: ${businessProfile.upiId}\n`;
    if (notes) msg += `Note: ${notes}\n`;
    msg += `\n_Thank you for choosing ${businessProfile.name}!_`;
    return msg;
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyClipboard = () => {
    const text = getWhatsAppMessage();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Industry preset buttons
  const industryPresets = [
    { id: 'scratch-1', icon: ShoppingBag, label: '🌾 Agri & Mandi' },
    { id: 'scratch-2', icon: Store, label: '🏪 General Store / Kirana' },
    { id: 'scratch-3', icon: Truck, label: '🌟 Wholesaler & Distributor' },
    { id: 'scratch-4', icon: Cpu, label: '⚡ Electronics & Hardware' },
    { id: 'scratch-5', icon: Palette, label: '🎨 Creators & Agency' }
  ];

  return (
    <div style={{
      padding: isModal ? '20px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <FileEdit size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                {isHindi ? 'व्यापार स्क्रैचपैड व कच्चा बिल' : 'Pre-Made Scratchpad & Quick Estimator'}
              </h2>
              <span className="badge badge-warning" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                <Sparkles size={11} /> 1-Click to Bill
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isHindi
                ? 'तुरंत कच्चा हिसाब, उद्धरण और कैलकुलेटर बनाएं — 1-क्लिक में पक्के GST बिल में बदलें'
                : 'Rapid rough estimates, quick counter notes & calculation pad — convert to official invoice in 1-click'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleNewBlank}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Create blank scratchpad"
          >
            <RotateCcw size={15} /> {isHindi ? 'नया साफ पैड' : 'New Blank'}
          </button>
          <button
            onClick={handleSaveCurrent}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Save size={15} /> {isHindi ? 'सेव रखें' : 'Save Pad'}
          </button>
          <button
            onClick={handleConvertToInvoice}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              boxShadow: '0 4px 12px rgba(15, 81, 50, 0.3)'
            }}
          >
            <ArrowRight size={16} />
            {isHindi ? 'पक्का बिल बनाएं (F2)' : 'Convert to GST Bill (F2)'}
          </button>

          {isModal && onClose && (
            <button onClick={onClose} className="btn-icon">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {savedToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: 'var(--primary-700)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.86rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          Scratchpad saved & synchronised to PC and Mobile devices!
        </div>
      )}

      {/* Pre-made Industry Template Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 2px 8px',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {isHindi ? 'रेडीमेड टेम्पलेट्स:' : 'Pre-made Presets:'}
        </span>
        {scratchpads.map((sp) => {
          const isSelected = selectedPresetId === sp.id;
          return (
            <button
              key={sp.id}
              onClick={() => handleSelectScratchpad(sp)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-color)',
                background: isSelected ? 'var(--primary-700)' : 'var(--bg-surface-alt)',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{sp.title}</span>
            </button>
          );
        })}
      </div>

      {/* Dual Column Layout: Main Estimation Sheet & Quick Counter Sticky Notes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Left Column: Calculation Sheet */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            background: 'var(--bg-surface-alt)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {isHindi ? 'पैड शीर्षक / नोट नाम' : 'Scratchpad Title'}
              </label>
              <input
                type="text"
                style={{ width: '100%', fontSize: '0.88rem', fontWeight: 600 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {isHindi ? 'संभावित ग्राहक (Customer / Farmer)' : 'Customer / Farmer'}
              </label>
              <input
                type="text"
                placeholder="Walk-in Customer / Kisan"
                style={{ width: '100%', fontSize: '0.88rem' }}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {isHindi ? 'मोबाइल नंबर (व्हाट्सएप)' : 'Mobile Phone'}
              </label>
              <input
                type="text"
                placeholder="+91 98..."
                style={{ width: '100%', fontSize: '0.88rem' }}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {isHindi ? 'व्यापार श्रेणी (Business Category)' : 'Industry Profile'}
              </label>
              <select
                style={{ width: '100%', fontSize: '0.85rem' }}
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                <option value="Agri / Kirana">🌾 Agri / Fertilizers / Seeds</option>
                <option value="General Stores / Kirana">🏪 Retail & Kirana</option>
                <option value="Distributors & Wholesalers">🌟 Distributors & Wholesalers</option>
                <option value="Electronic / Hardware stores">⚡ Electronic & Hardware</option>
                <option value="Creators & Freelancers">🎨 Creators & Services</option>
              </select>
            </div>
          </div>

          {/* Quick Item Picker from Inventory */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {isHindi ? '⚡ इन्वेंटरी से तुरंत सामान जोड़ें:' : '⚡ Quick Insert from Inventory:'}
            </span>
            <select
              style={{ flex: 1, minWidth: '220px', fontSize: '0.85rem' }}
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const prod = products.find(p => p.id === e.target.value);
                if (prod) {
                  setItems([
                    ...items,
                    {
                      name: prod.name,
                      quantity: 1,
                      unit: prod.unit,
                      rate: prod.sellingPrice,
                      discount: 0,
                      gstRate: prod.gstRate
                    }
                  ]);
                }
              }}
            >
              <option value="">-- Choose item from store catalogue --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.sellingPrice} / {p.unit}) [Stock: {p.stock}]
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Calculation Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{
                  background: 'var(--bg-surface-alt)',
                  borderBottom: '2px solid var(--border-color)',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)'
                }}>
                  <th style={{ padding: '8px 10px', width: '30px' }}>#</th>
                  <th style={{ padding: '8px 10px', width: '38%' }}>{isHindi ? 'सामान का नाम' : 'Item Description'}</th>
                  <th style={{ padding: '8px 10px', width: '80px' }}>{isHindi ? 'मात्रा' : 'Qty'}</th>
                  <th style={{ padding: '8px 10px', width: '80px' }}>{isHindi ? 'इकाई' : 'Unit'}</th>
                  <th style={{ padding: '8px 10px', width: '100px' }}>{isHindi ? 'दर (₹)' : 'Rate (₹)'}</th>
                  <th style={{ padding: '8px 10px', width: '70px' }}>{isHindi ? 'छूट %' : 'Disc %'}</th>
                  <th style={{ padding: '8px 10px', width: '80px' }}>GST %</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>{isHindi ? 'कुल' : 'Total (₹)'}</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '36px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineTotal = calculateLineTotal(item);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <input
                          type="text"
                          placeholder="Item name / note"
                          style={{ width: '100%', fontSize: '0.85rem' }}
                          value={item.name}
                          onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <input
                          type="number"
                          min="1"
                          style={{ width: '75px', fontWeight: 600, fontSize: '0.85rem' }}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <select
                          style={{ width: '75px', fontSize: '0.8rem' }}
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                        >
                          <option value="Bags">Bags</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Kg">Kg</option>
                          <option value="Qtl">Qtl</option>
                          <option value="Ltr">Ltr</option>
                          <option value="Roll">Roll</option>
                          <option value="Box">Box</option>
                          <option value="Mtr">Mtr</option>
                        </select>
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <input
                          type="number"
                          style={{ width: '90px', fontWeight: 600, fontSize: '0.85rem' }}
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          style={{ width: '65px', fontSize: '0.85rem' }}
                          value={item.discount}
                          onChange={(e) => handleUpdateItem(idx, 'discount', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <select
                          style={{ width: '75px', fontSize: '0.8rem' }}
                          value={item.gstRate}
                          onChange={(e) => handleUpdateItem(idx, 'gstRate', e.target.value)}
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="btn-icon"
                          style={{ color: 'var(--danger-500)', padding: '4px' }}
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleAddItem}
              className="btn-outline-primary"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              <Plus size={14} /> {isHindi ? '+ और सामान जोड़ें' : '+ Add Item'}
            </button>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {items.length} items on pad
            </span>
          </div>

          {/* Remarks & Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'कच्ची टिप्पणी / डिलीवरी विवरण' : 'Estimate Notes & Terms'}
            </label>
            <input
              type="text"
              placeholder="e.g. Rate valid for 3 days; Cash payment on delivery"
              style={{ width: '100%', fontSize: '0.85rem' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: Financial Summary, WhatsApp Share & Sticky Notepad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Summary Card */}
          <div className="card" style={{
            background: 'var(--bg-surface-alt)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            border: '1.5px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <Calculator size={18} style={{ color: 'var(--primary-600)' }} />
              <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 800 }}>
                {isHindi ? 'कच्चा हिसाब योग' : 'Rough Estimate Summary'}
              </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Gross Total:</span>
              <span className="font-mono">₹{subtotalGross.toFixed(2)}</span>
            </div>

            {totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                <span>Total Discount:</span>
                <span className="font-mono">- ₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Estimated GST Tax:</span>
              <span className="font-mono">₹{estimatedTax.toFixed(2)}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '2px solid var(--border-color)',
              fontSize: '1.35rem',
              fontWeight: 900,
              color: 'var(--primary-700)'
            }}>
              <span>{isHindi ? 'कुल योग' : 'Grand Total'}:</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Quick Share Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={handleShareWhatsApp}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: '#16a34a',
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  gap: '6px'
                }}
                title="Send formatted rough quote to customer on WhatsApp"
              >
                <Send size={14} /> WhatsApp
              </button>

              <button
                onClick={handleCopyClipboard}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.82rem', gap: '4px' }}
                title="Copy breakdown text to clipboard"
              >
                {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={handleConvertToInvoice}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '0.9rem',
                fontWeight: 700,
                marginTop: '4px'
              }}
            >
              <ArrowRight size={16} />
              {isHindi ? '1-क्लिक में पक्का बिल बनाएं' : 'Convert to Official Invoice'}
            </button>
          </div>

          {/* Counter Sticky Notepad (Persistent Quick Notes) */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.15) 0%, rgba(253, 224, 71, 0.25) 100%)',
            border: '1.5px solid #facc15',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem', color: '#854d0e' }}>
                <StickyNote size={16} />
                <span>{isHindi ? 'दुकान काउन्टर स्टिकी नोट' : 'Counter Quick Sticky Note'}</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#a16207', fontWeight: 600 }}>Auto-saved</span>
            </div>

            <p style={{ margin: 0, fontSize: '0.72rem', color: '#713f12' }}>
              {isHindi ? 'फोन नंबर, गाडी नंबर, किसान वादा, और त्वरित नोट्स लिखें' : 'Quick notes, phone messages, driver tempo numbers & daily reminders'}
            </p>

            <textarea
              rows={5}
              style={{
                width: '100%',
                fontSize: '0.82rem',
                lineHeight: 1.4,
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid #fde047',
                borderRadius: '6px',
                color: '#1e293b'
              }}
              value={quickStickyNotes}
              onChange={(e) => setQuickStickyNotes(e.target.value)}
              placeholder="Type rough counter notes here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
