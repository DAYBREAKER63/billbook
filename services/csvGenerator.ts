
import { Invoice } from '../types';

export const generateInvoicesCSV = (invoices: Invoice[]) => {
  const headers = [
    'Invoice Number',
    'Date',
    'Due Date',
    'Customer Name',
    'Customer GSTIN',
    'Status',
    'Subtotal',
    'CGST',
    'SGST',
    'IGST',
    'Grand Total'
  ];

  const rows = invoices.map(invoice => [
    invoice.invoiceNumber,
    invoice.date,
    invoice.dueDate,
    invoice.customer.name,
    invoice.customer.gstin,
    invoice.status,
    invoice.total.toFixed(2),
    invoice.cgst.toFixed(2),
    invoice.sgst.toFixed(2),
    invoice.igst.toFixed(2),
    invoice.grandTotal.toFixed(2)
  ]);

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.join(",") + "\r\n";
  rows.forEach(rowArray => {
    const row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `invoices_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
