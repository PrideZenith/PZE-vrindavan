import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  BellRing,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Invoice, PaymentStatus, GSTType } from '../types';
import { formatINR, round2 } from '../utils/gstCalculations';
import { exportInvoices, exportDetailedLineItems } from '../utils/exportUtils';

interface InvoiceListProps {
  invoices: Invoice[];
  onNewInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onViewPrint: (invoice: Invoice) => void;
  onSendReminder: (invoice: Invoice) => void;
  onUpdateStatus: (id: string, status: PaymentStatus, amountPaid?: number) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onNewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onViewPrint,
  onSendReminder,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gstTypeFilter, setGstTypeFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(search.toLowerCase()) ||
      inv.site.toLowerCase().includes(search.toLowerCase()) ||
      (inv.partyGstin && inv.partyGstin.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    const matchesGst = gstTypeFilter === 'ALL' || inv.gstType === gstTypeFilter;

    return matchesSearch && matchesStatus && matchesGst;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvoices.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedInvoices = invoices.filter((inv) => selectedIds.includes(inv.id));
  const exportTarget = selectedInvoices.length > 0 ? selectedInvoices : filteredInvoices;

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Partial
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Bulk Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales Invoices & Receivables
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer billings with automated CGST, SGST, IGST calculations and customizable amounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'All'}
              </span>
            </button>

            {exportMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs text-slate-700"
                onMouseLeave={() => setExportMenuOpen(false)}
              >
                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Export Sales Register
                </div>
                <button
                  onClick={() => {
                    exportInvoices(exportTarget, 'CSV');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Invoices Summary (CSV)</span>
                  <span className="text-[10px] text-slate-400 font-mono">.csv</span>
                </button>
                <button
                  onClick={() => {
                    exportInvoices(exportTarget, 'XLS');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Invoices Summary (Excel)</span>
                  <span className="text-[10px] text-slate-400 font-mono">.xls</span>
                </button>

                <div className="border-t border-slate-100 my-1" />
                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Export Detailed Line Items
                </div>
                <button
                  onClick={() => {
                    exportDetailedLineItems(exportTarget, 'CSV');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Itemized Line Items (CSV)</span>
                  <span className="text-[10px] text-slate-400 font-mono">.csv</span>
                </button>
                <button
                  onClick={() => {
                    exportDetailedLineItems(exportTarget, 'XLS');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Itemized Line Items (Excel)</span>
                  <span className="text-[10px] text-slate-400 font-mono">.xls</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onNewInvoice}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, GSTIN, or site location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg shrink-0">
            {(['ALL', 'PENDING', 'OVERDUE', 'PAID', 'PARTIAL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* GST Type Filter */}
          <select
            value={gstTypeFilter}
            onChange={(e) => setGstTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shrink-0"
          >
            <option value="ALL">All GST Types</option>
            <option value="INTRA">Intrastate (CGST+SGST)</option>
            <option value="INTER">Interstate (IGST)</option>
          </select>
        </div>
      </div>

      {/* Selected Action Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedIds.length} invoice(s) selected</span>
            <span>·</span>
            <span>
              Total Value:{' '}
              <strong className="font-mono">
                {formatINR(
                  selectedInvoices.reduce((sum, i) => sum + i.grandTotal, 0)
                )}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedIds.forEach((id) => onUpdateStatus(id, 'PAID'));
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors cursor-pointer"
            >
              Mark as Paid
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredInvoices.length > 0 &&
                      selectedIds.length === filteredInvoices.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3 px-3">Invoice # / Date</th>
                <th className="py-3 px-3">Customer & GSTIN</th>
                <th className="py-3 px-3">Site / Project</th>
                <th className="py-3 px-3 text-right">Taxable Amt</th>
                <th className="py-3 px-3 text-right">CGST</th>
                <th className="py-3 px-3 text-right">SGST</th>
                <th className="py-3 px-3 text-right">IGST</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No invoices match your search or filter</p>
                    <button
                      onClick={onNewInvoice}
                      className="mt-2 text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
                    >
                      + Create a new invoice
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      selectedIds.includes(inv.id) ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={() => handleToggleSelect(inv.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => onViewPrint(inv)}
                        className="font-mono font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                      >
                        {inv.invoiceNumber}
                      </button>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {inv.invoiceDate} (Due: {inv.dueDate})
                      </div>
                    </td>
                    <td className="py-3.5 px-3 max-w-[200px]">
                      <div className="font-medium text-slate-900 truncate">{inv.partyName}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {inv.partyGstin || 'Unregistered'} · {inv.supplyState}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 max-w-[150px]">
                      <span className="text-slate-700 truncate block">{inv.site}</span>
                      <span className="text-[10px] text-slate-400">
                        {inv.gstType === 'INTRA' ? 'Intra (27)' : `Inter (${inv.supplyStateCode})`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {formatINR(inv.subtotal)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {inv.totalCgst > 0 ? formatINR(inv.totalCgst) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {inv.totalSgst > 0 ? formatINR(inv.totalSgst) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {inv.totalIgst > 0 ? formatINR(inv.totalIgst) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        {formatINR(inv.grandTotal)}
                      </span>
                      {inv.balanceDue > 0 && inv.amountPaid > 0 && (
                        <span className="text-[10px] font-mono text-amber-600">
                          Due: {formatINR(inv.balanceDue)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {getStatusBadge(inv.paymentStatus)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewPrint(inv)}
                          title="View / Print Tax Invoice"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => onSendReminder(inv)}
                            title="Send Late Payment Reminder"
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditInvoice(inv)}
                          title="Edit Invoice"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          title="Delete Invoice"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Aggregate Totals */}
        <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-500">
            Showing <strong className="text-slate-900">{filteredInvoices.length}</strong> of{' '}
            <strong className="text-slate-900">{invoices.length}</strong> total invoices
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>
              Taxable:{' '}
              <strong className="text-slate-900">
                {formatINR(filteredInvoices.reduce((sum, i) => sum + i.subtotal, 0))}
              </strong>
            </span>
            <span>
              GST:{' '}
              <strong className="text-slate-900">
                {formatINR(filteredInvoices.reduce((sum, i) => sum + i.totalTax, 0))}
              </strong>
            </span>
            <span>
              Total Invoiced:{' '}
              <strong className="text-indigo-600 text-sm font-bold">
                {formatINR(filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0))}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
