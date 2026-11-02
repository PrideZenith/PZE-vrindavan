import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  FileSpreadsheet,
  Calendar,
  Building2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Invoice, ExpenseRecord } from '../types';
import { formatINR, round2 } from '../utils/gstCalculations';
import { computeGSTBreakdown, computeMonthlySummaries } from '../utils/financialCalculations';
import { exportGSTTaxFilingSheet } from '../utils/exportUtils';

interface GSTTaxViewProps {
  invoices: Invoice[];
  expenses: ExpenseRecord[];
}

export const GSTTaxView: React.FC<GSTTaxViewProps> = ({ invoices, expenses }) => {
  const monthlySummaries = computeMonthlySummaries(invoices, expenses);
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  const report = computeGSTBreakdown(
    invoices,
    expenses,
    selectedMonth === 'ALL' ? undefined : selectedMonth
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            GST Tax Filing & Liabilities Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Segregated CGST, SGST, and IGST breakdowns for GSTR-1 and GSTR-3B tax compliance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Recorded Periods</option>
              {monthlySummaries.map((m) => (
                <option key={m.monthKey} value={m.monthKey}>
                  {m.monthName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => exportGSTTaxFilingSheet(report, 'CSV')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportGSTTaxFilingSheet(report, 'XLS')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (XLS)</span>
          </button>
        </div>
      </div>

      {/* 3 Core Pillars: Outward Liabilities, Inward ITC, and Net Payable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Output GST (Sales) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1. Outward Supplies (GSTR-1)
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Output Tax Liabilities
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Sales
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500">Taxable Sales Turnover:</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {formatINR(report.taxableSales)}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Central Tax (CGST):</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatINR(report.outputCgst)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">State Tax (SGST):</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatINR(report.outputSgst)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Integrated Tax (IGST):</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatINR(report.outputIgst)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-sm">
              <span className="text-slate-900">Total Output Tax:</span>
              <span className="font-mono text-indigo-700">
                {formatINR(report.totalOutputTax)}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Input Tax Credit (Purchases/Expenses) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                2. Inward Supplies (GSTR-2B)
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Input Tax Credit (ITC)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Credits
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500">Eligible Expense Purchases:</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {formatINR(report.eligiblePurchases)}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">CGST Input Credit:</span>
              <span className="font-mono font-semibold text-emerald-700">
                {formatINR(report.itcCgst)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">SGST Input Credit:</span>
              <span className="font-mono font-semibold text-emerald-700">
                {formatINR(report.itcSgst)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">IGST Input Credit:</span>
              <span className="font-mono font-semibold text-emerald-700">
                {formatINR(report.itcIgst)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-sm">
              <span className="text-slate-900">Total ITC Available:</span>
              <span className="font-mono text-emerald-600">
                {formatINR(report.totalItcAvailable)}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Net Tax Payable (Offset Computation) */}
        <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                3. Tax Settlement (GSTR-3B Table 6.1)
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Net Tax Payable in Cash
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-200 bg-indigo-800 px-2 py-0.5 rounded">
              Govt Challan
            </span>
          </div>

          <div>
            <span className="text-xs text-indigo-200">Total Net Liability:</span>
            <p className="text-2xl font-bold font-mono text-white mt-0.5">
              {formatINR(report.totalNetGstPayable)}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-indigo-800 text-xs text-indigo-100">
            <div className="flex justify-between items-center">
              <span>Net CGST Payable:</span>
              <span className="font-mono font-semibold text-white">
                {formatINR(report.netCgstPayable)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Net SGST Payable:</span>
              <span className="font-mono font-semibold text-white">
                {formatINR(report.netSgstPayable)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Net IGST Payable:</span>
              <span className="font-mono font-semibold text-white">
                {formatINR(report.netIgstPayable)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-indigo-700/80 font-bold text-sm text-white">
              <span>Net Cash to Deposit:</span>
              <span className="font-mono text-amber-300">
                {formatINR(report.totalNetGstPayable > 0 ? report.totalNetGstPayable : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate-Wise Slab Breakdown (GSTR-1 Table 12 & Table 4/7) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Rate-Wise GST Slabs Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Directly map values to GSTR-1 returns across 0%, 5%, 12%, 18%, and 28% GST tax brackets
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Period: {report.period}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Tax Rate Slab</th>
                <th className="py-3 px-4 text-right">Taxable Turnover</th>
                <th className="py-3 px-4 text-right">Central Tax (CGST)</th>
                <th className="py-3 px-4 text-right">State Tax (SGST)</th>
                <th className="py-3 px-4 text-right">Integrated Tax (IGST)</th>
                <th className="py-3 px-6 text-right">Total GST Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.rateBreakdown.map((r) => (
                <tr key={r.rate} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                      GST @ {r.rate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatINR(r.taxableValue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatINR(r.cgst)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatINR(r.sgst)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatINR(r.igst)}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-indigo-700">
                    {formatINR(r.totalGst)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td className="py-3 px-6 text-slate-900">Total All Slabs:</td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  {formatINR(report.taxableSales)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  {formatINR(report.outputCgst)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  {formatINR(report.outputSgst)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  {formatINR(report.outputIgst)}
                </td>
                <td className="py-3 px-6 text-right font-mono text-indigo-700 text-sm">
                  {formatINR(report.totalOutputTax)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
