
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Item } from '../types';
import Modal from './common/Modal';
import { PlusIcon, EditIcon, TrashIcon } from './common/Icons';

const ItemForm: React.FC<{ item: Item | null; onClose: () => void }> = ({ item, onClose }) => {
  const { addItem, updateItem } = useData();
  const [formData, setFormData] = useState<Partial<Item>>(
    item || { name: '', price: 0, hsn: '', gstRate: 18 }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      updateItem({ ...item, ...formData });
    } else {
      addItem({ id: `item-${Date.now()}`, ...formData } as Item);
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={item ? 'Edit Item' : 'New Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block font-medium">Name</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-2 py-1 border rounded" required />
        </div>
        <div>
            <label className="block font-medium">Price</label>
            <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="w-full px-2 py-1 border rounded" required />
        </div>
        <div>
            <label className="block font-medium">HSN/SAC Code</label>
            <input type="text" name="hsn" value={formData.hsn || ''} onChange={handleChange} className="w-full px-2 py-1 border rounded" required />
        </div>
        <div>
            <label className="block font-medium">GST Rate (%)</label>
            <input type="number" name="gstRate" value={formData.gstRate || 0} onChange={handleChange} className="w-full px-2 py-1 border rounded" required />
        </div>
        <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
    </Modal>
  );
};

const ItemList: React.FC = () => {
  const { items, deleteItem } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Items / Services</h1>
        <button onClick={handleAddNew} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700">
          <PlusIcon /><span className="ml-2">Add Item</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">GST</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="p-3">{item.gstRate}%</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(item)}><EditIcon /></button>
                      <button onClick={() => deleteItem(item.id)}><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && <ItemForm item={selectedItem} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default ItemList;
