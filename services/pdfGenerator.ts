import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, CompanyProfile, InvoiceColumnVisibility } from '../types';

// Helper to convert hex color to RGB array for jsPDF
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};

const getFontSizes = (size: 'small' | 'medium' | 'large') => {
    const sizes = {
        small: { header: 16, title: 18, body: 8, table: 7 },
        medium: { header: 18, title: 20, body: 10, table: 9 },
        large: { header: 20, title: 22, body: 12, table: 11 },
    };
    return sizes[size] || sizes.medium;
}

const buildTable = (invoice: Invoice, showColumns: InvoiceColumnVisibility) => {
    const head: any[][] = [[]];
    const body: any[][] = [];
    const columnStyles: { [key: number]: any } = { 0: { cellWidth: 10 }};
    let currentColumn = 1;

    // --- Define Columns ---
    const columns = [
        { key: 'item', title: `Item${showColumns.hsn ? ' & HSN/SAC' : ''}`, style: {} },
        { key: 'quantity', title: 'Qty', style: { cellWidth: 15, halign: 'right' } },
        { key: 'price', title: 'Rate', style: { cellWidth: 20, halign: 'right' } },
        { key: 'discount', title: 'Discount', style: { cellWidth: 20, halign: 'right' }, condition: showColumns.discount },
        { key: 'gst', title: 'GST', style: { cellWidth: 15, halign: 'right' }, condition: showColumns.gst },
        { key: 'amount', title: 'Amount', style: { cellWidth: 25, halign: 'right' } }
    ];

    head[0].push('#');
    columns.forEach(col => {
        if (col.condition !== false) {
            head[0].push(col.title);
            columnStyles[currentColumn++] = col.style;
        }
    });

    // --- Populate Body ---
    invoice.items.map((item, index) => {
        const amount = item.quantity * item.price;
        const discountedAmount = amount - (amount * item.discount / 100);
        const rowData = {
            '#': index + 1,
            item: `${item.name}${showColumns.hsn ? `\nHSN: ${item.hsn}` : ''}`,
            quantity: item.quantity,
            price: item.price.toFixed(2),
            discount: `${item.discount}%`,
            gst: item.gstRate > 0 ? `${item.gstRate}%` : 'Exempt',
            amount: discountedAmount.toFixed(2)
        }
        
        const row: any[] = [];
        head[0].forEach(header => {
            const key = columns.find(c => c.title === header)?.key || '#';
            if ((rowData as any)[key] !== undefined) {
                row.push((rowData as any)[key]);
            }
        });
        body.push(row);
    });

    return { head, body, columnStyles };
};

const drawFooter = (doc: jsPDF, invoice: Invoice, profile: CompanyProfile) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = profile.pdfMargin === 'narrow' ? 10 : 15;
    const fonts = getFontSizes(profile.pdfFontSize);
    const accentColorRgb = hexToRgb(profile.accentColor) || [0, 0, 0];
    const pageBottomMargin = 10;
    let footerContentY = pageHeight - pageBottomMargin;

    // Draw custom footer text at the very bottom
    if (profile.customFooter) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(fonts.table);
        const footerText = doc.splitTextToSize(profile.customFooter, pageWidth - margin * 2);
        doc.text(footerText, pageWidth / 2, footerContentY, { align: 'center' });
        footerContentY -= (footerText.length * 4);
    }

    // Draw Notes
    if (invoice.notes) {
        doc.setFont('helvetica', 'normal');
        const notesText = doc.splitTextToSize(`Notes: ${invoice.notes}`, pageWidth / 2);
        doc.text(notesText, margin, footerContentY);
        footerContentY -= (notesText.length * 4);
    }

    // Draw custom fields
    if (profile.showCustomFieldsInPdf && profile.customFields && profile.customFields.length > 0) {
        footerContentY -= 2; // Extra space
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fonts.table);
        // Draw from bottom up to avoid calculating total height
        profile.customFields.slice().reverse().forEach(field => {
            const text = `${field.label}: ${field.value}`;
            const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
            footerContentY -= (splitText.length * 4);
            doc.text(splitText, margin, footerContentY);
        });
        footerContentY -= 2; // Extra space before line
    }

    // Draw the separator line above all footer content
    doc.setLineWidth(0.5);
    doc.setDrawColor(...accentColorRgb);
    doc.line(margin, footerContentY, pageWidth - margin, footerContentY);
};


