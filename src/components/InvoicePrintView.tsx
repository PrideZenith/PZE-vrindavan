import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Invoice, CompanyProfile } from '../types';
import { formatINR, numberToWordsINR } from '../utils/gstCalculations';

interface InvoicePrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  company: CompanyProfile;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  isOpen,
  onClose,
  invoice,
  company,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar (hidden during print) */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">
              Tax Invoice Preview ({invoice.invoiceNumber})
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-indigo-700 font-medium">
              {invoice.gstType === 'INTRA' ? 'Intrastate (CGST+SGST)' : 'Interstate (IGST)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-sans text-slate-900 bg-white">
          <div className="border border-slate-800 p-6 space-y-4 max-w-3xl mx-auto text-xs">
            {/* Header: Tax Invoice banner */}
            <div className="text-center pb-3 border-b border-slate-800">
              <h1 className="text-xl font-bold tracking-wider uppercase text-slate-900">
                TAX INVOICE
              </h1>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">
                (Issued under Section 31 of Central Goods and Services Tax Act, 2017)
              </p>
            </div>

            {/* Company & Invoice Meta Two-Column */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-800">
              {/* Supplier Details */}
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-950 uppercase">{company.name}</p>
                {company.tradeName && (
                  <p className="text-[11px] text-slate-600 font-medium">{company.tradeName}</p>
                )}
                <p className="text-slate-600 leading-tight">{company.address}, {company.city} - {company.pincode}</p>
                <p className="font-mono">
                  <strong>GSTIN:</strong> {company.gstin}
                </p>
                <p>
                  <strong>State:</strong> {company.state} (Code: {company.stateCode})
                </p>
                <p>
                  <strong>Email:</strong> {company.email} | <strong>Phone:</strong> {company.phone}
                </p>
              </div>

              {/* Invoice Specifics */}
              <div className="space-y-1 text-right sm:border-l sm:border-slate-200 sm:pl-4">
                <p className="font-mono text-sm font-bold text-slate-950">
                  Invoice No: {invoice.invoiceNumber}
                </p>
                <p>
                  <strong>Invoice Date:</strong> {invoice.invoiceDate}
                </p>
                <p>
                  <strong>Payment Due Date:</strong> {invoice.dueDate}
                </p>
                {invoice.poNumber && (
                  <p>
                    <strong>PO / Ref No:</strong> {invoice.poNumber}
                  </p>
                )}
                <p>
                  <strong>Terms:</strong> {invoice.paymentTerms}
                </p>
                <p>
                  <strong>Place of Supply:</strong> {invoice.supplyState} ({invoice.supplyStateCode})
                </p>
                <p>
                  <strong>Reverse Charge:</strong> No
                </p>
              </div>
            </div>

            {/* Billed To / Shipped To (Site) */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-800">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-700 text-[10px]">
                  Billed To (Customer Details):
                </p>
                <p className="font-bold text-slate-950 mt-1">{invoice.partyName}</p>
                <p className="text-slate-600">{invoice.partyAddress}</p>
                <p className="font-mono mt-0.5">
                  <strong>GSTIN / UIN:</strong> {invoice.partyGstin || 'Unregistered'}
                </p>
                <p>
                  <strong>State:</strong> {invoice.partyState} ({invoice.partyStateCode})
                </p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-slate-700 text-[10px]">
                  Shipped To / Project Worksite:
                </p>
                <p className="font-bold text-slate-950 mt-1">{invoice.site}</p>
                <p className="text-slate-600">Place of Supply: {invoice.supplyState} ({invoice.supplyStateCode})</p>
                <p className="text-slate-500 mt-1">Transaction Category: {invoice.gstType === 'INTRA' ? 'Intrastate (Domestic)' : 'Interstate (Domestic)'}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full border-collapse border border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 text-slate-800 font-bold">
                  <th className="p-1.5 border border-slate-800 text-center w-8">#</th>
                  <th className="p-1.5 border border-slate-800 text-left">Item & Worksite Description</th>
                  <th className="p-1.5 border border-slate-800 text-center w-14">HSN</th>
                  <th className="p-1.5 border border-slate-800 text-right w-12">Qty</th>
                  <th className="p-1.5 border border-slate-800 text-center w-12">Unit</th>
                  <th className="p-1.5 border border-slate-800 text-right w-16">Rate (₹)</th>
                  <th className="p-1.5 border border-slate-800 text-right w-20">Taxable (₹)</th>
                  <th className="p-1.5 border border-slate-800 text-right w-14">GST %</th>
                  <th className="p-1.5 border border-slate-800 text-right w-20">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="p-1.5 border border-slate-800 text-center font-mono">{idx + 1}</td>
                    <td className="p-1.5 border border-slate-800">
                      <div className="font-bold text-slate-900">{item.description}</div>
                      <div className="text-[10px] text-slate-500">Site: {item.site}</div>
                    </td>
                    <td className="p-1.5 border border-slate-800 text-center font-mono">{item.hsnSac}</td>
                    <td className="p-1.5 border border-slate-800 text-right font-mono">{item.quantity}</td>
                    <td className="p-1.5 border border-slate-800 text-center">{item.unit}</td>
                    <td className="p-1.5 border border-slate-800 text-right font-mono">{item.rate.toFixed(2)}</td>
                    <td className="p-1.5 border border-slate-800 text-right font-mono font-medium">
                      {item.taxableAmount.toFixed(2)}
                    </td>
                    <td className="p-1.5 border border-slate-800 text-right font-mono">{item.taxRate}%</td>
                    <td className="p-1.5 border border-slate-800 text-right font-mono font-bold">
                      {item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* GST Tax Segregation Table */}
            <div className="border border-slate-800 p-2 text-[10px]">
              <p className="font-bold text-slate-900 mb-1">Tax Amount Breakdown (Segregated GST):</p>
              <div className="grid grid-cols-5 gap-2 font-mono text-[10px]">
                <div>
                  <span className="text-slate-500">Taxable Value:</span>{' '}
                  <strong className="text-slate-900">{formatINR(invoice.subtotal)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">SGST (9%):</span>{' '}
                  <strong className="text-slate-900">{invoice.totalSgst > 0 ? formatINR(invoice.totalSgst) : '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">CGST (9%):</span>{' '}
                  <strong className="text-slate-900">{invoice.totalCgst > 0 ? formatINR(invoice.totalCgst) : '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">IGST (18%):</span>{' '}
                  <strong className="text-slate-900">
                    {invoice.totalIgst > 0 ? formatINR(invoice.totalIgst) : (invoice.totalTax > 0 && invoice.totalSgst === 0 ? formatINR(invoice.totalTax) : '-')}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Total Tax:</span>{' '}
                  <strong className="text-slate-900">{formatINR(invoice.totalTax)}</strong>
                </div>
              </div>
            </div>

            {/* Total in Words & Grand Total Box */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pb-2 border-b border-slate-800">
              <div className="sm:col-span-7 space-y-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Invoice Amount in Words:
                  </p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {numberToWordsINR(invoice.grandTotal)}
                  </p>
                </div>

                {/* Bank Details for NEFT / RTGS / UPI */}
                <div className="pt-2 border-t border-slate-200 text-[10px] space-y-0.5">
                  <p className="font-bold text-slate-900">Bank Details for Payment Remittance:</p>
                  <p>Bank: {company.bankName} | Branch: {company.branch}</p>
                  <p className="font-mono">Account Number: {company.accountNumber}</p>
                  <p className="font-mono">IFSC Code: {company.ifscCode} | UPI ID: {company.upiId}</p>
                </div>
              </div>

              <div className="sm:col-span-5 bg-slate-50 border border-slate-300 p-2.5 rounded space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-700 font-semibold">Total Amount:</span>
                  <span className="font-bold text-slate-900">{formatINR(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Add: SGST@9%:</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.totalSgst > 0 ? formatINR(invoice.totalSgst) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Add: CGST@9%:</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.totalCgst > 0 ? formatINR(invoice.totalCgst) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Add: IGST@18%:</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.totalIgst > 0 ? formatINR(invoice.totalIgst) : (invoice.totalTax > 0 && invoice.totalSgst === 0 ? formatINR(invoice.totalTax) : '-')}
                  </span>
                </div>
                {invoice.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Round Off:</span>
                    <span>{formatINR(invoice.roundOff)}</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-sm text-slate-950">
                  <span>Grand Total:</span>
                  <span className="text-indigo-900">{formatINR(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Declaration & Signature */}
            <div className="grid grid-cols-2 gap-4 pt-3 text-[10px]">
              <div>
                <p className="font-bold text-slate-900">Declaration & Terms:</p>
                <p className="text-slate-600 mt-0.5">
                  We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct. Interest @ 18% p.a. will be levied on delayed payments beyond agreed terms.
                </p>
                {invoice.notes && (
                  <p className="text-slate-700 italic mt-1 font-sans">
                    <strong>Note:</strong> {invoice.notes}
                  </p>
                )}
              </div>

              <div className="text-right space-y-12">
                <p className="font-bold text-slate-900 uppercase">
                  For {company.name}
                </p>
                <p className="border-t border-slate-400 inline-block pt-1 text-slate-600">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
