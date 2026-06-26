import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { INTEGRATION_CATEGORIES } from '../config/integrations.config';

export const CustomIntegrationModal = ({ isOpen, onClose, onSave }) => {
  const [service, setService] = useState('');
  const [category, setCategory] = useState(INTEGRATION_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('extension');
  const [fields, setFields] = useState([
    { key: 'apiKey', label: 'API Key', type: 'password', value: '' },
    { key: 'url', label: 'Endpoint URL', type: 'url', value: '' }
  ]);

  if (!isOpen) return null;

  const handleAddField = () => {
    setFields([...fields, { key: `field${fields.length}`, label: 'New Field', type: 'text', value: '' }]);
  };

  const handleUpdateField = (index, prop, value) => {
    const updated = [...fields];
    updated[index][prop] = value;
    if (prop === 'label') {
      // Auto-generate a safe key based on label if key hasn't been heavily modified
      updated[index].key = value.toLowerCase().replace(/\s+/g, '') || `field${index}`;
    }
    setFields(updated);
  };

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!service.trim()) return;

    onSave({
      id: service.toLowerCase().replace(/\s+/g, '-'),
      category,
      service,
      description,
      icon,
      status: 'Pending',
      fields: fields.filter(f => f.label.trim() !== '')
    });
    
    // Reset
    setService('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-xl font-bold text-on-surface">Add Custom Integration</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant transition-colors">
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface">
          <form id="customIntegrationForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Service Name</label>
                <input
                  required
                  type="text"
                  value={service}
                  onChange={e => setService(e.target.value)}
                  placeholder="e.g. Firebase, Stripe, Twilio"
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-4 py-2 focus:border-primary outline-none"
                >
                  {INTEGRATION_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of the service's purpose"
                className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-4 py-2 focus:border-primary outline-none"
              />
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-on-surface">Configuration Fields</h3>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <Icon name="add" size={18} /> Add Field
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Field Label</label>
                      <input
                        type="text"
                        required
                        value={field.label}
                        onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                        placeholder="e.g. Account SID"
                        className="w-full bg-white border border-border-subtle rounded px-3 py-1.5 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                        className="w-full bg-white border border-border-subtle rounded px-3 py-1.5 text-sm outline-none focus:border-primary"
                      >
                        <option value="text">Text</option>
                        <option value="password">Password / Secret</option>
                        <option value="url">URL</option>
                        <option value="boolean">Toggle (Boolean)</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="mt-6 text-on-surface-variant hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Icon name="delete" size={18} />
                    </button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-4 bg-surface-container-lowest rounded-lg border border-dashed border-border-subtle">No fields added. Click "Add Field" to define configuration keys.</p>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-bold text-on-surface hover:bg-surface-variant transition-colors">
            Cancel
          </button>
          <button type="submit" form="customIntegrationForm" className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
            Save Integration
          </button>
        </div>
      </div>
    </div>
  );
};
