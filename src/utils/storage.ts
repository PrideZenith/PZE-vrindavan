import { CompanyProfile, Party, Invoice, ExpenseRecord, RecurringSubscription, EmailReportConfig } from '../types';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Pride Zenith Enterprises Vrindavan',
  tradeName: 'Pride Zenith Enterprises',
  gstin: '09ABAFP6990M1ZH',
  state: 'Uttar Pradesh',
  stateCode: '09',
  address: 'Raman Reti Road, Near ISKCON',
  city: 'Vrindavan',
  pincode: '281121',
  phone: '+91 98200 45678',
  email: 'info@pridezenith.co.in',
  website: 'www.pridezenith.co.in',
  bankName: 'HDFC Bank',
  accountNumber: '50200084920192',
  ifscCode: 'HDFC0001234',
  branch: 'Vrindavan, Mathura',
  upiId: 'pridezenith@hdfcbank',
  panNumber: 'ABAFP6990M',
};

export const INITIAL_PARTIES: Party[] = [
  {
    id: 'pty-1',
    name: 'Vertex Engineering Works',
    contactPerson: 'Rajesh Sharma',
    email: 'accounts@vertexeng.com',
    phone: '+91 98111 22334',
    gstin: '27AABCV8765A1Z4',
    state: 'Maharashtra',
    stateCode: '27',
    address: 'Survey No. 44, Hinjawadi Phase 2',
    city: 'Pune',
    pincode: '411057',
    partyType: 'CUSTOMER',
    defaultSite: 'Site A - Pune Plant',
  },
  {
    id: 'pty-2',
    name: 'Skyline Digital Infra Ltd',
    contactPerson: 'Ananya Roy',
    email: 'billing@skylineinfra.io',
    phone: '+91 97400 88991',
    gstin: '29AAECS4433D1ZM',
    state: 'Karnataka',
    stateCode: '29',
    address: 'Prestige Tech Cloud, Marathahalli-Sarjapur Outer Ring Rd',
    city: 'Bengaluru',
    pincode: '560103',
    partyType: 'CUSTOMER',
    defaultSite: 'Site B - Bengaluru Hub',
  },
  {
    id: 'pty-3',
    name: 'Apex Logistics & Warehousing',
    contactPerson: 'Vikram Joshi',
    email: 'finance@apexlogistics.in',
    phone: '+91 99201 33445',
    gstin: '27BBBCP9988G1ZQ',
    state: 'Maharashtra',
    stateCode: '27',
    address: 'Warehouse Zone 3, Bhiwandi Bypass',
    city: 'Thane',
    pincode: '421302',
    partyType: 'CUSTOMER',
    defaultSite: 'Site C - Bhiwandi Depot',
  },
  {
    id: 'pty-4',
    name: 'Prime Capital Solutions',
    contactPerson: 'Sanjay Malhotra',
    email: 'sanjay@primecap.co.in',
    phone: '+91 98710 44556',
    gstin: '07AABCS5544K1ZF',
    state: 'Delhi',
    stateCode: '07',
    address: '14 Barakhamba Road, Connaught Place',
    city: 'New Delhi',
    pincode: '110001',
    partyType: 'CUSTOMER',
    defaultSite: 'Site D - Delhi Corporate',
  },
  {
    id: 'pty-5',
    name: 'Mahalaxmi Metals & Steel',
    contactPerson: 'Dinesh Patel',
    email: 'sales@mahalaxmisteel.com',
    phone: '+91 98220 11223',
    gstin: '27AACCM9911K1Z2',
    state: 'Maharashtra',
    stateCode: '27',
    address: 'Industrial Area, Taloja MIDC',
    city: 'Navi Mumbai',
    pincode: '410208',
    partyType: 'VENDOR',
    defaultSite: 'Site A - Pune Plant',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-10-15',
    dueDate: '2026-10-30',
    partyId: 'pty-1',
    partyName: 'Vertex Engineering Works',
    partyGstin: '27AABCV8765A1Z4',
    partyState: 'Maharashtra',
    partyStateCode: '27',
    partyAddress: 'Survey No. 44, Hinjawadi Phase 2, Pune, Maharashtra 411057',
    site: 'Site A - Pune Plant',
    supplyState: 'Maharashtra',
    supplyStateCode: '27',
    gstType: 'INTRA',
    poNumber: 'PO-VTX-892',
    paymentTerms: 'Net 15 Days',
    items: [
      {
        id: 'itm-1',
        site: 'Site A - Pune Plant',
        party: 'Vertex Engineering Works',
        description: 'Industrial Sensor Assembly Units',
        hsnSac: '8479',
        quantity: 120,
        unit: 'pcs',
        rate: 1250,
        taxRate: 18,
        taxableAmount: 150000,
        cgstRate: 9,
        cgstAmount: 13500,
        sgstRate: 9,
        sgstAmount: 13500,
        igstRate: 0,
        igstAmount: 0,
        totalTax: 27000,
        totalAmount: 177000,
        isTotalCustomized: false,
      },
      {
        id: 'itm-2',
        site: 'Site A - Pune Plant',
        party: 'Vertex Engineering Works',
        description: 'On-site Calibration & Testing Service',
        hsnSac: '9987',
        quantity: 1,
        unit: 'job',
        rate: 25000,
        taxRate: 18,
        taxableAmount: 25000,
        cgstRate: 9,
        cgstAmount: 2250,
        sgstRate: 9,
        sgstAmount: 2250,
        igstRate: 0,
        igstAmount: 0,
        totalTax: 4500,
        totalAmount: 29500,
        isTotalCustomized: false,
      },
    ],
    subtotal: 175000,
    totalCgst: 15750,
    totalSgst: 15750,
    totalIgst: 0,
    totalTax: 31500,
    roundOff: 0,
    grandTotal: 206500,
    amountPaid: 206500,
    balanceDue: 0,
    paymentStatus: 'PAID',
    paymentMode: 'BANK_TRANSFER',
    notes: 'Paid via RTGS Ref: HDFC9902847291 on Oct 28, 2026',
    isRecurring: false,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-28T14:30:00Z',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-002',
    invoiceDate: '2026-10-20',
    dueDate: '2026-11-04',
    partyId: 'pty-2',
    partyName: 'Skyline Digital Infra Ltd',
    partyGstin: '29AAECS4433D1ZM',
    partyState: 'Karnataka',
    partyStateCode: '29',
    partyAddress: 'Prestige Tech Cloud, Marathahalli Outer Ring Rd, Bengaluru 560103',
    site: 'Site B - Bengaluru Hub',
    supplyState: 'Karnataka',
    supplyStateCode: '29',
    gstType: 'INTER',
    poNumber: 'PO-SKY-5501',
    paymentTerms: 'Net 15 Days',
    items: [
      {
        id: 'itm-3',
        site: 'Site B - Bengaluru Hub',
        party: 'Skyline Digital Infra Ltd',
        description: 'Monthly Cloud Infrastructure Monitoring & Maintenance Retainer',
        hsnSac: '9983',
        quantity: 1,
        unit: 'month',
        rate: 85000,
        taxRate: 18,
        taxableAmount: 85000,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 18,
        igstAmount: 15300,
        totalTax: 15300,
        totalAmount: 100300,
        isTotalCustomized: false,
      },
    ],
    subtotal: 85000,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 15300,
    totalTax: 15300,
    roundOff: 0,
    grandTotal: 100300,
    amountPaid: 0,
    balanceDue: 100300,
    paymentStatus: 'PENDING',
    notes: 'Recurring subscription invoice for October-November 2026.',
    isRecurring: true,
    recurringId: 'rec-1',
    createdAt: '2026-10-20T11:00:00Z',
    updatedAt: '2026-10-20T11:00:00Z',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-003',
    invoiceDate: '2026-10-02',
    dueDate: '2026-10-17',
    partyId: 'pty-3',
    partyName: 'Apex Logistics & Warehousing',
    partyGstin: '27BBBCP9988G1ZQ',
    partyState: 'Maharashtra',
    partyStateCode: '27',
    partyAddress: 'Warehouse Zone 3, Bhiwandi Bypass, Thane 421302',
    site: 'Site C - Bhiwandi Depot',
    supplyState: 'Maharashtra',
    supplyStateCode: '27',
    gstType: 'INTRA',
    poNumber: 'PO-APX-3312',
    paymentTerms: 'Net 15 Days',
    items: [
      {
        id: 'itm-4',
        site: 'Site C - Bhiwandi Depot',
        party: 'Apex Logistics & Warehousing',
        description: 'Heavy Duty Storage Pallet Racks (Custom Fabrication)',
        hsnSac: '7308',
        quantity: 40,
        unit: 'sets',
        rate: 3800,
        taxRate: 18,
        taxableAmount: 152000,
        cgstRate: 9,
        cgstAmount: 13680,
        sgstRate: 9,
        sgstAmount: 13680,
        igstRate: 0,
        igstAmount: 0,
        totalTax: 27360,
        totalAmount: 179360,
        isTotalCustomized: false,
      },
    ],
    subtotal: 152000,
    totalCgst: 13680,
    totalSgst: 13680,
    totalIgst: 0,
    totalTax: 27360,
    roundOff: 0,
    grandTotal: 179360,
    amountPaid: 50000,
    balanceDue: 129360,
    paymentStatus: 'OVERDUE',
    paymentMode: 'BANK_TRANSFER',
    notes: 'Advance of ₹50,000 received. Balance overdue since Oct 17. Reminder sent.',
    isRecurring: false,
    lastReminderSent: '2026-10-25',
    reminderCount: 2,
    createdAt: '2026-10-02T09:30:00Z',
    updatedAt: '2026-10-25T16:00:00Z',
  },
  {
    id: 'inv-104',
    invoiceNumber: 'INV-2026-004',
    invoiceDate: '2026-10-28',
    dueDate: '2026-11-12',
    partyId: 'pty-4',
    partyName: 'Prime Capital Solutions',
    partyGstin: '07AABCS5544K1ZF',
    partyState: 'Delhi',
    partyStateCode: '07',
    partyAddress: '14 Barakhamba Road, Connaught Place, New Delhi 110001',
    site: 'Site D - Delhi Corporate',
    supplyState: 'Delhi',
    supplyStateCode: '07',
    gstType: 'INTER',
    poNumber: 'PO-PRM-902',
    paymentTerms: 'Net 15 Days',
    items: [
      {
        id: 'itm-5',
        site: 'Site D - Delhi Corporate',
        party: 'Prime Capital Solutions',
        description: 'Financial Analytics Software License & Setup',
        hsnSac: '998314',
        quantity: 1,
        unit: 'package',
        rate: 65000,
        taxRate: 18,
        taxableAmount: 65000,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 18,
        igstAmount: 11700,
        totalTax: 11700,
        totalAmount: 76700,
        isTotalCustomized: false,
      },
    ],
    subtotal: 65000,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 11700,
    totalTax: 11700,
    roundOff: 0,
    grandTotal: 76700,
    amountPaid: 0,
    balanceDue: 76700,
    paymentStatus: 'PENDING',
    notes: 'Invoice generated under annual agreement.',
    isRecurring: true,
    recurringId: 'rec-2',
    createdAt: '2026-10-28T14:15:00Z',
    updatedAt: '2026-10-28T14:15:00Z',
  },
  {
    id: 'inv-105',
    invoiceNumber: 'INV-2026-005',
    invoiceDate: '2026-09-18',
    dueDate: '2026-10-03',
    partyId: 'pty-1',
    partyName: 'Vertex Engineering Works',
    partyGstin: '27AABCV8765A1Z4',
    partyState: 'Maharashtra',
    partyStateCode: '27',
    partyAddress: 'Survey No. 44, Hinjawadi Phase 2, Pune, Maharashtra 411057',
    site: 'Site A - Pune Plant',
    supplyState: 'Maharashtra',
    supplyStateCode: '27',
    gstType: 'INTRA',
    poNumber: 'PO-VTX-771',
    paymentTerms: 'Net 15 Days',
    items: [
      {
        id: 'itm-6',
        site: 'Site A - Pune Plant',
        party: 'Vertex Engineering Works',
        description: 'Specialized CNC Machined Components',
        hsnSac: '8466',
        quantity: 50,
        unit: 'pcs',
        rate: 2200,
        taxRate: 18,
        taxableAmount: 110000,
        cgstRate: 9,
        cgstAmount: 9900,
        sgstRate: 9,
        sgstAmount: 9900,
        igstRate: 0,
        igstAmount: 0,
        totalTax: 19800,
        totalAmount: 129800,
        isTotalCustomized: false,
      },
    ],
    subtotal: 110000,
    totalCgst: 9900,
    totalSgst: 9900,
    totalIgst: 0,
    totalTax: 19800,
    roundOff: 0,
    grandTotal: 129800,
    amountPaid: 129800,
    balanceDue: 0,
    paymentStatus: 'PAID',
    paymentMode: 'BANK_TRANSFER',
    notes: 'Settled fully in September.',
    isRecurring: false,
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-29T11:00:00Z',
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-2026-01',
    date: '2026-10-05',
    category: 'Raw Materials',
    vendorName: 'Mahalaxmi Metals & Steel',
    vendorGstin: '27AACCM9911K1Z2',
    vendorState: 'Maharashtra',
    vendorStateCode: '27',
    site: 'Site A - Pune Plant',
    description: 'Stainless Steel Sheets Grade 304 (2mm)',
    quantity: 250,
    rate: 240,
    taxRate: 18,
    taxableAmount: 60000,
    gstType: 'INTRA',
    cgstAmount: 5400,
    sgstAmount: 5400,
    igstAmount: 0,
    totalTax: 10800,
    totalAmount: 70800,
    isTotalCustomized: false,
    isItcEligible: true,
    paymentMode: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    referenceNumber: 'BILL-MMS-4091',
    notes: 'Input Tax Credit claimed for GSTR-3B Table 4(A)(5)',
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-2026-02',
    date: '2026-10-01',
    category: 'Office Rent & Facilities',
    vendorName: 'MIDC Industrial Landlord Trust',
    vendorGstin: '27AAATM8822B1Z9',
    vendorState: 'Maharashtra',
    vendorStateCode: '27',
    site: 'Site A - Pune Plant',
    description: 'Factory Floor Lease for October 2026',
    quantity: 1,
    rate: 45000,
    taxRate: 18,
    taxableAmount: 45000,
    gstType: 'INTRA',
    cgstAmount: 4050,
    sgstAmount: 4050,
    igstAmount: 0,
    totalTax: 8100,
    totalAmount: 53100,
    isTotalCustomized: false,
    isItcEligible: true,
    paymentMode: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    referenceNumber: 'RENT-OCT-26',
  },
  {
    id: 'exp-3',
    expenseNumber: 'EXP-2026-03',
    date: '2026-10-12',
    category: 'Logistics & Freight',
    vendorName: 'SafeExpress Cargo Carriers',
    vendorGstin: '27AAECS3321L1ZK',
    vendorState: 'Maharashtra',
    vendorStateCode: '27',
    site: 'Site C - Bhiwandi Depot',
    description: 'Inter-facility Component Dispatch to Pune and Bhiwandi',
    quantity: 12,
    rate: 1500,
    taxRate: 5,
    taxableAmount: 18000,
    gstType: 'INTRA',
    cgstAmount: 450,
    sgstAmount: 450,
    igstAmount: 0,
    totalTax: 900,
    totalAmount: 18900,
    isTotalCustomized: false,
    isItcEligible: true,
    paymentMode: 'UPI',
    paymentStatus: 'PAID',
    referenceNumber: 'EXP-TR-998',
  },
  {
    id: 'exp-4',
    expenseNumber: 'EXP-2026-04',
    date: '2026-10-18',
    category: 'Software & Subscriptions',
    vendorName: 'Amazon Web Services India Pvt Ltd',
    vendorGstin: '29AABCA2233N1ZO',
    vendorState: 'Karnataka',
    vendorStateCode: '29',
    site: 'Site B - Bengaluru Hub',
    description: 'Cloud Server Compute & Database Hosting',
    quantity: 1,
    rate: 22000,
    taxRate: 18,
    taxableAmount: 22000,
    gstType: 'INTER',
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 3960,
    totalTax: 3960,
    totalAmount: 25960,
    isTotalCustomized: false,
    isItcEligible: true,
    paymentMode: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    referenceNumber: 'AWS-INV-77319',
  },
  {
    id: 'exp-5',
    expenseNumber: 'EXP-2026-05',
    date: '2026-10-22',
    category: 'Contractor & Labour',
    vendorName: 'Shree Sai Technical Services',
    vendorGstin: '27AAMFS4912J1ZR',
    vendorState: 'Maharashtra',
    vendorStateCode: '27',
    site: 'Site A - Pune Plant',
    description: 'Precision Assembly Contractors (2 Weeks)',
    quantity: 1,
    rate: 32000,
    taxRate: 18,
    taxableAmount: 32000,
    gstType: 'INTRA',
    cgstAmount: 2880,
    sgstAmount: 2880,
    igstAmount: 0,
    totalTax: 5760,
    totalAmount: 37760,
    isTotalCustomized: false,
    isItcEligible: true,
    paymentMode: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    referenceNumber: 'CON-OCT-102',
  },
  {
    id: 'exp-6',
    expenseNumber: 'EXP-2026-06',
    date: '2026-09-10',
    category: 'Raw Materials',
    vendorName: 'Mahalaxmi Metals & Steel',
    vendorGstin: '27AACCM9911K1Z2',
    vendorState: 'Maharashtra',
    vendorStateCode: '27',
    site: 'Site A - Pune Plant',
    description: 'Brass Rods and Aluminum Billets',
    quantity: 180,
    rate: 220,
    taxRate: 18,
    taxableAmount: 39600,
    gstType: 'INTRA',
    cgstAmount: 3564,
    sgstAmount: 3564,
    igstAmount: 0,
    totalTax: 7128,
    totalAmount: 46728,
    isTotalCustomized: false,
    isItcEligible: true,
    paymentMode: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    referenceNumber: 'BILL-MMS-3810',
  },
  {
    id: 'exp-7',
    expenseNumber: 'EXP-2026-07',
    date: '2026-09-02',
    category: 'Office Rent & Facilities',
    vendorName: 'MIDC Industrial Landlord Trust',
    vendorGstin: '27AAATM8822B1Z9',
    vendorState: 'Maharashtra',
    vendorStateCode: '27',
    site: 'Site A - Pune Plant',
    description: 'Factory Floor Lease for September 2026',
    quantity: 1,
    rate: 45000,
    taxRate: 18,
    taxableAmount: 45000,
    gstType: 'INTRA',
    cgstAmount: 4050,
    sgstAmount: 4050,
    igstAmount: 0,
    totalTax: 8100,
    totalAmount: 53100,
    isTotalCustomized: false,
    isItcEligible: true,
    paymentMode: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    referenceNumber: 'RENT-SEP-26',
  },
];

