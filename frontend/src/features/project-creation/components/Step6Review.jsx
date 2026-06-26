import React from 'react';
import { Icon } from '../../../components/Icon';

export const Step6Review = ({ formState }) => {
  const {
    formData, priority, teamMembers, channels, meetings, clientContacts, integrations, milestones, deliverables, setDeliverables, completenessScore
  } = formState;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 6: Review & Generate</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Validate project details and generate kickoff packages</p>
      </div>

      <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Icon name="fact_check" size={18} className="text-primary" /> Project Summary
          </h4>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
            {completenessScore || 0}% Complete
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Project Identity</span>
              <p className="font-bold text-on-surface text-sm">{formData.projectName || 'Unnamed Project'}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Client: {formData.clientName || 'N/A'}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Type: {formData.projectType || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Schedule & Priority</span>
              <p className="text-xs text-on-surface font-medium capitalize flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${priority === 'Critical' ? 'bg-status-error' : priority === 'High' ? 'bg-status-warning' : 'bg-status-success'}`} /> {priority} Priority</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">{formData.startDate || 'No start'} to {formData.endDate || 'No end'}</p>
            </div>
          </div>
          <div className="space-y-4">
             <div>
               <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Financials & Leadership</span>
               <p className="text-xs text-on-surface font-medium">Budget: {formData.contractValue ? `$${formData.contractValue}` : 'N/A'}</p>
               <p className="text-xs text-on-surface-variant font-medium mt-1">Manager: {formData.projectManager || 'N/A'}</p>
             </div>
             <div>
               <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Scale Overview</span>
               <div className="grid grid-cols-2 gap-2 mt-2">
                 <div className="bg-surface-base border border-border-subtle rounded-lg p-2 text-center">
                   <p className="text-lg font-bold text-primary">{teamMembers.length}</p>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase">Consultants</p>
                 </div>
                 <div className="bg-surface-base border border-border-subtle rounded-lg p-2 text-center">
                   <p className="text-lg font-bold text-primary">{milestones.length}</p>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase">Milestones</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Deliverables checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
          <Icon name="inventory" size={16} className="text-primary" /> Included Deliverables
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'kickoffDocument', label: 'Kickoff Document', desc: 'Strategy deck & agenda' },
            { key: 'projectCharter', label: 'Project Charter', desc: 'Alignment charter signed by sponsors' },
            { key: 'teamDirectory', label: 'Team Directory', desc: 'Roles & escalation contacts' },
            { key: 'communicationMatrix', label: 'Communication Matrix', desc: 'Slack guidelines & meetings' },
            { key: 'timelinePlan', label: 'Timeline Plan', desc: 'Milestones & delivery deadlines' },
            { key: 'credentialsSheet', label: 'Credentials Sheet', desc: 'Secure environments catalog' }
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => setDeliverables({ ...deliverables, [item.key]: !deliverables[item.key] })}
              className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${deliverables[item.key] ? 'border-primary bg-primary-container/5 shadow-sm' : 'border-border-subtle bg-surface-container-lowest hover:bg-surface-container-low'}`}
            >
              <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${deliverables[item.key] ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'}`}>
                {deliverables[item.key] && <Icon name="check" size={12} />}
              </div>
              <div>
                <h5 className="font-bold text-xs text-on-surface">{item.label}</h5>
                <p className="text-[10px] text-on-surface-variant opacity-75 mt-0.5 leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={formState.handleExportJSON || formState.handleDownloadPackage}
          className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95 border border-border-subtle"
        >
          <Icon name="data_object" size={16} /> JSON Backup
        </button>
        <button
          type="button"
          onClick={formState.handleSharePackage}
          className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95 border border-border-subtle"
        >
          <Icon name="share" size={16} /> Share Link
        </button>
      </div>
    </div>
  );
};
