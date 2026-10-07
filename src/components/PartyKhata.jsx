import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  Phone,
  MapPin,
  FileText,
  X,
  Send
} from 'lucide-react';

export default function PartyKhata({ selectedPartyForReminder, onCloseReminder }) {
  const {
    parties,
    addParty,
    recordPayment,
    invoices,
    businessProfile,
    language,
    setActiveTab
  } = useApp();

  const isHindi = language === 'hi';

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'customer' | 'supplier' | 'udhaar'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);

  // Modals
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderParty, setReminderParty] = useState(null);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('receive'); // 'receive' | 'pay'
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Reminder template state
  const [reminderTemplate, setReminderTemplate] = useState('polite_hi');

  // New Party Form state
  const initialPartyForm = {
    name: '',
    phone: '',
    type: 'customer',
    city: '',
    state: 'Haryana (06)',
    gstin: '',
    balance: 0,
    creditLimit: 50000,
    notes: ''
  };
  const [partyFormData, setPartyFormData] = useState(initialPartyForm);

  // If a party was passed to remind from dashboard
  React.useEffect(() => {
    if (selectedPartyForReminder) {
      setReminderParty(selectedPartyForReminder);
      setIsReminderModalOpen(true);
    }
  }, [selectedPartyForReminder]);

  // Calculations
  const totalReceivables = parties
    .filter((p) => p.balance > 0)
    .reduce((sum, p) => sum + Number(p.balance), 0);

  const totalPayables = parties
    .filter((p) => p.balance < 0)
    .reduce((sum, p) => sum + Math.abs(Number(p.balance)), 0);

  // Filter parties
  const filteredParties = parties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone && p.phone.includes(searchTerm)) ||
      (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeFilter === 'customer') return matchesSearch && p.type === 'customer';
    if (activeFilter === 'supplier') return matchesSearch && p.type === 'supplier';
    if (activeFilter === 'udhaar') return matchesSearch && p.balance > 0;
    return matchesSearch;
  });

  // Calculate party specific transactions
  const getPartyTransactions = (partyId) => {
    const partyInvoices = invoices.filter((inv) => inv.partyId === partyId);
    return partyInvoices;
  };

  const handleCreateParty = (e) => {
    e.preventDefault();
    if (!partyFormData.name) return;
    addParty(partyFormData);
    setIsAddPartyOpen(false);
    setPartyFormData(initialPartyForm);
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedParty || !paymentAmount) return;
    recordPayment(selectedParty.id, paymentAmount, paymentType, paymentMode, paymentNotes);
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentNotes('');

    // Update locally selected party view
    const updated = parties.find((p) => p.id === selectedParty.id);
    if (updated) setSelectedParty(updated);
  };

  const getReminderMessage = (party, templateKey) => {
    if (!party) return '';
    const balance = Math.abs(party.balance);

    if (templateKey === 'polite_hi') {
      return `नमस्ते ${party.name} जी!\n` +
        `जय किसान कृषि केंद्र (${businessProfile.name}) से सविनय निवेदन है कि आपके खाते में ₹${balance.toLocaleString('en-IN')} की उधारी शेष है।\n` +
        `कृपया सुविधा अनुसार UPI: ${businessProfile.upiId} पर भुगतान करें।\n` +
        `धन्यवाद! संपर्क: ${businessProfile.phone}`;
    } else if (templateKey === 'polite_en') {
      return `Dear ${party.name},\n` +
        `Greetings from ${businessProfile.name}!\n` +
        `This is a gentle reminder that an outstanding amount of Rs. ${balance.toLocaleString('en-IN')} is pending in your account.\n` +
        `Kindly settle via UPI: ${businessProfile.upiId} or bank transfer.\n` +
        `Thank you for your business!`;
    } else {
      return `IMPORTANT DUE NOTICE: Outstanding payment of Rs. ${balance.toLocaleString('en-IN')} is due for your bills at ${businessProfile.name}. Please pay immediately via UPI: ${businessProfile.upiId} to avoid disruption in credit.`;
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            {isHindi ? 'पार्टी खाता व उधारी बहीखाता' : 'Parties & Khata Ledger'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isHindi ? 'किसान व व्यापारी खाता, उधारी वसूली और व्हाट्सएप तकाजा' : 'Manage customer & supplier ledgers, credit limits, and automated WhatsApp reminders'}
          </p>
        </div>

        <button
          onClick={() => setIsAddPartyOpen(true)}
          className="btn-primary"
          style={{ padding: '9px 16px' }}
        >
          <Plus size={18} />
          {isHindi ? '+ नया ग्राहक / व्यापारी जोड़ें' : '+ Add New Party'}
        </button>
      </div>

      {/* Top Ledger Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--gold-100)', color: 'var(--gold-600)' }}>
            <ArrowDownLeft size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isHindi ? 'कुल उधारी (लेना है / You will Receive)' : 'Total Receivables (To Receive)'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-600)' }}>
              ₹{totalReceivables.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--danger-100)', color: 'var(--danger-600)' }}>
            <ArrowUpRight size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isHindi ? 'कुल देनदारी (देना है / You have to Pay)' : 'Total Payables (To Pay)'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger-600)' }}>
              ₹{totalPayables.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Pane Layout: Party List on Left, Selected Party Details on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedParty ? '1fr 1.3fr' : '1fr',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* ================= LEFT COLUMN: PARTIES LIST ================= */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          {/* Search & Filter Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={isHindi ? 'पार्टी का नाम, फोन या शहर खोजें...' : 'Search party name, phone, city...'}
                style={{ width: '100%', paddingLeft: '36px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveFilter('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: activeFilter === 'all' ? 'var(--primary-700)' : 'transparent',
                  color: activeFilter === 'all' ? '#ffffff' : 'var(--text-main)'
                }}
              >
                {isHindi ? 'सभी' : 'All'} ({parties.length})
              </button>
              <button
                onClick={() => setActiveFilter('udhaar')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: activeFilter === 'udhaar' ? 'var(--gold-500)' : 'transparent',
                  color: activeFilter === 'udhaar' ? '#ffffff' : 'var(--gold-600)'
                }}
              >
                ⚠️ {isHindi ? 'केवल उधारी' : 'Pending Udhaar'}
              </button>
              <button
                onClick={() => setActiveFilter('customer')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: activeFilter === 'customer' ? 'var(--primary-700)' : 'transparent',
                  color: activeFilter === 'customer' ? '#ffffff' : 'var(--text-main)'
                }}
              >
                {isHindi ? 'ग्राहक / किसान' : 'Farmers / Retail'}
              </button>
              <button
                onClick={() => setActiveFilter('supplier')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: activeFilter === 'supplier' ? 'var(--primary-700)' : 'transparent',
                  color: activeFilter === 'supplier' ? '#ffffff' : 'var(--text-main)'
                }}
              >
                {isHindi ? 'सप्लायर / कंपनी' : 'Distributors'}
              </button>
            </div>
          </div>

          {/* Parties List Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '560px', overflowY: 'auto' }}>
            {filteredParties.map((p) => {
              const isSelected = selectedParty && selectedParty.id === p.id;
              const hasReceivable = p.balance > 0;
              const hasPayable = p.balance < 0;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedParty(p)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--primary-50)' : 'var(--bg-surface-alt)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {p.phone} • {p.city || 'Karnal'} • <span style={{ textTransform: 'capitalize' }}>{p.type}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: hasReceivable ? 'var(--gold-600)' : hasPayable ? 'var(--danger-600)' : '#10b981'
                    }}>
                      ₹{Math.abs(p.balance).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>
                      {hasReceivable ? (isHindi ? 'लेना है' : 'You will receive') : hasPayable ? (isHindi ? 'देना है' : 'You have to pay') : 'Settled'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SELECTED PARTY LEDGER ================= */}
        {selectedParty && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Party Profile Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{selectedParty.name}</h3>
                  <span className="badge badge-info">{selectedParty.type}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} /> {selectedParty.phone || 'No phone'} •
                  <MapPin size={13} style={{ display: 'inline', margin: '0 4px' }} /> {selectedParty.city || 'Haryana'}
                  {selectedParty.gstin && ` • GSTIN: ${selectedParty.gstin}`}
                </div>
                {selectedParty.notes && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '4px', fontStyle: 'italic' }}>
                    Note: {selectedParty.notes}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isHindi ? 'वर्तमान बकाया खाता शेष' : 'Current Net Balance'}
                </div>
                <div style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: selectedParty.balance > 0 ? 'var(--gold-600)' : selectedParty.balance < 0 ? 'var(--danger-600)' : '#10b981'
                }}>
                  ₹{Math.abs(selectedParty.balance).toLocaleString('en-IN')}
                </div>
                <span className={`badge ${selectedParty.balance > 0 ? 'badge-warning' : selectedParty.balance < 0 ? 'badge-danger' : 'badge-success'}`}>
                  {selectedParty.balance > 0 ? 'Pending Udhaar' : selectedParty.balance < 0 ? 'You Owe' : 'Zero Balance'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setPaymentType('receive');
                  setIsPaymentModalOpen(true);
                }}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <ArrowDownLeft size={16} />
                {isHindi ? 'भुगतान प्राप्त करें (रुपये मिले)' : 'Record Payment In'}
              </button>

              {selectedParty.balance > 0 && (
                <button
                  onClick={() => {
                    setReminderParty(selectedParty);
                    setIsReminderModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ background: '#16a34a', padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Send size={15} />
                  {isHindi ? 'व्हाट्सएप तकाजा भेजें' : 'WhatsApp Reminder'}
                </button>
              )}

              <button
                onClick={() => setActiveTab('billing')}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <FileText size={15} />
                {isHindi ? '+ नया बिल बनाएं' : '+ New Bill'}
              </button>

              <button
                onClick={() => setSelectedParty(null)}
                className="btn-icon"
                style={{ marginLeft: 'auto' }}
                title="Close Ledger"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ledger Transactions */}
            <div>
              <h4 style={{ fontSize: '0.92rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                {isHindi ? 'लेन-देन विवरण (Transaction History)' : 'Transaction History'}
              </h4>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      <th style={{ padding: '8px 10px' }}>Date</th>
                      <th style={{ padding: '8px 10px' }}>Particulars / Ref</th>
                      <th style={{ padding: '8px 10px' }}>Type</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPartyTransactions(selectedParty.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                          No recent bills logged for this party yet.
                        </td>
                      </tr>
                    ) : (
                      getPartyTransactions(selectedParty.id).map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px' }}>{inv.date}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span className="font-mono" style={{ fontWeight: 600 }}>{inv.invoiceNumber}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {inv.items?.length || 0} items ({inv.paymentMode})
                            </div>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                            ₹{Number(inv.grandTotal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD NEW PARTY ================= */}
      {isAddPartyOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                {isHindi ? 'नया खाता / पार्टी जोड़ें' : 'Add New Party (Customer / Supplier)'}
              </h3>
              <button onClick={() => setIsAddPartyOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateParty} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'पार्टी का नाम *' : 'Party / Customer Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balram Farmer / Sharma Traders"
                  style={{ width: '100%' }}
                  value={partyFormData.name}
                  onChange={(e) => setPartyFormData({ ...partyFormData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'प्रकार (Party Type)' : 'Party Type'}
                  </label>
                  <select
                    style={{ width: '100%' }}
                    value={partyFormData.type}
                    onChange={(e) => setPartyFormData({ ...partyFormData, type: e.target.value })}
                  >
                    <option value="customer">Customer / Farmer (ग्राहक)</option>
                    <option value="supplier">Supplier / Distributor (कंपनी / सप्लायर)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'मोबाइल नंबर (व्हाट्सएप)' : 'Mobile Phone'}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    style={{ width: '100%' }}
                    value={partyFormData.phone}
                    onChange={(e) => setPartyFormData({ ...partyFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'शहर / गांव' : 'City / Village'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karnal"
                    style={{ width: '100%' }}
                    value={partyFormData.city}
                    onChange={(e) => setPartyFormData({ ...partyFormData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="Optional 15-digit GSTIN"
                    style={{ width: '100%' }}
                    value={partyFormData.gstin}
                    onChange={(e) => setPartyFormData({ ...partyFormData, gstin: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'प्रारंभिक उधारी शेष (₹)' : 'Opening Balance (₹)'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    style={{ width: '100%' }}
                    value={partyFormData.balance}
                    onChange={(e) => setPartyFormData({ ...partyFormData, balance: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'उधार सीमा (Credit Limit)' : 'Credit Limit (₹)'}
                  </label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={partyFormData.creditLimit}
                    onChange={(e) => setPartyFormData({ ...partyFormData, creditLimit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddPartyOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isHindi ? 'खाता बनाएं' : 'Save Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PAYMENT IN / OUT ================= */}
      {isPaymentModalOpen && selectedParty && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', width: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
              {isHindi ? 'भुगतान दर्ज करें' : 'Record Payment'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Party: <strong>{selectedParty.name}</strong> • Current Balance: ₹{selectedParty.balance}
            </p>

            <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'राशि (₹) *' : 'Amount (₹) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount"
                  style={{ width: '100%', fontSize: '1.2rem', fontWeight: 700 }}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
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
                  <option value="UPI / QR">UPI (PhonePe / GPay / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                  <option value="Cheque">Cheque (चेक)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'टिप्पणी / रसीद विवरण' : 'Notes / Reference'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harvest settlement payment"
                  style={{ width: '100%' }}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isHindi ? 'भुगतान रसीद जमा करें' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WHATSAPP PAYMENT REMINDER ================= */}
      {isReminderModalOpen && reminderParty && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#16a34a', color: '#fff', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                  <Send size={16} />
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                  {isHindi ? 'व्हाट्सएप भुगतान तकाजा भेजें' : 'WhatsApp Payment Reminder'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsReminderModalOpen(false);
                  if (onCloseReminder) onCloseReminder();
                }}
                className="btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface-alt)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
              <div><strong>Farmer/Party:</strong> {reminderParty.name}</div>
              <div><strong>Phone:</strong> {reminderParty.phone || 'N/A'}</div>
              <div style={{ color: 'var(--gold-600)', fontWeight: 800, fontSize: '1.05rem', marginTop: '4px' }}>
                Pending Amount: ₹{Math.abs(reminderParty.balance).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Template Selector */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Choose Reminder Tone / भाषा व लहज़ा:
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setReminderTemplate('polite_hi')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-color)',
                    background: reminderTemplate === 'polite_hi' ? 'var(--primary-700)' : 'transparent',
                    color: reminderTemplate === 'polite_hi' ? '#fff' : 'var(--text-main)'
                  }}
                >
                  विनम्र निवेदन (हिन्दी)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTemplate('polite_en')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-color)',
                    background: reminderTemplate === 'polite_en' ? 'var(--primary-700)' : 'transparent',
                    color: reminderTemplate === 'polite_en' ? '#fff' : 'var(--text-main)'
                  }}
                >
                  Gentle Reminder (English)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTemplate('due_notice')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-color)',
                    background: reminderTemplate === 'due_notice' ? 'var(--primary-700)' : 'transparent',
                    color: reminderTemplate === 'due_notice' ? '#fff' : 'var(--text-main)'
                  }}
                >
                  Due Date Notice
                </button>
              </div>
            </div>

            {/* Message Preview Box */}
            <div style={{
              background: '#e8f5e9',
              border: '1px solid #c8e6c9',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.84rem',
              color: '#1b5e20',
              whiteSpace: 'pre-wrap',
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif'
            }}>
              {getReminderMessage(reminderParty, reminderTemplate)}
            </div>

            {/* Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsReminderModalOpen(false);
                  if (onCloseReminder) onCloseReminder();
                }}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const msg = getReminderMessage(reminderParty, reminderTemplate);
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                  setIsReminderModalOpen(false);
                  if (onCloseReminder) onCloseReminder();
                }}
                className="btn-primary"
                style={{ background: '#16a34a' }}
              >
                <Send size={15} /> Open WhatsApp & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
