import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  initialBusinessProfile,
  initialProducts,
  initialParties,
  initialInvoices,
  initialExpenses,
  initialEWayBills,
  initialQuotations,
  initialScratchpads
} from '../data/seedData';

const AppContext = createContext();

// Generate an initial 6-digit sync room code if none exists
const generateSyncCode = () => {
  return 'JKV-' + Math.floor(1000 + Math.random() * 9000);
};

export const AppProvider = ({ children }) => {
  // --- Persistent State from LocalStorage ---
  const [businessProfile, setBusinessProfile] = useState(() => {
    const saved = localStorage.getItem('jkv_business');
    return saved ? JSON.parse(saved) : initialBusinessProfile;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('jkv_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [parties, setParties] = useState(() => {
    const saved = localStorage.getItem('jkv_parties');
    return saved ? JSON.parse(saved) : initialParties;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('jkv_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('jkv_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [eWayBills, setEWayBills] = useState(() => {
    const saved = localStorage.getItem('jkv_ewaybills');
    return saved ? JSON.parse(saved) : initialEWayBills;
  });

  const [quotations, setQuotations] = useState(() => {
    const saved = localStorage.getItem('jkv_quotations');
    return saved ? JSON.parse(saved) : initialQuotations;
  });

  const [scratchpads, setScratchpads] = useState(() => {
    const saved = localStorage.getItem('jkv_scratchpads');
    return saved ? JSON.parse(saved) : initialScratchpads;
  });

  const [scratchpadToConvert, setScratchpadToConvert] = useState(null);
  const [isScratchpadModalOpen, setIsScratchpadModalOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jkv_theme') || 'light';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('jkv_lang') || 'en'; // 'en' | 'hi'
  });

  const [deviceView, setDeviceView] = useState('pc'); // 'pc' | 'mobile_sim'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'billing' | 'inventory' | 'parties' | 'expenses' | 'reports' | 'settings'

  // Global Dialog / Modal States
  const [isEWayBillOpen, setIsEWayBillOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [eWayBillInitialInvoice, setEWayBillInitialInvoice] = useState(null);

  const openEWayBill = (invoice = null) => {
    setEWayBillInitialInvoice(invoice);
    setIsEWayBillOpen(true);
  };

  const closeEWayBill = () => {
    setIsEWayBillOpen(false);
    setEWayBillInitialInvoice(null);
  };

  // --- Real-time Sync Engine State ---
  const [syncRoomCode, setSyncRoomCode] = useState(() => {
    return localStorage.getItem('jkv_sync_code') || generateSyncCode();
  });
  const [syncStatus, setSyncStatus] = useState('connected'); // 'connected' | 'syncing' | 'offline'
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [pairedDevices, setPairedDevices] = useState(2); // simulated PC + Mobile pair
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  
  // Unique Tab ID to avoid echoing own Broadcast messages
  const clientIdRef = useRef('client_' + Math.random().toString(36).substring(2, 9));
  const channelRef = useRef(null);

  // Apply Theme attribute to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jkv_theme', theme);
  }, [theme]);

  // Persist Data Changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('jkv_business', JSON.stringify(businessProfile));
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem('jkv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('jkv_parties', JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem('jkv_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('jkv_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('jkv_sync_code', syncRoomCode);
  }, [syncRoomCode]);

  useEffect(() => {
    localStorage.setItem('jkv_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('jkv_ewaybills', JSON.stringify(eWayBills));
  }, [eWayBills]);

  useEffect(() => {
    localStorage.setItem('jkv_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('jkv_scratchpads', JSON.stringify(scratchpads));
  }, [scratchpads]);

  // Load initial data from backend MongoDB
  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.businessProfile && Object.keys(data.businessProfile).length) setBusinessProfile(data.businessProfile);
        if (data.products && data.products.length) setProducts(data.products);
        else setProducts(initialProducts);
        if (data.parties && data.parties.length) setParties(data.parties);
        else setParties(initialParties);
        if (data.invoices && data.invoices.length) setInvoices(data.invoices);
        else setInvoices(initialInvoices);
        if (data.expenses && data.expenses.length) setExpenses(data.expenses);
        else setExpenses(initialExpenses);
        if (data.eWayBills && data.eWayBills.length) setEWayBills(data.eWayBills);
        else setEWayBills(initialEWayBills);
        if (data.quotations && data.quotations.length) setQuotations(data.quotations);
        else setQuotations(initialQuotations);
        if (data.scratchpads && data.scratchpads.length) setScratchpads(data.scratchpads);
        else setScratchpads(initialScratchpads);
      })
      .catch(err => {
        console.error('Failed to load initial data from server, falling back to seed data', err);
        setProducts(initialProducts);
        setParties(initialParties);
        setInvoices(initialInvoices);
        setExpenses(initialExpenses);
        setEWayBills(initialEWayBills);
        setQuotations(initialQuotations);
        setScratchpads(initialScratchpads);
      });
  }, []);

  // --- BroadcastChannel for Live Instant Sync Across Tabs / Windows ---
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('jai_kisan_vyapar_sync_v1');

      channelRef.current.onmessage = (event) => {
        const { type, senderId, payload, timestamp } = event.data;
        if (senderId === clientIdRef.current) return; // Ignore own messages

        if (type === 'SYNC_FULL_STATE') {
          setSyncStatus('syncing');
          if (payload.products) setProducts(payload.products);
          if (payload.parties) setParties(payload.parties);
          if (payload.invoices) setInvoices(payload.invoices);
          if (payload.expenses) setExpenses(payload.expenses);
          if (payload.businessProfile) setBusinessProfile(payload.businessProfile);
          if (payload.scratchpads) setScratchpads(payload.scratchpads);

          setTimeout(() => {
            setSyncStatus('connected');
            setLastSyncTime(new Date().toLocaleTimeString());
          }, 300);
        } else if (type === 'PING_DISCOVERY') {
          channelRef.current.postMessage({
            type: 'PONG_ACK',
            senderId: clientIdRef.current,
            timestamp: Date.now()
          });
        }
      };

      // Announce device discovery
      channelRef.current.postMessage({
        type: 'PING_DISCOVERY',
        senderId: clientIdRef.current
      });
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

