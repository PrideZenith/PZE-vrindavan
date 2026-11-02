import React, { useState } from 'react';
import {
  BellRing,
  Clock,
  AlertTriangle,
  Mail,
  MessageSquare,
  CheckCircle2,
  Copy,
  ExternalLink,
  Send,
  Calendar,
} from 'lucide-react';
import { Invoice, CompanyProfile } from '../types';
import { formatINR, round2 } from '../utils/gstCalculations';
import { computePaymentReminders } from '../utils/financialCalculations';

interface PaymentRemindersViewProps {
  invoices: Invoice[];
  company: CompanyProfile;
  onLogReminderSent: (invoiceId: string) => void;
  onRecordPayment: (invoiceId: string, amount: number) => void;
}

export const PaymentRemindersView: React.FC<PaymentRemindersViewProps> = ({
  invoices,
  company,
  onLogReminderSent,
  onRecordPayment,
}) => {
  const reminders = computePaymentReminders(invoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Group by aging
  const critical = reminders.filter((r) => r.reminderStatus === 'CRITICAL');
  const overdue = reminders.filter((r) => r.reminderStatus === 'OVERDUE');
  const dueSoon = reminders.filter((r) => r.reminderStatus === 'DUE_SOON');

  const totalOverdueAmount = round2(
    [...critical, ...overdue].reduce((sum, r) => sum + r.balanceDue, 0)
  );

  const getEmailContent = (inv: Invoice) => {
    return {
      subject: `Payment Reminder: Invoice ${inv.invoiceNumber} Outstanding (${formatINR(inv.balanceDue)})`,
      body: `Dear Accounts Team at ${inv.partyName},

This is a gentle reminder that payment for Tax Invoice ${inv.invoiceNumber} dated ${inv.invoiceDate} (Due Date: ${inv.dueDate}) in the amount of ${formatINR(inv.balanceDue)} remains pending.

Worksite: ${inv.site}
Total Invoiced: ${formatINR(inv.grandTotal)}
Balance Outstanding: ${formatINR(inv.balanceDue)}

Kindly arrange remittance at your earliest convenience to our bank account:
• Bank: ${company.bankName}
• Account No: ${company.accountNumber}
• IFSC Code: ${company.ifscCode}
• Branch: ${company.branch}
• UPI ID: ${company.upiId}

If payment has already been initiated, please share the UTR / transaction receipt.

Thank you,
Finance & Accounts Department
${company.name}
GSTIN: ${company.gstin} | ${company.phone}`,
    };
  };

  const handleOpenNotice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) setSelectedInvoice(inv);
  };

  const handleCopyNotice = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendAndLog = (invoiceId: string) => {
    onLogReminderSent(invoiceId);
    setSelectedInvoice(null);
    alert('Payment reminder successfully dispatched and logged in invoice ledger.');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    onRecordPayment(paymentModalInvoice.id, Number(paymentAmount));
    setPaymentModalInvoice(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Late Payment Reminders & Aging
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated reminder templates, overdue aging analysis, and payment collection tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">
            Total Overdue: <strong className="text-rose-600 font-bold">{formatINR(totalOverdueAmount)}</strong>
          </span>
        </div>
      </div>

      {/* Aging Analysis Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Critical (>30 days) */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Critical Overdue (&gt; 30 Days)
            </span>
            <span className="font-mono">{critical.length}</span>
          </div>
          <p className="text-xl font-bold font-mono text-rose-900 mt-2">
            {formatINR(critical.reduce((sum, r) => sum + r.balanceDue, 0))}
          </p>
          <p className="text-[11px] text-rose-700 mt-0.5">High escalation priority</p>
        </div>

        {/* 1-30 days overdue */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Overdue (1 - 30 Days)
            </span>
            <span className="font-mono">{overdue.length}</span>
          </div>
          <p className="text-xl font-bold font-mono text-amber-900 mt-2">
            {formatINR(overdue.reduce((sum, r) => sum + r.balanceDue, 0))}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">Routine reminder cycle</p>
        </div>

        {/* Due Soon */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming (Due Soon)
            </span>
            <span className="font-mono">{dueSoon.length}</span>
          </div>
          <p className="text-xl font-bold font-mono text-blue-900 mt-2">
            {formatINR(dueSoon.reduce((sum, r) => sum + r.balanceDue, 0))}
          </p>
          <p className="text-[11px] text-blue-700 mt-0.5">Courtesy payment notice</p>
        </div>
      </div>

      {/* Reminders Queue Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Pending & Overdue Invoices Queue ({reminders.length})
          </h2>
          <span className="text-xs text-slate-400">Click reminder to dispatch email / copy WhatsApp</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Customer & Party</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Aging / Days Overdue</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Reminders Sent</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-medium text-slate-700">All customer invoices are fully settled!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Zero outstanding late payments</p>
                  </td>
                </tr>
              ) : (
                reminders.map((r) => (
                  <tr key={r.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{r.partyName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.partyEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {r.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {r.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.daysOverdue > 0 ? (
                        <span className={`inline-flex items-center gap-1 font-mono font-semibold text-xs ${
                          r.daysOverdue > 30 ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {r.daysOverdue} days overdue
                        </span>
                      ) : (
                        <span className="font-mono text-blue-600 text-xs">
                          Due in {Math.abs(r.daysOverdue)} days
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(r.balanceDue)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {r.reminderCount} sent
                      </span>
                      {r.lastReminderSent && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Last: {r.lastReminderSent}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const inv = invoices.find((i) => i.id === r.invoiceId);
                            if (inv) {
                              setPaymentModalInvoice(inv);
                              setPaymentAmount(inv.balanceDue);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                        >
                          Record Paid
                        </button>

                        <button
                          onClick={() => handleOpenNotice(r.invoiceId)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                        >
                          <BellRing className="w-3 h-3" />
                          <span>Send Notice</span>
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

      {/* Reminder Notice Modal (Email & WhatsApp Formats) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Payment Reminder Notice
                </h3>
                <p className="text-[11px] text-slate-500">
                  Invoice {selectedInvoice.invoiceNumber} · Due: {selectedInvoice.dueDate} · Balance:{' '}
                  <strong>{formatINR(selectedInvoice.balanceDue)}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  readOnly
                  value={getEmailContent(selectedInvoice).subject}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Notice Body (Email / Letter)</label>
                  <button
                    onClick={() => handleCopyNotice(getEmailContent(selectedInvoice).body)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  readOnly
                  value={getEmailContent(selectedInvoice).body}
                  className="w-full px-3 py-2 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg whitespace-pre-wrap resize-none"
                />
              </div>

              {/* Direct Mailto link & Simulator */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Open in Email Client</p>
                  <p className="text-[11px] text-slate-500">
                    Launches your default mail client with pre-filled subject and body
                  </p>
                </div>
                <a
                  href={`mailto:${selectedInvoice.partyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com?subject=${encodeURIComponent(
                    getEmailContent(selectedInvoice).subject
                  )}&body=${encodeURIComponent(getEmailContent(selectedInvoice).body)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mailto Link</span>
                </a>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendAndLog(selectedInvoice.id)}
                className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Dispatch & Log Reminder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Payment Received
            </h3>
            <p className="text-slate-600">
              For Invoice <strong>{paymentModalInvoice.invoiceNumber}</strong> ({paymentModalInvoice.partyName})
            </p>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount Received (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  max={paymentModalInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm bg-white border border-slate-300 rounded-lg text-right font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Remaining balance due will be updated automatically.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
