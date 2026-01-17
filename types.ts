export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
}

export interface InvoiceItem {
  id: string;
  name: string;
  hsn: string;
  quantity: number;
  price: number;
  discount: number; // Percentage
  gstRate: number; // Percentage
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  billingAddress: string;
  shippingAddress: string;
  gstin: string;
  state: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  hsn: string;
  gstRate: number; // Percentage
}

export type InvoiceTemplate = 'standard' | 'compact' | 'modern';
export type PaperSize = 'a4' | 'letter' | 'a5';

export interface InvoiceColumnVisibility {
  hsn: boolean;
  discount: boolean;
  gst: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  customer: Customer;
  items: InvoiceItem[];
  status: InvoiceStatus;
  notes: string;
  total: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  template?: InvoiceTemplate;
  paperSize?: PaperSize;
  showColumns?: InvoiceColumnVisibility;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface CompanyProfile {
    name: string;
    address: string;
    gstin: string;
    phone: string;
    email: string;
    logo: string; // base64
    state: string;
    
    // Invoice Preferences
    template: InvoiceTemplate;
    accentColor: string; // hex color
    customFooter: string;
    invoicePrefix: string;
    enableRoundOff: boolean;
    
    // Tax Settings
    defaultGstRates: string; // Comma-separated string like "5,12,18,28"
    
    // PDF & Print Preferences
    showLogoInPdf: boolean;
    pdfFontSize: 'small' | 'medium' | 'large';
    pdfMargin: 'normal' | 'narrow';
    pdfPaperSize: PaperSize;
    pdfShowColumns: InvoiceColumnVisibility;

    // Custom Fields
    showCustomFieldsInPdf: boolean;
    customFields: CustomField[];
}