// Broadcast state changes to all listening tabs/devices
const broadcastState = async (overrides = {}) => {
  setSyncStatus('syncing');
  setLastSyncTime(new Date().toLocaleTimeString());

  const fullPayload = {
    products,
    parties,
    invoices,
    expenses,
    businessProfile,
    eWayBills,
    quotations,
    scratchpads,
    ...overrides
  };

  if (channelRef.current) {
    channelRef.current.postMessage({
      type: 'SYNC_FULL_STATE',
      senderId: clientIdRef.current,
      timestamp: Date.now(),
      payload: fullPayload
    });
  }

  // Persist to backend MongoDB
  try {
    await fetch('http://localhost:5000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload)
    });
  } catch (e) {
    console.error('Sync error', e);
  }

  setTimeout(() => {
    setSyncStatus('connected');
  }, 400);
};

  // Play subtle celebratory audio chime for invoice creation
  const playCashChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.1); // A5
      osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.2); // D6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // AudioContext may be restricted by browser policy before user interaction
    }
  };

  // --- ACTIONS ---

  // 1. Invoices (Create Sale / Purchase)
  const addInvoice = (invoiceData) => {
    const newInvoice = {
      ...invoiceData,
      id: invoiceData.id || `INV-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };

    // Update Product Stock (Deduct sold quantities)
    const updatedProducts = products.map((prod) => {
      const lineItem = newInvoice.items.find((item) => item.productId === prod.id);
      if (lineItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - Number(lineItem.quantity))
        };
      }
      return prod;
    });

    // Update Party Balance if credit / unpaid balance remains
    let updatedParties = parties;
    if (newInvoice.partyId && newInvoice.balanceDue > 0) {
      updatedParties = parties.map((p) => {
        if (p.id === newInvoice.partyId) {
          return {
            ...p,
            balance: Number(p.balance || 0) + Number(newInvoice.balanceDue)
          };
        }
        return p;
      });
    }

    const updatedInvoices = [newInvoice, ...invoices];

    setInvoices(updatedInvoices);
    setProducts(updatedProducts);
    setParties(updatedParties);

    // Broadcast sync
    broadcastState({
      invoices: updatedInvoices,
      products: updatedProducts,
      parties: updatedParties
    });

    // Trigger visual celebration & sound
    playCashChime();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#f59e0b', '#0f5132']
    });

    return newInvoice;
  };

  const deleteInvoice = (invoiceId) => {
    const targetInv = invoices.find((inv) => inv.id === invoiceId);
    if (!targetInv) return;

    // Restore stock
    const updatedProducts = products.map((prod) => {
      const lineItem = targetInv.items.find((item) => item.productId === prod.id);
      if (lineItem) {
        return {
          ...prod,
          stock: prod.stock + Number(lineItem.quantity)
        };
      }
      return prod;
    });

    // Restore party balance
    let updatedParties = parties;
    if (targetInv.partyId && targetInv.balanceDue > 0) {
      updatedParties = parties.map((p) => {
        if (p.id === targetInv.partyId) {
          return {
            ...p,
            balance: Math.max(0, Number(p.balance || 0) - Number(targetInv.balanceDue))
          };
        }
        return p;
      });
    }

    const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId);

    setInvoices(updatedInvoices);
    setProducts(updatedProducts);
    setParties(updatedParties);

    broadcastState({
      invoices: updatedInvoices,
      products: updatedProducts,
      parties: updatedParties
    });
  };

  // 2. Inventory / Products
  const addProduct = (prodData) => {
    const newProd = {
      ...prodData,
      id: `prod-${Date.now().toString().slice(-6)}`,
      stock: Number(prodData.stock || 0),
      minStock: Number(prodData.minStock || 10),
      sellingPrice: Number(prodData.sellingPrice || 0),
      purchasePrice: Number(prodData.purchasePrice || 0),
      gstRate: Number(prodData.gstRate || 0)
    };

    const updatedProducts = [newProd, ...products];
    setProducts(updatedProducts);
    broadcastState({ products: updatedProducts });
    return newProd;
  };

  const updateProduct = (prodId, updatedFields) => {
    const updatedProducts = products.map((prod) => {
      if (prod.id === prodId) {
        return {
          ...prod,
          ...updatedFields,
          stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : prod.stock,
          sellingPrice: updatedFields.sellingPrice !== undefined ? Number(updatedFields.sellingPrice) : prod.sellingPrice,
          purchasePrice: updatedFields.purchasePrice !== undefined ? Number(updatedFields.purchasePrice) : prod.purchasePrice,
          gstRate: updatedFields.gstRate !== undefined ? Number(updatedFields.gstRate) : prod.gstRate
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    broadcastState({ products: updatedProducts });
  };

  const deleteProduct = (prodId) => {
    const updated = products.filter((p) => p.id !== prodId);
    setProducts(updated);
    broadcastState({ products: updated });
  };

  // 3. Parties / Khata Ledger
  const addParty = (partyData) => {
    const newParty = {
      ...partyData,
      id: `party-${Date.now().toString().slice(-6)}`,
      balance: Number(partyData.balance || 0),
      creditLimit: Number(partyData.creditLimit || 50000)
    };

    const updated = [newParty, ...parties];
    setParties(updated);
    broadcastState({ parties: updated });
    return newParty;
  };

  const updateParty = (partyId, updatedFields) => {
    const updated = parties.map((p) => (p.id === partyId ? { ...p, ...updatedFields } : p));
    setParties(updated);
    broadcastState({ parties: updated });
  };

  const recordPayment = (partyId, amount, type = 'receive', paymentMode = 'Cash', notes = '') => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const updatedParties = parties.map((p) => {
      if (p.id === partyId) {
        const change = type === 'receive' ? -numAmount : numAmount;
        return {
          ...p,
          balance: Number(p.balance || 0) + change
        };
      }
      return p;
    });

    // Also record as a cash transaction or note
    const paymentReceipt = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      partyId,
      amount: numAmount,
      type,
      paymentMode,
      notes,
      date: new Date().toISOString().split('T')[0]
    };

    setParties(updatedParties);
    broadcastState({ parties: updatedParties });

    playCashChime();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10b981', '#0f5132']
    });

    return paymentReceipt;
  };

  // 4. Expenses
  const addExpense = (expenseData) => {
    const newExp = {
      ...expenseData,
      id: `exp-${Date.now().toString().slice(-6)}`,
      amount: Number(expenseData.amount || 0),
      date: expenseData.date || new Date().toISOString().split('T')[0]
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    broadcastState({ expenses: updated });
    return newExp;
  };

  const deleteExpense = (expId) => {
    const updated = expenses.filter((e) => e.id !== expId);
    setExpenses(updated);
    broadcastState({ expenses: updated });
  };

  // 5. Business Profile
  const updateBusinessProfile = (profileData) => {
    setBusinessProfile(profileData);
    broadcastState({ businessProfile: profileData });
  };

  // 5b. E-Way Bills
  const addEWayBill = (ewbData) => {
    const newEWB = {
      ...ewbData,
      id: `EWB-${Date.now().toString().slice(-6)}`,
      date: ewbData.date || new Date().toISOString().split('T')[0]
    };
    const updated = [newEWB, ...eWayBills];
    setEWayBills(updated);
    broadcastState({ eWayBills: updated });
    return newEWB;
  };

  const deleteEWayBill = (id) => {
    const updated = eWayBills.filter(e => e.id !== id);
    setEWayBills(updated);
    broadcastState({ eWayBills: updated });
  };

  // 5c. Quotations
  const addQuotation = (quotData) => {
    const newQuot = {
      ...quotData,
      id: `QUOT-${Date.now().toString().slice(-6)}`,
      date: quotData.date || new Date().toISOString().split('T')[0]
    };
    const updated = [newQuot, ...quotations];
    setQuotations(updated);
    broadcastState({ quotations: updated });
    return newQuot;
  };

  const deleteQuotation = (id) => {
    const updated = quotations.filter(q => q.id !== id);
    setQuotations(updated);
    broadcastState({ quotations: updated });
  };

  // 5d. Scratchpads
  const saveScratchpad = (scratchData) => {
    let updated;
    const exists = scratchpads.some(s => s.id === scratchData.id);
    if (exists) {
      updated = scratchpads.map(s => s.id === scratchData.id ? { ...s, ...scratchData, updatedAt: new Date().toISOString() } : s);
    } else {
      const newScratch = {
        ...scratchData,
        id: scratchData.id || `scratch-${Date.now().toString().slice(-6)}`,
        date: scratchData.date || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };
      updated = [newScratch, ...scratchpads];
    }
    setScratchpads(updated);
    broadcastState({ scratchpads: updated });
    return updated.find(s => s.id === (scratchData.id || updated[0].id));
  };

  const deleteScratchpad = (id) => {
    const updated = scratchpads.filter(s => s.id !== id);
    setScratchpads(updated);
    broadcastState({ scratchpads: updated });
  };

  const convertScratchpadToInvoice = (scratchpad) => {
    setScratchpadToConvert(scratchpad);
    setActiveTab('billing');
  };

  // 6. Backup & Restore (JSON Export / Import)
  const exportDataToJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'Jai Kisan Vyapar',
      version: '1.0.0',
      businessProfile,
      products,
      parties,
      invoices,
      expenses,
      eWayBills,
      quotations,
      scratchpads
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jai_Kisan_Vyapar_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataFromJson = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.businessProfile) setBusinessProfile(data.businessProfile);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.parties && Array.isArray(data.parties)) setParties(data.parties);
      if (data.invoices && Array.isArray(data.invoices)) setInvoices(data.invoices);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.eWayBills && Array.isArray(data.eWayBills)) setEWayBills(data.eWayBills);
      if (data.quotations && Array.isArray(data.quotations)) setQuotations(data.quotations);
      if (data.scratchpads && Array.isArray(data.scratchpads)) setScratchpads(data.scratchpads);

      broadcastState(data);
      return { success: true, message: 'Data restored successfully!' };
    } catch (err) {
      return { success: false, message: 'Invalid backup file format.' };
    }
  };

  const resetToDemoData = () => {
    setBusinessProfile(initialBusinessProfile);
    setProducts(initialProducts);
    setParties(initialParties);
    setInvoices(initialInvoices);
    setExpenses(initialExpenses);
    setEWayBills(initialEWayBills);
    setQuotations(initialQuotations);
    setScratchpads(initialScratchpads);

    localStorage.clear();
    broadcastState({
      businessProfile: initialBusinessProfile,
      products: initialProducts,
      parties: initialParties,
      invoices: initialInvoices,
      expenses: initialExpenses,
      eWayBills: initialEWayBills,
      quotations: initialQuotations,
      scratchpads: initialScratchpads
    });
  };

  return (
    <AppContext.Provider
      value={{
        businessProfile,
        updateBusinessProfile,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        parties,
        addParty,
        updateParty,
        recordPayment,
        invoices,
        addInvoice,
        deleteInvoice,
        expenses,
        addExpense,
        deleteExpense,
        // E-Way Bills
        eWayBills,
        addEWayBill,
        deleteEWayBill,
        // Quotations
        quotations,
        addQuotation,
        deleteQuotation,
        // Scratchpads
        scratchpads,
        saveScratchpad,
        deleteScratchpad,
        scratchpadToConvert,
        setScratchpadToConvert,
        convertScratchpadToInvoice,
        isScratchpadModalOpen,
        setIsScratchpadModalOpen,
        // UI & Device view states
        theme,
        setTheme,
        toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
        language,
        setLanguage,
        toggleLanguage: () => setLanguage((prev) => (prev === 'en' ? 'hi' : 'en')),
        deviceView,
        setDeviceView,
        activeTab,
        setActiveTab,
        // Global dialog / builder states
        isEWayBillOpen,
        setIsEWayBillOpen,
        openEWayBill,
        closeEWayBill,
        eWayBillInitialInvoice,
        isQuotationOpen,
        setIsQuotationOpen,
        isChecklistOpen,
        setIsChecklistOpen,
        // Sync states & methods
        syncRoomCode,
        setSyncRoomCode,
        syncStatus,
        lastSyncTime,
        pairedDevices,
        isSyncModalOpen,
        setIsSyncModalOpen,
        broadcastState,
        exportDataToJson,
        importDataFromJson,
        resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
