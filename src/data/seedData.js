// Initial Seed Data for Jai Kisan Vyapar App

export const initialBusinessProfile = {
  name: "Jai Kisan Krishi Kendra & Traders",
  tagline: "Authorized Distributor: Seeds, Fertilizers, Pesticides & Farm Equipment",
  gstin: "06AAACJ1234K1Z5",
  state: "Haryana (06)",
  stateCode: "06",
  address: "Shop No. 12, Krishi Upaj Mandi Samiti, Main G.T. Road, Karnal, Haryana - 132001",
  phone: "+91 98765 43210",
  email: "billing@jaikisankrishi.in",
  bankName: "State Bank of India (SBI)",
  accountNumber: "30987654321",
  ifsc: "SBIN0001234",
  branch: "Mandi Karnal Branch",
  upiId: "jaikisanvyapar@sbi",
  termsAndConditions: "1. Goods once sold will not be taken back without original bill.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond 15 days.\n3. All disputes subject to Karnal Jurisdiction only.",
  logoUrl: "/logo.jpg"
};

export const initialProducts = [
  {
    id: "prod-1",
    name: "DAP Fertilizer (IFFCO 50kg Bag)",
    hsn: "3105",
    category: "Fertilizers",
    unit: "Bags",
    purchasePrice: 1250,
    sellingPrice: 1350,
    gstRate: 5,
    stock: 85,
    minStock: 20,
    batchNo: "IFF-DAP-2026",
    expiryDate: "2026-11-30"
  },
  {
    id: "prod-2",
    name: "Neem Coated Urea (KRIBHCO 45kg)",
    hsn: "3102",
    category: "Fertilizers",
    unit: "Bags",
    purchasePrice: 242,
    sellingPrice: 266.5,
    gstRate: 5,
    stock: 140,
    minStock: 30,
    batchNo: "KBH-U-402",
    expiryDate: "2026-09-30"
  },
  {
    id: "prod-3",
    name: "Hybrid Cotton Seed (Rasi 773 - 450g)",
    hsn: "1209",
    category: "Seeds",
    unit: "Pcs",
    purchasePrice: 720,
    sellingPrice: 860,
    gstRate: 0,
    stock: 55,
    minStock: 15,
    batchNo: "RSI-773-BT",
    expiryDate: "2026-03-31"
  },
  {
    id: "prod-4",
    name: "Chlorpyrifos 20% EC (1 Litre Bottle)",
    hsn: "3808",
    category: "Pesticides",
    unit: "Ltr",
    purchasePrice: 380,
    sellingPrice: 490,
    gstRate: 18,
    stock: 8, // Low stock trigger
    minStock: 15,
    batchNo: "CPY-9921",
    expiryDate: "2025-12-15"
  },
  {
    id: "prod-5",
    name: "Emamectin Benzoate 5% SG (100g)",
    hsn: "3808",
    category: "Pesticides",
    unit: "Pcs",
    purchasePrice: 190,
    sellingPrice: 270,
    gstRate: 18,
    stock: 35,
    minStock: 10,
    batchNo: "EMB-501",
    expiryDate: "2026-06-30"
  },
  {
    id: "prod-6",
    name: "Basmati 1121 Paddy Seeds (5kg Pouch)",
    hsn: "1209",
    category: "Seeds",
    unit: "Bags",
    purchasePrice: 420,
    sellingPrice: 540,
    gstRate: 0,
    stock: 6, // Low stock trigger
    minStock: 15,
    batchNo: "BAS-1121",
    expiryDate: "2026-05-15"
  },
  {
    id: "prod-7",
    name: "Drip Lateral Pipe 16mm (100m Roll)",
    hsn: "3917",
    category: "Equipment",
    unit: "Roll",
    purchasePrice: 950,
    sellingPrice: 1250,
    gstRate: 12,
    stock: 22,
    minStock: 8,
    batchNo: "DRP-16MM",
    expiryDate: "2028-12-31"
  },
  {
    id: "prod-8",
    name: "Zinc Sulphate Monohydrate 33% (5kg)",
    hsn: "2833",
    category: "Nutrients",
    unit: "Bags",
    purchasePrice: 260,
    sellingPrice: 340,
    gstRate: 12,
    stock: 48,
    minStock: 12,
    batchNo: "ZN-33-KNL",
    expiryDate: "2026-10-20"
  }
];

