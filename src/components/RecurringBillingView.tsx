import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { RecurringSubscription, Party, CompanyProfile, Invoice } from '../types';
import { formatINR, round2, determineGstType, calculateLineItemTaxes } from '../utils/gstCalculations';

interface RecurringBillingViewProps {
  recurring: RecurringSubscription[];
  parties: Party[];
  company: CompanyProfile;
  onSaveSubscription: (sub: RecurringSubscription) => void;
  onDeleteSubscription: (id: string) => void;
  onTriggerGenerateInvoice: (sub: RecurringSubscription) => void;
}

export const RecurringBillingView: React.FC<RecurringBillingViewProps> = ({
  recurring,
  parties,
  company,
  onSaveSubscription,
  onDeleteSubscription,
  onTriggerGenerateInvoice,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [site, setSite] = useState('Site B - Bengaluru Hub');
  const [frequency, setFrequency] = useState<'MONTHLY' | 'QUARTERLY' | 'WEEKLY' | 'ANNUAL'>('MONTHLY');
  const [amount, setAmount] = useState<number>(50000);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [startDate, setStartDate] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [description, setDescription] = useState('');
  const [hsnSac, setHsnSac] = useState('9983');
  const [autoSendInvoice, setAutoSendInvoice] = useState(true);

  const openAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextStr = nextMonth.toISOString().split('T')[0];

    setTitle('');
    setSelectedPartyId(parties[0]?.id || '');
    setSite(parties[0]?.defaultSite || 'Site B - Bengaluru Hub');
    setFrequency('MONTHLY');
    setAmount(45000);
    setTaxRate(18);
    setStartDate(today);
    setNextBillingDate(nextStr);
    setDescription('Monthly Managed Services & Software Maintenance Agreement');
    setHsnSac('9983');
    setAutoSendInvoice(true);
    setModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const party = parties.find((p) => p.id === selectedPartyId);
    if (!party) {
      alert('Please select a customer party');
      return;
    }

    const newSub: RecurringSubscription = {
      id: 'rec-' + Date.now(),
      title,
      partyId: party.id,
      partyName: party.name,
      partyEmail: party.email,
      site,
      frequency,
      amount: Number(amount) || 0,
      taxRate: Number(taxRate) || 18,
      startDate,
      nextBillingDate,
      status: 'ACTIVE',
      description,
      hsnSac,
      autoSendInvoice,
      totalInvoicesGenerated: 0,
    };

    onSaveSubscription(newSub);
    setModalOpen(false);
  };

  const toggleStatus = (sub: RecurringSubscription) => {
    onSaveSubscription({
      ...sub,
      status: sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
    });
  };

  const totalMonthlyRunRate = round2(
    recurring
      .filter((s) => s.status === 'ACTIVE')
      .reduce((sum, s) => {
        let monthlyEquiv = s.amount;
        if (s.frequency === 'QUARTERLY') monthlyEquiv = s.amount / 3;
        if (s.frequency === 'ANNUAL') monthlyEquiv = s.amount / 12;
        if (s.frequency === 'WEEKLY') monthlyEquiv = s.amount * 4.33;
        return sum + monthlyEquiv;
      }, 0)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recurring Billing & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automate periodic invoicing, retainer contracts, and subscription renewals with next billing tracking
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Monthly Recurring Revenue (MRR)</p>
          <p className="text-xl font-bold font-mono text-indigo-600 mt-1">
            {formatINR(totalMonthlyRunRate)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Normalized monthly retainer run-rate</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Active Subscriptions</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {recurring.filter((s) => s.status === 'ACTIVE').length} of {recurring.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Live customer billing schedules</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Auto-Billing Engine</p>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
            Ready
          </p>
          <p className="text-xs text-slate-400 mt-1">Automated tax invoices on due date</p>
        </div>
      </div>

      {/* Subscription Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurring.map((sub) => {
          const totalWithTax = round2(sub.amount * (1 + sub.taxRate / 100));
          return (
            <div
              key={sub.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                sub.status === 'ACTIVE' ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                      {sub.frequency} CONTRACT
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                      {sub.title}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    sub.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer:</span>
                    <strong className="text-slate-900 truncate max-w-[160px]">{sub.partyName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Worksite / Site:</span>
                    <span className="text-slate-800">{sub.site}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billing Base:</span>
                    <span className="font-mono text-slate-900">{formatINR(sub.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST ({sub.taxRate}%):</span>
                    <span className="font-mono text-slate-900">{formatINR(totalWithTax - sub.amount)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
                    <span>Total Cycle Bill:</span>
                    <span className="font-mono text-indigo-600">{formatINR(totalWithTax)}</span>
                  </div>
                </div>

                {/* Dates Info */}
                <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Next Billing Date:</span>
                    <span className="font-mono font-bold text-indigo-700">{sub.nextBillingDate}</span>
                  </div>
                  {sub.lastInvoiceDate && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Last Invoiced:</span>
                      <span className="font-mono">{sub.lastInvoiceDate}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Generated Invoices:</span>
                    <span className="font-mono font-semibold">{sub.totalInvoicesGenerated} cycles</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleStatus(sub)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {sub.status === 'ACTIVE' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Resume</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteSubscription(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onTriggerGenerateInvoice(sub)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                Create Recurring Billing Subscription
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contract / Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Cloud Infrastructure Monitoring & Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Party *</label>
                  <select
                    value={selectedPartyId}
                    onChange={(e) => {
                      setSelectedPartyId(e.target.value);
                      const p = parties.find((party) => party.id === e.target.value);
                      if (p?.defaultSite) setSite(p.defaultSite);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Worksite / Location *</label>
                  <input
                    type="text"
                    required
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Frequency *</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs text-right"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Tax Rate *</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Billing Date *</label>
                  <input
                    type="date"
                    required
                    value={nextBillingDate}
                    onChange={(e) => setNextBillingDate(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Line Item Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoSend"
                  checked={autoSendInvoice}
                  onChange={(e) => setAutoSendInvoice(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                />
                <label htmlFor="autoSend" className="text-slate-700 font-medium">
                  Auto-generate consecutive invoice on scheduled billing date
                </label>
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
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
