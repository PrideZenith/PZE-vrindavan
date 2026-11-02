import React from 'react';
import {
  TrendingUp,
  Receipt,
  FileCheck2,
  AlertCircle,
  Repeat,
  ArrowUpRight,
  Plus,
  Download,
  Calendar,
  Building2,
  Wallet,
} from 'lucide-react';
import { Invoice, ExpenseRecord, RecurringSubscription, CompanyProfile } from '../types';
import { formatINR, round2 } from '../utils/gstCalculations';
import { computeGSTBreakdown, computeMonthlySummaries } from '../utils/financialCalculations';

interface DashboardViewProps {
  invoices: Invoice[];
  expenses: ExpenseRecord[];
  recurring: RecurringSubscription[];
  company: CompanyProfile;
  onNavigate: (tab: any) => void;
  onNewInvoice: () => void;
  onNewExpense: () => void;
  onOpenBulkExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  expenses,
  recurring,
  company,
  onNavigate,
  onNewInvoice,
  onNewExpense,
  onOpenBulkExport,
}) => {
  const gstBreakdown = computeGSTBreakdown(invoices, expenses);
  const monthlySummaries = computeMonthlySummaries(invoices, expenses);
  const currentMonthSummary = monthlySummaries[0] || {
    monthName: 'Current Period',
    taxableRevenue: 0,
    grossSales: 0,
    directExpenses: 0,
    indirectExpenses: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    grossMarginPercent: 0,
    netMarginPercent: 0,
    collectedAmount: 0,
    pendingReceivables: 0,
  };

  // Lifetime & Overall numbers
  const totalInvoiced = round2(invoices.reduce((sum, inv) => sum + inv.grandTotal, 0));
  const totalCollected = round2(invoices.reduce((sum, inv) => sum + inv.amountPaid, 0));
  const totalOutstanding = round2(invoices.reduce((sum, inv) => sum + inv.balanceDue, 0));
  const overdueInvoices = invoices.filter((inv) => inv.paymentStatus === 'OVERDUE');
  const overdueAmount = round2(overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0));

  // Category-wise Tax Liability Summary
  const expenseCategoriesTax = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = {
        category: exp.category,
        count: 0,
        taxable: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
        itcEligible: exp.isItcEligible,
      };
    }
    acc[exp.category].count += 1;
    acc[exp.category].taxable += exp.taxableAmount;
    acc[exp.category].cgst += exp.cgstAmount;
    acc[exp.category].sgst += exp.sgstAmount;
    acc[exp.category].igst += exp.igstAmount;
    acc[exp.category].totalTax += exp.totalTax;
    return acc;
  }, {} as Record<string, { category: string; count: number; taxable: number; cgst: number; sgst: number; igst: number; totalTax: number; itcEligible: boolean }>);

  const categoryList = Object.values(expenseCategoriesTax).sort((a, b) => b.totalTax - a.totalTax);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial & Tax Overview
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{company.name}</span>
            <span aria-hidden="true">·</span>
            <span>State: {company.state} ({company.stateCode})</span>
            <span aria-hidden="true">·</span>
            <span>GSTIN: {company.gstin}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={onNewInvoice}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Overdue Late Payments Alert Banner if any overdue */}
      {overdueInvoices.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {overdueInvoices.length} Overdue Payment{overdueInvoices.length > 1 ? 's' : ''} Requiring Reminder Attention
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Total Overdue Receivables: <span className="font-mono font-bold">{formatINR(overdueAmount)}</span>. Send automated email or WhatsApp payment notices.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reminders')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <span>Review Reminders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Core KPI Matrix (4 structured cards with clean tabular numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Invoiced Turnover</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {formatINR(totalInvoiced)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>{invoices.length} Total Invoices</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-medium">{formatINR(totalCollected)} Collected</span>
          </div>
        </div>

        {/* Card 2: Outstanding Receivables */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Receivables</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-600 tracking-tight">
              {formatINR(totalOutstanding)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>{overdueInvoices.length} Overdue</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              View Aging
            </button>
          </div>
        </div>

        {/* Card 3: Net GST Liability */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Net GST Liability</span>
            <FileCheck2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {formatINR(gstBreakdown.totalNetGstPayable)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Output: {formatINR(gstBreakdown.totalOutputTax)}</span>
            <span aria-hidden="true">·</span>
            <span>ITC: {formatINR(gstBreakdown.totalItcAvailable)}</span>
          </div>
        </div>

        {/* Card 4: Month Net Profit */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{currentMonthSummary.monthName} Net Profit</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold font-mono tracking-tight ${
              currentMonthSummary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {formatINR(currentMonthSummary.netProfit)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Margin: {currentMonthSummary.netMarginPercent}%</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onNavigate('pnl')}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Full P&L Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Tax Liabilities Summary by Category (Requested explicitly by user) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Tax Liabilities & Input Tax Credit (ITC) by Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of tax amounts segregated across business expense & operational heads for seamless tax filing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('gst-tax')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <span>Detailed GST Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* GST Output vs Inward summary bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/60 p-4 border-b border-slate-200">
          <div className="px-4 py-2">
            <p className="text-xs text-slate-500 font-medium">Output GST (Sales Invoices)</p>
            <p className="text-lg font-bold font-mono text-slate-900 mt-1">
              {formatINR(gstBreakdown.totalOutputTax)}
            </p>
            <div className="text-[11px] font-mono text-slate-500 flex gap-2 mt-1">
              <span>CGST: {formatINR(gstBreakdown.outputCgst)}</span>
              <span>SGST: {formatINR(gstBreakdown.outputSgst)}</span>
              <span>IGST: {formatINR(gstBreakdown.outputIgst)}</span>
            </div>
          </div>

          <div className="px-4 py-2">
            <p className="text-xs text-slate-500 font-medium">Input Tax Credit (ITC Available)</p>
            <p className="text-lg font-bold font-mono text-emerald-600 mt-1">
              {formatINR(gstBreakdown.totalItcAvailable)}
            </p>
            <div className="text-[11px] font-mono text-slate-500 flex gap-2 mt-1">
              <span>CGST: {formatINR(gstBreakdown.itcCgst)}</span>
              <span>SGST: {formatINR(gstBreakdown.itcSgst)}</span>
              <span>IGST: {formatINR(gstBreakdown.itcIgst)}</span>
            </div>
          </div>

          <div className="px-4 py-2">
            <p className="text-xs text-slate-500 font-medium">Net GST Payable to Govt</p>
            <p className="text-lg font-bold font-mono text-indigo-700 mt-1">
              {formatINR(gstBreakdown.totalNetGstPayable)}
            </p>
            <div className="text-[11px] font-mono text-slate-500 flex gap-2 mt-1">
              <span>Net CGST: {formatINR(gstBreakdown.netCgstPayable)}</span>
              <span>Net SGST: {formatINR(gstBreakdown.netSgstPayable)}</span>
              <span>Net IGST: {formatINR(gstBreakdown.netIgstPayable)}</span>
            </div>
          </div>
        </div>

        {/* Category Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Expense / Cost Category</th>
                <th className="py-3 px-4 text-right">Taxable Turnover</th>
                <th className="py-3 px-4 text-right">CGST</th>
                <th className="py-3 px-4 text-right">SGST</th>
                <th className="py-3 px-4 text-right">IGST</th>
                <th className="py-3 px-4 text-right">Total Tax (ITC)</th>
                <th className="py-3 px-6 text-center">ITC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryList.map((cat) => (
                <tr key={cat.category} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cat.category}</span>
                      <span className="text-xs text-slate-400 font-mono">({cat.count} vouchers)</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatINR(cat.taxable)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatINR(cat.cgst)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatINR(cat.sgst)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatINR(cat.igst)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                    {formatINR(cat.totalTax)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Eligible ITC
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Recent Invoices & Recurring Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Invoices */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Generated Invoices</h3>
              <p className="text-xs text-slate-500">Latest sales invoices with site & GST breakup</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All ({invoices.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {invoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 truncate">{inv.partyName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{inv.site}</span>
                    <span>·</span>
                    <span>{inv.gstType === 'INTRA' ? 'Intrastate (CGST+SGST)' : 'Interstate (IGST)'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold font-mono text-slate-900">{formatINR(inv.grandTotal)}</p>
                  <p className={`text-[11px] font-medium ${
                    inv.paymentStatus === 'PAID'
                      ? 'text-emerald-600'
                      : inv.paymentStatus === 'OVERDUE'
                      ? 'text-rose-600 font-semibold'
                      : 'text-amber-600'
                  }`}>
                    {inv.paymentStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recurring Subscriptions */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Subscription Services</h3>
              <p className="text-xs text-slate-500">Automated recurring billing contracts & next dates</p>
            </div>
            <button
              onClick={() => onNavigate('recurring')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Manage ({recurring.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {recurring.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-900 truncate">{sub.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{sub.partyName}</span>
                    <span>·</span>
                    <span>{sub.frequency}</span>
                    <span>·</span>
                    <span className="text-indigo-600 font-mono">Next: {sub.nextBillingDate}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold font-mono text-slate-900">{formatINR(sub.amount)}</p>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                    + {sub.taxRate}% GST
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
