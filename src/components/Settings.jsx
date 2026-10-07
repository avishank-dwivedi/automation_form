import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Building2,
  CreditCard,
  FileCheck,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Camera,
  Database,
  Truck,
  Globe,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Key,
  Lock,
  CheckCircle,
  Server
} from 'lucide-react';

export default function Settings() {
  const {
    businessProfile,
    updateBusinessProfile,
    exportDataToJson,
    importDataFromJson,
    resetToDemoData,
    broadcastState,
    language
  } = useApp();

  const isHindi = language === 'hi';

  const [formData, setFormData] = useState({ ...businessProfile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Backend & MongoDB State
  const [serverHealth, setServerHealth] = useState({
    status: 'checking',
    mongoStatus: 'unknown',
    mongoUri: '',
    ewbMode: 'sandbox',
    nicSessionActive: false
  });
  const [mongoSyncing, setMongoSyncing] = useState(false);
  const [mongoSyncResult, setMongoSyncResult] = useState('');

  // NIC E-Way Bill Portal Config & Session State
  const [nicConfig, setNicConfig] = useState({
    gstin: businessProfile?.gstin || '',
    username: '',
    password: '',
    mode: 'sandbox'
  });
  const [nicSession, setNicSession] = useState({
    active: false,
    isMock: false,
    gstin: null,
    tokenExpiry: null,
    mode: 'sandbox'
  });
  const [nicTesting, setNicTesting] = useState(false);
  const [nicTestResult, setNicTestResult] = useState(null);

  // Load server & NIC session status
  const loadServerStatus = () => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        setServerHealth(data);
        if (data.ewbMode) setNicConfig(prev => ({ ...prev, mode: data.ewbMode }));
      })
      .catch(() => {
        setServerHealth({
          status: 'offline',
          mongoStatus: 'disconnected',
          mongoUri: 'http://localhost:5000 (not running)',
          ewbMode: 'sandbox',
          nicSessionActive: false
        });
      });

    fetch('http://localhost:5000/api/ewb/session-status')
      .then(res => res.json())
      .then(data => setNicSession(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadServerStatus();
  }, []);

  // Test and Authenticate with NIC Portal
  const handleNicAuthTest = async (e) => {
    e?.preventDefault();
    setNicTesting(true);
    setNicTestResult(null);

    try {
      // 1. Save config to server
      await fetch('http://localhost:5000/api/ewb/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstin: nicConfig.gstin || formData.gstin,
          username: nicConfig.username,
          password: nicConfig.password,
          mode: nicConfig.mode
        })
      });

      // 2. Authenticate
      const res = await fetch('http://localhost:5000/api/ewb/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstin: nicConfig.gstin || formData.gstin,
          username: nicConfig.username,
          password: nicConfig.password
        })
      });

      const data = await res.json();
      setNicTestResult(data);
      if (data.success) {
        setNicSession({
          active: true,
          isMock: data.isMock || false,
          gstin: data.gstin,
          tokenExpiry: data.tokenExpiry,
          mode: nicConfig.mode
        });
      }
    } catch (err) {
      setNicTestResult({
        success: false,
        error: 'Backend server not responding. Please run "npm run server" in the terminal.'
      });
    }
    setNicTesting(false);
  };

  // Sync Data to MongoDB
  const handleMongoSync = async () => {
    setMongoSyncing(true);
    setMongoSyncResult('');
    try {
      await broadcastState();
      setMongoSyncResult('success');
      loadServerStatus();
    } catch (err) {
      setMongoSyncResult('error');
    }
    setMongoSyncing(false);
    setTimeout(() => setMongoSyncResult(''), 4000);
  };

  // Handle custom logo image upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, logoUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Industry Preset Profiles
  const applyIndustryProfile = (type) => {
    if (type === 'distributor') {
      setFormData(prev => ({
        ...prev,
        name: 'Jai Kisan Agro Distributors & Wholesalers',
        tagline: 'Authorized C&F Rake Agent & Bulk Distributor: Seeds & Fertilizers',
        termsAndConditions: '1. Wholesale bulk supplies subject to factory dispatch norms.\n2. 50% advance with booking, balance within 15 days.\n3. Interest @ 18% p.a. charged on overdue balance.'
      }));
    } else if (type === 'retail') {
      setFormData(prev => ({
        ...prev,
        name: 'Shree Shyam Kirana & General Store',
        tagline: 'Daily Essentials, Grocery, FMCG & Household Goods',
        termsAndConditions: '1. Goods sold against cash or instant UPI.\n2. Check goods and count at the counter.\n3. Thank you for your visit!'
      }));
    } else if (type === 'hardware') {
      setFormData(prev => ({
        ...prev,
        name: 'Apex Electricals & Hardware Supplies',
        tagline: 'Pumps, Cables, Motors, PVC Pipes & Industrial Tools',
        termsAndConditions: '1. Electrical equipment covered by manufacturer warranty only.\n2. Original invoice required for replacement or claims.\n3. Goods returnable within 3 days if unused.'
      }));
    } else if (type === 'creators') {
      setFormData(prev => ({
        ...prev,
        name: 'Studio Pixel Creatives & Digital Media',
        tagline: 'Creative Design, Video Production, Brand Marketing & Retainers',
        termsAndConditions: '1. Invoices payable within 7 days of delivery.\n2. Intellectual property transfers upon 100% payment receipt.\n3. Bank / UPI settlement preferred.'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        name: 'Jai Kisan Krishi Kendra & Traders',
        tagline: 'Authorized Distributor: Seeds, Fertilizers, Pesticides & Farm Equipment',
        termsAndConditions: '1. Goods once sold will not be taken back without original bill.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond 15 days.\n3. All disputes subject to Karnal Jurisdiction only.'
      }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateBusinessProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importDataFromJson(event.target.result);
      if (res.success) {
        alert('Data successfully restored!');
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
          {isHindi ? 'व्यापार सेटिंग्स व प्रोफाइल' : 'Business Settings & Profile'}
        </h2>
        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isHindi ? 'कंपनी नाम, GSTIN, बैंक खाता, UPI ID व बैकअप सेटिंग्स' : 'Configure your store name, GSTIN, bank details, and data backup'}
        </p>
      </div>

      {saveSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--primary-100)',
          color: 'var(--primary-700)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          {isHindi ? 'व्यापार प्रोफाइल सफलतापूर्वक सुरक्षित हो गया!' : 'Business profile updated and synced successfully!'}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Business Identity */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Building2 size={18} style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              {isHindi ? 'दुकान / फर्म विवरण' : 'Store & Company Identity'}
            </h3>
          </div>

          {/* Quick Industry Profile Switcher */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              {isHindi ? '⚡ उद्योग / व्यापार प्रोफ़ाइल चुनें (Quick Industry Preset):' : '⚡ Switch Business Profile Preset:'}
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => applyIndustryProfile('agro')}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                🌾 Seeds & Fertilizers (कृषि केंद्र)
              </button>
              <button
                type="button"
                onClick={() => applyIndustryProfile('distributor')}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                🌟 Distributors & Wholesalers
              </button>
              <button
                type="button"
                onClick={() => applyIndustryProfile('retail')}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                🏪 Retail Shop / Kirana
              </button>
              <button
                type="button"
                onClick={() => applyIndustryProfile('hardware')}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                ⚡ Electronic / Hardware
              </button>
              <button
                type="button"
                onClick={() => applyIndustryProfile('creators')}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                🎨 Creators & Agency
              </button>
            </div>
          </div>

          {/* Company Logo Upload & Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--bg-surface-alt)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={formData.logoUrl || '/logo.jpg'}
                alt="Company Logo"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '2px solid var(--primary-500)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>
                {isHindi ? 'कंपनी / फर्म का लोगो' : 'Company / Store Logo'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {isHindi ? 'यह लोगो सभी GST बिलों, ई-वे बिलों व कोटेशन पर मुद्रित होगा।' : 'This logo will be displayed on all printed GST invoices, E-way bills, and quotations.'}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Camera size={13} />
                  <span>{isHindi ? 'नया लोगो अपलोड करें' : 'Upload Custom Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                </label>
                {formData.logoUrl !== '/logo.jpg' && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoUrl: '/logo.jpg' }))}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    Reset Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'व्यापार / दुकान का नाम *' : 'Business / Store Name *'}
            </label>
            <input
              type="text"
              required
              style={{ width: '100%', fontWeight: 700 }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'टैगलाइन / उप-शीर्षक' : 'Tagline / Dealership info'}
            </label>
            <input
              type="text"
              style={{ width: '100%' }}
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                GSTIN
              </label>
              <input
                type="text"
                className="font-mono"
                style={{ width: '100%', fontWeight: 600 }}
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {isHindi ? 'राज्य व कोड' : 'State & State Code'}
              </label>
              <input
                type="text"
                style={{ width: '100%' }}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'दुकान का पूरा पता *' : 'Complete Store Address *'}
            </label>
            <textarea
              rows={2}
              required
              style={{ width: '100%' }}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {isHindi ? 'मोबाइल नंबर (बिल पर छपेगा)' : 'Official Phone Number'}
              </label>
              <input
                type="text"
                style={{ width: '100%' }}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                style={{ width: '100%' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank & UPI Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <CreditCard size={18} style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              {isHindi ? 'बैंक व UPI भुगतान खाता (बिल व QR कोड हेतु)' : 'Bank & UPI Details (For Bills & QR)'}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Bank Name
              </label>
              <input
                type="text"
                style={{ width: '100%' }}
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Account Number
              </label>
              <input
                type="text"
                className="font-mono"
                style={{ width: '100%' }}
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                IFSC Code
              </label>
              <input
                type="text"
                className="font-mono"
                style={{ width: '100%' }}
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                UPI ID (PhonePe, GPay, Paytm)
              </label>
              <input
                type="text"
                style={{ width: '100%', fontWeight: 700, color: 'var(--primary-700)' }}
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'बिल पर नियम व शर्तें (Terms & Conditions)' : 'Invoice Terms & Conditions'}
            </label>
            <textarea
              rows={3}
              style={{ width: '100%', fontSize: '0.85rem' }}
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
            <Save size={18} />
            {isHindi ? 'सेटिंग्स सुरक्षित करें' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Section 3: Government NIC E-Way Bill Portal (ewaybillgst.gov.in) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1.5px solid #10b981', background: 'linear-gradient(180deg, rgba(16,185,129,0.03) 0%, rgba(255,255,255,0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0f5132', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isHindi ? 'भारत सरकार ई-वे बिल पोर्टल (ewaybillgst.gov.in)' : 'Govt of India E-Way Bill Portal (NIC API)'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isHindi ? 'NIC पोर्टल से सीधे 12-अंकों का आधिकारिक ई-वे बिल नंबर प्राप्त करें' : 'Generate official Form GST EWB-01 directly with live NIC servers'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: nicSession.active ? (nicSession.isMock ? '#fef3c7' : '#d1fae5') : '#f3f4f6',
              color: nicSession.active ? (nicSession.isMock ? '#b45309' : '#065f46') : '#6b7280',
              border: `1px solid ${nicSession.active ? (nicSession.isMock ? '#f59e0b' : '#10b981') : '#d1d5db'}`
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: nicSession.active ? (nicSession.isMock ? '#f59e0b' : '#10b981') : '#9ca3af'
              }}></span>
              {nicSession.active ? (nicSession.isMock ? 'Mock Dev Session' : 'Live NIC Session') : (isHindi ? 'पोर्टल डिस्कनेक्टेड' : 'NIC Disconnected')}
            </span>

            <button
              type="button"
              onClick={loadServerStatus}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              title="Refresh status"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Status / Alert Banner */}
        {nicTestResult && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            background: nicTestResult.success ? (nicTestResult.isMock ? '#fffbeb' : '#f0fdf4') : '#fef2f2',
            color: nicTestResult.success ? (nicTestResult.isMock ? '#92400e' : '#166534') : '#991b1b',
            border: `1px solid ${nicTestResult.success ? (nicTestResult.isMock ? '#fde68a' : '#bbf7d0') : '#fecaca'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              {nicTestResult.success ? <CheckCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />}
              <div>
                <strong>{nicTestResult.success ? (nicTestResult.isMock ? '⚠️ Mock Session Active' : '✅ NIC Portal Connected') : '❌ Connection Failed'}</strong>
                <div style={{ marginTop: '3px' }}>
                  {nicTestResult.message || nicTestResult.error || (nicTestResult.success ? 'Ready to generate live Government E-Way Bills.' : 'Please verify GSTIN and portal credentials.')}
                </div>
                {nicTestResult.tokenExpiry && (
                  <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.85 }}>
                    Session expires at: {new Date(nicTestResult.tokenExpiry).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'पोर्टल एनवायरनमेंट (Environment)' : 'Portal Mode'}
            </label>
            <select
              value={nicConfig.mode}
              onChange={(e) => setNicConfig({ ...nicConfig, mode: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            >
              <option value="sandbox">Sandbox / Staging (Testing - ewaybill1.nic.in)</option>
              <option value="production">Production (Official Live - ewaybillgst.gov.in)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'पंजीकृत GSTIN' : 'Registered GSTIN'}
            </label>
            <input
              type="text"
              className="font-mono"
              placeholder="e.g. 06AAACJ1234K1Z5"
              value={nicConfig.gstin}
              onChange={(e) => setNicConfig({ ...nicConfig, gstin: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'NIC API यूजरनेम' : 'NIC API Username'}
            </label>
            <input
              type="text"
              placeholder="Username from ewaybill portal"
              value={nicConfig.username}
              onChange={(e) => setNicConfig({ ...nicConfig, username: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              {isHindi ? 'NIC API पासवर्ड' : 'NIC API Password'}
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={nicConfig.password}
              onChange={(e) => setNicConfig({ ...nicConfig, password: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '6px' }}>
          <button
            type="button"
            disabled={nicTesting}
            onClick={handleNicAuthTest}
            className="btn-primary"
            style={{
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #0f5132, #15803d)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {nicTesting ? <RefreshCw size={15} className="spin" /> : <ShieldCheck size={16} />}
            <span>{nicTesting ? (isHindi ? 'जांच जारी...' : 'Authenticating...') : (isHindi ? 'NIC कनेक्शन टेस्ट व लॉगिन करें' : 'Test & Authenticate NIC')}</span>
          </button>

          <a
            href="https://ewaybillgst.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Globe size={14} />
            <span>NIC Official Portal</span>
            <ExternalLink size={12} />
          </a>

          <a
            href="https://ewaybill1.nic.in/BillGeneration/BillUnderSandbox/EwbUserRegistration.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>Sandbox Register</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Quick Instructions Guide */}
        <div style={{
          background: 'var(--bg-surface-alt)',
          padding: '12px 14px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          border: '1px solid var(--border-color)'
        }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
            ℹ️ {isHindi ? 'सरकारी पोर्टल से API क्रेडेंशियल्स कैसे प्राप्त करें:' : 'How to get official Government API credentials:'}
          </strong>
          <ol style={{ margin: '0', paddingLeft: '18px' }}>
            <li>{isHindi ? 'ewaybillgst.gov.in पर अपने GST खाते से लॉगिन करें।' : 'Log in to ewaybillgst.gov.in using your GST account.'}</li>
            <li>{isHindi ? 'बाएं मेनू में "Registration" > "For GSP" पर क्लिक करें।' : 'Click on "Registration" > "For GSP" in the left navigation.'}</li>
            <li>{isHindi ? 'API यूजर आईडी और पासवर्ड बनाएं और उसे ऊपर दर्ज करें।' : 'Register an API User and Password, then enter those credentials above.'}</li>
            <li>{isHindi ? 'टेस्टिंग के लिए आप सीधे Sandbox मोड का उपयोग कर सकते हैं जिसमें ऑटो-मॉक उपलब्ध है।' : 'For testing, Sandbox mode includes full offline mock fallbacks for immediate testing.'}</li>
          </ol>
        </div>
      </div>

      {/* Section 4: MongoDB Enterprise Database & Backend Server */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: '#00684a' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
                {isHindi ? 'MongoDB डेटाबेस व बैकएंड सर्वर' : 'MongoDB Database & Server'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isHindi ? 'स्थानीय या क्लाउड MongoDB से सुरक्षित डेटा सिंक' : 'Persistent database storage across devices and browsers'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: serverHealth.mongoStatus === 'connected' ? '#d1fae5' : '#fee2e2',
              color: serverHealth.mongoStatus === 'connected' ? '#065f46' : '#991b1b',
              border: `1px solid ${serverHealth.mongoStatus === 'connected' ? '#10b981' : '#f87171'}`
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: serverHealth.mongoStatus === 'connected' ? '#10b981' : '#ef4444'
              }}></span>
              {serverHealth.mongoStatus === 'connected' ? 'MongoDB Connected' : (serverHealth.status === 'offline' ? 'Server Offline' : 'MongoDB Offline (Local Active)')}
            </span>

            <button
              type="button"
              onClick={loadServerStatus}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              title="Refresh MongoDB status"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Server & Mongo Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: 'var(--bg-surface-alt)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '0.8rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>API SERVER</div>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>
              {serverHealth.status === 'ok' ? '🟢 Running on http://localhost:5000' : '🔴 Server Offline'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>MONGODB URI</div>
            <div className="font-mono" style={{ fontWeight: 600, marginTop: '2px', wordBreak: 'break-all' }}>
              {serverHealth.mongoUri || 'mongodb://127.0.0.1:27017/jai_kisan_agro'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>STORAGE ENGINE</div>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>
              {serverHealth.mongoStatus === 'connected' ? 'MongoDB + Browser LocalStorage' : 'Browser LocalStorage (Offline Resilient)'}
            </div>
          </div>
        </div>

        {/* Sync Action */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={mongoSyncing}
            onClick={handleMongoSync}
            className="btn-outline-primary"
            style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {mongoSyncing ? <RefreshCw size={15} className="spin" /> : <Server size={15} />}
            <span>{mongoSyncing ? (isHindi ? 'सिंक हो रहा है...' : 'Syncing...') : (isHindi ? 'अभी MongoDB में सिंक करें' : 'Sync All Data to MongoDB Now')}</span>
          </button>

          {mongoSyncResult === 'success' && (
            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={15} /> {isHindi ? 'सफलतापूर्वक सिंक हो गया!' : 'All records synced to MongoDB!'}
            </span>
          )}

          {mongoSyncResult === 'error' && (
            <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={15} /> {isHindi ? 'सिंक विफल (सर्वर चालू करें)' : 'Sync failed (Check server)'}
            </span>
          )}
        </div>

        {serverHealth.mongoStatus !== 'connected' && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#fffbeb', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
            💡 <strong>Tip to start MongoDB:</strong> Run <code style={{ background: '#f3f4f6', padding: '2px 5px', borderRadius: '4px' }}>npm run server</code> in terminal. To connect to Cloud MongoDB Atlas, set your <code style={{ background: '#f3f4f6', padding: '2px 5px', borderRadius: '4px' }}>MONGO_URI</code> in <code style={{ background: '#f3f4f6', padding: '2px 5px', borderRadius: '4px' }}>server/.env</code>.
          </div>
        )}
      </div>

      {/* Section 5: Data Backup, Restore & Reset */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
        <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
          {isHindi ? 'डेटा बैकअप, रिस्टोर व रीसेट' : 'Data Backup, Restore & Reset'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          {isHindi ? 'अपना पूरा व्यापार डेटा सुरक्षित रखें ताकि मोबाइल या नए कंप्यूटर में कभी भी लोड किया जा सके।' : 'Safely export your business data to take offline or migrate across PC and mobile.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={exportDataToJson}
            className="btn-outline-primary"
            style={{ padding: '9px 16px' }}
          >
            <Download size={16} />
            {isHindi ? 'पूरा डेटा बैकअप डाउनलोड करें (JSON)' : 'Download Full Backup (JSON)'}
          </button>

          <label className="btn-secondary" style={{ padding: '9px 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} />
            <span>{isHindi ? 'बैकअप फाइल अपलोड करें' : 'Restore from Backup'}</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset to initial demo data? All test records will be restored to defaults.')) {
                resetToDemoData();
              }
            }}
            className="btn-secondary"
            style={{ color: 'var(--danger-600)', padding: '9px 16px', marginLeft: 'auto' }}
          >
            <RotateCcw size={16} />
            {isHindi ? 'डेमो डेटा रीसेट करें' : 'Reset to Demo Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
