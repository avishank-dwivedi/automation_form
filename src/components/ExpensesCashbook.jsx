import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  WalletCards,
  Plus,
  ArrowUpRight,
  TrendingDown,
  Building,
  Trash2,
  Calendar,
  Tag,
  X
} from 'lucide-react';

export default function ExpensesCashbook() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    invoices,
    businessProfile,
    language
  } = useApp();

  const isHindi = language === 'hi';

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const initialExpenseForm = {
    category: 'Transport & Bhada',
    amount: '',
    paidFrom: 'Cash in Hand',
    payee: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState(initialExpenseForm);

  const categories = [
    'All',
    'Transport & Bhada',
    'Hamali & Labour',
    'Shop Electricity',
    'Shop Rent',
    'Mandi Tax & Cess',
    'Tea & Refreshment',
    'Packaging & Misc'
  ];

  // Calculate totals
  const totalExpenseSum = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalCashCollected = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + Number(i.paidAmount || i.grandTotal), 0);
  const cashInHand = Math.max(8450, totalCashCollected - totalExpenseSum + 12000);
  const bankBalance = 142500; // Simulated SBI balance

  const filteredExpenses = expenses.filter((e) => {
    if (categoryFilter === 'All') return true;
    return e.category === categoryFilter;
  });

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return;
    addExpense(formData);
    setIsAddExpenseOpen(false);
    setFormData(initialExpenseForm);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            {isHindi ? 'दुकान खर्चे व रोकड़ बही (Cashbook)' : 'Expenses & Daily Cashbook'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isHindi ? 'भाड़ा, हमाली, बिजली, किराया व दैनिक खर्चों का हिसाब रखें' : 'Track daily transport freight, labour, electricity, and shop running costs'}
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="btn-primary"
          style={{ padding: '9px 16px' }}
        >
          <Plus size={18} />
          {isHindi ? '+ नया खर्च जोड़ें' : '+ Record Expense'}
        </button>
      </div>

      {/* Cash & Expense Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Total Expenses */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--danger-100)', color: 'var(--danger-600)' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isHindi ? 'कुल दर्ज खर्चे' : 'Total Expenses'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger-600)' }}>
              ₹{totalExpenseSum.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Card 2: Cash In Hand */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            <WalletCards size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isHindi ? 'गल्ला / रोकड़ (Cash In Hand)' : 'Cash in Hand (Drawer)'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)' }}>
              ₹{Math.round(cashInHand).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Card 3: Bank Account */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--info-100)', color: 'var(--info-600)' }}>
            <Building size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {businessProfile.bankName}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--info-600)' }}>
              ₹{bankBalance.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid var(--border-color)',
                background: categoryFilter === cat ? 'var(--primary-700)' : 'transparent',
                color: categoryFilter === cat ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '2px solid var(--border-color)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>{isHindi ? 'दिनांक' : 'Date'}</th>
                <th style={{ padding: '12px' }}>{isHindi ? 'खर्च श्रेणी' : 'Category'}</th>
                <th style={{ padding: '12px' }}>{isHindi ? 'पाने वाला (Payee)' : 'Payee'}</th>
                <th style={{ padding: '12px' }}>{isHindi ? 'भुगतान खाता' : 'Paid From'}</th>
                <th style={{ padding: '12px' }}>{isHindi ? 'विवरण / नोट्स' : 'Notes'}</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>{isHindi ? 'रकम (₹)' : 'Amount (₹)'}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{e.date}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-warning">{e.category}</span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, fontSize: '0.9rem' }}>
                    {e.payee || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {e.paidFrom}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {e.notes || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: 'var(--danger-600)' }}>
                    ₹{Number(e.amount).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => deleteExpense(e.id)}
                      className="btn-icon"
                      style={{ color: 'var(--danger-500)' }}
                      title="Delete Expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD EXPENSE ================= */}
      {isAddExpenseOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px', width: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                {isHindi ? 'नया व्यापार खर्च दर्ज करें' : 'Record Business Expense'}
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'खर्च की श्रेणी *' : 'Expense Category *'}
                </label>
                <select
                  style={{ width: '100%' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Transport & Bhada">Transport & Bhada (भाड़ा / Freight)</option>
                  <option value="Hamali & Labour">Hamali & Labour (मजदूरी / हमाली)</option>
                  <option value="Shop Electricity">Shop Electricity (दुकान बिजली बिल)</option>
                  <option value="Shop Rent">Shop Rent (दुकान किराया)</option>
                  <option value="Mandi Tax & Cess">Mandi Tax & Cess (मंडी शुल्क)</option>
                  <option value="Tea & Refreshment">Tea & Refreshment (चाय-पानी व नाश्ता)</option>
                  <option value="Packaging & Misc">Packaging & Stationery</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'रकम (₹) *' : 'Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 1500"
                    style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'दिनांक' : 'Date'}
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%' }}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'भुगतान खाता' : 'Paid From'}
                  </label>
                  <select
                    style={{ width: '100%' }}
                    value={formData.paidFrom}
                    onChange={(e) => setFormData({ ...formData, paidFrom: e.target.value })}
                  >
                    <option value="Cash in Hand">Cash in Hand (गल्ला रोकड़)</option>
                    <option value="Bank Account (SBI)">Bank Account (SBI)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'पाने वाले का नाम' : 'Payee Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sonu Driver"
                    style={{ width: '100%' }}
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'टिप्पणी (Notes)' : 'Notes'}
                </label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  style={{ width: '100%' }}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isHindi ? 'खर्च सेव करें' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