export const INITIAL_RECURRING: RecurringSubscription[] = [
  {
    id: 'rec-1',
    title: 'Cloud Infrastructure Monitoring & Maintenance',
    partyId: 'pty-2',
    partyName: 'Skyline Digital Infra Ltd',
    partyEmail: 'billing@skylineinfra.io',
    site: 'Site B - Bengaluru Hub',
    frequency: 'MONTHLY',
    amount: 85000,
    taxRate: 18,
    startDate: '2026-06-01',
    nextBillingDate: '2026-11-20',
    status: 'ACTIVE',
    description: 'Monthly Cloud Infrastructure Monitoring & Maintenance Retainer',
    hsnSac: '9983',
    autoSendInvoice: true,
    totalInvoicesGenerated: 5,
    lastInvoiceDate: '2026-10-20',
  },
  {
    id: 'rec-2',
    title: 'Financial Analytics Software License',
    partyId: 'pty-4',
    partyName: 'Prime Capital Solutions',
    partyEmail: 'sanjay@primecap.co.in',
    site: 'Site D - Delhi Corporate',
    frequency: 'MONTHLY',
    amount: 65000,
    taxRate: 18,
    startDate: '2026-09-01',
    nextBillingDate: '2026-11-28',
    status: 'ACTIVE',
    description: 'Financial Analytics Software License & Setup',
    hsnSac: '998314',
    autoSendInvoice: true,
    totalInvoicesGenerated: 2,
    lastInvoiceDate: '2026-10-28',
  },
  {
    id: 'rec-3',
    title: 'Preventive Machinery Maintenance',
    partyId: 'pty-1',
    partyName: 'Vertex Engineering Works',
    partyEmail: 'accounts@vertexeng.com',
    site: 'Site A - Pune Plant',
    frequency: 'QUARTERLY',
    amount: 45000,
    taxRate: 18,
    startDate: '2026-07-01',
    nextBillingDate: '2026-12-01',
    status: 'ACTIVE',
    description: 'Quarterly CNC Machine Calibration and Hydraulic Checkups',
    hsnSac: '9987',
    autoSendInvoice: false,
    totalInvoicesGenerated: 2,
    lastInvoiceDate: '2026-09-01',
  },
];

