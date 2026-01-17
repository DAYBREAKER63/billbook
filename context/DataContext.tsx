import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Invoice, Customer, Item, CompanyProfile } from '../types';
import { SAMPLE_INVOICES, SAMPLE_CUSTOMERS, SAMPLE_ITEMS } from '../constants';

interface DataContextProps {
  invoices: Invoice[];
  customers: Customer[];
  items: Item[];
  companyProfile: CompanyProfile;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  getNextInvoiceNumber: () => string;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => Item | undefined;
  updateCompanyProfile: (profile: CompanyProfile) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', SAMPLE_INVOICES);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', SAMPLE_CUSTOMERS);
  const [items, setItems] = useLocalStorage<Item[]>('items', SAMPLE_ITEMS);
  const [companyProfile, setCompanyProfile] = useLocalStorage<CompanyProfile>('companyProfile', {
    name: 'My Business',
    address: '123 Main Street, Anytown, Karnataka, 12345',
    gstin: '29ABCDE1234F1Z5',
    phone: '9998887776',
    email: 'contact@mybusiness.com',
    logo: '',
    state: 'Karnataka',
    template: 'standard',
    accentColor: '#4F46E5',
    customFooter: 'Thank you for your business!',
    invoicePrefix: 'INV-',
    enableRoundOff: true,
    defaultGstRates: '5,12,18,28',
    showLogoInPdf: true,
    pdfFontSize: 'medium',
    pdfMargin: 'normal',
    pdfPaperSize: 'a4',
    pdfShowColumns: { hsn: true, discount: true, gst: true },
    showCustomFieldsInPdf: true,
    customFields: [],
  });

  const addInvoice = (invoice: Invoice) => setInvoices([...invoices, invoice]);
  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(invoices.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
  };
  const deleteInvoice = (id: string) => setInvoices(invoices.filter(inv => inv.id !== id));
  const getInvoiceById = (id: string) => invoices.find(inv => inv.id === id);
  
  const getNextInvoiceNumber = () => {
    const prefix = companyProfile.invoicePrefix || 'INV-';
    const year = new Date().getFullYear();
    const yearPrefix = `${prefix}${year}-`;
    
    const yearInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(yearPrefix));

    if (yearInvoices.length === 0) {
        return `${yearPrefix}0001`;
    }

    const lastNum = yearInvoices.reduce((max, inv) => {
        const num = parseInt(inv.invoiceNumber.replace(yearPrefix, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    
    const newNum = lastNum + 1;
    return `${yearPrefix}${String(newNum).padStart(4, '0')}`;
  };

  const addCustomer = (customer: Customer) => setCustomers([...customers, customer]);
  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
  };
  const deleteCustomer = (id: string) => setCustomers(customers.filter(c => c.id !== id));
  const getCustomerById = (id: string) => customers.find(c => c.id === id);

  const addItem = (item: Item) => setItems([...items, item]);
  const updateItem = (updatedItem: Item) => {
    setItems(items.map(i => (i.id === updatedItem.id ? updatedItem : i)));
  };
  const deleteItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const getItemById = (id: string) => items.find(i => i.id === id);
  
  const updateCompanyProfile = (profile: CompanyProfile) => setCompanyProfile(profile);

  const value = {
    invoices,
    customers,
    items,
    companyProfile,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    getNextInvoiceNumber,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    updateCompanyProfile
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};