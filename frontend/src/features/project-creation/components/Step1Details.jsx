import React from 'react';
import { Icon } from '../../../components/Icon';

export const Step1Details = ({ formState }) => {
  const {
    // Destructure all possible state you might need here
    // or just let it destructure everything blindly.
    // Actually, spreading it makes it easy, but for now we'll destructure commonly used:
    formData, handleInputChange, handleInputBlur, saveProjectDetails, priority, setPriority,
    teamMembers, showAddMemberInline, setShowAddMemberInline, inlineName, setInlineName, inlineRole, setInlineRole, inlineDept, setInlineDept, inlineSkills, setInlineSkills, handleAddMemberSubmit, handleDeleteMember, handleAddSuggestedRole,
    channels, handleChannelChange, meetings, showAddMeetingInline, setShowAddMeetingInline, meetName, setMeetName, meetFreq, setMeetFreq, meetDay, setMeetDay, meetTime, setMeetTime, meetDuration, setMeetDuration, clientContacts, showAddContactInline, setShowAddContactInline, contactName, setContactName, contactRole, setContactRole, contactEmail, setContactEmail, contactPhone, setContactPhone, handleChannelBlur, handleApplySuggestedFreq,
    integrations, handleToggleIntegration,
    milestones, showAddMilestoneInline, setShowAddMilestoneInline, msTitle, setMsTitle, msDesc, setMsDesc, msStart, setMsStart, msEnd, setMsEnd, handleAddMilestoneSubmit, handleDeleteMilestone, handleAddSuggestedMilestone, risks, setRisks, deliverables, setDeliverables
  } = formState;

  return (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 1: Project Details</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Initialize project parameters and metadata</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="client-name">Client Name *</label>
                      <input
                        id="client-name"
                        type="text"
                        required
                        placeholder="Acme Corporation"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-name">Project Name *</label>
                      <input
                        id="project-name"
                        type="text"
                        required
                        placeholder="Cloud Infrastructure Migration"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.projectName}
                        onChange={(e) => handleInputChange('projectName', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="industry">Industry</label>
                      <select
                        id="industry"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.industry}
                        onChange={(e) => {
                          handleInputChange('industry', e.target.value)
                          saveProjectDetails({ industry: e.target.value })
                        }}
                      >
                        <option>Financial Services</option>
                        <option>Healthcare</option>
                        <option>Technology</option>
                        <option>Manufacturing</option>
                        <option>Retail</option>
                        <option>Energy</option>
                        <option>Public Sector</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-type">Project Type</label>
                      <input
                        id="project-type"
                        type="text"
                        placeholder="Cloud Transformation"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.projectType}
                        onChange={(e) => handleInputChange('projectType', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="contract-value">Contract Value (₹)</label>
                      <input
                        id="contract-value"
                        type="number"
                        placeholder="125000"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.contractValue}
                        onChange={(e) => handleInputChange('contractValue', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="start-date">Start Date</label>
                      <input
                        id="start-date"
                        type="date"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="end-date">End Date</label>
                      <input
                        id="end-date"
                        type="date"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="pm">Project Manager</label>
                      <select
                        id="pm"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.projectManager}
                        onChange={(e) => {
                          handleInputChange('projectManager', e.target.value)
                          saveProjectDetails({ projectManager: e.target.value })
                        }}
                      >
                        <option>Sarah Jenkins</option>
                        <option>Mark Thompson</option>
                        <option>David Chen</option>
                        <option>Elena Rostova</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant">Priority Level</label>
                      <div className="flex gap-2">
                        {['low', 'medium', 'high'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => {
                              setPriority(level)
                              saveProjectDetails({ priority: level })
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold capitalize transition-all flex items-center justify-center gap-1.5 ${
                              priority === level
                                ? level === 'high' ? 'border-status-error bg-error-container/20 text-status-error'
                                  : level === 'medium' ? 'border-status-warning bg-status-warning/10 text-status-warning'
                                  : 'border-status-success bg-status-success/10 text-status-success'
                                : 'border-border-subtle hover:bg-surface-container-low text-on-surface-variant'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${level === 'high' ? 'bg-status-error' : level === 'medium' ? 'bg-status-warning' : 'bg-status-success'}`} />
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="notes">Internal Notes</label>
                    <textarea
                      id="notes"
                      rows={4}
                      placeholder="Compliance requirements, primary technical challenges, and key client milestones..."
                      className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </div>
  );
};
