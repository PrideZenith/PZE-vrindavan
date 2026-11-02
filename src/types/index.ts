export type GSTType = 'INTRA' | 'INTER'; // INTRA = CGST + SGST, INTER = IGST

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'CANCELLED';

export type PaymentMode = 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CASH' | 'CREDIT_CARD';

export type RecurringFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'BI_ANNUAL' | 'ANNUAL';

export interface CompanyProfile {
  name: string;
  tradeName?: string;
  gstin: string;
  state: string;
  stateCode: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  panNumber?: string;
}

export interface Party {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  gstin?: string;
  state: string;
  stateCode: string;
  address: string;
  city: string;
  pincode: string;
  partyType: 'CUSTOMER' | 'VENDOR' | 'BOTH';
  defaultSite?: string;
  outstandingBalance?: number;
}

export interface InvoiceLineItem {
  id: string;
  site: string; // Worksite / Project / Branch
  party: string; // Customer / Recipient reference
  description: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number; // 0, 5, 12, 18, 28
  taxCategory?: 'SGST_CGST' | 'IGST' | 'AUTO';
  taxableAmount: number; // quantity * rate
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  isTotalCustomized?: boolean; // When user customized total amount directly
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  partyId: string;
  partyName: string;
  partyGstin?: string;
  partyState: string;
  partyStateCode: string;
  partyAddress: string;
  site: string; // Primary site/project
  supplyState: string;
  supplyStateCode: string;
  gstType: GSTType; // Auto-determined or manual
  poNumber?: string;
  paymentTerms: string;
  items: InvoiceLineItem[];
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode;
  notes?: string;
  isRecurring?: boolean;
  recurringId?: string;
  lastReminderSent?: string;
  reminderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  vendorName: string;
  vendorGstin?: string;
  vendorState: string;
  vendorStateCode: string;
  site: string; // Worksite / Branch where expense occurred
  description: string;
  quantity: number;
  rate: number;
  taxRate: number; // 0, 5, 12, 18, 28
  taxableAmount: number;
  gstType: GSTType;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  isTotalCustomized?: boolean;
  isItcEligible: boolean; // Input Tax Credit eligibility
  paymentMode: PaymentMode;
  paymentStatus: 'PAID' | 'PENDING';
  referenceNumber?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'Raw Materials'
  | 'Contractor & Labour'
  | 'Logistics & Freight'
  | 'Office Rent & Facilities'
  | 'Electricity & Utilities'
  | 'Software & Subscriptions'
  | 'Marketing & Advertising'
  | 'Professional & Legal'
  | 'Equipment & Maintenance'
  | 'Travel & Fuel'
  | 'Misc Expenses';

export interface RecurringSubscription {
  id: string;
  title: string;
  partyId: string;
  partyName: string;
  partyEmail: string;
  site: string;
  frequency: RecurringFrequency;
  amount: number;
  taxRate: number;
  startDate: string; // YYYY-MM-DD
  nextBillingDate: string; // YYYY-MM-DD
  endDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  description: string;
  hsnSac: string;
  autoSendInvoice: boolean;
  totalInvoicesGenerated: number;
  lastInvoiceDate?: string;
}

export interface PaymentReminder {
  invoiceId: string;
  invoiceNumber: string;
  partyName: string;
  partyEmail: string;
  partyPhone: string;
  dueDate: string;
  daysOverdue: number;
  balanceDue: number;
  reminderStatus: 'DUE_SOON' | 'OVERDUE' | 'CRITICAL';
  reminderCount: number;
  lastReminderSent?: string;
}

export interface MonthlyFinancialSummary {
  monthKey: string; // YYYY-MM
  monthName: string;
  taxableRevenue: number;
  totalOutputGst: number;
  grossSales: number;
  directExpenses: number;
  indirectExpenses: number;
  totalExpenses: number;
  totalInputGst: number;
  grossProfit: number;
  netProfit: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  invoicesCount: number;
  collectedAmount: number;
  pendingReceivables: number;
}

export interface GSTBreakdownReport {
  period: string; // e.g. "October 2026" or "Q3 2026"
  // Output GST (from Invoices)
  outputCgst: number;
  outputSgst: number;
  outputIgst: number;
  totalOutputTax: number;
  taxableSales: number;
  // Input Tax Credit (from Expenses)
  itcCgst: number;
  itcSgst: number;
  itcIgst: number;
  totalItcAvailable: number;
  eligiblePurchases: number;
  // Net Payable
  netCgstPayable: number;
  netSgstPayable: number;
  netIgstPayable: number;
  totalNetGstPayable: number;
  // Rate-wise summary
  rateBreakdown: {
    rate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
  }[];
}

export interface EmailReportConfig {
  accountingEmail: string;
  marketingEmail: string;
  additionalCc: string;
  includeGstSummary: boolean;
  includePnlStatement: boolean;
  includeAgingReport: boolean;
  includeMarketingSyncCsv: boolean;
  autoSchedule: boolean;
  scheduleDay: number; // Day of month (e.g. 1st)
  lastDispatchedAt?: string;
}
