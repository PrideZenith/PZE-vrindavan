import React, { useState } from 'react';
import { X, Building2, Landmark, Users, Plus, Trash2, Check, RefreshCw } from 'lucide-react';
import { CompanyProfile, Party } from '../types';
import { INDIAN_STATES } from '../utils/gstCalculations';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  parties: Party[];
  onSaveCompany: (company: CompanyProfile) => void;
  onSaveParties: (parties: Party[]) => void;
  onResetDemoData: () => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  company,
  parties,
  onSaveCompany,
  onSaveParties,
  onResetDemoData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'COMPANY' | 'BANK' | 'PARTIES'>('COMPANY');
  const [formData, setFormData] = useState<CompanyProfile>({ ...company });
  const [partyList, setPartyList] = useState<Party[]>([...parties]);
  const [isSaved, setIsSaved] = useState(false);

  // New Party Form
  const [showAddParty, setShowAddParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyEmail, setNewPartyEmail] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyGstin, setNewPartyGstin] = useState('');
  const [newPartyStateCode, setNewPartyStateCode] = useState('27');
  const [newPartyAddress, setNewPartyAddress] = useState('');
  const [newPartyCity, setNewPartyCity] = useState('');
  const [newPartyDefaultSite, setNewPartyDefaultSite] = useState('');

  if (!isOpen) return null;

  const handleStateChange = (code: string) => {
    const found = INDIAN_STATES.find((s) => s.code === code);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        state: found.name,
        stateCode: found.code,
      }));
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(formData);
    onSaveParties(partyList);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleAddParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;

    const stateObj = INDIAN_STATES.find((s) => s.code === newPartyStateCode) || {
      name: 'Maharashtra',
      code: '27',
    };

    const newParty: Party = {
      id: 'pty-' + Date.now(),
      name: newPartyName,
      email: newPartyEmail,
      phone: newPartyPhone,
      gstin: newPartyGstin.trim() ? newPartyGstin.trim().toUpperCase() : undefined,
      state: stateObj.name,
      stateCode: stateObj.code,
      address: newPartyAddress,
      city: newPartyCity,
      pincode: '400001',
      partyType: 'CUSTOMER',
      defaultSite: newPartyDefaultSite || 'Site A - Main Facility',
    };

    setPartyList((prev) => [...prev, newParty]);
    setShowAddParty(false);
    setNewPartyName('');
    setNewPartyEmail('');
    setNewPartyPhone('');
    setNewPartyGstin('');
    setNewPartyAddress('');
    setNewPartyCity('');
    setNewPartyDefaultSite('');
  };

  const handleDeleteParty = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setPartyList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Business Profile & Party Directory
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              GST registration, banking coordinates, and customer directory
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-6">
          <button
            type="button"
            onClick={() => setActiveSubTab('COMPANY')}
            className={`py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'COMPANY'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Company & GSTIN
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('BANK')}
            className={`py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'BANK'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Bank & Payment Accounts
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('PARTIES')}
            className={`py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'PARTIES'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Directory ({partyList.length})
          </button>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeSubTab === 'COMPANY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trade / Brand Name</label>
                  <input
                    type="text"
                    value={formData.tradeName || ''}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN (15 Digits) *</label>
                  <input
                    type="text"
                    required
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 font-mono uppercase bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registered Home State *</label>
                  <select
                    value={formData.stateCode}
                    onChange={(e) => handleStateChange(e.target.value)}
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Office Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'BANK' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3 text-[11px] text-indigo-900">
                These banking details are automatically rendered at the bottom of all generated GST Tax Invoices and payment reminder emails for customer NEFT/RTGS/UPI transfers.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Branch</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IFSC Code (11 Digits) *</label>
                  <input
                    type="text"
                    required
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 font-mono uppercase bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPI ID (e.g. pridezenith@hdfcbank)</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'PARTIES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-800">Saved Customers & Accounts</span>
                <button
                  type="button"
                  onClick={() => setShowAddParty(!showAddParty)}
                  className="inline-flex items-center gap-1 px-3 py-1 font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddParty ? 'Hide Form' : 'Add New Customer'}</span>
                </button>
              </div>

              {showAddParty && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-900">New Customer Account</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={newPartyName}
                      onChange={(e) => setNewPartyName(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="GSTIN (Optional)"
                      value={newPartyGstin}
                      onChange={(e) => setNewPartyGstin(e.target.value.toUpperCase())}
                      className="px-2.5 py-1 font-mono uppercase bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newPartyStateCode}
                      onChange={(e) => setNewPartyStateCode(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Default Worksite (e.g. Site A - Pune)"
                      value={newPartyDefaultSite}
                      onChange={(e) => setNewPartyDefaultSite(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Billing Email"
                      value={newPartyEmail}
                      onChange={(e) => setNewPartyEmail(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={newPartyPhone}
                      onChange={(e) => setNewPartyPhone(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddParty}
                    className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer"
                  >
                    Save Customer to Directory
                  </button>
                </div>
              )}

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {partyList.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        GSTIN: {p.gstin || 'Unregistered'} · {p.state} ({p.stateCode})
                      </p>
                      {p.defaultSite && (
                        <span className="text-[10px] text-slate-500">Site: {p.defaultSite}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteParty(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset application data to initial sample dataset?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Saved Changes!' : 'Save Business Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
