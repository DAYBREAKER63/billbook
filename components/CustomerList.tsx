
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Customer } from '../types';
import Modal from './common/Modal';
import { INDIAN_STATES } from '../constants';
import { PlusIcon, EditIcon, TrashIcon } from './common/Icons';

const CustomerForm: React.FC<{ customer: Customer | null; onClose: () => void }> = ({ customer, onClose }) => {
  const { addCustomer, updateCustomer } = useData();
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      name: '', phone: '', email: '', billingAddress: '', shippingAddress: '', gstin: '', state: ''
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      updateCustomer({ ...customer, ...formData });
    } else {
      addCustomer({ id: `cust-${Date.now()}`, ...formData } as Customer);
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={customer ? 'Edit Customer' : 'New Customer'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(formData).filter(k => k !== 'id').map(key => (
            key === 'state' ? (
                <div key={key}>
                    <label className="block font-medium capitalize">{key}</label>
                    <select name={key} value={formData[key]} onChange={handleChange} className="w-full px-2 py-1 border rounded bg-white" required>
                        <option value="" disabled>Select State</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            ) : (
                <div key={key}>
                    <label className="block font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                        type={key === 'email' ? 'email' : 'text'}
                        name={key}
                        value={(formData as any)[key]}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded"
                        required
                    />
                </div>
            )
        ))}
        <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
    </Modal>
  );
};

const CustomerList: React.FC = () => {
  const { customers, deleteCustomer } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button onClick={handleAddNew} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700">
          <PlusIcon /><span className="ml-2">Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white p-4 rounded-lg shadow-md space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{customer.name}</h3>
                <p className="text-sm text-slate-500">{customer.phone}</p>
                <p className="text-sm text-slate-500">{customer.gstin}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(customer)}><EditIcon /></button>
                <button onClick={() => deleteCustomer(customer.id)}><TrashIcon /></button>
              </div>
            </div>
            <p className="text-sm text-slate-600">{customer.billingAddress}</p>
          </div>
        ))}
      </div>

      {isFormOpen && <CustomerForm customer={selectedCustomer} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default CustomerList;