export const initialParties = [
  {
    id: "party-1",
    name: "Ramesh Patel (Farmer)",
    phone: "+91 98123 45678",
    type: "customer",
    city: "Karnal",
    state: "Haryana (06)",
    stateCode: "06",
    gstin: "",
    balance: 14200, // Positive = You will receive (Udhaar)
    creditLimit: 30000,
    notes: "Kharif season payment expected after harvest"
  },
  {
    id: "party-2",
    name: "Baldev Singh Dhillon (Farmer)",
    phone: "+91 98234 56789",
    type: "customer",
    city: "Kaithal",
    state: "Haryana (06)",
    stateCode: "06",
    gstin: "",
    balance: 8400,
    creditLimit: 50000,
    notes: "Regular buyer of fertilizers & hybrid paddy"
  },
  {
    id: "party-3",
    name: "Sharmaji Kirana & Agro Store",
    phone: "+91 98345 67890",
    type: "customer",
    city: "Panipat",
    state: "Haryana (06)",
    stateCode: "06",
    gstin: "06AABCS1429P1Z1",
    balance: 0,
    creditLimit: 100000,
    notes: "Wholesale buyer, prompt UPI settlement"
  },
  {
    id: "party-4",
    name: "IFFCO Fertilizer Distributors",
    phone: "+91 11 2658 9000",
    type: "supplier",
    city: "New Delhi",
    state: "Delhi (07)",
    stateCode: "07",
    gstin: "07AAACI1928D1ZQ",
    balance: -45000, // Negative = You have to pay
    creditLimit: 200000,
    notes: "Official IFFCO rake allocation supplier"
  },
  {
    id: "party-5",
    name: "Bayer CropScience Hub",
    phone: "+91 22 2531 1234",
    type: "supplier",
    city: "Gurugram",
    state: "Haryana (06)",
    stateCode: "06",
    gstin: "06AAACB0329H1Z8",
    balance: -18500,
    creditLimit: 150000,
    notes: "Crop protection chemicals distributor"
  }
];

export const initialInvoices = [
  {
    id: "INV-2024-001",
    invoiceNumber: "INV-1001",
    date: "2026-09-21",
    dueDate: "2026-10-05",
    partyId: "party-1",
    partyName: "Ramesh Patel (Farmer)",
    partyPhone: "+91 98123 45678",
    partyGstin: "",
    partyAddress: "Village Taraori, Karnal",
    items: [
      {
        productId: "prod-1",
        name: "DAP Fertilizer (IFFCO 50kg Bag)",
        hsn: "3105",
        quantity: 10,
        unit: "Bags",
        rate: 1350,
        discount: 0,
        gstRate: 5,
        taxableAmount: 12857.14,
        cgst: 321.43,
        sgst: 321.43,
        igst: 0,
        total: 13500
      },
      {
        productId: "prod-5",
        name: "Emamectin Benzoate 5% SG (100g)",
        hsn: "3808",
        quantity: 2,
        unit: "Pcs",
        rate: 270,
        discount: 0,
        gstRate: 18,
        taxableAmount: 457.63,
        cgst: 41.19,
        sgst: 41.19,
        igst: 0,
        total: 540
      }
    ],
    subtotal: 13314.77,
    totalTax: 725.24,
    roundOff: -0.01,
    grandTotal: 14040,
    paidAmount: 0,
    balanceDue: 14040,
    status: "Unpaid", // 'Paid' | 'Partial' | 'Unpaid'
    paymentMode: "Credit / Udhaar",
    notes: "Delivered to Taraori farmhouse"
  },
  {
    id: "INV-2024-002",
    invoiceNumber: "INV-1002",
    date: "2026-09-22",
    dueDate: "2026-09-22",
    partyId: "party-3",
    partyName: "Sharmaji Kirana & Agro Store",
    partyPhone: "+91 98345 67890",
    partyGstin: "06AABCS1429P1Z1",
    partyAddress: "Shop 4, GT Road, Panipat",
    items: [
      {
        productId: "prod-3",
        name: "Hybrid Cotton Seed (Rasi 773 - 450g)",
        hsn: "1209",
        quantity: 20,
        unit: "Pcs",
        rate: 860,
        discount: 2, // 2% trade discount
        gstRate: 0,
        taxableAmount: 16856,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 16856
      },
      {
        productId: "prod-7",
        name: "Drip Lateral Pipe 16mm (100m Roll)",
        hsn: "3917",
        quantity: 10,
        unit: "Roll",
        rate: 1250,
        discount: 0,
        gstRate: 12,
        taxableAmount: 11160.71,
        cgst: 669.64,
        sgst: 669.64,
        igst: 0,
        total: 12500
      }
    ],
    subtotal: 28016.71,
    totalTax: 1339.28,
    roundOff: 0.01,
    grandTotal: 29356,
    paidAmount: 29356,
    balanceDue: 0,
    status: "Paid",
    paymentMode: "UPI / QR",
    notes: "Payment received via SBI UPI Ref #4265891"
  }
];

