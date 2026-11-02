import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  FileSpreadsheet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { Invoice, ExpenseRecord, MonthlyFinancialSummary } from '../types';
import { formatINR, round2 } from '../utils/gstCalculations';
import { computeMonthlySummaries } from '../utils/financialCalculations';
import { exportMonthlyPNL } from '../utils/exportUtils';

interface ProfitLossViewProps {
  invoices: Invoice[];
  expenses: ExpenseRecord[];
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({ invoices, expenses }) => {
  const summaries = computeMonthlySummaries(invoices, expenses);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    summaries[0]?.monthKey || ''
  );

  const selectedSummary =
    summaries.find((s) => s.monthKey === selectedMonthKey) ||
    summaries[0] || {
      monthKey: '',
      monthName: 'No Data',
      taxableRevenue: 0,
      totalOutputGst: 0,
      grossSales: 0,
      directExpenses: 0,
      indirectExpenses: 0,
      totalExpenses: 0,
      totalInputGst: 0,
      grossProfit: 0,
      netProfit: 0,
      grossMarginPercent: 0,
      netMarginPercent: 0,
      invoicesCount: 0,
      collectedAmount: 0,
      pendingReceivables: 0,
    };

  // Detailed breakdown of expenses for this month
  const monthExpenses = expenses.filter(
    (e) => e.date.slice(0, 7) === selectedSummary.monthKey
  );

