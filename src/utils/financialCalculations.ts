import { Invoice, ExpenseRecord, MonthlyFinancialSummary, GSTBreakdownReport, PaymentReminder } from '../types';
import { round2, GST_RATES } from './gstCalculations';

export function getMonthKey(dateStr: string): string {
  // expects YYYY-MM-DD
  return dateStr.slice(0, 7);
}

export function formatMonthName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function computeMonthlySummaries(invoices: Invoice[], expenses: ExpenseRecord[]): MonthlyFinancialSummary[] {
  // Collect all distinct months
  const monthsSet = new Set<string>();

  invoices.forEach((inv) => monthsSet.add(getMonthKey(inv.invoiceDate)));
  expenses.forEach((exp) => monthsSet.add(getMonthKey(exp.date)));

  // If empty, ensure current month is present
  if (monthsSet.size === 0) {
    const today = new Date().toISOString().slice(0, 7);
    monthsSet.add(today);
  }

  const sortedMonths = Array.from(monthsSet).sort().reverse();

  return sortedMonths.map((mKey) => {
    const monthInvoices = invoices.filter((inv) => getMonthKey(inv.invoiceDate) === mKey);
    const monthExpenses = expenses.filter((exp) => getMonthKey(exp.date) === mKey);

    const taxableRevenue = round2(monthInvoices.reduce((sum, inv) => sum + inv.subtotal, 0));
    const totalOutputGst = round2(monthInvoices.reduce((sum, inv) => sum + inv.totalTax, 0));
    const grossSales = round2(monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0));

    // Direct expenses: Raw Materials, Contractor, Logistics
    const directCategories = ['Raw Materials', 'Contractor & Labour', 'Logistics & Freight'];
    const directExpenses = round2(
      monthExpenses
        .filter((exp) => directCategories.includes(exp.category))
        .reduce((sum, exp) => sum + exp.taxableAmount, 0)
    );

    // Indirect expenses: Rent, Utilities, Software, Marketing, etc.
    const indirectExpenses = round2(
      monthExpenses
        .filter((exp) => !directCategories.includes(exp.category))
        .reduce((sum, exp) => sum + exp.taxableAmount, 0)
    );

    const totalExpenses = round2(directExpenses + indirectExpenses);
    const totalInputGst = round2(monthExpenses.reduce((sum, exp) => sum + exp.totalTax, 0));

    const grossProfit = round2(taxableRevenue - directExpenses);
    const netProfit = round2(grossProfit - indirectExpenses);

    const grossMarginPercent = taxableRevenue > 0 ? round2((grossProfit / taxableRevenue) * 100) : 0;
    const netMarginPercent = taxableRevenue > 0 ? round2((netProfit / taxableRevenue) * 100) : 0;

    const collectedAmount = round2(monthInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0));
    const pendingReceivables = round2(monthInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0));

    return {
      monthKey: mKey,
      monthName: formatMonthName(mKey),
      taxableRevenue,
      totalOutputGst,
      grossSales,
      directExpenses,
      indirectExpenses,
      totalExpenses,
      totalInputGst,
      grossProfit,
      netProfit,
      grossMarginPercent,
      netMarginPercent,
      invoicesCount: monthInvoices.length,
      collectedAmount,
      pendingReceivables,
    };
  });
}

export function computeGSTBreakdown(
  invoices: Invoice[],
  expenses: ExpenseRecord[],
  monthFilter?: string
): GSTBreakdownReport {
  const filteredInvoices = monthFilter
    ? invoices.filter((inv) => getMonthKey(inv.invoiceDate) === monthFilter)
    : invoices;

  const filteredExpenses = monthFilter
    ? expenses.filter((exp) => getMonthKey(exp.date) === monthFilter)
    : expenses;

  // Output GST
  const taxableSales = round2(filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0));
  const outputCgst = round2(filteredInvoices.reduce((sum, inv) => sum + inv.totalCgst, 0));
  const outputSgst = round2(filteredInvoices.reduce((sum, inv) => sum + inv.totalSgst, 0));
  const outputIgst = round2(filteredInvoices.reduce((sum, inv) => sum + inv.totalIgst, 0));
  const totalOutputTax = round2(outputCgst + outputSgst + outputIgst);

  // Input Tax Credit (Eligible ITC)
  const itcExpenses = filteredExpenses.filter((exp) => exp.isItcEligible);
  const eligiblePurchases = round2(itcExpenses.reduce((sum, exp) => sum + exp.taxableAmount, 0));
  const itcCgst = round2(itcExpenses.reduce((sum, exp) => sum + exp.cgstAmount, 0));
  const itcSgst = round2(itcExpenses.reduce((sum, exp) => sum + exp.sgstAmount, 0));
  const itcIgst = round2(itcExpenses.reduce((sum, exp) => sum + exp.igstAmount, 0));
  const totalItcAvailable = round2(itcCgst + itcSgst + itcIgst);

  // Net GST Payable (or excess credit if negative)
  const netCgstPayable = round2(outputCgst - itcCgst);
  const netSgstPayable = round2(outputSgst - itcSgst);
  const netIgstPayable = round2(outputIgst - itcIgst);
  const totalNetGstPayable = round2(totalOutputTax - totalItcAvailable);

  // Rate breakdown for GSTR-1
  const rateBreakdown = GST_RATES.map((rate) => {
    let rateTaxable = 0;
    let rateCgst = 0;
    let rateSgst = 0;
    let rateIgst = 0;

    for (const inv of filteredInvoices) {
      for (const item of inv.items) {
        if (item.taxRate === rate) {
          rateTaxable += item.taxableAmount;
          rateCgst += item.cgstAmount;
          rateSgst += item.sgstAmount;
          rateIgst += item.igstAmount;
        }
      }
    }

    return {
      rate,
      taxableValue: round2(rateTaxable),
      cgst: round2(rateCgst),
      sgst: round2(rateSgst),
      igst: round2(rateIgst),
      totalGst: round2(rateCgst + rateSgst + rateIgst),
    };
  });

  const periodName = monthFilter ? formatMonthName(monthFilter) : 'All Recorded Periods (FY 2026-27)';

  return {
    period: periodName,
    outputCgst,
    outputSgst,
    outputIgst,
    totalOutputTax,
    taxableSales,
    itcCgst,
    itcSgst,
    itcIgst,
    totalItcAvailable,
    eligiblePurchases,
    netCgstPayable,
    netSgstPayable,
    netIgstPayable,
    totalNetGstPayable,
    rateBreakdown,
  };
}

export function computePaymentReminders(invoices: Invoice[]): PaymentReminder[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const unpaid = invoices.filter((inv) => inv.balanceDue > 0 && inv.paymentStatus !== 'CANCELLED');

  return unpaid
    .map((inv) => {
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - due.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let reminderStatus: 'DUE_SOON' | 'OVERDUE' | 'CRITICAL' = 'DUE_SOON';
      if (diffDays > 30) {
        reminderStatus = 'CRITICAL';
      } else if (diffDays > 0) {
        reminderStatus = 'OVERDUE';
      }

      return {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        partyName: inv.partyName,
        partyEmail: 'accounts@' + inv.partyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        partyPhone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
        dueDate: inv.dueDate,
        daysOverdue: diffDays,
        balanceDue: inv.balanceDue,
        reminderStatus,
        reminderCount: inv.reminderCount || 0,
        lastReminderSent: inv.lastReminderSent,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}