export const initialExpenses = [
  {
    id: "exp-1",
    date: "2026-09-21",
    category: "Transport & Bhada",
    amount: 2200,
    paidFrom: "Cash in Hand",
    payee: "Sonu Tempo Service",
    notes: "Freight for Urea bags from railway siding"
  },
  {
    id: "exp-2",
    date: "2026-09-22",
    category: "Hamali & Labour",
    amount: 1800,
    paidFrom: "Cash in Hand",
    payee: "Mandi Labour Union",
    notes: "Unloading 200 bags DAP & Urea"
  },
  {
    id: "exp-3",
    date: "2026-09-22",
    category: "Shop Electricity",
    amount: 3450,
    paidFrom: "Bank Account (SBI)",
    payee: "DHBVN Haryana Bijli",
    notes: "Monthly shop bill"
  }
];

export const initialEWayBills = [
  {
    id: "EWB-102938",
    ewbNumber: "241088294172",
    date: "2026-09-24",
    validTill: "2026-09-26",
    sellerGSTIN: "06AAACJ1234K1Z5",
    buyerPartyId: "party-1",
    buyerName: "Chaudhary Baldev Singh (Kisan)",
    buyerGSTIN: "06AAEPB1122C1Z4",
    buyerAddress: "VPO Taraori, Karnal, Haryana",
    transportMode: "Road",
    vehicleNumber: "HR05AJ4491",
    transporterId: "06AABCT9981K1Z3",
    distance: "45",
    invoiceRef: "INV-1001",
    supplyType: "Outward",
    totalValue: 53999.98,
    items: [
      { productId: "prod-1", name: "DAP Fertilizer (IFFCO 50kg Bag)", hsn: "3105", quantity: 30, unit: "Bags", rate: 1350, gstRate: 5, taxableAmount: 38571.43, cgst: 964.29, sgst: 964.29, igst: 0, total: 40500 },
      { productId: "prod-2", name: "Neem Coated Urea (KRIBHCO 45kg)", hsn: "3102", quantity: 50, unit: "Bags", rate: 266.5, gstRate: 5, taxableAmount: 12690.48, cgst: 317.26, sgst: 317.26, igst: 0, total: 13325 }
    ]
  }
];

export const initialQuotations = [
  {
    id: "QUOT-20491",
    quotationNumber: "EST-2026-042",
    date: "2026-09-24",
    validTill: "2026-10-15",
    subject: "Rabi Season Wheat Seed & Fertilizer Estimation",
    partyId: "party-2",
    partyName: "Kisan Agro Seva Kendra (Karnal)",
    partyAddress: "Railway Road, Nilokheri, Karnal",
    partyGSTIN: "06AABFK8899M1Z8",
    terms: "50% advance along with confirmed order, balance against delivery at store.",
    subtotal: 68500,
    totalTax: 3425,
    roundOff: 0,
    grandTotal: 71925,
    items: [
      { productId: "prod-1", name: "DAP Fertilizer (IFFCO 50kg Bag)", hsn: "3105", quantity: 40, unit: "Bags", rate: 1350, gstRate: 5, taxableAmount: 51428.57, cgst: 1285.71, sgst: 1285.71, igst: 0, total: 54000 },
      { productId: "prod-3", name: "Hybrid Cotton Seed (Rasi 773 - 450g)", hsn: "1209", quantity: 20, unit: "Pcs", rate: 860, gstRate: 0, taxableAmount: 17200, cgst: 0, sgst: 0, igst: 0, total: 17200 }
    ]
  }
];

