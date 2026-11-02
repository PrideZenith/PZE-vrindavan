import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle2, FileText, BookOpen, ShieldCheck, PieChart, Users } from 'lucide-react';
import { Invoice, ExpenseRecord, Party, MonthlyFinancialSummary } from '../types';
import {
  exportInvoices,
  exportDetailedLineItems,
  exportExpenses,
  exportMonthlyPNL,
  exportGSTTaxFilingSheet,
  exportMarketingSync,
  ExportFormat,
} from '../utils/exportUtils';
import { computeGSTBreakdown, computeMonthlySummaries } from '../utils/financialCalculations';

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  expenses: ExpenseRecord[];
  parties: Party[];
}

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
  isOpen,
  onClose,
  invoices,
  expenses,
  parties,
}) => {
  const [format, setFormat] = useState<ExportFormat>('XLS');
  const [exportType, setExportType] = useState<string>('ALL');

  if (!isOpen) return null;

  const gstReport = computeGSTBreakdown(invoices, expenses);
  const pnlSummaries = computeMonthlySummaries(invoices, expenses);

  const handleExport = () => {
    switch (exportType) {
      case 'SALES_REGISTER':
        exportInvoices(invoices, format);
        break;
      case 'DETAILED_ITEMS':
        exportDetailedLineItems(invoices, format);
        break;
      case 'EXPENSES':
        exportExpenses(expenses, format);
        break;
      case 'GST_FILING':
        exportGSTTaxFilingSheet(gstReport, format);
        break;
      case 'PNL':
        exportMonthlyPNL(pnlSummaries, format);
        break;
      case 'MARKETING_SYNC':
        exportMarketingSync(parties, invoices, format);
        break;
      case 'ALL':
      default:
        exportInvoices(invoices, format);
        exportDetailedLineItems(invoices, format);
        exportExpenses(expenses, format);
        exportGSTTaxFilingSheet(gstReport, format);
        exportMonthlyPNL(pnlSummaries, format);
        exportMarketingSync(parties, invoices, format);
        break;
    }
    onClose();
  };

  const exportOptions = [
    {
      id: 'ALL',
      title: 'Complete Master Financial Package (All Datasets)',
      description: 'Exports Sales Register, Line Items, Expenses/ITC, GSTR Tax Sheet, P&L, and Marketing Sync simultaneously',
      icon: Download,
    },
    {
      id: 'SALES_REGISTER',
      title: 'Sales Register & Invoices (With Segregated GST)',
      description: 'Full customer invoice ledger with separate CGST, SGST, IGST, and payment aging',
      icon: FileText,
    },
    {
      id: 'DETAILED_ITEMS',
      title: 'Itemized Line Items (Site, Party, Qty, Rate, Tax, Total)',
      description: 'Granular breakdown of every line item across worksites, quantities, rates, and customized totals',
      icon: FileSpreadsheet,
    },
    {
      id: 'EXPENSES',
      title: 'Purchase & Expense Book Record (Input Tax Credit)',
      description: 'Vendor bills, worksites, and ITC claims ready for GSTR-2B reconciliation',
      icon: BookOpen,
    },
    {
      id: 'GST_FILING',
      title: 'GST Tax Compliance Sheet (GSTR-1 & GSTR-3B Format)',
      description: 'Outward liabilities, eligible ITC, net payable, and 0/5/12/18/28% slab summaries',
      icon: ShieldCheck,
    },
    {
      id: 'PNL',
      title: 'Monthly Profit & Loss Statements',
      description: 'Operating revenues, direct COGS, overheads, and monthly profit margins',
      icon: PieChart,
    },
    {
      id: 'MARKETING_SYNC',
      title: 'Marketing Department Customer Synchronization',
      description: 'Customer contact details, registered GSTINs, lifetime turnover, and payment status',
      icon: Users,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden text-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bulk Financial & Tax Data Export
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Export high-fidelity spreadsheets formatted for tax compliance and marketing synchronization
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Format Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Export File Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('XLS')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  format === 'XLS'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Microsoft Excel (.xls)</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Formatted spreadsheet with header colors, cell styles, and numeric columns.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormat('CSV')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  format === 'CSV'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Standard CSV (.csv)</span>
                  <Download className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Universal comma-separated text file with UTF-8 BOM encoding for seamless import.
                </p>
              </button>
            </div>
          </div>

          {/* Export Type Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Select Dataset to Export</label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {exportOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = exportType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setExportType(opt.id)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className={`font-semibold ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                        {opt.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200/60 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate & Download {format}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