  const directCategories = ['Raw Materials', 'Contractor & Labour', 'Logistics & Freight'];
  const directList = monthExpenses.filter((e) => directCategories.includes(e.category));
  const indirectList = monthExpenses.filter((e) => !directCategories.includes(e.category));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monthly Profit & Loss Statements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track business operating revenue, direct COGS, facility overheads, and net margins month-by-month
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              {summaries.map((s) => (
                <option key={s.monthKey} value={s.monthKey}>
                  {s.monthName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => exportMonthlyPNL(summaries, 'CSV')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportMonthlyPNL(summaries, 'XLS')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Headline Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Operating Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Operating Revenue (Taxable)</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {formatINR(selectedSummary.taxableRevenue)}
          </p>
          <div className="text-[11px] text-slate-400 mt-1">
            Gross Billed: {formatINR(selectedSummary.grossSales)} ({selectedSummary.invoicesCount} invoices)
          </div>
        </div>

        {/* Total Cost / Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Book Expenses</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {formatINR(selectedSummary.totalExpenses)}
          </p>
          <div className="text-[11px] text-slate-400 mt-1">
            Direct: {formatINR(selectedSummary.directExpenses)} · Indirect: {formatINR(selectedSummary.indirectExpenses)}
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Gross Profit</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-2">
            {formatINR(selectedSummary.grossProfit)}
          </p>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Gross Margin: {selectedSummary.grossMarginPercent}%
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Net Operating Profit</span>
          <p className={`text-2xl font-bold font-mono mt-2 ${
            selectedSummary.netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
          }`}>
            {formatINR(selectedSummary.netProfit)}
          </p>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            Net Margin: {selectedSummary.netMarginPercent}%
          </div>
        </div>
      </div>

      {/* Formal P&L Statement Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Income Statement ({selectedSummary.monthName})
            </h2>
            <p className="text-xs text-slate-500">
              Detailed financial breakdown conforming to standard corporate accounting principles
            </p>
          </div>
          <span className="font-mono text-xs text-slate-600 font-medium">
            Cash Collected: <strong className="text-emerald-700">{formatINR(selectedSummary.collectedAmount)}</strong>
          </span>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* 1. Operating Revenue */}
          <div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 font-bold text-slate-900 text-sm">
              <span>I. OPERATING REVENUE / TURNOVER</span>
              <span className="font-mono">{formatINR(selectedSummary.taxableRevenue)}</span>
            </div>
            <div className="divide-y divide-slate-100 py-1">
              <div className="flex justify-between items-center py-1.5 text-slate-600 pl-4">
                <span>Invoiced Domestic Sales (Taxable Base)</span>
                <span className="font-mono">{formatINR(selectedSummary.taxableRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 text-slate-500 pl-4 text-[11px]">
                <span>Output GST Collected (CGST/SGST/IGST Liabilities)</span>
                <span className="font-mono">+{formatINR(selectedSummary.totalOutputGst)}</span>
              </div>
            </div>
          </div>

          {/* 2. Direct Costs (COGS) */}
          <div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 font-bold text-slate-900 text-sm">
              <span>II. COST OF GOODS & PRODUCTION (DIRECT EXPENSES)</span>
              <span className="font-mono text-rose-700">-{formatINR(selectedSummary.directExpenses)}</span>
            </div>
            <div className="divide-y divide-slate-100 py-1">
              {directList.length === 0 ? (
                <div className="py-1 text-slate-400 pl-4">No direct production costs recorded for this month.</div>
              ) : (
                directList.map((d) => (
                  <div key={d.id} className="flex justify-between items-center py-1.5 text-slate-600 pl-4">
                    <span>{d.category} · {d.description} ({d.site})</span>
                    <span className="font-mono">{formatINR(d.taxableAmount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gross Profit Subtotal */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex justify-between items-center font-bold text-slate-900">
            <div>
              <span className="text-sm">GROSS PROFIT (I - II)</span>
              <span className="text-xs text-emerald-700 font-normal ml-3 font-mono">
                Margin: {selectedSummary.grossMarginPercent}%
              </span>
            </div>
            <span className="font-mono text-base text-emerald-700">{formatINR(selectedSummary.grossProfit)}</span>
          </div>

          {/* 3. Indirect Expenses & Overheads */}
          <div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 font-bold text-slate-900 text-sm">
              <span>III. OPERATING OVERHEADS (INDIRECT EXPENSES)</span>
              <span className="font-mono text-rose-700">-{formatINR(selectedSummary.indirectExpenses)}</span>
            </div>
            <div className="divide-y divide-slate-100 py-1">
              {indirectList.length === 0 ? (
                <div className="py-1 text-slate-400 pl-4">No indirect facility overheads recorded.</div>
              ) : (
                indirectList.map((ind) => (
                  <div key={ind.id} className="flex justify-between items-center py-1.5 text-slate-600 pl-4">
                    <span>{ind.category} · {ind.vendorName}</span>
                    <span className="font-mono">{formatINR(ind.taxableAmount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Net Operating Profit Bottomline */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center font-bold">
            <div>
              <span className="text-base">NET OPERATING PROFIT (EBITDA)</span>
              <span className="text-xs text-slate-300 font-normal ml-3 font-mono">
                Net Margin: {selectedSummary.netMarginPercent}%
              </span>
            </div>
            <span className="font-mono text-lg text-emerald-400">{formatINR(selectedSummary.netProfit)}</span>
          </div>
        </div>
      </div>

      {/* 12-Month Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Multi-Month Performance Comparison</h3>
          <span className="text-xs text-slate-500 font-mono">FY 2026-27</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Month</th>
                <th className="py-3 px-4 text-right">Taxable Turnover</th>
                <th className="py-3 px-4 text-right">Direct Costs</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-4 text-right">Overheads</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Net Margin</th>
                <th className="py-3 px-6 text-right">Pending Receivables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((s) => (
                <tr
                  key={s.monthKey}
                  onClick={() => setSelectedMonthKey(s.monthKey)}
                  className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                    s.monthKey === selectedMonthKey ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {s.monthName}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatINR(s.taxableRevenue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatINR(s.directExpenses)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                    {formatINR(s.grossProfit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatINR(s.indirectExpenses)}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                    s.netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
                  }`}>
                    {formatINR(s.netProfit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {s.netMarginPercent}%
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono text-amber-600">
                    {formatINR(s.pendingReceivables)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
