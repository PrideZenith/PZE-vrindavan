import React from 'react';
import {
  FileText,
  BookOpen,
  PieChart,
  Repeat,
  BellRing,
  Mail,
  Download,
  Settings,
  Plus,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { CompanyProfile } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'invoices'
  | 'book-record'
  | 'gst-tax'
  | 'pnl'
  | 'recurring'
  | 'reminders'
  | 'email-reports';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewInvoice: () => void;
  onOpenBulkExport: () => void;
  onOpenSettings: () => void;
  company: CompanyProfile;
  pendingRemindersCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewInvoice,
  onOpenBulkExport,
  onOpenSettings,
  company,
  pendingRemindersCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'book-record', label: 'Book Record', icon: BookOpen },
    { id: 'gst-tax', label: 'GST Filing', icon: ShieldCheck },
    { id: 'pnl', label: 'Profit & Loss', icon: PieChart },
    { id: 'recurring', label: 'Recurring Billing', icon: Repeat },
    { id: 'reminders', label: 'Reminders', icon: BellRing, badge: pendingRemindersCount },
    { id: 'email-reports', label: 'Monthly Reports', icon: Mail },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      {/* Top Bar Contract: 3 zones separated by gap-8: [Single-line brand wordmark] - [4-5 clean links] - [1 primary action] */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                Pride Zenith Enterprises Vrindavan
              </span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 border-l border-slate-200 pl-3">
              <span className="text-slate-400 font-sans">GSTIN:</span>
              <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                {company.gstin || '09ABAFP6990M1ZH'}
              </span>
            </span>
          </div>

          {/* Zone 2: Navigation Links (single line, no wrapping) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Export, Settings, + New Invoice) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBulkExport}
              title="Bulk Export to CSV or Excel"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Bulk Export</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Company GST & Bank Details"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewInvoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation bar for tablet & mobile screen widths */}
      <div className="lg:hidden border-t border-slate-100 bg-slate-50/80 px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-mono px-1 bg-rose-100 text-rose-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
