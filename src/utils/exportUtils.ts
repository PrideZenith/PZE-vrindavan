import { Invoice, ExpenseRecord, Party, MonthlyFinancialSummary, GSTBreakdownReport } from '../types';
import { round2 } from './gstCalculations';

export type ExportFormat = 'CSV' | 'XLS';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

function arrayToCsv(headers: string[], rows: (string | number)[][]): string {
  const headerLine = headers.map(escapeCsvField).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvField).join(','));
  // Prepend UTF-8 Byte Order Mark for Excel
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

function arrayToHtmlExcel(title: string, headers: string[], rows: (string | number)[][]): string {
  const tableHeaders = headers.map((h) => `<th style="background-color: #0f172a; color: #ffffff; padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 600; text-align: left;">${h}</th>`).join('');
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => {
            const isNumeric = typeof cell === 'number';
            const align = isNumeric ? 'right' : 'left';
            return `<td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: ${align};">${cell}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${title.slice(0, 31)}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/html; charset=UTF-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        h2 { color: #0f172a; margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <h2>${title}</h2>
      <p style="font-size: 11px; color: #64748b; margin-top: 0;">Exported from ZenithBooks GST System on ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

// 1. Export Invoices (Sales Register)
export function exportInvoices(invoices: Invoice[], format: ExportFormat = 'CSV'): void {
  const headers = [
    'Invoice Number',
    'Date',
    'Due Date',
    'Status',
    'Customer / Party',
    'Party GSTIN',
    'Place of Supply',
    'Site / Project',
    'GST Type',
    'Taxable Value (INR)',
    'CGST (INR)',
    'SGST (INR)',
    'IGST (INR)',
    'Total Tax (INR)',
    'Grand Total (INR)',
    'Amount Paid (INR)',
    'Balance Due (INR)',
    'Payment Terms',
    'PO Number',
    'Notes',
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.invoiceDate,
    inv.dueDate,
    inv.paymentStatus,
    inv.partyName,
    inv.partyGstin || 'Unregistered',
    `${inv.supplyState} (${inv.supplyStateCode})`,
    inv.site,
    inv.gstType,
    inv.subtotal,
    inv.totalCgst,
    inv.totalSgst,
    inv.totalIgst,
    inv.totalTax,
    inv.grandTotal,
    inv.amountPaid,
    inv.balanceDue,
    inv.paymentTerms,
    inv.poNumber || '',
    inv.notes || '',
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Sales_Register_GST_${timestamp}.${format === 'CSV' ? 'csv' : 'xls'}`;

  if (format === 'CSV') {
    const csv = arrayToCsv(headers, rows);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } else {
    const html = arrayToHtmlExcel('GST Sales Register & Invoices', headers, rows);
    downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
  }
}

// 2. Export Detailed Itemized Line Items for Invoices (with Site, Party, Qty, Rate, Tax, Total)
export function exportDetailedLineItems(invoices: Invoice[], format: ExportFormat = 'CSV'): void {
  const headers = [
    'Invoice Number',
    'Invoice Date',
    'Party / Customer',
    'Site / Location',
    'Item Description',
    'HSN / SAC Code',
    'Quantity',
    'Unit',
    'Rate (INR)',
    'Tax Rate (%)',
    'Taxable Amount (INR)',
    'CGST Amount (INR)',
    'SGST Amount (INR)',
    'IGST Amount (INR)',
    'Total Tax (INR)',
    'Total Line Amount (INR)',
    'Customized Override',
  ];

  const rows: (string | number)[][] = [];

  for (const inv of invoices) {
    for (const item of inv.items) {
      rows.push([
        inv.invoiceNumber,
        inv.invoiceDate,
        item.party || inv.partyName,
        item.site || inv.site,
        item.description,
        item.hsnSac,
        item.quantity,
        item.unit,
        item.rate,
        item.taxRate,
        item.taxableAmount,
        item.cgstAmount,
        item.sgstAmount,
        item.igstAmount,
        item.totalTax,
        item.totalAmount,
        item.isTotalCustomized ? 'YES' : 'NO',
      ]);
    }
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Invoice_Itemized_Line_Items_${timestamp}.${format === 'CSV' ? 'csv' : 'xls'}`;

  if (format === 'CSV') {
    const csv = arrayToCsv(headers, rows);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } else {
    const html = arrayToHtmlExcel('Itemized Sales & GST Breakdown', headers, rows);
    downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
  }
}

// 3. Export Expenses / Book Record (Purchase Register with ITC)
export function exportExpenses(expenses: ExpenseRecord[], format: ExportFormat = 'CSV'): void {
  const headers = [
    'Expense Voucher #',
    'Date',
    'Category',
    'Vendor / Party',
    'Vendor GSTIN',
    'Vendor State',
    'Site / Worksite',
    'Description',
    'Quantity',
    'Rate (INR)',
    'Tax Rate (%)',
    'Taxable Amount (INR)',
    'GST Type',
    'CGST (INR)',
    'SGST (INR)',
    'IGST (INR)',
    'Total Tax (INR)',
    'Total Amount (INR)',
    'ITC Eligible (Input Tax Credit)',
    'Payment Mode',
    'Payment Status',
    'Reference / Bill #',
    'Notes',
  ];

  const rows = expenses.map((exp) => [
    exp.expenseNumber,
    exp.date,
    exp.category,
    exp.vendorName,
    exp.vendorGstin || 'Unregistered',
    `${exp.vendorState} (${exp.vendorStateCode})`,
    exp.site,
    exp.description,
    exp.quantity,
    exp.rate,
    exp.taxRate,
    exp.taxableAmount,
    exp.gstType,
    exp.cgstAmount,
    exp.sgstAmount,
    exp.igstAmount,
    exp.totalTax,
    exp.totalAmount,
    exp.isItcEligible ? 'YES (Eligible)' : 'NO (Ineligible)',
    exp.paymentMode,
    exp.paymentStatus,
    exp.referenceNumber || '',
    exp.notes || '',
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Purchase_Expenses_Register_ITC_${timestamp}.${format === 'CSV' ? 'csv' : 'xls'}`;

  if (format === 'CSV') {
    const csv = arrayToCsv(headers, rows);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } else {
    const html = arrayToHtmlExcel('GST Purchase Register & ITC Book Record', headers, rows);
    downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
  }
}

// 4. Export Monthly Profit & Loss Statement
export function exportMonthlyPNL(monthlySummaries: MonthlyFinancialSummary[], format: ExportFormat = 'CSV'): void {
  const headers = [
    'Month',
    'Operating Revenue / Taxable Sales (INR)',
    'Output GST Collected (INR)',
    'Gross Invoiced (INR)',
    'Direct Expenses / COGS (INR)',
    'Indirect & Facility Expenses (INR)',
    'Total Expenses (INR)',
    'Input Tax Credit / Expense GST (INR)',
    'Gross Profit (INR)',
    'Gross Margin (%)',
    'Net Profit (INR)',
    'Net Margin (%)',
    'Invoices Count',
    'Amount Collected (INR)',
    'Pending Receivables (INR)',
  ];

  const rows = monthlySummaries.map((m) => [
    m.monthName,
    m.taxableRevenue,
    m.totalOutputGst,
    m.grossSales,
    m.directExpenses,
    m.indirectExpenses,
    m.totalExpenses,
    m.totalInputGst,
    m.grossProfit,
    `${m.grossMarginPercent}%`,
    m.netProfit,
    `${m.netMarginPercent}%`,
    m.invoicesCount,
    m.collectedAmount,
    m.pendingReceivables,
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Monthly_Profit_Loss_Statement_${timestamp}.${format === 'CSV' ? 'csv' : 'xls'}`;

  if (format === 'CSV') {
    const csv = arrayToCsv(headers, rows);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } else {
    const html = arrayToHtmlExcel('Monthly Profit & Loss Statements', headers, rows);
    downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
  }
}

// 5. Export GSTR-1 & GSTR-3B Tax Filing Sheet
export function exportGSTTaxFilingSheet(report: GSTBreakdownReport, format: ExportFormat = 'CSV'): void {
  const headers = [
    'Tax Section / Description',
    'Taxable Turnover (INR)',
    'CGST (INR)',
    'SGST (INR)',
    'IGST (INR)',
    'Total Tax (INR)',
  ];

  const rows: (string | number)[][] = [
    [
      'A. Output Tax Liabilities (Sales Invoices)',
      report.taxableSales,
      report.outputCgst,
      report.outputSgst,
      report.outputIgst,
      report.totalOutputTax,
    ],
    [
      'B. Input Tax Credit - ITC (Eligible Business Purchases)',
      report.eligiblePurchases,
      report.itcCgst,
      report.itcSgst,
      report.itcIgst,
      report.totalItcAvailable,
    ],
    [
      'C. Net GST Payable / (Credit Carried Forward)',
      round2(report.taxableSales - report.eligiblePurchases),
      report.netCgstPayable,
      report.netSgstPayable,
      report.netIgstPayable,
      report.totalNetGstPayable,
    ],
    ['', '', '', '', '', ''],
    ['--- RATE-WISE GST BREAKDOWN ---', '', '', '', '', ''],
    ...report.rateBreakdown.map((r) => [
      `GST @ ${r.rate}% Slab`,
      r.taxableValue,
      r.cgst,
      r.sgst,
      r.igst,
      r.totalGst,
    ]),
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `GST_Filing_Summary_GSTR1_GSTR3B_${timestamp}.${format === 'CSV' ? 'csv' : 'xls'}`;

  if (format === 'CSV') {
    const csv = arrayToCsv(headers, rows);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } else {
    const html = arrayToHtmlExcel(`GST Tax Filing Summary - ${report.period}`, headers, rows);
    downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
  }
}

// 6. Export Marketing Department Synchronization Sheet
export function exportMarketingSync(parties: Party[], invoices: Invoice[], format: ExportFormat = 'CSV'): void {
  const headers = [
    'Party / Account Name',
    'Contact Person',
    'Email Address',
    'Phone Number',
    'GSTIN',
    'State',
    'State Code',
    'Registered Office City',
    'Default Worksite',
    'Total Invoices Billed',
    'Lifetime Billed Amount (INR)',
    'Total Amount Paid (INR)',
    'Current Outstanding Due (INR)',
    'Account Status',
  ];

  const rows = parties.map((p) => {
    const partyInvoices = invoices.filter((inv) => inv.partyId === p.id);
    const totalBilled = round2(partyInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0));
    const totalPaid = round2(partyInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0));
    const outstanding = round2(partyInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0));
    const status = outstanding > 0 ? (partyInvoices.some((i) => i.paymentStatus === 'OVERDUE') ? 'OVERDUE' : 'ACTIVE_PAYING') : 'CLEAN';

    return [
      p.name,
      p.contactPerson || '',
      p.email,
      p.phone,
      p.gstin || 'Unregistered',
      p.state,
      p.stateCode,
      p.city,
      p.defaultSite || 'Main Site',
      partyInvoices.length,
      totalBilled,
      totalPaid,
      outstanding,
      status,
    ];
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Marketing_Customer_Sync_Data_${timestamp}.${format === 'CSV' ? 'csv' : 'xls'}`;

  if (format === 'CSV') {
    const csv = arrayToCsv(headers, rows);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } else {
    const html = arrayToHtmlExcel('Marketing Department Customer & Accounts Sync', headers, rows);
    downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
  }
}
