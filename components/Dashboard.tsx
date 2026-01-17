
import React from 'react';
import { useData } from '../context/DataContext';
import { Invoice, InvoiceStatus } from '../types';
import { PlusIcon } from './common/Icons';

interface DashboardProps {
    setCurrentPage: (page: 'invoices' | 'customers' | 'items') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { invoices } = useData();

  const totalInvoices = invoices.length;
  const unpaidInvoices = invoices.filter(inv => inv.status !== InvoiceStatus.PAID);
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalRevenue = invoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className={`p-4 rounded-lg shadow-md ${color}`}>
      <p className="text-sm text-white/80">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="bg-green-500" />
        <StatCard title="Pending Amount" value={`₹${totalUnpaidAmount.toLocaleString('en-IN')}`} color="bg-orange-500" />
        <StatCard title="Total Invoices" value={String(totalInvoices)} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setCurrentPage('invoices')} className="flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <PlusIcon /> <span className="ml-2 font-semibold">Create New Invoice</span>
        </button>
         <button onClick={() => setCurrentPage('customers')} className="flex items-center justify-center p-6 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-colors">
            <PlusIcon /> <span className="ml-2 font-semibold">Add New Customer</span>
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Invoices</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="p-3">Invoice #</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {recentInvoices.map(invoice => (
                        <tr key={invoice.id} className="border-b">
                            <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                            <td className="p-3">{invoice.customer.name}</td>
                            <td className="p-3">₹{invoice.grandTotal.toLocaleString('en-IN')}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    invoice.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' :
                                    invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {invoice.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