export const DEFAULT_EMAIL_CONFIG: EmailReportConfig = {
  accountingEmail: 'pridezenithenterprises@gmail.com',
  marketingEmail: 'info@pridezenith.co.in',
  additionalCc: 'finance.lead@zenithenterprises.in',
  includeGstSummary: true,
  includePnlStatement: true,
  includeAgingReport: true,
  includeMarketingSyncCsv: true,
  autoSchedule: true,
  scheduleDay: 1,
  lastDispatchedAt: '2026-10-01T09:00:00Z',
};

// Storage keys
const STORAGE_KEYS = {
  COMPANY: 'zb_company_profile',
  PARTIES: 'zb_parties',
  INVOICES: 'zb_invoices',
  EXPENSES: 'zb_expenses',
  RECURRING: 'zb_recurring',
  EMAIL_CONFIG: 'zb_email_config',
};

export function loadCompany(): CompanyProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.gstin === '27AABCP1234F1ZX' || !parsed.gstin?.startsWith('09')) {
        const updated: CompanyProfile = {
          ...parsed,
          name: 'Pride Zenith Enterprises Vrindavan',
          tradeName: 'Pride Zenith Enterprises',
          gstin: '09ABAFP6990M1ZH',
          state: 'Uttar Pradesh',
          stateCode: '09',
          address: 'Raman Reti Road, Near ISKCON',
          city: 'Vrindavan',
          pincode: '281121',
          branch: 'Vrindavan, Mathura',
          panNumber: 'ABAFP6990M',
        };
        saveCompany(updated);
        return updated;
      }
      return parsed;
    }
    return DEFAULT_COMPANY;
  } catch {
    return DEFAULT_COMPANY;
  }
}

