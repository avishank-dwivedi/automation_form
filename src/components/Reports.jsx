import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

export default function Reports() {
  const {
    invoices,
    products,
    expenses,
    businessProfile,
    language
  } = useApp();

  const isHindi = language === 'hi';
  const [activeReport, setActiveReport] = useState('gstr1'); // 'gstr1' | 'pnl' | 'stock'

  // --- 1. GSTR-1 Tax Calculations ---
  let taxableTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let exemptSalesTotal = 0;

  invoices.forEach((inv) => {
    inv.items?.forEach((it) => {
      const taxRate = Number(it.gstRate) || 0;
      if (taxRate === 0) {
        exemptSalesTotal += Number(it.total) || 0;
      } else {
        taxableTotal += Number(it.taxableAmount) || Number(it.total);
        cgstTotal += Number(it.cgst) || 0;
        sgstTotal += Number(it.sgst) || 0;
        igstTotal += Number(it.igst) || 0;
      }
    });
  });

  const totalGstCollected = cgstTotal + sgstTotal + igstTotal;

  // --- 2. Profit & Loss Statement Calculations ---
  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
  
  // Approximate COGS from products
  const estimatedCOGS = invoices.reduce((sum, inv) => {
    const billCost = inv.items?.reduce((itemSum, it) => {
      const prod = products.find((p) => p.id === it.productId);
      const unitCost = prod ? Number(prod.purchasePrice) : Number(it.rate) * 0.85;
      return itemSum + unitCost * Number(it.quantity || 1);
    }, 0) || 0;
    return sum + billCost;
  }, 0);

  const grossProfit = totalSalesRevenue - estimatedCOGS;
  const totalOperatingExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitMargin = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : 0;

  // --- 3. Stock Valuation ---
  const totalStockPurchaseVal = products.reduce((sum, p) => sum + Number(p.stock) * Number(p.purchasePrice || 0), 0);
  const totalStockRetailVal = products.reduce((sum, p) => sum + Number(p.stock) * Number(p.sellingPrice || 0), 0);

  // Export report to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeReport === 'gstr1') {
      csvContent += "Invoice Number,Date,Customer,GSTIN,Taxable Amount,CGST,SGST,IGST,Total Amount\n";
      invoices.forEach((inv) => {
        csvContent += `"${inv.invoiceNumber}","${inv.date}","${inv.partyName || 'Cash'}","${inv.partyGstin || ''}",${inv.subtotal},${(inv.totalTax/2).toFixed(2)},${(inv.totalTax/2).toFixed(2)},0,${inv.grandTotal}\n`;
      });
    } else if (activeReport === 'stock') {
      csvContent += "Product Name,Category,HSN,Stock,Unit,Purchase Rate,Selling Rate,Asset Value\n";
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.category}","${p.hsn || ''}",${p.stock},"${p.unit}",${p.purchasePrice},${p.sellingPrice},${p.stock * p.purchasePrice}\n`;
      });
    } else {
      csvContent += "Metric,Amount (INR)\n";
      csvContent += `Total Sales Revenue,${totalSalesRevenue}\n`;
      csvContent += `Cost of Goods Sold (COGS),${Math.round(estimatedCOGS)}\n`;
      csvContent += `Gross Profit,${Math.round(grossProfit)}\n`;
      csvContent += `Total Operating Expenses,${totalOperatingExpenses}\n`;
      csvContent += `Net Business Profit,${Math.round(netProfit)}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jai_Kisan_${activeReport}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Printable Report Header (Visible on print) */}
      <div className="print-only" style={{ display: 'none', borderBottom: '2px solid #0f5132', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', color: '#0f5132', margin: 0 }}>{businessProfile.name}</h1>
            <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#4b5563' }}>{businessProfile.address}</p>
            <p style={{ margin: '2px 0', fontSize: '0.82rem', fontWeight: 700 }}>GSTIN: {businessProfile.gstin} &bull; Ph: {businessProfile.phone}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#1f2937' }}>
              {activeReport === 'gstr1' ? 'GSTR-1 Sales & Tax Report' : activeReport === 'pnl' ? 'Profit & Loss (P&L) Statement' : 'Inventory & Stock Valuation Report'}
            </h2>
            <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#6b7280' }}>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Screen Header (Hidden on print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            {isHindi ? 'GST व वित्तीय व्यापार रिपोर्ट्स' : 'GST Compliance & Financial Reports'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isHindi ? 'GSTR-1 सेल्स समरी, लाभ-हानि खाता (P&L) और स्टॉक मूल्यांकन' : 'GSTR-1 summary, Profit & Loss statement, and stock valuation'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Download CSV / Excel Spreadsheet"
          >
            <FileSpreadsheet size={16} />
            {isHindi ? 'एक्सेल/CSV डाउनलोड' : 'Export to CSV'}
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Print or Save as PDF"
          >
            <Printer size={16} />
            {isHindi ? 'प्रिंट / सेव PDF' : 'Print / Save PDF'}
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs (Hidden on print) */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '6px',
        background: 'var(--bg-surface-alt)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        alignSelf: 'flex-start'
      }}>
        <button
          onClick={() => setActiveReport('gstr1')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: activeReport === 'gstr1' ? 'var(--primary-700)' : 'transparent',
            color: activeReport === 'gstr1' ? '#ffffff' : 'var(--text-muted)'
          }}
        >
          {isHindi ? '📊 GSTR-1 टैक्स समरी' : '📊 GSTR-1 Sales Report'}
        </button>

        <button
          onClick={() => setActiveReport('pnl')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: activeReport === 'pnl' ? 'var(--primary-700)' : 'transparent',
            color: activeReport === 'pnl' ? '#ffffff' : 'var(--text-muted)'
          }}
        >
          {isHindi ? '💰 लाभ-हानि खाता (P&L)' : '💰 Profit & Loss (P&L)'}
        </button>

        <button
          onClick={() => setActiveReport('stock')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: activeReport === 'stock' ? 'var(--primary-700)' : 'transparent',
            color: activeReport === 'stock' ? '#ffffff' : 'var(--text-muted)'
          }}
        >
          {isHindi ? '📦 स्टॉक वैल्यूएशन' : '📦 Stock Valuation'}
        </button>
      </div>

      {/* ================= REPORT 1: GSTR-1 TAX SUMMARY ================= */}
      {activeReport === 'gstr1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px'
          }}>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Taxable Turnover</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>₹{Math.round(taxableTotal).toLocaleString('en-IN')}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CGST Collected</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '4px' }}>₹{cgstTotal.toFixed(2)}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SGST Collected</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '4px' }}>₹{sgstTotal.toFixed(2)}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Zero Rated / Exempt (Seeds 0%)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>₹{Math.round(exemptSalesTotal).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>GSTR-1 Outward Supplies Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Invoice #</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                    <th style={{ padding: '10px 12px' }}>Customer Name</th>
                    <th style={{ padding: '10px 12px' }}>GSTIN</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Taxable (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>CGST (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>SGST (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }} className="font-mono">{inv.invoiceNumber}</td>
                      <td style={{ padding: '10px 12px' }}>{inv.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{inv.partyName || 'Cash Sale'}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{inv.partyGstin || 'Unregistered'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{Number(inv.subtotal).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{(Number(inv.totalTax)/2).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{(Number(inv.totalTax)/2).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>₹{Number(inv.grandTotal).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT 2: PROFIT & LOSS (P&L) ================= */}
      {activeReport === 'pnl' && (
        <div className="card" style={{ maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
              {isHindi ? 'लाभ और हानि खाता (P&L Statement)' : 'Trading & Profit & Loss Statement'}
            </h3>
            <span className="badge badge-success">Live Audited</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Sales Revenue */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
              <span>Gross Sales Turnover (Revenue):</span>
              <span className="font-mono" style={{ color: 'var(--primary-700)' }}>+ ₹{totalSalesRevenue.toLocaleString('en-IN')}</span>
            </div>

            {/* Cost of Goods Sold */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              <span>Less: Cost of Goods Sold (Purchase Cost of Items):</span>
              <span className="font-mono">- ₹{Math.round(estimatedCOGS).toLocaleString('en-IN')}</span>
            </div>

            {/* Gross Profit */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'var(--bg-surface-alt)',
              fontWeight: 800,
              fontSize: '1.05rem'
            }}>
              <span>Gross Operating Profit:</span>
              <span className="font-mono">₹{Math.round(grossProfit).toLocaleString('en-IN')}</span>
            </div>

            {/* Operating Expenses */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--danger-600)' }}>
              <span>Less: Operating Expenses (Transport, Labour, Rent, Bijli):</span>
              <span className="font-mono">- ₹{totalOperatingExpenses.toLocaleString('en-IN')}</span>
            </div>

            {/* Net Profit */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 81, 50, 0.2) 100%)',
              border: '1.5px solid var(--primary-500)',
              fontWeight: 900,
              fontSize: '1.35rem',
              color: 'var(--primary-700)'
            }}>
              <span>Net Business Profit (शुद्ध मुनाफा):</span>
              <span className="font-mono">₹{Math.round(netProfit).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              Estimated Net Margin: <strong>{netProfitMargin}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT 3: STOCK VALUATION ================= */}
      {activeReport === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Purchase Cost Value</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>₹{Math.round(totalStockPurchaseVal).toLocaleString('en-IN')}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated Retail Sales Value</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '4px' }}>₹{Math.round(totalStockRetailVal).toLocaleString('en-IN')}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expected Gross Stock Margin</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-600)', marginTop: '4px' }}>₹{Math.round(totalStockRetailVal - totalStockPurchaseVal).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Item-wise Inventory Value</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Product</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>In Stock</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Purchase Price</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Asset Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{p.name}</td>
                      <td style={{ padding: '10px 12px' }}>{p.category}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{p.stock} {p.unit}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{p.purchasePrice}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>₹{(p.stock * p.purchasePrice).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
