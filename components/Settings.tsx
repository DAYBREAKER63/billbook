import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CompanyProfile, CustomField } from '../types';
import { INDIAN_STATES } from '../constants';
import Modal from './common/Modal';
import { EditIcon, TrashIcon, PlusIcon } from './common/Icons';

const Settings: React.FC = () => {
  const { companyProfile, updateCompanyProfile } = useData();
  const [profile, setProfile] = useState<CompanyProfile>(companyProfile);
  const [message, setMessage] = useState('');

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [currentField, setCurrentField] = useState<{ label: string; value: string }>({ label: '', value: '' });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setProfile(prev => ({...prev, [name]: checked}));
    } else {
        setProfile(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleColumnVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProfile(prev => ({
        ...prev,
        pdfShowColumns: {
            ...prev.pdfShowColumns,
            [name]: checked,
        }
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(profile);
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // --- Custom Field Handlers ---
  const handleAddNewField = () => {
    setEditingField(null);
    setCurrentField({ label: '', value: '' });
    setIsFieldModalOpen(true);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setCurrentField({ label: field.label, value: field.value });
    setIsFieldModalOpen(true);
  };

  const handleRemoveField = (fieldId: string) => {
    setProfile(prev => ({
        ...prev,
        customFields: prev.customFields.filter(f => f.id !== fieldId)
    }));
  };

  const handleSaveField = () => {
    if (editingField) { // Editing existing field
        setProfile(prev => ({
            ...prev,
            customFields: prev.customFields.map(f => f.id === editingField.id ? { ...f, ...currentField } : f)
        }));
    } else { // Adding new field
        const newField: CustomField = {
            id: `cf-${Date.now()}`,
            ...currentField
        };
        setProfile(prev => ({
            ...prev,
            customFields: [...(prev.customFields || []), newField]
        }));
    }
    setIsFieldModalOpen(false);
  };
  
  const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const FormField: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({ label, children, description }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
  
  const ToggleSwitch: React.FC<{ name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; description?: string }> = ({ name, checked, onChange, label, description }) => (
    <div>
        <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
        </label>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button type="submit" form="settings-form" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700">
            Save Settings
        </button>
      </div>
      
      {message && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
            <p>{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} id="settings-form" className="space-y-6">
        <SettingsCard title="Company Profile">
            <FormField label="Company Name">
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </FormField>
            <FormField label="Address">
              <textarea name="address" value={profile.address} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" rows={3}></textarea>
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="GSTIN">
                  <input type="text" name="gstin" value={profile.gstin} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" />
                </FormField>
                <FormField label="State">
                  <select name="state" value={profile.state} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white">
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Phone">
                    <input type="tel" name="phone" placeholder="Phone" value={profile.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" />
                </FormField>
                <FormField label="Email">
                    <input type="email" name="email" placeholder="Email" value={profile.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" />
                </FormField>
            </div>
            <FormField label="Company Logo">
              <div className="flex items-center gap-4">
                  {profile.logo && <img src={profile.logo} alt="Company Logo" className="w-16 h-16 object-contain rounded-md border p-1" />}
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </FormField>
            
            {/* Custom Fields Section */}
            <div className="pt-4 border-t">
              <FormField label="Custom Invoice Fields" description="Add fields like Bank Details or License Number to appear in the invoice footer.">
                <div className="space-y-2 mt-2">
                    <ToggleSwitch name="showCustomFieldsInPdf" checked={profile.showCustomFieldsInPdf} onChange={handleChange} label="Show Custom Fields on PDF" />
                    {(profile.customFields || []).map(field => (
                        <div key={field.id} className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                            <div>
                                <p className="font-medium text-sm">{field.label}</p>
                                <p className="text-xs text-slate-500">{field.value}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleEditField(field)} className="p-1"><EditIcon /></button>
                                <button type="button" onClick={() => handleRemoveField(field.id)} className="p-1"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddNewField} className="flex items-center justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-blue-600 bg-blue-50 border-2 border-dashed border-blue-200 rounded-md hover:bg-blue-100">
                      <PlusIcon /> <span className="ml-2">Add Custom Field</span>
                    </button>
                </div>
              </FormField>
            </div>
        </SettingsCard>
        
        <SettingsCard title="Invoice Preferences">
            <FormField label="Invoice Number Prefix">
                <input type="text" name="invoicePrefix" value={profile.invoicePrefix} onChange={handleChange} placeholder="e.g. INV-" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </FormField>
            <FormField label="Default GST Rates" description="Comma-separated values for quick selection in invoice form.">
                <input type="text" name="defaultGstRates" value={profile.defaultGstRates} onChange={handleChange} placeholder="e.g. 5,12,18,28" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </FormField>
            <FormField label="Custom Footer">
                <textarea name="customFooter" value={profile.customFooter} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" rows={2} placeholder="e.g., Thank you for your business!"></textarea>
            </FormField>
            <ToggleSwitch name="enableRoundOff" checked={profile.enableRoundOff} onChange={handleChange} label="Enable Grand Total Round-off" />
        </SettingsCard>

        <SettingsCard title="PDF & Print Preferences">
            <FormField label="Default PDF Template">
                 <select name="template" value={profile.template} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white">
                    <option value="standard">Standard</option>
                    <option value="compact">Compact</option>
                    <option value="modern">Modern</option>
                </select>
            </FormField>
            <FormField label="Paper Size">
                 <select name="pdfPaperSize" value={profile.pdfPaperSize} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white">
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="a5">A5</option>
                </select>
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Font Size">
                    <select name="pdfFontSize" value={profile.pdfFontSize} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </FormField>
                <FormField label="Margin Presets">
                    <select name="pdfMargin" value={profile.pdfMargin} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="normal">Normal</option>
                        <option value="narrow">Narrow</option>
                    </select>
                </FormField>
            </div>
             <FormField label="Accent Color">
                <div className="flex items-center gap-2">
                  <input type="color" name="accentColor" value={profile.accentColor} onChange={handleChange} className="h-10 w-10 p-1 border rounded-md" />
                  <input type="text" value={profile.accentColor} onChange={handleChange} name="accentColor" className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-32 bg-white"/>
                </div>
            </FormField>
             <FormField label="Visible Invoice Columns">
                <div className="space-y-2">
                  <ToggleSwitch name="hsn" checked={profile.pdfShowColumns.hsn} onChange={handleColumnVisibilityChange} label="Show HSN/SAC Column" />
                  <ToggleSwitch name="discount" checked={profile.pdfShowColumns.discount} onChange={handleColumnVisibilityChange} label="Show Discount Column" />
                  <ToggleSwitch name="gst" checked={profile.pdfShowColumns.gst} onChange={handleColumnVisibilityChange} label="Show GST Column" />
                </div>
            </FormField>
            <ToggleSwitch name="showLogoInPdf" checked={profile.showLogoInPdf} onChange={handleChange} label="Show Logo on Invoice PDF" />
        </SettingsCard>

        <SettingsCard title="Backup & Sync">
             <ToggleSwitch name="sync" checked={false} onChange={() => {}} label="Enable Google Drive Sync" description="This feature is coming soon." />
        </SettingsCard>

        <SettingsCard title="Security">
             <ToggleSwitch name="security" checked={false} onChange={() => {}} label="Enable Biometric/PIN Lock" description="This feature is coming soon." />
        </SettingsCard>

      </form>

      {isFieldModalOpen && (
        <Modal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} title={editingField ? 'Edit Custom Field' : 'Add Custom Field'}>
            <div className="space-y-4">
                <FormField label="Field Label">
                    <input
                        type="text"
                        placeholder="e.g. Bank Name"
                        value={currentField.label}
                        onChange={(e) => setCurrentField(prev => ({...prev, label: e.target.value}))}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </FormField>
                <FormField label="Field Value">
                     <input
                        type="text"
                        placeholder="e.g. State Bank of India"
                        value={currentField.value}
                        onChange={(e) => setCurrentField(prev => ({...prev, value: e.target.value}))}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </FormField>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsFieldModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md">Cancel</button>
                    <button type="button" onClick={handleSaveField} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Field</button>
                </div>
            </div>
        </Modal>
      )}

    </div>
  );
};

export default Settings;