import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Info, Check, AlertCircle } from 'lucide-react';
import {
  Invoice,
  InvoiceLineItem,
  CompanyProfile,
  Party,
  GSTType,
  PaymentStatus,
  PaymentMode,
} from '../types';
import {
  INDIAN_STATES,
  GST_RATES,
  determineGstType,
  calculateLineItemTaxes,
  calculateInvoiceTotals,
  formatINR,
  round2,
} from '../utils/gstCalculations';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  company: CompanyProfile;
  parties: Party[];
  existingInvoice?: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  company,
  parties,
  existingInvoice,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyGstin, setPartyGstin] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyState, setPartyState] = useState('');
  const [partyStateCode, setPartyStateCode] = useState('');
  const [site, setSite] = useState('Site A - Main Facility');
  const [supplyState, setSupplyState] = useState('');
  const [supplyStateCode, setSupplyStateCode] = useState('');
  const [gstType, setGstType] = useState<GSTType>('INTRA');
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days');
  const [poNumber, setPoNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Line items state
  const [items, setItems] = useState<InvoiceLineItem[]>([]);

  // Initialize or reset form
  useEffect(() => {
    if (existingInvoice) {
      setInvoiceNumber(existingInvoice.invoiceNumber);
      setInvoiceDate(existingInvoice.invoiceDate);
      setDueDate(existingInvoice.dueDate);
      setSelectedPartyId(existingInvoice.partyId);
      setPartyName(existingInvoice.partyName);
      setPartyGstin(existingInvoice.partyGstin || '');
      setPartyAddress(existingInvoice.partyAddress);
      setPartyState(existingInvoice.partyState);
      setPartyStateCode(existingInvoice.partyStateCode);
      setSite(existingInvoice.site);
      setSupplyState(existingInvoice.supplyState);
      setSupplyStateCode(existingInvoice.supplyStateCode);
      setGstType(existingInvoice.gstType);
      setPaymentTerms(existingInvoice.paymentTerms);
      setPoNumber(existingInvoice.poNumber || '');
      setPaymentStatus(existingInvoice.paymentStatus);
      setPaymentMode(existingInvoice.paymentMode || 'BANK_TRANSFER');
      setAmountPaid(existingInvoice.amountPaid || 0);
      setNotes(existingInvoice.notes || '');
      setItems(existingInvoice.items);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 15);
      const dueStr = due.toISOString().split('T')[0];

      const defaultParty = parties[0] || null;
      const initialGstType = defaultParty
        ? determineGstType(company.stateCode, defaultParty.stateCode)
        : 'INTRA';

      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setInvoiceDate(today);
      setDueDate(dueStr);
      setPaymentTerms('Net 15 Days');
      setPoNumber('');
      setPaymentStatus('PENDING');
      setPaymentMode('BANK_TRANSFER');
      setAmountPaid(0);
      setNotes('Thank you for your business. Please quote the invoice number during payment.');

      if (defaultParty) {
        setSelectedPartyId(defaultParty.id);
        setPartyName(defaultParty.name);
        setPartyGstin(defaultParty.gstin || '');
        setPartyAddress(`${defaultParty.address}, ${defaultParty.city}`);
        setPartyState(defaultParty.state);
        setPartyStateCode(defaultParty.stateCode);
        setSite(defaultParty.defaultSite || 'Site A - Main Facility');
        setSupplyState(defaultParty.state);
        setSupplyStateCode(defaultParty.stateCode);
        setGstType(initialGstType);
      } else {
        setSelectedPartyId('');
        setPartyName('');
        setPartyGstin('');
        setPartyAddress('');
        setPartyState(company.state);
        setPartyStateCode(company.stateCode);
        setSite('Site A - Main Facility');
        setSupplyState(company.state);
        setSupplyStateCode(company.stateCode);
        setGstType('INTRA');
      }

      // Default first line item
      const initialItemTaxes = calculateLineItemTaxes(10, 1500, 18, initialGstType);
      setItems([
        {
          id: 'item-' + Date.now(),
          site: defaultParty?.defaultSite || 'Site A - Main Facility',
          party: defaultParty?.name || 'Default Customer',
          description: 'Industrial Components / Engineering Services',
          hsnSac: '8479',
          quantity: 10,
          unit: 'pcs',
          rate: 1500,
          taxRate: 18,
          ...initialItemTaxes,
        },
      ]);
    }
  }, [existingInvoice, isOpen]);

  // Handle party selection change
  const handlePartyChange = (partyId: string) => {
    setSelectedPartyId(partyId);
    const found = parties.find((p) => p.id === partyId);
    if (found) {
      setPartyName(found.name);
      setPartyGstin(found.gstin || '');
      setPartyAddress(`${found.address}, ${found.city} - ${found.pincode}`);
      setPartyState(found.state);
      setPartyStateCode(found.stateCode);
      setSupplyState(found.state);
      setSupplyStateCode(found.stateCode);

      const determined = determineGstType(company.stateCode, found.stateCode);
      setGstType(determined);

      // Recalculate line items with new GST type
      setItems((prev) =>
        prev.map((item) => {
          const taxes = calculateLineItemTaxes(
            item.quantity,
            item.rate,
            item.taxRate,
            determined,
            item.isTotalCustomized ? item.totalAmount : undefined
          );
          return {
            ...item,
            party: found.name,
            site: found.defaultSite || item.site,
            ...taxes,
          };
        })
      );
    }
  };

  // Handle Place of Supply Change (Interstate vs Intrastate)
  const handleSupplyStateChange = (stateCode: string) => {
    const foundState = INDIAN_STATES.find((s) => s.code === stateCode);
    if (!foundState) return;

    setSupplyState(foundState.name);
    setSupplyStateCode(foundState.code);

    const determined = determineGstType(company.stateCode, foundState.code);
    setGstType(determined);

    // Update line items taxes for the new GST type
    setItems((prev) =>
      prev.map((item) => {
        const taxes = calculateLineItemTaxes(
          item.quantity,
          item.rate,
          item.taxRate,
          determined,
          item.isTotalCustomized ? item.totalAmount : undefined
        );
        return {
          ...item,
          ...taxes,
        };
      })
    );
  };

  // Direct toggle between Intrastate (18%), Interstate (9% SGST + 9% CGST), and IGST (18%)
  const handleGstTypeToggle = (newGstType: GSTType, forcedCategory?: 'SGST_CGST' | 'IGST' | 'AUTO') => {
    setGstType(newGstType);
    setItems((prev) =>
      prev.map((item) => {
        const cat = forcedCategory || (newGstType === 'INTER' ? 'SGST_CGST' : 'AUTO');
        const taxes = calculateLineItemTaxes(
          item.quantity,
          item.rate,
          item.taxRate,
          newGstType,
          item.isTotalCustomized ? item.totalAmount : undefined,
          cat
        );
        return {
          ...item,
          ...taxes,
        };
      })
    );
  };

  // Add line item
  const handleAddItem = () => {
    const taxes = calculateLineItemTaxes(1, 1000, 18, gstType);
    const newItem: InvoiceLineItem = {
      id: 'item-' + Date.now() + Math.random().toString(36).substring(2, 6),
      site: site,
      party: partyName,
      description: '',
      hsnSac: '9983',
      quantity: 1,
      unit: 'pcs',
      rate: 1000,
      taxRate: 18,
      ...taxes,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Remove line item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Change tax option with explicit IGST 18% or SGST 9% + CGST 9%
  const handleTaxOptionChange = (id: string, compositeValue: string) => {
    let newCategory: 'SGST_CGST' | 'IGST' | 'AUTO' = 'AUTO';
    let newRate = 18;

    if (compositeValue === 'IGST_18') {
      newCategory = 'IGST';
      newRate = 18;
    } else if (compositeValue === 'SGST_CGST_18') {
      newCategory = 'SGST_CGST';
      newRate = 18;
    } else if (compositeValue.startsWith('IGST_')) {
      newCategory = 'IGST';
      newRate = Number(compositeValue.replace('IGST_', ''));
    } else if (compositeValue.startsWith('AUTO_')) {
      newCategory = 'AUTO';
      newRate = Number(compositeValue.replace('AUTO_', ''));
    } else {
      newRate = Number(compositeValue);
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const taxes = calculateLineItemTaxes(
          item.quantity,
          item.rate,
          newRate,
          gstType,
          item.isTotalCustomized ? item.totalAmount : undefined,
          newCategory
        );
        return {
          ...item,
          taxRate: newRate,
          ...taxes,
        };
      })
    );
  };

  // Update line item property
  const handleUpdateItem = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number | boolean
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // If user changed quantity, rate, or taxRate -> forward compute
        if (field === 'quantity' || field === 'rate' || field === 'taxRate') {
          const taxes = calculateLineItemTaxes(
            Number(field === 'quantity' ? value : item.quantity),
            Number(field === 'rate' ? value : item.rate),
            Number(field === 'taxRate' ? value : item.taxRate),
            gstType,
            undefined,
            item.taxCategory
          );
          return {
            ...updated,
            ...taxes,
            isTotalCustomized: false, // reset override when changing base variables
          };
        }

        // If user directly customized the Total Amount (User requested: "total amount need customize so i can chnge")
        if (field === 'totalAmount') {
          const customTotal = Number(value) || 0;
          const taxes = calculateLineItemTaxes(
            item.quantity,
            item.rate,
            item.taxRate,
            gstType,
            customTotal,
            item.taxCategory
          );
          return {
            ...updated,
            ...taxes,
            isTotalCustomized: true,
          };
        }

        return updated;
      })
    );
  };

  // Calculate overall totals
  const totals = calculateInvoiceTotals(items);
  const balanceDue = round2(totals.grandTotal - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) {
      alert('Please specify customer / party name');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const effectiveStatus: PaymentStatus =
      amountPaid >= totals.grandTotal
        ? 'PAID'
        : amountPaid > 0
        ? 'PARTIAL'
        : paymentStatus;

    const savedInvoice: Invoice = {
      id: existingInvoice ? existingInvoice.id : 'inv-' + Date.now(),
      invoiceNumber,
      invoiceDate,
      dueDate,
      partyId: selectedPartyId || 'custom-party',
      partyName,
      partyGstin: partyGstin.trim() || undefined,
      partyState,
      partyStateCode,
      partyAddress,
      site,
      supplyState,
      supplyStateCode,
      gstType,
      poNumber: poNumber.trim() || undefined,
      paymentTerms,
      items,
      subtotal: totals.subtotal,
      totalCgst: totals.totalCgst,
      totalSgst: totals.totalSgst,
      totalIgst: totals.totalIgst,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      amountPaid: Number(amountPaid) || 0,
      balanceDue: balanceDue > 0 ? balanceDue : 0,
      paymentStatus: effectiveStatus,
      paymentMode,
      notes,
      isRecurring: existingInvoice ? existingInvoice.isRecurring : false,
      recurringId: existingInvoice?.recurringId,
      createdAt: existingInvoice ? existingInvoice.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedInvoice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {existingInvoice ? `Edit Invoice: ${existingInvoice.invoiceNumber}` : 'Create GST Tax Invoice'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>GSTIN: {company.gstin}</span>
              <span>·</span>
              <div className="inline-flex items-center p-0.5 bg-slate-200/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleGstTypeToggle('INTRA')}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                    gstType === 'INTRA' && items[0]?.taxCategory !== 'IGST'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Intrastate (18%)
                </button>
                <button
                  type="button"
                  onClick={() => handleGstTypeToggle('INTER', 'SGST_CGST')}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                    gstType === 'INTER' && items[0]?.taxCategory !== 'IGST'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Interstate (9% SGST + 9% CGST)
                </button>
                <button
                  type="button"
                  onClick={() => handleGstTypeToggle('INTER', 'IGST')}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                    items[0]?.taxCategory === 'IGST'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  IGST (18%)
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Invoice Meta & Place of Supply */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Date *</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PO / Ref Number</label>
              <input
                type="text"
                placeholder="e.g. PO-89201"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Customer / Party Details & Worksite */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Party Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Customer / Party *</label>
                <span className="text-[11px] text-slate-400">Select or enter</span>
              </div>
              <select
                value={selectedPartyId}
                onChange={(e) => handlePartyChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 mb-2"
              >
                <option value="">-- Choose Existing Party --</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.state} - {p.stateCode})
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Customer Business Name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* GSTIN & State */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Party GSTIN (if registered)</label>
              <input
                type="text"
                placeholder="27AABCV8765A1Z4"
                value={partyGstin}
                onChange={(e) => setPartyGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 font-mono text-xs uppercase bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 mb-2"
              />
              <label className="block font-semibold text-slate-700 mb-1">Place of Supply (POS) *</label>
              <select
                value={supplyStateCode}
                onChange={(e) => handleSupplyStateChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.code} - {st.name} {st.code === company.stateCode ? '(Company Home State)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Site / Project Location & Address */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Worksite / Branch / Project *</label>
              <input
                type="text"
                required
                placeholder="e.g. Site A - Pune Plant"
                value={site}
                onChange={(e) => {
                  setSite(e.target.value);
                  // Update items site if default
                  setItems((prev) => prev.map((itm) => ({ ...itm, site: e.target.value })));
                }}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 mb-2"
              />
              <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
              <input
                type="text"
                placeholder="Plot / Street / City"
                value={partyAddress}
                onChange={(e) => setPartyAddress(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 3: Customizable Line Items (Site, Party, Qty, Rate, Tax, Customizable Total) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Line Items & Taxes</span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] text-slate-500">
                  Rate × Qty + GST. Total amount is directly customizable.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1 font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                >
                  {/* Row 1: Site, Party, Description, HSN */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-500 font-medium">Worksite / Location</label>
                      <input
                        type="text"
                        placeholder="Worksite"
                        value={item.site}
                        onChange={(e) => handleUpdateItem(item.id, 'site', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-500 font-medium">Party / Recipient</label>
                      <input
                        type="text"
                        placeholder="Party"
                        value={item.party}
                        onChange={(e) => handleUpdateItem(item.id, 'party', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-xs"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-500 font-medium">Item Description</label>
                      <input
                        type="text"
                        required
                        placeholder="Product / Service Description"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 font-medium">HSN / SAC</label>
                      <input
                        type="text"
                        placeholder="8479"
                        value={item.hsnSac}
                        onChange={(e) => handleUpdateItem(item.id, 'hsnSac', e.target.value)}
                        className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded-md text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 2: Qty, Unit, Rate, Tax Rate (%), Taxable, Tax Amount, Total Amount */}
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-end pt-1 border-t border-slate-200/60">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 font-medium">Quantity</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded-md text-xs text-right"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] text-slate-500 font-medium">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                        className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded-md text-xs"
                      >
                        <option value="pcs">pcs</option>
                        <option value="sets">sets</option>
                        <option value="month">month</option>
                        <option value="hrs">hrs</option>
                        <option value="kgs">kgs</option>
                        <option value="nos">nos</option>
                        <option value="job">job</option>
                        <option value="pkg">pkg</option>
                        <option value="Sites">Sites</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 font-medium">Rate (INR)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                        className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded-md text-xs text-right"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-indigo-700 whitespace-nowrap">
                        {item.taxCategory === 'IGST'
                          ? 'IGST 18%'
                          : (item.taxCategory === 'SGST_CGST'
                              ? '9% SGST + 9% CGST'
                              : '9% SGST + 9% CGST / IGST 18%')}
                      </label>
                      <select
                        value={
                          item.taxCategory === 'IGST'
                            ? `IGST_${item.taxRate}`
                            : (item.taxCategory === 'SGST_CGST'
                                ? `SGST_CGST_${item.taxRate}`
                                : (item.taxRate === 18 ? (gstType === 'INTER' ? 'SGST_CGST_18' : 'IGST_18') : `AUTO_${item.taxRate}`))
                        }
                        onChange={(e) => handleTaxOptionChange(item.id, e.target.value)}
                        className="w-full px-1.5 py-1 font-mono bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="SGST_CGST_18">9% SGST + 9% CGST (18%)</option>
                        <option value="IGST_18">IGST 18%</option>
                        <option value="AUTO_18">18% Standard Tax</option>
                        <option value="AUTO_12">12% Tax</option>
                        <option value="AUTO_5">5% Tax</option>
                        <option value="AUTO_28">28% Tax</option>
                        <option value="AUTO_0">0% (Exempt)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <label className="block text-[10px] text-slate-500 font-medium">Taxable</label>
                      <span className="block py-1 font-mono text-slate-700 font-medium text-xs">
                        {formatINR(item.taxableAmount)}
                      </span>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <label className="block text-[10px] text-slate-500 font-medium">Tax Amt</label>
                      <span className="block py-1 font-mono text-indigo-700 font-bold text-xs">
                        {formatINR(item.totalTax)}
                      </span>
                    </div>

                    {/* Customizable Total Amount */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-indigo-700">
                          Total Amount
                        </label>
                        {item.isTotalCustomized && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-semibold">
                            Manual
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={item.totalAmount}
                        onChange={(e) => handleUpdateItem(item.id, 'totalAmount', e.target.value)}
                        className={`w-full px-2 py-1 font-mono font-bold text-xs rounded-md text-right border ${
                          item.isTotalCustomized
                            ? 'bg-amber-50/70 border-amber-400 text-amber-900'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length <= 1}
                        title="Delete line item"
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Totals Summary & Payment Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Left: Notes & Payment status */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="PENDING">Pending (Unpaid)</option>
                    <option value="PAID">Fully Paid</option>
                    <option value="PARTIAL">Partially Paid</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Paid (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountPaid}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAmountPaid(val);
                      if (val >= totals.grandTotal) {
                        setPaymentStatus('PAID');
                      } else if (val > 0) {
                        setPaymentStatus('PARTIAL');
                      }
                    }}
                    className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded-lg text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Terms & Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment notes, UTR ref, or bank details..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg resize-none"
                />
              </div>
            </div>

            {/* Right: Tax Breakup & Grand Total Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total Amount (Taxable Subtotal):</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(totals.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Add: SGST@9%:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {totals.totalSgst > 0 ? formatINR(totals.totalSgst) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Add: CGST@9%:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {totals.totalCgst > 0 ? formatINR(totals.totalCgst) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Add: IGST@18%:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {totals.totalIgst > 0 ? formatINR(totals.totalIgst) : (totals.totalTax > 0 && totals.totalSgst === 0 ? formatINR(totals.totalTax) : '-')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total Tax:</span>
                <span className="font-mono text-slate-900">{formatINR(totals.totalTax)}</span>
              </div>

              {totals.roundOff !== 0 && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Round Off:</span>
                  <span className="font-mono">{formatINR(totals.roundOff)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-700 text-base">{formatINR(totals.grandTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Balance Due:</span>
                <span className={`font-mono font-semibold ${balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {formatINR(balanceDue > 0 ? balanceDue : 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {existingInvoice ? 'Update Invoice' : 'Generate & Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
