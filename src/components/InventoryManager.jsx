import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  PlusCircle,
  Calendar,
  Layers,
  X,
  CheckCircle2
} from 'lucide-react';

export default function InventoryManager() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    language
  } = useApp();

  const isHindi = language === 'hi';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockInProduct, setStockInProduct] = useState(null);
  const [stockInQty, setStockInQty] = useState(10);

  // Form State
  const initialForm = {
    name: '',
    category: 'Fertilizers',
    hsn: '',
    unit: 'Bags',
    purchasePrice: '',
    sellingPrice: '',
    gstRate: 5,
    stock: '',
    minStock: 15,
    batchNo: '',
    expiryDate: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const categories = ['All', 'Fertilizers', 'Seeds', 'Pesticides', 'Equipment', 'Nutrients'];

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.hsn && prod.hsn.includes(searchTerm)) ||
      (prod.batchNo && prod.batchNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || prod.stock <= prod.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalStockValuation = products.reduce(
    (sum, p) => sum + Number(p.stock) * Number(p.purchasePrice || 0),
    0
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category || 'Fertilizers',
      hsn: prod.hsn || '',
      unit: prod.unit || 'Bags',
      purchasePrice: prod.purchasePrice || '',
      sellingPrice: prod.sellingPrice || '',
      gstRate: prod.gstRate !== undefined ? prod.gstRate : 5,
      stock: prod.stock || 0,
      minStock: prod.minStock || 10,
      batchNo: prod.batchNo || '',
      expiryDate: prod.expiryDate || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }

    setIsAddModalOpen(false);
  };

  const handleApplyStockIn = (e) => {
    e.preventDefault();
    if (!stockInProduct || !stockInQty) return;
    const newStock = Number(stockInProduct.stock) + Number(stockInQty);
    updateProduct(stockInProduct.id, { stock: newStock });
    setStockInProduct(null);
    setStockInQty(10);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            {isHindi ? 'स्टॉक व उत्पाद इन्वेंटरी' : 'Inventory & Stock Management'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isHindi ? 'उत्पाद सूची, बैच, एक्सपायरी और कम स्टॉक चेतावनी ट्रैक करें' : 'Track stock levels, batch numbers, expiry dates, and low stock reorder alerts'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary"
          style={{ padding: '9px 16px' }}
        >
          <Plus size={18} />
          {isHindi ? '+ नया सामान जोड़ें' : '+ Add New Product'}
        </button>
      </div>

      {/* Inventory Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isHindi ? 'कुल उत्पाद' : 'Total Items'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{products.length}</div>
          </div>
        </div>

        <div
          className="card"
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            border: showLowStockOnly ? '2px solid var(--gold-500)' : '1px solid var(--border-color)',
            background: showLowStockOnly ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface)'
          }}
        >
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--gold-100)', color: 'var(--gold-600)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isHindi ? 'कम स्टॉक वाले' : 'Low Stock Items'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-600)' }}>
              {lowStockCount} {showLowStockOnly ? ' (Filtered)' : ''}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-700)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isHindi ? 'गोदाम स्टॉक लागत' : 'Total Stock Asset Value'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)' }}>
              ₹{Math.round(totalStockValuation).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={isHindi ? 'उत्पाद नाम, HSN या बैच नंबर से खोजें...' : 'Search item name, HSN, batch #...'}
              style={{ width: '100%', paddingLeft: '36px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: selectedCategory === cat ? 'var(--primary-700)' : 'var(--bg-surface)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '2px solid var(--border-color)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>{isHindi ? 'उत्पाद / जिंस' : 'Product Name'}</th>
                <th style={{ padding: '12px' }}>{isHindi ? 'श्रेणी' : 'Category'}</th>
                <th style={{ padding: '12px' }}>HSN</th>
                <th style={{ padding: '12px' }}>{isHindi ? 'बैच / एक्सपायरी' : 'Batch / Expiry'}</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>{isHindi ? 'खरीद दर' : 'Purchase'}</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>{isHindi ? 'बिक्री दर' : 'Selling'}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>GST</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{isHindi ? 'वर्तमान स्टॉक' : 'Current Stock'}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{isHindi ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{p.name}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {p.hsn || '-'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div>{p.batchNo || 'N/A'}</div>
                      {p.expiryDate && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Exp: {p.expiryDate}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                      ₹{p.purchasePrice}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-700)' }}>
                      ₹{p.sellingPrice}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem' }}>
                      {p.gstRate}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        backgroundColor: isOut ? 'var(--danger-100)' : isLow ? 'var(--gold-100)' : 'var(--primary-100)',
                        color: isOut ? 'var(--danger-600)' : isLow ? 'var(--gold-600)' : 'var(--primary-700)'
                      }}>
                        {isLow && <AlertTriangle size={12} />}
                        {p.stock} {p.unit}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setStockInProduct(p);
                            setStockInQty(10);
                          }}
                          className="btn-icon"
                          title="Quick Stock In (माल आया)"
                          style={{ padding: '6px', color: 'var(--primary-600)' }}
                        >
                          <PlusCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="btn-icon"
                          title="Edit Product"
                          style={{ padding: '6px' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete product ${p.name}?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="btn-icon"
                          title="Delete Product"
                          style={{ padding: '6px', color: 'var(--danger-500)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                {editingProduct ? (isHindi ? 'उत्पाद विवरण संपादित करें' : 'Edit Product') : (isHindi ? 'नया उत्पाद जोड़ें' : 'Add New Product')}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'उत्पाद का नाम *' : 'Product / Item Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DAP Fertilizer (50kg)"
                  style={{ width: '100%' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'श्रेणी' : 'Category'}
                  </label>
                  <select
                    style={{ width: '100%' }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Fertilizers">Fertilizers (उर्वरक / खाद)</option>
                    <option value="Seeds">Seeds (बीज)</option>
                    <option value="Pesticides">Pesticides (कीटनाशक दवा)</option>
                    <option value="Equipment">Equipment / Pipes (कृषि यंत्र)</option>
                    <option value="Nutrients">Nutrients / Micronutrients</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'इकाई (Unit)' : 'Unit'}
                  </label>
                  <select
                    style={{ width: '100%' }}
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="Bags">Bags (बोरी)</option>
                    <option value="Kg">Kg (किलोग्राम)</option>
                    <option value="Qtl">Quintal (क्विंटल)</option>
                    <option value="Ltr">Litre (लीटर)</option>
                    <option value="Pcs">Pcs (नग / पैकेट)</option>
                    <option value="Roll">Roll (रोल)</option>
                    <option value="Box">Box (पेटी)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    HSN Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3105"
                    style={{ width: '100%' }}
                    value={formData.hsn}
                    onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'खरीद दर (₹)' : 'Purchase Rate (₹)'}
                  </label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'बिक्री दर (₹) *' : 'Selling Rate (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', fontWeight: 700 }}
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    GST %
                  </label>
                  <select
                    style={{ width: '100%' }}
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'प्रारंभिक स्टॉक' : 'Initial Stock'}
                  </label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'कम स्टॉक सीमा' : 'Min Alert Level'}
                  </label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'बैच नंबर (Batch No)' : 'Batch Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-2026"
                    style={{ width: '100%' }}
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {isHindi ? 'एक्सपायरी तिथि' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%' }}
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isHindi ? 'सुरक्षित करें' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK STOCK IN ================= */}
      {stockInProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', width: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>
              {isHindi ? '📦 नया स्टॉक जोड़ें (Stock In)' : '📦 Quick Stock In'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <strong>{stockInProduct.name}</strong><br />
              Current Stock: {stockInProduct.stock} {stockInProduct.unit}
            </p>

            <form onSubmit={handleApplyStockIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {isHindi ? 'आई हुई मात्रा जोड़ें (Add Quantity)' : 'Add Quantity'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                  value={stockInQty}
                  onChange={(e) => setStockInQty(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                New Total Stock will be: {Number(stockInProduct.stock) + Number(stockInQty || 0)} {stockInProduct.unit}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setStockInProduct(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isHindi ? 'स्टॉक अपडेट करें' : 'Confirm Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
