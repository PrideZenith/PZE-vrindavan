import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Building2,
  CheckCircle,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategory, PaymentMode, CompanyProfile, Party } from '../types';
import {
  INDIAN_STATES,
  GST_RATES,
  determineGstType,
  calculateLineItemTaxes,
  formatINR,
  round2,
} from '../utils/gstCalculations';
import { exportExpenses } from '../utils/exportUtils';

interface BookRecordViewProps {
  expenses: ExpenseRecord[];
  company: CompanyProfile;
  parties: Party[];
  onSaveExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Raw Materials',
  'Contractor & Labour',
  'Logistics & Freight',
  'Office Rent & Facilities',
  'Electricity & Utilities',
  'Software & Subscriptions',
  'Marketing & Advertising',
  'Professional & Legal',
  'Equipment & Maintenance',
  'Travel & Fuel',
  'Misc Expenses',
];

export const BookRecordView: React.FC<BookRecordViewProps> = ({
  expenses,
  company,
  parties,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  // Form states for Add/Edit Expense
  const [expenseNumber, setExpenseNumber] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Raw Materials');
  const [vendorName, setVendorName] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [vendorStateCode, setVendorStateCode] = useState('27');
  const [site, setSite] = useState('Site A - Pune Plant');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [totalAmount, setTotalAmount] = useState<number>(1180);
  const [isTotalCustomized, setIsTotalCustomized] = useState(false);
  const [isItcEligible, setIsItcEligible] = useState(true);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Extract all sites for filter
  const allSites = Array.from(new Set(expenses.map((e) => e.site))).filter(Boolean);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.expenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      exp.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.site.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || exp.category === categoryFilter;
    const matchesSite = siteFilter === 'ALL' || exp.site === siteFilter;

    return matchesSearch && matchesCategory && matchesSite;
  });

  const totalExpenseVal = round2(filteredExpenses.reduce((sum, e) => sum + e.totalAmount, 0));
  const totalItcVal = round2(
    filteredExpenses.filter((e) => e.isItcEligible).reduce((sum, e) => sum + e.totalTax, 0)
  );

  const openAddModal = () => {
    setEditingExpense(null);
    setExpenseNumber(`EXP-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Raw Materials');
    setVendorName('');
    setVendorGstin('');
    setVendorStateCode(company.stateCode);
    setSite('Site A - Pune Plant');
    setDescription('');
    setQuantity(1);
    setRate(5000);
    setTaxRate(18);
    setTotalAmount(5900);
    setIsTotalCustomized(false);
    setIsItcEligible(true);
    setPaymentMode('BANK_TRANSFER');
    setPaymentStatus('PAID');
    setReferenceNumber('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setExpenseNumber(exp.expenseNumber);
    setDate(exp.date);
    setCategory(exp.category);
    setVendorName(exp.vendorName);
    setVendorGstin(exp.vendorGstin || '');
    setVendorStateCode(exp.vendorStateCode);
    setSite(exp.site);
    setDescription(exp.description);
    setQuantity(exp.quantity);
    setRate(exp.rate);
    setTaxRate(exp.taxRate);
    setTotalAmount(exp.totalAmount);
    setIsTotalCustomized(!!exp.isTotalCustomized);
    setIsItcEligible(exp.isItcEligible);
    setPaymentMode(exp.paymentMode);
    setPaymentStatus(exp.paymentStatus);
    setReferenceNumber(exp.referenceNumber || '');
    setNotes(exp.notes || '');
    setModalOpen(true);
  };

  // Live tax recalculation inside expense modal
  const handleQtyRateTaxChange = (newQty: number, newRate: number, newTaxPct: number) => {
    setQuantity(newQty);
    setRate(newRate);
    setTaxRate(newTaxPct);
    const gstType = determineGstType(company.stateCode, vendorStateCode);
    const taxes = calculateLineItemTaxes(newQty, newRate, newTaxPct, gstType);
    setTotalAmount(taxes.totalAmount);
    setIsTotalCustomized(false);
  };

  const handleTotalAmountChange = (newTotal: number) => {
    setTotalAmount(newTotal);
    setIsTotalCustomized(true);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !description.trim()) {
      alert('Please fill in vendor name and description');
      return;
    }

    const vendorStateObj = INDIAN_STATES.find((s) => s.code === vendorStateCode) || {
      name: company.state,
      code: company.stateCode,
    };
    const gstType = determineGstType(company.stateCode, vendorStateCode);
    const computed = calculateLineItemTaxes(
      quantity,
      rate,
      taxRate,
      gstType,
      isTotalCustomized ? totalAmount : undefined
    );

    const record: ExpenseRecord = {
      id: editingExpense ? editingExpense.id : 'exp-' + Date.now(),
      expenseNumber,
      date,
      category,
      vendorName,
      vendorGstin: vendorGstin.trim() ? vendorGstin.trim().toUpperCase() : undefined,
      vendorState: vendorStateObj.name,
      vendorStateCode: vendorStateObj.code,
      site,
      description,
      quantity,
      rate,
      taxRate,
      taxableAmount: computed.taxableAmount,
      gstType,
      cgstAmount: computed.cgstAmount,
      sgstAmount: computed.sgstAmount,
      igstAmount: computed.igstAmount,
      totalTax: computed.totalTax,
      totalAmount: computed.totalAmount,
      isTotalCustomized,
      isItcEligible,
      paymentMode,
      paymentStatus,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSaveExpense(record);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Book Record & Business Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            General purchase ledger with Input Tax Credit (ITC) tracking, site allocation, and customized totals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportExpenses(filteredExpenses, 'CSV')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportExpenses(filteredExpenses, 'XLS')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Book Expenses</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatINR(totalExpenseVal)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{filteredExpenses.length} entries recorded</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Input Tax Credit (ITC Claimable)</p>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {formatINR(totalItcVal)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Offsets sales tax liability</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Active Worksites Tracked</p>
          <p className="text-xl font-bold font-mono text-indigo-600 mt-1">
            {allSites.length} Sites
          </p>
          <p className="text-xs text-slate-400 mt-1">Multi-site cost accounting</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expense #, vendor, description, or worksite..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Worksites</option>
            {allSites.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Voucher / Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Vendor & GSTIN</th>
                <th className="py-3 px-3">Worksite / Site</th>
                <th className="py-3 px-3 text-right">Taxable</th>
                <th className="py-3 px-3 text-right">GST %</th>
                <th className="py-3 px-3 text-right">CGST</th>
                <th className="py-3 px-3 text-right">SGST</th>
                <th className="py-3 px-3 text-right">IGST</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-center">ITC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No expenses found matching filter</p>
                    <button
                      onClick={openAddModal}
                      className="mt-2 text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
                    >
                      + Record a new expense
                    </button>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{exp.expenseNumber}</span>
                      <span className="text-[11px] text-slate-400">{exp.date}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-800">{exp.category}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{exp.description}</span>
                    </td>
                    <td className="py-3.5 px-3 max-w-[180px]">
                      <div className="font-medium text-slate-900 truncate">{exp.vendorName}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {exp.vendorGstin || 'Unregistered'} · {exp.vendorState}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-slate-700 truncate block max-w-[130px]">{exp.site}</span>
                      <span className="text-[10px] text-slate-400">{exp.paymentMode}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {formatINR(exp.taxableAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {exp.taxRate}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {exp.cgstAmount > 0 ? formatINR(exp.cgstAmount) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {exp.sgstAmount > 0 ? formatINR(exp.sgstAmount) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {exp.igstAmount > 0 ? formatINR(exp.igstAmount) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        {formatINR(exp.totalAmount)}
                      </span>
                      {exp.isTotalCustomized && (
                        <span className="text-[9px] text-amber-700 font-semibold block">Customized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {exp.isItcEligible ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ITC Yes
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
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
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {editingExpense ? `Edit Expense: ${editingExpense.expenseNumber}` : 'Record Business Expense Voucher'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Voucher Number *</label>
                  <input
                    type="text"
                    required
                    value={expenseNumber}
                    onChange={(e) => setExpenseNumber(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vendor & State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Party *</label>
                  <input
                    type="text"
                    required
                    placeholder="Vendor Name"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor GSTIN</label>
                  <input
                    type="text"
                    placeholder="27AACCM9911K1Z2"
                    value={vendorGstin}
                    onChange={(e) => setVendorGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 font-mono uppercase bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor State (POS)</label>
                  <select
                    value={vendorStateCode}
                    onChange={(e) => setVendorStateCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Worksite & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Worksite / Site *</label>
                  <input
                    type="text"
                    required
                    placeholder="Site A - Pune Plant"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Steel sheets, factory rent, or courier charges"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Qty, Rate, Tax Rate, and Customizable Total Amount */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={quantity}
                    onChange={(e) =>
                      handleQtyRateTaxChange(Number(e.target.value), rate, taxRate)
                    }
                    className="w-full px-2 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={rate}
                    onChange={(e) =>
                      handleQtyRateTaxChange(quantity, Number(e.target.value), taxRate)
                    }
                    className="w-full px-2 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Tax %</label>
                  <select
                    value={taxRate}
                    onChange={(e) =>
                      handleQtyRateTaxChange(quantity, rate, Number(e.target.value))
                    }
                    className="w-full px-2 py-1.5 font-mono bg-white border border-slate-300 rounded-lg"
                  >
                    {GST_RATES.map((r) => (
                      <option key={r} value={r}>
                        {r}%
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-indigo-700">Total (Customizable)</label>
                    {isTotalCustomized && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-semibold">
                        Manual
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={totalAmount}
                    onChange={(e) => handleTotalAmountChange(Number(e.target.value))}
                    className={`w-full px-2 py-1.5 font-mono font-bold border rounded-lg text-right ${
                      isTotalCustomized
                        ? 'bg-amber-50 border-amber-400 text-amber-900'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* ITC & Payment Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="itcEligible"
                    checked={isItcEligible}
                    onChange={(e) => setIsItcEligible(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="itcEligible" className="font-semibold text-slate-700 cursor-pointer">
                    Eligible for Input Tax Credit (ITC)
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bill / Invoice Reference #</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-4491"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
