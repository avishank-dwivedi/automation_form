require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// =============================================
// MongoDB Connection
// =============================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jai_kisan_agro';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000
})
  .then(() => console.log('✅ Connected to MongoDB:', MONGO_URI))
  .catch(err => {
    console.warn('⚠️  MongoDB connection note:', err.message);
    console.log('ℹ️  Server running in resilient mode. If MongoDB is offline, local cache is preserved.');
  });

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));

// =============================================
// Schemas (flexible, strict: false)
// =============================================
const opts = { strict: false, timestamps: true };
const BusinessProfile = mongoose.model('BusinessProfile', new mongoose.Schema({}, opts));
const Product         = mongoose.model('Product',         new mongoose.Schema({}, opts));
const Party           = mongoose.model('Party',           new mongoose.Schema({}, opts));
const Invoice         = mongoose.model('Invoice',         new mongoose.Schema({}, opts));
const Expense         = mongoose.model('Expense',         new mongoose.Schema({}, opts));
const EWayBill        = mongoose.model('EWayBill',        new mongoose.Schema({}, opts));
const Quotation       = mongoose.model('Quotation',       new mongoose.Schema({}, opts));
const Scratchpad      = mongoose.model('Scratchpad',      new mongoose.Schema({}, opts));

// NIC E-Way Bill Portal session token store (in-memory for this session)
let nicSession = {
  authToken: null,
  tokenExpiry: null,
  gstin: null
};

// =============================================
// Helper: find by app-id or MongoDB _id
// =============================================
const findFilter = (id) =>
  mongoose.isValidObjectId(id) ? { _id: id } : { id };

// =============================================
// HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    app: 'Jai Kisan Vyapar API Server',
    mongoStatus: isMongoConnected ? 'connected' : 'disconnected',
    mongoUri: MONGO_URI,
    ewbMode: process.env.EWB_MODE || 'sandbox',
    nicSessionActive: !!nicSession.authToken && nicSession.tokenExpiry > Date.now(),
    isMockSession: !!nicSession.authToken && nicSession.authToken.startsWith('MOCK_'),
    gstin: nicSession.gstin || process.env.EWB_GSTIN || 'Not Configured',
    timestamp: new Date().toISOString()
  });
});

// Update NIC Configuration dynamically from Settings UI
app.post('/api/ewb/config', (req, res) => {
  const { gstin, username, password, mode } = req.body;
  if (gstin) process.env.EWB_GSTIN = gstin;
  if (username) process.env.EWB_USERNAME = username;
  if (password) process.env.EWB_PASSWORD = password;
  if (mode) process.env.EWB_MODE = mode;
  res.json({
    success: true,
    message: 'E-Way Bill NIC configuration updated',
    config: {
      gstin: process.env.EWB_GSTIN,
      username: process.env.EWB_USERNAME,
      mode: process.env.EWB_MODE
    }
  });
});

// =============================================
// GET ALL DATA (startup load)
// =============================================
app.get('/api/data', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({
      connected: false,
      message: 'MongoDB is offline. Local browser state is active.',
      businessProfile: {},
      products: [],
      parties: [],
      invoices: [],
      expenses: [],
      eWayBills: [],
      quotations: [],
      scratchpads: []
    });
  }

  try {
    const [businessProfile, products, parties, invoices, expenses, eWayBills, quotations, scratchpads] =
      await Promise.all([
        BusinessProfile.findOne().lean(),
        Product.find().lean(),
        Party.find().lean(),
        Invoice.find().sort({ createdAt: -1 }).lean(),
        Expense.find().sort({ date: -1 }).lean(),
        EWayBill.find().sort({ createdAt: -1 }).lean(),
        Quotation.find().sort({ createdAt: -1 }).lean(),
        Scratchpad.find().sort({ updatedAt: -1 }).lean(),
      ]);
    res.json({
      connected: true,
      businessProfile: businessProfile || {},
      products:   products   || [],
      parties:    parties    || [],
      invoices:   invoices   || [],
      expenses:   expenses   || [],
      eWayBills:  eWayBills  || [],
      quotations: quotations || [],
      scratchpads: scratchpads || [],
    });
  } catch (e) {
    console.error('Error fetching full data:', e);
    res.status(500).json({ error: e.message });
  }
});

