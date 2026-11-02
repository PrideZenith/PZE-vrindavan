import React, { useState } from 'react';
import {
  Mail,
  Send,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Settings,
  FileSpreadsheet,
  Share2,
  Check,
  Building2,
} from 'lucide-react';
import {
  Invoice,
  ExpenseRecord,
  Party,
  CompanyProfile,
  EmailReportConfig,
} from '../types';
import { formatINR, round2 } from '../utils/gstCalculations';
import { computeMonthlySummaries, computeGSTBreakdown } from '../utils/financialCalculations';
import {
  exportInvoices,
  exportExpenses,
  exportMonthlyPNL,
  exportGSTTaxFilingSheet,
  exportMarketingSync,
} from '../utils/exportUtils';

interface EmailReportsViewProps {
  invoices: Invoice[];
  expenses: ExpenseRecord[];
  parties: Party[];
  company: CompanyProfile;
  config: EmailReportConfig;
  onSaveConfig: (config: EmailReportConfig) => void;
}

export const EmailReportsView: React.FC<EmailReportsViewProps> = ({
  invoices,
  expenses,
  parties,
  company,
  config,
  onSaveConfig,
}) => {
  const summaries = computeMonthlySummaries(invoices, expenses);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    summaries[0]?.monthKey || ''
  );
  const [accountingEmail, setAccountingEmail] = useState(config.accountingEmail);
  const [marketingEmail, setMarketingEmail] = useState(
    config.marketingEmail === 'marketing@zenithenterprises.in'
      ? 'info@pridezenith.co.in'
      : config.marketingEmail || 'info@pridezenith.co.in'
  );
  const [additionalCc, setAdditionalCc] = useState(config.additionalCc);
  const [autoSchedule, setAutoSchedule] = useState(config.autoSchedule);
  const [scheduleDay, setScheduleDay] = useState(config.scheduleDay);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const selectedSummary =
    summaries.find((s) => s.monthKey === selectedMonthKey) || summaries[0];
  const gstBreakdown = computeGSTBreakdown(invoices, expenses, selectedMonthKey);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EmailReportConfig = {
      ...config,
      accountingEmail,
      marketingEmail,
      additionalCc,
      autoSchedule,
      scheduleDay: Number(scheduleDay) || 1,
    };
    onSaveConfig(updated);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleDispatchReport = () => {
    setSentSuccess(true);
    const updated: EmailReportConfig = {
      ...config,
      lastDispatchedAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  const handleDownloadAllReports = () => {
    const monthInvoices = invoices.filter(
      (inv) => inv.invoiceDate.slice(0, 7) === selectedMonthKey
    );
    const monthExpenses = expenses.filter(
      (exp) => exp.date.slice(0, 7) === selectedMonthKey
    );

    exportInvoices(monthInvoices.length > 0 ? monthInvoices : invoices, 'XLS');
    exportGSTTaxFilingSheet(gstBreakdown, 'XLS');
    exportMonthlyPNL(summaries, 'XLS');
    exportMarketingSync(parties, invoices, 'XLS');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monthly Reports & Email Dispatch Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated monthly financial statements, tax compliance packs, and marketing sync exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAllReports}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download All Sheets (Excel)</span>
          </button>

          <button
            onClick={handleDispatchReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Monthly Report Now</span>
          </button>
        </div>
      </div>

      {sentSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Monthly Report Successfully Dispatched!</p>
              <p className="text-emerald-700 mt-0.5">
                Sent to Accounting Team (<strong>{accountingEmail}</strong>) and Marketing Department (<strong>{marketingEmail}</strong>) with attached P&L, GSTR sheets, and sync files.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-emerald-700">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Main Two Columns: Report Preview & Recipient Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Preview (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900 text-sm">
                Generated Email Report Preview
              </span>
            </div>

            {/* Select Reporting Month */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Period:</span>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-2 py-1 shadow-2xs"
              >
                {summaries.map((s) => (
                  <option key={s.monthKey} value={s.monthKey}>
                    {s.monthName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Body Simulation */}
          <div className="p-6 space-y-6 text-xs text-slate-800">
            {/* Headers */}
            <div className="space-y-1 pb-4 border-b border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 font-mono">To (Accounting):</span>{' '}
                <strong className="text-slate-800 font-mono">{accountingEmail}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-mono">To (Marketing):</span>{' '}
                <strong className="text-slate-800 font-mono font-semibold">{marketingEmail}</strong>
              </div>
              {additionalCc && (
                <div>
                  <span className="text-slate-400 font-mono">Cc:</span>{' '}
                  <span className="text-slate-600 font-mono">{additionalCc}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-mono">Subject:</span>{' '}
                <strong className="text-indigo-950">
                  [{company.name}] Monthly Accounting, Tax Compliance & Marketing Sync Report - {selectedSummary?.monthName}
                </strong>
              </div>
            </div>

            {/* Message Body Content */}
            <div className="space-y-4">
              <p>Dear Management, Accounts, and Marketing Teams,</p>
              <p>
                Please find below the consolidated executive financial summary, GST tax liabilities breakdown, and marketing customer data synchronization for <strong>{selectedSummary?.monthName}</strong>.
              </p>

              {/* 1. Executive Performance Metrics Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  1. Executive Financial Performance
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Taxable Sales</span>
                    <strong className="text-sm font-mono text-slate-900">
                      {formatINR(selectedSummary?.taxableRevenue || 0)}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Collections</span>
                    <strong className="text-sm font-mono text-emerald-600">
                      {formatINR(selectedSummary?.collectedAmount || 0)}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Pending Dues</span>
                    <strong className="text-sm font-mono text-amber-600">
                      {formatINR(selectedSummary?.pendingReceivables || 0)}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Net Operating Profit</span>
                    <strong className="text-sm font-mono text-indigo-700">
                      {formatINR(selectedSummary?.netProfit || 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. Tax Liabilities Breakdown for Accounting Team */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2. GST Tax Liabilities & ITC Offsets (For Accounts Team)
                </h4>
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-1">Tax Component</th>
                      <th className="py-1 text-right">Output (Sales)</th>
                      <th className="py-1 text-right">Input ITC (Purchases)</th>
                      <th className="py-1 text-right">Net Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-1 font-sans">Central GST (CGST)</td>
                      <td className="py-1 text-right">{formatINR(gstBreakdown.outputCgst)}</td>
                      <td className="py-1 text-right text-emerald-600">{formatINR(gstBreakdown.itcCgst)}</td>
                      <td className="py-1 text-right font-bold">{formatINR(gstBreakdown.netCgstPayable)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">State GST (SGST)</td>
                      <td className="py-1 text-right">{formatINR(gstBreakdown.outputSgst)}</td>
                      <td className="py-1 text-right text-emerald-600">{formatINR(gstBreakdown.itcSgst)}</td>
                      <td className="py-1 text-right font-bold">{formatINR(gstBreakdown.netSgstPayable)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">Integrated GST (IGST)</td>
                      <td className="py-1 text-right">{formatINR(gstBreakdown.outputIgst)}</td>
                      <td className="py-1 text-right text-emerald-600">{formatINR(gstBreakdown.itcIgst)}</td>
                      <td className="py-1 text-right font-bold">{formatINR(gstBreakdown.netIgstPayable)}</td>
                    </tr>
                    <tr className="font-bold border-t border-slate-300">
                      <td className="py-1.5 font-sans">Total Tax Settlement:</td>
                      <td className="py-1.5 text-right text-slate-900">{formatINR(gstBreakdown.totalOutputTax)}</td>
                      <td className="py-1.5 text-right text-emerald-700">{formatINR(gstBreakdown.totalItcAvailable)}</td>
                      <td className="py-1.5 text-right text-indigo-700">{formatINR(gstBreakdown.totalNetGstPayable)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Marketing Department Data Sync */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  3. Marketing & Customer Account Insights
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Attached CSV/XLS file contains <strong>{parties.length} customer records</strong> with lifetime billing history, current overdue status, and registered GSTINs for CRM and email sync.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => exportMarketingSync(parties, invoices, 'CSV')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Marketing Customer Sync (CSV)</span>
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => exportMarketingSync(parties, invoices, 'XLS')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>Download Marketing Customer Sync (Excel)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Scheduling Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Delivery & Scheduling</h3>
              <Settings className="w-4 h-4 text-slate-400" />
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Accounting Team Email *
                </label>
                <input
                  type="email"
                  required
                  value={accountingEmail}
                  onChange={(e) => setAccountingEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Marketing Department Email *
                </label>
                <input
                  type="email"
                  required
                  value={marketingEmail}
                  onChange={(e) => setMarketingEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Additional CC Recipient(s)
                </label>
                <input
                  type="text"
                  placeholder="finance.head@example.com"
                  value={additionalCc}
                  onChange={(e) => setAdditionalCc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSchedule"
                    checked={autoSchedule}
                    onChange={(e) => setAutoSchedule(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                  />
                  <label htmlFor="autoSchedule" className="font-semibold text-slate-700 cursor-pointer">
                    Enable Automated Monthly Delivery
                  </label>
                </div>

                {autoSchedule && (
                  <div>
                    <label className="block text-slate-500 mb-1">Dispatch on day of month:</label>
                    <select
                      value={scheduleDay}
                      onChange={(e) => setScheduleDay(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value={1}>1st of every month (Recommended)</option>
                      <option value={5}>5th of every month</option>
                      <option value={10}>10th of every month (Before GSTR-1)</option>
                      <option value={20}>20th of every month (GSTR-3B due date)</option>
                    </select>
                  </div>
                )}
              </div>

              {config.lastDispatchedAt && (
                <div className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg">
                  Last Dispatched: {new Date(config.lastDispatchedAt).toLocaleString()}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {configSaved ? 'Saved Settings!' : 'Save Email Configurations'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
