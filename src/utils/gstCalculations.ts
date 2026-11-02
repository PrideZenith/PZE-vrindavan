import { GSTType, InvoiceLineItem } from '../types';

export interface StateInfo {
  code: string;
  name: string;
}

export const INDIAN_STATES: StateInfo[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli & Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
];

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export function determineGstType(companyStateCode: string, supplyStateCode: string): GSTType {
  const norm1 = companyStateCode.padStart(2, '0');
  const norm2 = supplyStateCode.padStart(2, '0');
  return norm1 === norm2 ? 'INTRA' : 'INTER';
}

export function calculateLineItemTaxes(
  quantity: number,
  rate: number,
  taxRate: number,
  gstType: GSTType,
  customTotalAmount?: number
): {
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  isTotalCustomized: boolean;
} {
  const qty = Number(quantity) || 0;
  const unitRate = Number(rate) || 0;
  const taxPct = Number(taxRate) || 0;

  // If user provided a customized total amount and it differs from natural math
  if (customTotalAmount !== undefined && customTotalAmount !== null && !isNaN(customTotalAmount)) {
    const total = Number(customTotalAmount);
    // Back-calculate taxable value and taxes proportionally
    const taxable = taxPct > 0 ? total / (1 + taxPct / 100) : total;
    const taxAmt = total - taxable;

    if (gstType === 'INTRA') {
      const halfRate = taxPct / 2;
      const halfTax = round2(taxAmt / 2);
      return {
        taxableAmount: round2(taxable),
        cgstRate: halfRate,
        cgstAmount: halfTax,
        sgstRate: halfRate,
        sgstAmount: halfTax,
        igstRate: 0,
        igstAmount: 0,
        totalTax: round2(halfTax * 2),
        totalAmount: round2(total),
        isTotalCustomized: true,
      };
    } else {
      return {
        taxableAmount: round2(taxable),
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: taxPct,
        igstAmount: round2(taxAmt),
        totalTax: round2(taxAmt),
        totalAmount: round2(total),
        isTotalCustomized: true,
      };
    }
  }

  // Standard forward calculation
  const taxable = round2(qty * unitRate);
  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (gstType === 'INTRA') {
    cgstRate = taxPct / 2;
    sgstRate = taxPct / 2;
    cgstAmount = round2((taxable * cgstRate) / 100);
    sgstAmount = round2((taxable * sgstRate) / 100);
  } else {
    igstRate = taxPct;
    igstAmount = round2((taxable * igstRate) / 100);
  }

  const totalTax = round2(cgstAmount + sgstAmount + igstAmount);
  const totalAmount = round2(taxable + totalTax);

  return {
    taxableAmount: taxable,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTax,
    totalAmount,
    isTotalCustomized: false,
  };
}

export function calculateInvoiceTotals(items: InvoiceLineItem[]) {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  for (const item of items) {
    subtotal += item.taxableAmount;
    totalCgst += item.cgstAmount;
    totalSgst += item.sgstAmount;
    totalIgst += item.igstAmount;
  }

  subtotal = round2(subtotal);
  totalCgst = round2(totalCgst);
  totalSgst = round2(totalSgst);
  totalIgst = round2(totalIgst);

  const totalTax = round2(totalCgst + totalSgst + totalIgst);
  const unroundedGrand = subtotal + totalTax;
  const roundedGrand = Math.round(unroundedGrand);
  const roundOff = round2(roundedGrand - unroundedGrand);

  return {
    subtotal,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTax,
    roundOff,
    grandTotal: roundedGrand,
  };
}

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatINR(val: number): string {
  const rounded = round2(val || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(rounded);
}

export function formatNumber(val: number): string {
  const rounded = round2(val || 0);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(rounded);
}

// Convert amount in numbers to words (Indian numbering system)
export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return singleDigits[n];
    return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + singleDigits[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    let result = '';
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (hundred > 0) {
      result += singleDigits[hundred] + ' Hundred';
      if (rest > 0) result += ' and ';
    }
    if (rest > 0) {
      result += convertTwoDigits(rest);
    }
    return result;
  }

  let num = rounded;
  let words = '';

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  const remaining = num;

  if (crores > 0) {
    words += convertTwoDigits(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertTwoDigits(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertTwoDigits(thousands) + ' Thousand ';
  }
  if (remaining > 0) {
    words += convertThreeDigits(remaining) + ' ';
  }

  return 'INR ' + words.trim() + ' Only';
}
