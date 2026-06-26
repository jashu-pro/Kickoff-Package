import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';

export const IntegrationCard = ({
  integration,
  onGenerate,
  onUpdateField,
  onDelete
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState({});

  const handleCopy = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (key) => {
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'Generated':
      case 'Configured':
        return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200 uppercase tracking-wider">{status}</span>;
      case 'Provisioning':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-200 uppercase tracking-wider flex items-center gap-1"><Icon name="sync" size={12} className="animate-spin" /> {status}</span>;
      case 'Failed':
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200 uppercase tracking-wider">{status}</span>;
      default:
        return <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200 uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="border border-border-subtle rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div 
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low/30"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            <Icon name={integration.icon || 'build'} size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-on-surface text-base">{integration.service}</h4>
              {renderBadge(integration.status)}
            </div>
            <p className="text-sm text-on-surface-variant mt-0.5">{integration.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {integration.status === 'Pending' && (
            <button
              type="button"
              onClick={() => onGenerate(integration.id)}
              className="bg-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
            >
              <Icon name="bolt" size={14} /> Generate
            </button>
          )}
          {integration.status === 'Generated' && (
            <button
              type="button"
              onClick={() => onGenerate(integration.id)}
              className="bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-border transition-all flex items-center gap-1"
            >
              <Icon name="refresh" size={14} /> Regenerate
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(integration.id)}
            className="text-on-surface-variant hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Remove Integration"
          >
            <Icon name="delete" size={18} />
          </button>
          <Icon name={expanded ? 'expand_less' : 'expand_more'} size={20} className="text-on-surface-variant ml-2" />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 bg-surface-container-low/30 grid grid-cols-1 md:grid-cols-2 gap-4">
          {integration.fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{field.label}</label>
              
              <div className="relative group flex items-center">
                <input
                  type={field.type === 'password' && !revealedKeys[field.key] ? 'password' : 'text'}
                  value={field.value || ''}
                  onChange={(e) => onUpdateField(integration.id, field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full bg-white border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-20 transition-all font-mono"
                  readOnly={integration.status === 'Provisioning'}
                />
                
                {/* Actions */}
                <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => toggleReveal(field.key)}
                      className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                      title={revealedKeys[field.key] ? "Hide" : "Reveal"}
                    >
                      <Icon name={revealedKeys[field.key] ? "visibility_off" : "visibility"} size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(field.key, field.value)}
                    className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                    title="Copy to clipboard"
                  >
                    <Icon name={copiedKey === field.key ? "check" : "content_copy"} size={14} className={copiedKey === field.key ? "text-green-500" : ""} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {integration.generated_at && (
            <div className="col-span-full mt-2 pt-3 border-t border-border-subtle flex justify-between items-center text-xs text-on-surface-variant font-medium">
              <span className="flex items-center gap-1"><Icon name="schedule" size={14} /> Provisioned at {integration.generated_at}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
