/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CompanyProfile,
  Party,
  Invoice,
  ExpenseRecord,
  RecurringSubscription,
  EmailReportConfig,
  PaymentStatus,
} from './types';
import {
  loadCompany,
  saveCompany,
  loadParties,
  saveParties,
  loadInvoices,
  saveInvoices,
  loadExpenses,
  saveExpenses,
  loadRecurring,
  saveRecurring,
  loadEmailConfig,
  saveEmailConfig,
  resetToDemoData,
} from './utils/storage';
import { determineGstType, calculateLineItemTaxes, round2 } from './utils/gstCalculations';
import { computePaymentReminders } from './utils/financialCalculations';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceModal } from './components/InvoiceModal';
import { InvoicePrintView } from './components/InvoicePrintView';
import { BookRecordView } from './components/BookRecordView';
import { GSTTaxView } from './components/GSTTaxView';
import { ProfitLossView } from './components/ProfitLossView';
import { RecurringBillingView } from './components/RecurringBillingView';
import { PaymentRemindersView } from './components/PaymentRemindersView';
import { EmailReportsView } from './components/EmailReportsView';
import { BulkExportModal } from './components/BulkExportModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Data States
  const [company, setCompany] = useState<CompanyProfile>(loadCompany);
  const [parties, setParties] = useState<Party[]>(loadParties);
  const [invoices, setInvoices] = useState<Invoice[]>(loadInvoices);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(loadExpenses);
  const [recurring, setRecurring] = useState<RecurringSubscription[]>(loadRecurring);
  const [emailConfig, setEmailConfig] = useState<EmailReportConfig>(loadEmailConfig);

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Notification / Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync to local storage
  useEffect(() => {
    saveCompany(company);
  }, [company]);

  useEffect(() => {
    saveParties(parties);
  }, [parties]);

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveRecurring(recurring);
  }, [recurring]);

  useEffect(() => {
    saveEmailConfig(emailConfig);
  }, [emailConfig]);

  // Invoice Handlers
  const handleOpenNewInvoice = () => {
    setEditingInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoice = (savedInv: Invoice) => {
    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === savedInv.id);
      if (exists) {
        return prev.map((i) => (i.id === savedInv.id ? savedInv : i));
      } else {
        return [savedInv, ...prev];
      }
    });
    showNotification(`Invoice ${savedInv.invoiceNumber} saved successfully.`);
  };

  const handleDeleteInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (confirm(`Delete invoice ${inv?.invoiceNumber || id}?`)) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      showNotification('Invoice removed.');
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: PaymentStatus, amountPaid?: number) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const paid = amountPaid !== undefined ? amountPaid : status === 'PAID' ? inv.grandTotal : 0;
        const bal = round2(inv.grandTotal - paid);
        return {
          ...inv,
          paymentStatus: status,
          amountPaid: paid,
          balanceDue: bal > 0 ? bal : 0,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showNotification('Invoice status updated.');
  };

  const handleViewPrint = (inv: Invoice) => {
    setPrintingInvoice(inv);
    setIsPrintModalOpen(true);
  };

  // Expense Handlers
  const handleSaveExpense = (exp: ExpenseRecord) => {
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === exp.id);
      if (exists) {
        return prev.map((e) => (e.id === exp.id ? exp : e));
      } else {
        return [exp, ...prev];
      }
    });
    showNotification(`Expense voucher ${exp.expenseNumber} recorded.`);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showNotification('Expense voucher removed.');
  };

  // Recurring Subscriptions
  const handleSaveSubscription = (sub: RecurringSubscription) => {
    setRecurring((prev) => {
      const exists = prev.some((s) => s.id === sub.id);
      if (exists) {
        return prev.map((s) => (s.id === sub.id ? sub : s));
      } else {
        return [sub, ...prev];
      }
    });
    showNotification(`Subscription "${sub.title}" updated.`);
  };

  const handleDeleteSubscription = (id: string) => {
    setRecurring((prev) => prev.filter((s) => s.id !== id));
    showNotification('Subscription plan deleted.');
  };

  const handleTriggerRecurringInvoice = (sub: RecurringSubscription) => {
    const party = parties.find((p) => p.id === sub.partyId);
    const partyStateCode = party ? party.stateCode : company.stateCode;
    const gstType = determineGstType(company.stateCode, partyStateCode);

    const taxes = calculateLineItemTaxes(1, sub.amount, sub.taxRate, gstType);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    // Compute next billing date
    const nextDate = new Date();
    if (sub.frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (sub.frequency === 'QUARTERLY') nextDate.setMonth(nextDate.getMonth() + 3);
    else if (sub.frequency === 'ANNUAL') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else if (sub.frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
    const nextStr = nextDate.toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber,
      invoiceDate: today,
      dueDate: nextStr,
      partyId: sub.partyId,
      partyName: sub.partyName,
      partyGstin: party?.gstin,
      partyState: party?.state || company.state,
      partyStateCode: party?.stateCode || company.stateCode,
      partyAddress: party ? `${party.address}, ${party.city}` : company.address,
      site: sub.site,
      supplyState: party?.state || company.state,
      supplyStateCode: party?.stateCode || company.stateCode,
      gstType,
      paymentTerms: 'Net 15 Days',
      items: [
        {
          id: 'itm-' + Date.now(),
          site: sub.site,
          party: sub.partyName,
          description: sub.description || sub.title,
          hsnSac: sub.hsnSac || '9983',
          quantity: 1,
          unit: 'month',
          rate: sub.amount,
          taxRate: sub.taxRate,
          ...taxes,
        },
      ],
      subtotal: taxes.taxableAmount,
      totalCgst: taxes.cgstAmount,
      totalSgst: taxes.sgstAmount,
      totalIgst: taxes.igstAmount,
      totalTax: taxes.totalTax,
      roundOff: 0,
      grandTotal: taxes.totalAmount,
      amountPaid: 0,
      balanceDue: taxes.totalAmount,
      paymentStatus: 'PENDING',
      isRecurring: true,
      recurringId: sub.id,
      notes: `Automated recurring cycle invoice for ${sub.title}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update subscription count
    setRecurring((prev) =>
      prev.map((s) =>
        s.id === sub.id
          ? {
              ...s,
              totalInvoicesGenerated: s.totalInvoicesGenerated + 1,
              lastInvoiceDate: today,
              nextBillingDate: nextStr,
            }
          : s
      )
    );

    showNotification(`Generated ${invoiceNumber} for ${sub.partyName}.`);
    setActiveTab('invoices');
  };

  // Payment Reminders
  const handleLogReminderSent = (invoiceId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              lastReminderSent: today,
              reminderCount: (inv.reminderCount || 0) + 1,
            }
          : inv
      )
    );
  };

  const handleRecordPayment = (invoiceId: string, amount: number) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const totalPaid = round2(inv.amountPaid + amount);
        const bal = round2(inv.grandTotal - totalPaid);
        const status: PaymentStatus = bal <= 0 ? 'PAID' : 'PARTIAL';
        return {
          ...inv,
          amountPaid: totalPaid,
          balanceDue: bal > 0 ? bal : 0,
          paymentStatus: status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showNotification('Payment successfully recorded in sales ledger.');
  };

  const handleResetDemoData = () => {
    resetToDemoData();
    setCompany(loadCompany());
    setParties(loadParties());
    setInvoices(loadInvoices());
    setExpenses(loadExpenses());
    setRecurring(loadRecurring());
    setEmailConfig(loadEmailConfig());
    showNotification('Application data reset to clean initial seed dataset.');
  };

  const pendingReminders = computePaymentReminders(invoices);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewInvoice={handleOpenNewInvoice}
        onOpenBulkExport={() => setIsBulkExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        company={company}
        pendingRemindersCount={pendingReminders.filter((r) => r.reminderStatus !== 'DUE_SOON').length}
      />

      {/* Global Notification Banner */}
      {notification && (
        <div className="bg-indigo-600 text-white text-xs font-medium py-2 px-4 text-center shadow-xs">
          {notification}
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            invoices={invoices}
            expenses={expenses}
            recurring={recurring}
            company={company}
            onNavigate={(tab) => setActiveTab(tab)}
            onNewInvoice={handleOpenNewInvoice}
            onNewExpense={() => setActiveTab('book-record')}
            onOpenBulkExport={() => setIsBulkExportOpen(true)}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            onNewInvoice={handleOpenNewInvoice}
            onEditInvoice={handleEditInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onViewPrint={handleViewPrint}
            onSendReminder={() => setActiveTab('reminders')}
            onUpdateStatus={handleUpdateInvoiceStatus}
          />
        )}

        {activeTab === 'book-record' && (
          <BookRecordView
            expenses={expenses}
            company={company}
            parties={parties}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'gst-tax' && (
          <GSTTaxView invoices={invoices} expenses={expenses} />
        )}

        {activeTab === 'pnl' && (
          <ProfitLossView invoices={invoices} expenses={expenses} />
        )}

        {activeTab === 'recurring' && (
          <RecurringBillingView
            recurring={recurring}
            parties={parties}
            company={company}
            onSaveSubscription={handleSaveSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            onTriggerGenerateInvoice={handleTriggerRecurringInvoice}
          />
        )}

        {activeTab === 'reminders' && (
          <PaymentRemindersView
            invoices={invoices}
            company={company}
            onLogReminderSent={handleLogReminderSent}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {activeTab === 'email-reports' && (
          <EmailReportsView
            invoices={invoices}
            expenses={expenses}
            parties={parties}
            company={company}
            config={emailConfig}
            onSaveConfig={(cfg) => {
              setEmailConfig(cfg);
              showNotification('Email report configuration updated.');
            }}
          />
        )}
      </main>

      {/* Invoice Generator / Editor Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        company={company}
        parties={parties}
        existingInvoice={editingInvoice}
      />

      {/* Invoice Print & PDF View Modal */}
      <InvoicePrintView
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={printingInvoice}
        company={company}
      />

      {/* Universal Bulk Data Export Modal (CSV & Excel) */}
      <BulkExportModal
        isOpen={isBulkExportOpen}
        onClose={() => setIsBulkExportOpen(false)}
        invoices={invoices}
        expenses={expenses}
        parties={parties}
      />

      {/* Company Settings & Party Directory Modal */}
      <CompanySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        company={company}
        parties={parties}
        onSaveCompany={(c) => {
          setCompany(c);
          showNotification('Business profile updated.');
        }}
        onSaveParties={(p) => {
          setParties(p);
          showNotification('Customer directory updated.');
        }}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