// =============================================
// POST SYNC (full replace)
// =============================================
app.post('/api/sync', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({
      success: false,
      connected: false,
      message: 'MongoDB is offline. Changes saved in browser localStorage.'
    });
  }

  const { businessProfile, products, parties, invoices, expenses, eWayBills, quotations, scratchpads } = req.body;
  try {
    if (businessProfile && Object.keys(businessProfile).length) {
      await BusinessProfile.findOneAndUpdate({}, businessProfile, { upsert: true, new: true });
    }

    const replace = async (Model, arr) => {
      await Model.deleteMany({});
      if (Array.isArray(arr) && arr.length) {
        await Model.insertMany(arr.map(d => ({ ...d, _id: undefined })));
      }
    };

    await replace(Product,    products);
    await replace(Party,      parties);
    await replace(Invoice,    invoices);
    await replace(Expense,    expenses);
    await replace(EWayBill,   eWayBills);
    await replace(Quotation,  quotations);
    await replace(Scratchpad, scratchpads);

    res.json({ success: true, connected: true, message: 'All data synchronized to MongoDB successfully' });
  } catch (e) {
    console.error('Sync error:', e);
    res.status(500).json({ error: e.message });
  }
});

// =============================================
// PRODUCTS CRUD
// =============================================
app.get('/api/products', async (req, res) => {
  try { res.json(await Product.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/products', async (req, res) => {
  try { res.status(201).json(await Product.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/products/:id', async (req, res) => {
  try { res.json(await Product.findOneAndUpdate(findFilter(req.params.id), req.body, { new: true })); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findOneAndDelete(findFilter(req.params.id)); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// =============================================
// PARTIES CRUD + PAYMENT
// =============================================
app.get('/api/parties', async (req, res) => {
  try { res.json(await Party.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/parties', async (req, res) => {
  try { res.status(201).json(await Party.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/parties/:id', async (req, res) => {
  try { res.json(await Party.findOneAndUpdate(findFilter(req.params.id), req.body, { new: true })); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/parties/:id', async (req, res) => {
  try { await Party.findOneAndDelete(findFilter(req.params.id)); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.post('/api/parties/:id/payment', async (req, res) => {
  try {
    const { amount, type } = req.body;
    const party = await Party.findOne(findFilter(req.params.id));
    if (!party) return res.status(404).json({ error: 'Party not found' });
    const change = type === 'receive' ? -Number(amount) : Number(amount);
    party.balance = Number(party.balance || 0) + change;
    await party.save();
    res.json({ success: true, party });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// =============================================
// INVOICES CRUD
// =============================================
app.get('/api/invoices', async (req, res) => {
  try { res.json(await Invoice.find().sort({ createdAt: -1 }).lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/invoices', async (req, res) => {
  try { res.status(201).json(await Invoice.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const item = await Invoice.findOne(findFilter(req.params.id)).lean();
    if (!item) return res.status(404).json({ error: 'Invoice not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/invoices/:id', async (req, res) => {
  try { await Invoice.findOneAndDelete(findFilter(req.params.id)); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// =============================================
// EXPENSES CRUD
// =============================================
app.get('/api/expenses', async (req, res) => {
  try { res.json(await Expense.find().sort({ date: -1 }).lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/expenses', async (req, res) => {
  try { res.status(201).json(await Expense.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/expenses/:id', async (req, res) => {
  try { await Expense.findOneAndDelete(findFilter(req.params.id)); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// =============================================
// BUSINESS PROFILE
// =============================================
app.get('/api/business-profile', async (req, res) => {
  try { res.json(await BusinessProfile.findOne().lean() || {}); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/business-profile', async (req, res) => {
  try { res.json(await BusinessProfile.findOneAndUpdate({}, req.body, { upsert: true, new: true })); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// =============================================
// E-WAY BILLS CRUD
// =============================================
app.get('/api/ewaybills', async (req, res) => {
  try { res.json(await EWayBill.find().sort({ createdAt: -1 }).lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/ewaybills', async (req, res) => {
  try { res.status(201).json(await EWayBill.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/ewaybills/:id', async (req, res) => {
  try {
    const item = await EWayBill.findOne(findFilter(req.params.id)).lean();
    if (!item) return res.status(404).json({ error: 'EWB not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/ewaybills/:id', async (req, res) => {
  try { await EWayBill.findOneAndDelete(findFilter(req.params.id)); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// =============================================
// QUOTATIONS CRUD
// =============================================
app.get('/api/quotations', async (req, res) => {
  try { res.json(await Quotation.find().sort({ createdAt: -1 }).lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/quotations', async (req, res) => {
  try { res.status(201).json(await Quotation.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/quotations/:id', async (req, res) => {
  try { await Quotation.findOneAndDelete(findFilter(req.params.id)); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// =============================================
// SCRATCHPADS CRUD
// =============================================
app.get('/api/scratchpads', async (req, res) => {
  try { res.json(await Scratchpad.find().sort({ updatedAt: -1 }).lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/scratchpads', async (req, res) => {
  try { res.status(201).json(await Scratchpad.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/scratchpads/:id', async (req, res) => {
  try { res.json(await Scratchpad.findOneAndUpdate(findFilter(req.params.id), { ...req.body, updatedAt: new Date() }, { new: true, upsert: true })); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/scratchpads/:id', async (req, res) => {
  try { await Scratchpad.findOneAndDelete(findFilter(req.params.id)); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});


// =============================================
// NIC E-WAY BILL PORTAL INTEGRATION
// =============================================
// The NIC (National Informatics Centre) runs the govt e-way bill portal.
// Official API Docs: https://ewaybillgst.gov.in/apidocs/
// Sandbox:    https://ewaybill1.nic.in/
// Production: https://ewaybillgst.gov.in/
//
// IMPORTANT: The real NIC API requires:
//   1. Registered e-Way Bill GSP (GST Suvidha Provider) subscription OR
//   2. Direct API access via GSTIN registered with NIC Portal
//
// This server acts as a SECURE PROXY so your NIC credentials are
// never exposed to the browser/frontend.
// =============================================

// Utility: Build NIC API Base URL
const getNicBaseUrl = () => {
  const mode = process.env.EWB_MODE || 'sandbox';
  if (mode === 'production') {
    return 'https://ewaybillgst.gov.in/BillGeneration';
  }
  // NIC Sandbox (test environment)
  return 'https://ewaybillgst.gov.in/BillGeneration';
};

// Utility: Encrypt password using AES-128-ECB (NIC API requirement)
const encryptPassword = (password, sek) => {
  try {
    const key = Buffer.from(sek, 'base64').slice(0, 16);
    const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
    return encrypted.toString('base64');
  } catch (err) {
    console.error('Encryption error:', err.message);
    return null;
  }
};

// ─── Route 1: Authenticate with NIC portal & get token ───
// POST /api/ewb/authenticate
// Body: { gstin, username, password, otp? }
app.post('/api/ewb/authenticate', async (req, res) => {
  const gstin    = req.body.gstin    || process.env.EWB_GSTIN;
  const username = req.body.username || process.env.EWB_USERNAME;
  const password = req.body.password || process.env.EWB_PASSWORD;
  const appKey   = req.body.appKey   || crypto.randomBytes(16).toString('base64');

  if (!gstin || !username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing credentials. Provide gstin, username, and password.'
    });
  }

  try {
    const baseUrl = getNicBaseUrl();
    const authPayload = {
      action: 'ACCESSTOKEN',
      username,
      password,
      appkey: appKey,
      gstin
    };

    const response = await axios.post(
      `${baseUrl}/api/authenticate`,
      authPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'gstin': gstin
        },
        timeout: 15000
      }
    );

    const data = response.data;

    if (data.status_cd === '1' && data.data) {
      // Decrypt SEK using appKey to get session encryption key
      const nicData = data.data;
      nicSession = {
        authToken: nicData.authtoken,
        sek: nicData.sek,
        appKey,
        tokenExpiry: Date.now() + (6 * 60 * 60 * 1000), // 6 hours
        gstin
      };

      return res.json({
        success: true,
        message: 'Authenticated with NIC e-Way Bill Portal successfully',
        gstin,
        tokenExpiry: new Date(nicSession.tokenExpiry).toISOString()
      });
    } else {
      return res.status(401).json({
        success: false,
        error: data.message || data.status_desc || 'Authentication failed',
        nicResponse: data
      });
    }
  } catch (err) {
    console.error('NIC Auth error:', err.message);

    // If NIC API is unreachable (sandbox down / network issue), return mock response for dev
    if (process.env.EWB_MODE !== 'production') {
      const mockToken = 'MOCK_' + crypto.randomBytes(12).toString('hex').toUpperCase();
      nicSession = {
        authToken: mockToken,
        sek: crypto.randomBytes(16).toString('base64'),
        appKey,
        tokenExpiry: Date.now() + (6 * 60 * 60 * 1000),
        gstin
      };
      return res.json({
        success: true,
        isMock: true,
        message: '⚠️ NIC portal unreachable — using MOCK session for development. Real EWB numbers will NOT be generated.',
        gstin,
        tokenExpiry: new Date(nicSession.tokenExpiry).toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Could not connect to NIC portal: ' + err.message
    });
  }
});

// ─── Route 2: Generate E-Way Bill on NIC Portal ───
// POST /api/ewb/generate
app.post('/api/ewb/generate', async (req, res) => {
  if (!nicSession.authToken || nicSession.tokenExpiry < Date.now()) {
    return res.status(401).json({
      success: false,
      error: 'NIC session expired or not authenticated. Please authenticate first via /api/ewb/authenticate'
    });
  }

  const billData = req.body;

  // Build NIC EWB-01 JSON payload
  const nicPayload = {
    supplyType:      billData.supplyType      || 'O',
    subSupplyType:   billData.subSupplyType   || '1',
    docType:         billData.docType         || 'INV',
    docNo:           billData.invoiceRef      || billData.docNo,
    docDate:         billData.date            ? billData.date.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB').replace(/\//g, '/'),
    fromGstin:       billData.sellerGSTIN     || nicSession.gstin,
    fromTrdName:     billData.sellerName      || '',
    fromAddr1:       billData.sellerAddress   || '',
    fromAddr2:       billData.sellerAddress2  || '',
    fromPlace:       billData.fromPlace       || 'Karnal',
    fromPincode:     billData.fromPincode     || 132001,
    fromStateCode:   billData.fromStateCode   || 6,
    toGstin:         billData.buyerGSTIN      || 'URP',
    toTrdName:       billData.buyerName       || '',
    toAddr1:         billData.buyerAddress    || '',
    toAddr2:         billData.buyerAddress2   || '',
    toPlace:         billData.toPlace         || billData.buyerAddress || '',
    toPincode:       billData.toPincode       || 132001,
    toStateCode:     billData.toStateCode     || 6,
    totalValue:      billData.totalTaxable    || 0,
    cgstValue:       (billData.totalTax || 0) / 2,
    sgstValue:       (billData.totalTax || 0) / 2,
    igstValue:       billData.igstValue       || 0,
    cessValue:       billData.cessValue       || 0,
    totInvValue:     billData.totalValue      || 0,
    transMode:       billData.transMode       || '1',
    transDistance:   billData.distance        || '0',
    transporterName: billData.transporterName || '',
    transporterId:   billData.transporterId   || '',
    transDocNo:      billData.transDocNo      || '',
    transDocDate:    billData.transDocDate    || '',
    vehicleNo:       billData.vehicleNumber   || '',
    vehicleType:     billData.vehicleType     || 'R',
    itemList: (billData.items || []).map(it => ({
      productName:   it.name            || '',
      productDesc:   it.name            || '',
      hsnCode:       Number(it.hsn)     || 3105,
      quantity:      it.quantity        || 1,
      qtyUnit:       it.unit            || 'BAG',
      cgstRate:      (it.gstRate || 0) / 2,
      sgstRate:      (it.gstRate || 0) / 2,
      igstRate:      0,
      cessRate:      0,
      taxableAmount: it.taxableAmount   || 0
    }))
  };

  // If this is a mock session, return a simulated response
  if (nicSession.authToken && nicSession.authToken.startsWith('MOCK_')) {
    const mockEwbNo = '24' + Math.floor(10000000000 + Math.random() * 90000000000);
    const mockValidTill = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return res.json({
      success: true,
      isMock: true,
      message: '⚠️ MOCK EWB generated (NIC portal not connected). For real EWBs, configure your NIC credentials in Settings.',
      ewayBillNo: mockEwbNo,
      validUpto: mockValidTill.toISOString().split('T')[0],
      ewbStatus: 'ACTIVE',
      nicPayload
    });
  }

  try {
    const baseUrl = getNicBaseUrl();
    const response = await axios.post(
      `${baseUrl}/api/ewayapi`,
      { action: 'GENEWAYBILL', ...nicPayload },
      {
        headers: {
          'Content-Type':  'application/json',
          'gstin':         nicSession.gstin,
          'authtoken':     nicSession.authToken,
          'user_name':     process.env.EWB_USERNAME
        },
        timeout: 15000
      }
    );

    const data = response.data;

    if (data.status_cd === '1' && data.data) {
      const ewbData = data.data;
      return res.json({
        success: true,
        ewayBillNo:  ewbData.ewayBillNo,
        ewbDt:       ewbData.ewbDt,
        validUpto:   ewbData.validUpto,
        ewbStatus:   ewbData.status,
        alert:       ewbData.alert || null,
        nicPayload
      });
    } else {
      return res.status(400).json({
        success: false,
        error:       data.message || data.status_desc || 'EWB generation failed',
        errorCodes:  data.status_cd,
        nicResponse: data
      });
    }
  } catch (err) {
    console.error('NIC EWB Generation error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate EWB on NIC portal: ' + err.message
    });
  }
});

// ─── Route 3: Get EWB details from NIC ───
// GET /api/ewb/details/:ewbNo
app.get('/api/ewb/details/:ewbNo', async (req, res) => {
  if (!nicSession.authToken || nicSession.tokenExpiry < Date.now()) {
    return res.status(401).json({ success: false, error: 'NIC session expired. Please re-authenticate.' });
  }

  if (nicSession.authToken.startsWith('MOCK_')) {
    return res.json({
      success: true,
      isMock: true,
      ewayBillNo: req.params.ewbNo,
      status: 'ACTIVE',
      message: 'Mock EWB details (NIC portal not connected)'
    });
  }

  try {
    const baseUrl = getNicBaseUrl();
    const response = await axios.get(
      `${baseUrl}/api/ewayapi?action=GETEWBPRDTLS&ewbNo=${req.params.ewbNo}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'gstin':        nicSession.gstin,
          'authtoken':    nicSession.authToken,
          'user_name':    process.env.EWB_USERNAME
        },
        timeout: 10000
      }
    );

    const data = response.data;
    if (data.status_cd === '1') {
      res.json({ success: true, ...data.data });
    } else {
      res.status(400).json({ success: false, error: data.message || 'Could not fetch EWB details', nicResponse: data });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Route 4: Cancel EWB on NIC ───
// POST /api/ewb/cancel
// Body: { ewbNo, cancelRsnCode, cancelRmrk }
app.post('/api/ewb/cancel', async (req, res) => {
  if (!nicSession.authToken || nicSession.tokenExpiry < Date.now()) {
    return res.status(401).json({ success: false, error: 'NIC session expired. Please re-authenticate.' });
  }

  if (nicSession.authToken.startsWith('MOCK_')) {
    return res.json({
      success: true,
      isMock: true,
      message: 'Mock EWB cancelled (NIC portal not connected)',
      cancelDate: new Date().toISOString()
    });
  }

  try {
    const baseUrl = getNicBaseUrl();
    const response = await axios.post(
      `${baseUrl}/api/ewayapi`,
      {
        action:          'CANCELEWB',
        ewbNo:           req.body.ewbNo,
        cancelRsnCode:   req.body.cancelRsnCode || 4,
        cancelRmrk:      req.body.cancelRmrk   || 'Cancelled via Jai Kisan Vyapar'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'gstin':        nicSession.gstin,
          'authtoken':    nicSession.authToken,
          'user_name':    process.env.EWB_USERNAME
        },
        timeout: 10000
      }
    );

    const data = response.data;
    if (data.status_cd === '1') {
      res.json({ success: true, cancelDate: data.data?.cancelDate, message: 'EWB cancelled successfully' });
    } else {
      res.status(400).json({ success: false, error: data.message || 'Cancellation failed', nicResponse: data });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Route 5: Update Vehicle on EWB ───
// POST /api/ewb/update-vehicle
// Body: { ewbNo, vehicleNo, fromPlace, fromState, transMode }
app.post('/api/ewb/update-vehicle', async (req, res) => {
  if (!nicSession.authToken || nicSession.tokenExpiry < Date.now()) {
    return res.status(401).json({ success: false, error: 'NIC session expired.' });
  }

  if (nicSession.authToken.startsWith('MOCK_')) {
    return res.json({
      success: true,
      isMock: true,
      message: 'Mock vehicle update (NIC portal not connected)',
      transUpdateDate: new Date().toISOString()
    });
  }

  try {
    const baseUrl = getNicBaseUrl();
    const response = await axios.post(
      `${baseUrl}/api/ewayapi`,
      {
        action:       'VEHEWB',
        ewbNo:        req.body.ewbNo,
        vehicleNo:    req.body.vehicleNo,
        fromPlace:    req.body.fromPlace    || 'Karnal',
        fromState:    req.body.fromState    || 6,
        reasonCode:   req.body.reasonCode   || '1',
        reasonRem:    req.body.reasonRem    || 'Vehicle Change',
        transDocNo:   req.body.transDocNo   || '',
        transDocDate: req.body.transDocDate || '',
        transMode:    req.body.transMode    || '1',
        vehicleType:  req.body.vehicleType  || 'R'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'gstin':        nicSession.gstin,
          'authtoken':    nicSession.authToken,
          'user_name':    process.env.EWB_USERNAME
        },
        timeout: 10000
      }
    );

    const data = response.data;
    if (data.status_cd === '1') {
      res.json({ success: true, transUpdateDate: data.data?.transUpdateDate, validUpto: data.data?.validUpto });
    } else {
      res.status(400).json({ success: false, error: data.message || 'Vehicle update failed', nicResponse: data });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Route 6: NIC Session Status ───
// GET /api/ewb/session-status
app.get('/api/ewb/session-status', (req, res) => {
  const isActive = !!nicSession.authToken && nicSession.tokenExpiry > Date.now();
  res.json({
    active:      isActive,
    isMock:      nicSession.authToken?.startsWith('MOCK_') || false,
    gstin:       nicSession.gstin || null,
    tokenExpiry: nicSession.tokenExpiry ? new Date(nicSession.tokenExpiry).toISOString() : null,
    mode:        process.env.EWB_MODE || 'sandbox'
  });
});

// ─── Route 7: Logout NIC session ───
// POST /api/ewb/logout
app.post('/api/ewb/logout', (req, res) => {
  nicSession = { authToken: null, tokenExpiry: null, gstin: null };
  res.json({ success: true, message: 'NIC session cleared' });
});


// =============================================
// Start Server
// =============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Jai Kisan Vyapar Server running on http://localhost:${PORT}`);
  console.log(`📦 MongoDB URI: ${MONGO_URI}`);
  console.log(`🏛️  NIC EWB Mode: ${process.env.EWB_MODE || 'sandbox'}`);
  console.log(`\nAPI Routes:`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/data`);
  console.log(`  POST /api/sync`);
  console.log(`  POST /api/ewb/authenticate`);
  console.log(`  POST /api/ewb/generate`);
  console.log(`  GET  /api/ewb/details/:ewbNo`);
  console.log(`  POST /api/ewb/cancel`);
  console.log(`  POST /api/ewb/update-vehicle`);
  console.log(`  GET  /api/ewb/session-status\n`);
});