export const initialScratchpads = [
  {
    id: "scratch-1",
    title: "🌾 Agri & Mandi Counter Estimate",
    customerName: "Kisan Ramesh Kumar",
    customerPhone: "+91 98123 45678",
    businessType: "Agri / Kirana",
    date: "2026-09-30",
    notes: "Kharif season sowing order estimate. Quoted with 5% discount on seeds.",
    items: [
      { name: "DAP Fertilizer (IFFCO 50kg Bag)", quantity: 5, unit: "Bags", rate: 1350, discount: 0, gstRate: 5 },
      { name: "Neem Coated Urea (KRIBHCO 45kg)", quantity: 10, unit: "Bags", rate: 266.5, discount: 0, gstRate: 5 },
      { name: "Hybrid Cotton Seed (Rasi 773 - 450g)", quantity: 4, unit: "Pcs", rate: 860, discount: 5, gstRate: 0 },
      { name: "Chlorpyrifos 20% EC (1L Bottle)", quantity: 2, unit: "Ltr", rate: 490, discount: 0, gstRate: 18 }
    ]
  },
  {
    id: "scratch-2",
    title: "🏪 General Store / Kirana Quick Basket",
    customerName: "Sharmaji Walk-in Customer",
    customerPhone: "+91 98345 67890",
    businessType: "General Stores / Kirana",
    date: "2026-09-30",
    notes: "Monthly grocery & supplies basket estimate.",
    items: [
      { name: "Basmati 1121 Paddy Seeds (5kg Pouch)", quantity: 3, unit: "Bags", rate: 540, discount: 0, gstRate: 0 },
      { name: "Zinc Sulphate Monohydrate 33% (5kg)", quantity: 2, unit: "Bags", rate: 340, discount: 0, gstRate: 12 },
      { name: "Emamectin Benzoate 5% SG (100g)", quantity: 3, unit: "Pcs", rate: 270, discount: 5, gstRate: 18 }
    ]
  },
  {
    id: "scratch-3",
    title: "🌟 Wholesaler & Distributor Bulk Order",
    customerName: "National Agro Distributors",
    customerPhone: "+91 11 2658 9000",
    businessType: "Distributors & Wholesalers",
    date: "2026-09-30",
    notes: "Full truckload booking rough calculation. Cash payment upon unloading.",
    items: [
      { name: "DAP Fertilizer (IFFCO 50kg Bag)", quantity: 80, unit: "Bags", rate: 1290, discount: 2, gstRate: 5 },
      { name: "Neem Coated Urea (KRIBHCO 45kg)", quantity: 120, unit: "Bags", rate: 255, discount: 0, gstRate: 5 },
      { name: "Drip Lateral Pipe 16mm (100m Roll)", quantity: 15, unit: "Roll", rate: 1180, discount: 5, gstRate: 12 }
    ]
  },
  {
    id: "scratch-4",
    title: "⚡ Electronics & Hardware Counter Quote",
    customerName: "Verma Tube-well & Electricals",
    customerPhone: "+91 98456 78901",
    businessType: "Electronic / Hardware stores",
    date: "2026-09-30",
    notes: "Pump & piping setup estimate for agricultural bore-well.",
    items: [
      { name: "Drip Lateral Pipe 16mm (100m Roll)", quantity: 8, unit: "Roll", rate: 1250, discount: 0, gstRate: 12 },
      { name: "Submersible Motor Control Cable 4mm (100m)", quantity: 1, unit: "Roll", rate: 4200, discount: 5, gstRate: 18 },
      { name: "PVC Heavy Duty Ball Valve 2 inch", quantity: 6, unit: "Pcs", rate: 320, discount: 0, gstRate: 18 }
    ]
  },
  {
    id: "scratch-5",
    title: "🎨 Creators & Freelancers Service Estimate",
    customerName: "Agro Tech Digital Media",
    customerPhone: "+91 98111 22334",
    businessType: "Creators & Freelancers",
    date: "2026-09-30",
    notes: "Product launch visual identity & commercial shoot package.",
    items: [
      { name: "Vyapar Brand Identity & Label Design", quantity: 1, unit: "Pcs", rate: 7500, discount: 10, gstRate: 18 },
      { name: "4K Crop Demo Commercial Video Production", quantity: 1, unit: "Pcs", rate: 12000, discount: 0, gstRate: 18 },
      { name: "Social Media Banner Suite (10 Creatives)", quantity: 1, unit: "Pcs", rate: 4500, discount: 0, gstRate: 18 }
    ]
  }
];