const drawStandardCompactTemplate = (
    doc: jsPDF, 
    invoice: Invoice, 
    profile: CompanyProfile,
    showColumns: InvoiceColumnVisibility
) => {
  const isCompact = (invoice.template || profile.template) === 'compact';
  const accentColorRgb = hexToRgb(profile.accentColor) || [0, 0, 0];
  const fonts = getFontSizes(profile.pdfFontSize);
  if (isCompact) {
      fonts.body -= 1; fonts.table -=1; fonts.header -=2;
  }
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = profile.pdfMargin === 'narrow' ? 10 : 15;

  // --- Header ---
  if (profile.logo && profile.showLogoInPdf) {
    try {
        doc.addImage(profile.logo, 'JPEG', margin, 10, 25, 25);
    } catch(e) { console.error("Error adding logo image to PDF:", e); }
  }
  
  doc.setFontSize(fonts.title);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColorRgb);
  doc.text('TAX INVOICE', pageWidth / 2, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.name, pageWidth - margin, 15, { align: 'right' });
  const profileAddress = doc.splitTextToSize(profile.address, 60);
  doc.text(profileAddress, pageWidth - margin, 20, { align: 'right' });
  doc.text(`GSTIN: ${profile.gstin}`, pageWidth - margin, 32, { align: 'right' });
  doc.text(`Phone: ${profile.phone}`, pageWidth - margin, 37, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.setDrawColor(...accentColorRgb);
  doc.line(margin, 45, pageWidth - margin, 45);

  // --- Invoice & Customer Details ---
  let yPos = 55;
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer.name, margin, yPos + 5);
  const customerAddress = doc.splitTextToSize(invoice.customer.billingAddress, 80);
  doc.text(customerAddress, margin, yPos + 10);
  doc.text(`GSTIN: ${invoice.customer.gstin}`, margin, yPos + 22);
  
  const detailsX = pageWidth - margin - 50;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', detailsX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, pageWidth - margin, yPos, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', detailsX, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.date).toLocaleDateString('en-IN'), pageWidth - margin, yPos + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', detailsX, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.dueDate).toLocaleDateString('en-IN'), pageWidth - margin, yPos + 10, { align: 'right' });

  // --- Items Table ---
  yPos += 30;
  const { head, body, columnStyles } = buildTable(invoice, showColumns);
  autoTable(doc, {
    startY: yPos,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: accentColorRgb, textColor: [255, 255, 255], fontSize: fonts.table },
    styles: { fontSize: fonts.table },
    columnStyles: columnStyles,
  });

  // --- Totals Section ---
  const finalY = (doc as any).lastAutoTable.finalY;
  const totalYStart = finalY + (isCompact ? 6 : 10);
  const lineHeight = isCompact ? 4 : 5;
  
  const addTotalLine = (label: string, value: string, y: number, isBold: boolean = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(label, pageWidth - margin - 50, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageWidth - margin, y, { align: 'right' });
  };
  
  addTotalLine('Subtotal', `₹${invoice.total.toFixed(2)}`, totalYStart);
  let currentY = totalYStart;

  if (invoice.cgst > 0) { currentY += lineHeight; addTotalLine(`CGST`, `₹${invoice.cgst.toFixed(2)}`, currentY); }
  if (invoice.sgst > 0) { currentY += lineHeight; addTotalLine(`SGST`, `₹${invoice.sgst.toFixed(2)}`, currentY); }
  if (invoice.igst > 0) { currentY += lineHeight; addTotalLine(`IGST`, `₹${invoice.igst.toFixed(2)}`, currentY); }

  currentY += (isCompact ? 5 : 7);
  doc.setLineWidth(0.2);
  doc.line(pageWidth - margin - 50, currentY - 2, pageWidth - margin, currentY - 2);

  doc.setFontSize(fonts.body + 2);
  doc.setTextColor(...accentColorRgb);
  addTotalLine('Grand Total', `₹${invoice.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, currentY + 2, true);
  doc.setTextColor(0, 0, 0);

  // --- Footer ---
  drawFooter(doc, invoice, profile);
};

const drawModernTemplate = (
    doc: jsPDF, 
    invoice: Invoice, 
    profile: CompanyProfile,
    showColumns: InvoiceColumnVisibility
) => {
    const accentColorRgb = hexToRgb(profile.accentColor) || [0, 0, 0];
    const fonts = getFontSizes(profile.pdfFontSize);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = profile.pdfMargin === 'narrow' ? 10 : 15;

    // --- Header ---
    doc.setFillColor(...accentColorRgb);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFontSize(fonts.title + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', margin, 20);

    if (profile.logo && profile.showLogoInPdf) {
        try {
            doc.addImage(profile.logo, 'JPEG', pageWidth - margin - 30, 5, 25, 25);
        } catch(e) { console.error("Error adding logo image to PDF:", e); }
    }
    
    // --- Company & Invoice Details ---
    let yPos = 40;
    doc.setTextColor(0,0,0);
    doc.setFontSize(fonts.body);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.name, pageWidth - margin, yPos, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const profileAddress = doc.splitTextToSize(`${profile.address}\nGSTIN: ${profile.gstin}`, 60);
    doc.text(profileAddress, pageWidth - margin, yPos + 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #:', margin, yPos + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber, margin + 25, yPos + 10);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin, yPos + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoice.date).toLocaleDateString('en-IN'), margin + 25, yPos + 15);

    yPos += 25;
    doc.setLineWidth(0.2);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // --- Customer Details ---
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customer.name, margin, yPos + 5);
    const customerAddress = doc.splitTextToSize(`${invoice.customer.billingAddress}\nGSTIN: ${invoice.customer.gstin}`, 80);
    doc.text(customerAddress, margin, yPos + 10);

    // --- Items Table ---
    yPos += 30;
    const { head, body, columnStyles } = buildTable(invoice, showColumns);
    autoTable(doc, {
        startY: yPos,
        head,
        body,
        theme: 'striped',
        headStyles: { fillColor: accentColorRgb, textColor: [255, 255, 255], fontSize: fonts.table },
        styles: { fontSize: fonts.table },
        columnStyles: columnStyles,
    });

    // --- Totals Section ---
    const finalY = (doc as any).lastAutoTable.finalY;
    let totalYStart = finalY + 10;
    const lineHeight = 5;
    const totalXLabel = pageWidth - margin - 50;
    const totalXValue = pageWidth - margin;

    const addTotalLine = (label: string, value: string, isBold: boolean = false) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(label, totalXLabel, totalYStart, { align: 'left' });
        doc.text(value, totalXValue, totalYStart, { align: 'right' });
        totalYStart += lineHeight;
    };
    
    addTotalLine('Subtotal', `₹${invoice.total.toFixed(2)}`);
    if (invoice.cgst > 0) { addTotalLine(`CGST`, `₹${invoice.cgst.toFixed(2)}`); }
    if (invoice.sgst > 0) { addTotalLine(`SGST`, `₹${invoice.sgst.toFixed(2)}`); }
    if (invoice.igst > 0) { addTotalLine(`IGST`, `₹${invoice.igst.toFixed(2)}`); }
    
    totalYStart += 2;
    doc.setLineWidth(0.3);
    doc.setDrawColor(...accentColorRgb);
    doc.line(totalXLabel - 5, totalYStart, totalXValue, totalYStart);
    totalYStart += 5;

    doc.setFontSize(fonts.body + 2);
    addTotalLine('GRAND TOTAL', `₹${invoice.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, true);

    // --- Footer ---
    drawFooter(doc, invoice, profile);
};

const drawTemplate = (
    doc: jsPDF, 
    invoice: Invoice, 
    profile: CompanyProfile
) => {
  const template = invoice.template || profile.template;
  const showColumns = invoice.showColumns || profile.pdfShowColumns;
  
  if (template === 'modern') {
      drawModernTemplate(doc, invoice, profile, showColumns);
  } else {
      drawStandardCompactTemplate(doc, invoice, profile, showColumns);
  }
};


export const generateInvoicePdf = (invoice: Invoice, profile: CompanyProfile) => {
  const paperSize = invoice.paperSize || profile.pdfPaperSize;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: paperSize
  });

  drawTemplate(doc, invoice, profile);

  return doc;
};


export const downloadPdf = (invoice: Invoice, profile: CompanyProfile) => {
    const doc = generateInvoicePdf(invoice, profile);
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};

export const printPdf = (invoice: Invoice, profile: CompanyProfile) => {
    const doc = generateInvoicePdf(invoice, profile);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
};