export function saveCompany(profile: CompanyProfile): void {
  localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(profile));
}

export function loadParties(): Party[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTIES);
    return data ? JSON.parse(data) : INITIAL_PARTIES;
  } catch {
    return INITIAL_PARTIES;
  }
}

export function saveParties(parties: Party[]): void {
  localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
}

export function loadInvoices(): Invoice[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

export function loadExpenses(): ExpenseRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : INITIAL_EXPENSES;
  } catch {
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: ExpenseRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function loadRecurring(): RecurringSubscription[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return data ? JSON.parse(data) : INITIAL_RECURRING;
  } catch {
    return INITIAL_RECURRING;
  }
}

export function saveRecurring(recurring: RecurringSubscription[]): void {
  localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
}

export function loadEmailConfig(): EmailReportConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EMAIL_CONFIG);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.marketingEmail === 'marketing@zenithenterprises.in') {
        const updated = { ...parsed, marketingEmail: 'info@pridezenith.co.in' };
        saveEmailConfig(updated);
        return updated;
      }
      return parsed;
    }
    return DEFAULT_EMAIL_CONFIG;
  } catch {
    return DEFAULT_EMAIL_CONFIG;
  }
}

export function saveEmailConfig(config: EmailReportConfig): void {
  localStorage.setItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(config));
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
  localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
  localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(INITIAL_RECURRING));
  localStorage.setItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(DEFAULT_EMAIL_CONFIG));
}
