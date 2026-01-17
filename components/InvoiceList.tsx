import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Invoice, InvoiceStatus } from '../types';
import InvoiceForm from './InvoiceForm';
import { downloadPdf } from '../services/pdfGenerator';
import { generateInvoicesCSV } from '../services/csvGenerator';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon } from './common/Icons';

const InvoiceList: React.FC = () => {
  const { invoices, deleteInvoice, companyProfile } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');


  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      const matchesSearch = searchTerm === '' ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        
        const [year, month, day] = invoice.date.split('-').map(Number);
        const invoiceDate = new Date(year, month - 1, day);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'thisMonth') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return invoiceDate >= startOfMonth && invoiceDate <= endOfMonth;
        }

        if (dateFilter === 'lastMonth') {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return invoiceDate >= startOfLastMonth && invoiceDate <= endOfLastMonth;
        }

        if (dateFilter === 'custom') {
            if (!customStartDate || !customEndDate) return true; // Don't filter if range is incomplete
            const [sY, sM, sD] = customStartDate.split('-').map(Number);
            const startDate = new Date(sY, sM - 1, sD);
            
            const [eY, eM, eD] = customEndDate.split('-').map(Number);
            const endDate = new Date(eY, eM - 1, eD);
            
            return invoiceDate >= startDate && invoiceDate <= endDate;
        }

        return true;
      })();
      
      return matchesStatus && matchesSearch && matchesDate;
    }
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-800';
      case InvoiceStatus.SENT:
        return 'bg-yellow-100 text-yellow-800';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case InvoiceStatus.DRAFT:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2">
            <button onClick={() => generateInvoicesCSV(filteredInvoices)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg shadow-sm hover:bg-slate-300">
                Export CSV
            </button>
            <button onClick={handleAddNew} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700">
                <PlusIcon />
                <span className="ml-2">New Invoice</span>
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Search</label>
            <input
              type="text"
              placeholder="Invoice # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | InvoiceStatus)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              {Object.values(InvoiceStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        {dateFilter === 'custom' && (
          <div className="flex items-end gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>


      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="border-b">
                  <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                  <td className="p-3">{invoice.customer.name}</td>
                  <td className="p-3">{new Date(invoice.date).toLocaleDateString('en-IN', { timeZone: 'UTC' })}</td>
                  <td className="p-3">₹{invoice.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button onClick={() => downloadPdf(invoice, companyProfile)} title="View/Download PDF"><EyeIcon /></button>
                      <button onClick={() => handleEdit(invoice)} title="Edit"><EditIcon /></button>
                      <button onClick={() => handleDelete(invoice.id)} title="Delete"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <InvoiceForm
          invoice={selectedInvoice}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default InvoiceList;