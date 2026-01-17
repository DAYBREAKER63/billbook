
import { Customer, Item, Invoice, InvoiceStatus, InvoiceItem } from './types';

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Ladakh", 
  "Lakshadweep", "Jammu and Kashmir", "Puducherry"
];

// Sample Data for initial state
export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'ABC Electronics',
    phone: '9876543210',
    email: 'contact@abcelectronics.com',
    billingAddress: '123 Tech Park, Bangalore, Karnataka, 560001',
    shippingAddress: '123 Tech Park, Bangalore, Karnataka, 560001',
    gstin: '29ABCDE1234F1Z5',
    state: 'Karnataka',
  },
  {
    id: 'cust-2',
    name: 'PQR Solutions',
    phone: '8765432109',
    email: 'support@pqrsolutions.com',
    billingAddress: '456 IT Hub, Pune, Maharashtra, 411057',
    shippingAddress: '456 IT Hub, Pune, Maharashtra, 411057',
    gstin: '27FGHIJ5678K2Z9',
    state: 'Maharashtra',
  },
  {
    id: 'cust-3',
    name: 'XYZ Retail',
    phone: '7654321098',
    email: 'sales@xyzretail.in',
    billingAddress: '789 Market Street, New Delhi, Delhi, 110001',
    shippingAddress: '789 Market Street, New Delhi, Delhi, 110001',
    gstin: '07LMNOP9012Q3Z8',
    state: 'Delhi',
  }
];

export const SAMPLE_ITEMS: Item[] = [
  { id: 'item-1', name: 'Laptop Pro 15"', price: 85000, hsn: '8471', gstRate: 18 },
  { id: 'item-2', name: 'Wireless Mouse', price: 1200, hsn: '8471', gstRate: 18 },
  { id: 'item-3', name: 'Software Consulting (per hour)', price: 3000, hsn: '9983', gstRate: 18 },
  { id: 'item-4', name: 'Premium Keyboard', price: 4500, hsn: '8471', gstRate: 18 },
  { id: 'item-5', name: 'Cotton T-Shirt', price: 500, hsn: '6109', gstRate: 5 },
];

const sampleInvoiceItems1: InvoiceItem[] = [
  { id: 'inv-item-1-1', name: 'Laptop Pro 15"', hsn: '8471', quantity: 1, price: 85000, discount: 5, gstRate: 18 },
  { id: 'inv-item-1-2', name: 'Wireless Mouse', hsn: '8471', quantity: 2, price: 1200, discount: 0, gstRate: 18 },
];

const sampleInvoiceItems2: InvoiceItem[] = [
  { id: 'inv-item-2-1', name: 'Software Consulting (per hour)', hsn: '9983', quantity: 10, price: 3000, discount: 0, gstRate: 18 },
];

export const SAMPLE_INVOICES: Invoice[] = [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2024-0001',
      date: '2024-07-20',
      dueDate: '2024-08-04',
      customer: SAMPLE_CUSTOMERS[0],
      items: sampleInvoiceItems1,
      status: InvoiceStatus.PAID,
      notes: 'Thank you for your business.',
      total: 83150,
      cgst: 7483.5,
      sgst: 7483.5,
      igst: 0,
      grandTotal: 98117,
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2024-0002',
      date: '2024-07-22',
      dueDate: '2024-08-06',
      customer: SAMPLE_CUSTOMERS[1],
      items: sampleInvoiceItems2,
      status: InvoiceStatus.SENT,
      notes: 'Payment is due within 15 days.',
      total: 30000,
      cgst: 0,
      sgst: 0,
      igst: 5400,
      grandTotal: 35400,
    },
    {
      id: 'inv-3',
      invoiceNumber: 'INV-2024-0003',
      date: '2024-06-15',
      dueDate: '2024-06-30',
      customer: SAMPLE_CUSTOMERS[2],
      items: [{ id: 'inv-item-3-1', name: 'Cotton T-Shirt', hsn: '6109', quantity: 20, price: 500, discount: 10, gstRate: 5 }],
      status: InvoiceStatus.OVERDUE,
      notes: '',
      total: 9000,
      cgst: 225,
      sgst: 225,
      igst: 0,
      grandTotal: 9450,
    }
  ];

