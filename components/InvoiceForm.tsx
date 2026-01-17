import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Invoice, InvoiceItem, Customer, Item, InvoiceStatus, InvoiceColumnVisibility } from '../types';
import Modal from './common/Modal';
import { TrashIcon } from './common/Icons';

interface InvoiceFormProps {
  invoice: Invoice | null;
  onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onClose }) => {
  const { 
    addInvoice, updateInvoice, getNextInvoiceNumber, customers, items, companyProfile, invoices 
  } = useData();
  
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: invoice?.invoiceNumber || getNextInvoiceNumber(),
    date: invoice?.date || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: invoice?.customer.id || '',
    items: invoice?.items || [{ id: `temp-${Date.now()}`, name: '', hsn: '', quantity: 1, price: 0, discount: 0, gstRate: 18 }],
    status: invoice?.status || InvoiceStatus.DRAFT,
    notes: invoice?.notes || 'Thank you for your business!',
    template: invoice?.template || companyProfile.template,
    paperSize: invoice?.paperSize || companyProfile.pdfPaperSize,
    showColumns: invoice?.showColumns || companyProfile.pdfShowColumns,
  });
  
  const [suggestedItems, setSuggestedItems] = useState<InvoiceItem[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedCustomer = customers.find(c => c.id === (formData as any).customerId);

  const calculateTotals = useCallback(() => {
    let total = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    const isInterState = companyProfile.state !== selectedCustomer?.state;

    formData.items?.forEach(item => {
      const itemAmount = item.quantity * item.price;
      const discountedAmount = itemAmount - (itemAmount * (item.discount || 0) / 100);
      total += discountedAmount;
      const tax = discountedAmount * (item.gstRate || 0) / 100;
      if (isInterState) {
        igst += tax;
      } else {
        cgst += tax / 2;
        sgst += tax / 2;
      }
    });

    const totalWithTax = total + cgst + sgst + igst;
    const grandTotal = companyProfile.enableRoundOff ? Math.round(totalWithTax) : totalWithTax;

    setFormData(prev => ({ ...prev, total, cgst, sgst, igst, grandTotal }));
  }, [formData.items, selectedCustomer, companyProfile.state, companyProfile.enableRoundOff]);


  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColumnVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({
          ...prev,
          showColumns: {
              ...(prev.showColumns as InvoiceColumnVisibility),
              [name]: checked,
          }
      }));
  };
  
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setFormData(prev => ({ ...prev, customerId }));

    if (customerId) {
        const customerInvoices = invoices.filter(inv => inv.customer.id === customerId);
        const itemFrequency = new Map<string, { item: InvoiceItem, count: number }>();

        customerInvoices.forEach(inv => {
            inv.items.forEach(item => {
                const key = `${item.name}-${item.price}`; // Use name and price for uniqueness
                const existing = itemFrequency.get(key);
                if (existing) {
                    itemFrequency.set(key, { ...existing, count: existing.count + 1 });
                } else {
                    const suggestionItem = { ...item, quantity: 1, discount: 0 };
                    itemFrequency.set(key, { item: suggestionItem, count: 1 });
                }
            });
        });
        
        const sortedItems = Array.from(itemFrequency.values())
            .sort((a, b) => b.count - a.count)
            .map(entry => entry.item);

        setSuggestedItems(sortedItems.slice(0, 5));
    } else {
        setSuggestedItems([]);
    }
  };

  const addSuggestedItem = (itemToAdd: InvoiceItem) => {
    const currentItems = formData.items || [];
    // If the only item is the default blank one, replace it. Otherwise, add to the list.
    if (currentItems.length === 1 && currentItems[0].name === '' && currentItems[0].price === 0 && currentItems[0].quantity === 1) {
        setFormData(prev => ({ ...prev, items: [{ ...itemToAdd, id: `temp-${Date.now()}` }] }));
    } else {
        setFormData(prev => ({ ...prev, items: [...currentItems, { ...itemToAdd, id: `temp-${Date.now()}` }] }));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...(formData.items || [])];
    (newItems[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleItemSearch = (index: number, query: string) => {
    handleItemChange(index, 'name', query);
    setActiveSearchIndex(index);

    if (query.trim()) {
      setFilteredItems(
        items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
      );
    } else {
      setFilteredItems(items); // Show all items if search is cleared
    }
  };

  const handleSearchedItemSelect = (itemIndex: number, selectedItem: Item) => {
    const newItems = [...(formData.items || [])];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      name: selectedItem.name,
      price: selectedItem.price,
      hsn: selectedItem.hsn,
      gstRate: selectedItem.gstRate
    };
    setFormData(prev => ({ ...prev, items: newItems }));
    
    setFilteredItems([]);
    setActiveSearchIndex(null);
  };


  const addItem = () => {
    const newItems = [...(formData.items || []), { id: `temp-${Date.now()}`, name: '', hsn: '', quantity: 1, price: 0, discount: 0, gstRate: 18 }];
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
        alert("Please select a customer.");
        return;
    }
    const finalInvoice: Invoice = {
      id: invoice?.id || `inv-${Date.now()}`,
      ...formData,
      customer: selectedCustomer,
    } as Invoice;
    
    if (invoice) {
      updateInvoice(finalInvoice);
    } else {
      addInvoice(finalInvoice);
    }
    onClose();
  };
  
  const defaultGstRates = companyProfile.defaultGstRates.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));

  return (
    <Modal isOpen={true} onClose={onClose} title={invoice ? 'Edit Invoice' : 'New Invoice'}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Invoice #</label>
            <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full px-2 py-1 border rounded" readOnly />
          </div>
          <div>
            <label className="block font-medium">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-2 py-1 border rounded bg-white">
              {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-2 py-1 border rounded" required />
          </div>
          <div>
            <label className="block font-medium">Due Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-2 py-1 border rounded" required />
          </div>
        </div>
        
        <div>
          <label className="block font-medium">Customer</label>
          <select name="customerId" value={(formData as any).customerId} onChange={handleCustomerChange} className="w-full px-2 py-1 border rounded bg-white" required>
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        {suggestedItems.length > 0 && (
          <div className="p-2 bg-slate-50 rounded-md">
            <label className="block font-medium text-xs text-slate-500 mb-2">Quick Add from History:</label>
            <div className="flex flex-wrap gap-2">
              {suggestedItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addSuggestedItem(item)}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
                  title={`Add ${item.name}`}
                >
                  + {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
            <h3 className="font-semibold">Items</h3>
            {formData.items?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border rounded relative">
                   <div className="col-span-12 relative">
                        <input
                            type="text"
                            placeholder="Select or enter item name"
                            value={item.name}
                            onFocus={() => {
                                setActiveSearchIndex(index);
                                setFilteredItems(items);
                            }}
                            onChange={(e) => handleItemSearch(index, e.target.value)}
                            onBlur={() => {
                                // Delay hiding to allow click event on search results
                                setTimeout(() => {
                                    if(activeSearchIndex === index) setActiveSearchIndex(null);
                                }, 150);
                            }}
                            className="w-full px-2 py-1 border rounded"
                        />
                        {activeSearchIndex === index && filteredItems.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded-b-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                {filteredItems.map(filteredItem => (
                                    <div
                                        key={filteredItem.id}
                                        className="p-2 text-sm hover:bg-blue-50 cursor-pointer"
                                        onClick={() => handleSearchedItemSelect(index, filteredItem)}
                                    >
                                        <p className="font-medium">{filteredItem.name}</p>
                                        <p className="text-xs text-slate-500">HSN: {filteredItem.hsn} - ₹{filteredItem.price}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                   </div>
                   <input type="text" placeholder="HSN" value={item.hsn} onChange={(e) => handleItemChange(index, 'hsn', e.target.value)} className="col-span-3 px-2 py-1 border rounded" />
                   <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} className="col-span-2 px-2 py-1 border rounded" />
                   <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))} className="col-span-3 px-2 py-1 border rounded" />
                   <input type="number" placeholder="Disc %" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))} className="col-span-2 px-2 py-1 border rounded" />
                   <select value={item.gstRate} onChange={(e) => handleItemChange(index, 'gstRate', parseFloat(e.target.value))} className="col-span-2 px-2 py-1 border rounded bg-white">
                      {defaultGstRates.map(rate => <option key={rate} value={rate}>{rate}%</option>)}
                      <option value="0">Exempt</option>
                   </select>

                   <button type="button" onClick={() => removeItem(index)} className="absolute top-1 right-1">
                      <TrashIcon />
                   </button>
                </div>
            ))}
            <button type="button" onClick={addItem} className="px-3 py-1 bg-slate-200 rounded text-xs">Add Item</button>
        </div>

        <div className="text-right space-y-1 font-medium">
            <div>Subtotal: ₹{formData.total?.toFixed(2) || '0.00'}</div>
            {formData.cgst > 0 && <div>CGST: ₹{formData.cgst?.toFixed(2) || '0.00'}</div>}
            {formData.sgst > 0 && <div>SGST: ₹{formData.sgst?.toFixed(2) || '0.00'}</div>}
            {formData.igst > 0 && <div>IGST: ₹{formData.igst?.toFixed(2) || '0.00'}</div>}
            <div className="text-lg font-bold">Total: ₹{formData.grandTotal?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</div>
        </div>

        <div>
            <label className="block font-medium">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full px-2 py-1 border rounded" rows={2}></textarea>
        </div>
        
        <div>
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-blue-600 text-sm font-medium">
                {showAdvanced ? 'Hide' : 'Show'} Advanced PDF Options
            </button>
             {showAdvanced && (
                <div className="mt-2 p-3 border rounded-md bg-slate-50 space-y-3">
                    <div>
                        <label className="block font-medium">PDF Template</label>
                        <select name="template" value={formData.template} onChange={handleChange} className="w-full px-2 py-1 border rounded bg-white">
                            <option value="standard">Standard</option>
                            <option value="compact">Compact</option>
                            <option value="modern">Modern</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Overrides the default template from settings.</p>
                    </div>
                    <div>
                        <label className="block font-medium">Paper Size</label>
                        <select name="paperSize" value={formData.paperSize} onChange={handleChange} className="w-full px-2 py-1 border rounded bg-white">
                            <option value="a4">A4</option>
                            <option value="letter">Letter</option>
                            <option value="a5">A5</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Visible Columns</label>
                        <div className="space-y-1">
                            <label className="flex items-center gap-2"><input type="checkbox" name="hsn" checked={formData.showColumns?.hsn} onChange={handleColumnVisibilityChange} /> Show HSN/SAC</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="discount" checked={formData.showColumns?.discount} onChange={handleColumnVisibilityChange} /> Show Discount</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="gst" checked={formData.showColumns?.gst} onChange={handleColumnVisibilityChange} /> Show GST Rate</label>
                        </div>
                    </div>
                    {companyProfile.customFields && companyProfile.customFields.length > 0 && (
                        <div>
                            <label className="block font-medium">Custom Fields (from Company Profile)</label>
                            <div className="mt-1 p-2 border rounded bg-slate-100 text-xs text-slate-600 space-y-1">
                                {companyProfile.customFields.map(field => (
                                    <p key={field.id}><strong>{field.label}:</strong> {field.value}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>


        <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save Invoice</button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceForm;