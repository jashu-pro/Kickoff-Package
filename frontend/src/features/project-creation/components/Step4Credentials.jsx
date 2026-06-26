import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { IntegrationCard } from './IntegrationCard';
import { CustomIntegrationModal } from './CustomIntegrationModal';
import { INTEGRATION_CATEGORIES } from '../config/integrations.config';

export const Step4Credentials = ({ formState }) => {
  const {
    integrations,
    handleGenerateCredentials,
    handleUpdateCredentialField,
    handleAddCustomIntegration,
    handleRemoveIntegration,
    integrationsEnv,
    setIntegrationsEnv
  } = formState;

  const [expandedCategories, setExpandedCategories] = useState(
    INTEGRATION_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const generatedCount = integrations.filter(i => i.status === 'Generated' || i.status === 'Configured').length;
  const totalCount = integrations.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((generatedCount / totalCount) * 100);

  // Group integrations by category
  const integrationsByCategory = INTEGRATION_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = integrations.filter(i => i.category === cat);
    return acc;
  }, {});

  // Add any custom categories that might have been created
  integrations.forEach(inte => {
    if (!integrationsByCategory[inte.category]) {
      integrationsByCategory[inte.category] = [inte];
    }
  });

  return (
    <div className="space-y-8 pb-8">
      {/* Header & Global Progress */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 flex items-center gap-2">
            <Icon name="dashboard" size={28} className="text-primary" /> Enterprise Provisioning
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Configure environments, credentials, and access for the generated Kickoff Package.</p>
        </div>

        <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
          <div className="flex items-center gap-2">
            <Icon name="dns" size={20} className="text-on-surface-variant" />
            <select
              value={integrationsEnv}
              onChange={(e) => setIntegrationsEnv(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="Development">Development</option>
              <option value="Staging">Staging</option>
              <option value="Production">Production</option>
            </select>
          </div>
          <div className="w-px h-6 bg-border-subtle"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Provisioned</span>
              <span className="text-sm font-bold text-primary">{generatedCount} / {totalCount}</span>
            </div>
            <div className="w-24 h-2 bg-surface-variant rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex justify-end border-b border-border pb-4">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-primary hover:bg-primary/10 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-primary/20"
        >
          <Icon name="add" size={18} /> Custom Integration
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {Object.entries(integrationsByCategory).map(([category, items]) => {
          if (items.length === 0) return null;

          const isExpanded = expandedCategories[category];

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => toggleCategory(category)}
              >
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <Icon name={isExpanded ? 'arrow_drop_down' : 'arrow_right'} size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  {category}
                  <span className="bg-surface-variant text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full">{items.length}</span>
                </h4>
                <div className="h-px flex-1 bg-border-subtle ml-4"></div>
              </div>

              {/* Category Items */}
              {isExpanded && (
                <div className="grid grid-cols-1 gap-4 pl-2">
                  {items.map(inte => (
                    <IntegrationCard
                      key={inte.id}
                      integration={inte}
                      onGenerate={handleGenerateCredentials}
                      onUpdateField={handleUpdateCredentialField}
                      onDelete={handleRemoveIntegration}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {integrations.length === 0 && (
          <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-dashed border-border">
            <Icon name="extension_off" size={48} className="text-on-surface-variant/30 mb-4 mx-auto" />
            <h4 className="text-lg font-bold text-on-surface mb-2">No integrations configured</h4>
            <p className="text-on-surface-variant text-sm mb-6 max-w-sm mx-auto">Add integrations manually or use the AI to recommend a stack for your project.</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-2 mx-auto"
            >
              <Icon name="add" size={18} /> Add First Integration
            </button>
          </div>
        )}
      </div>

      <CustomIntegrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCustomIntegration}
      />
    </div>
  );
};
