import React from 'react';
import { Icon } from '../../../components/Icon';

export const Step6Review = ({ formState }) => {
  const {
    // Destructure all possible state you might need here
    // or just let it destructure everything blindly.
    // Actually, spreading it makes it easy, but for now we'll destructure commonly used:
    formData, handleInputChange, priority, setPriority,
    teamMembers, showAddMemberInline, setShowAddMemberInline, inlineName, setInlineName, inlineRole, setInlineRole, inlineDept, setInlineDept, inlineSkills, setInlineSkills, handleAddMemberSubmit, handleDeleteMember, handleAddSuggestedRole,
    channels, handleChannelChange, meetings, showAddMeetingInline, setShowAddMeetingInline, meetName, setMeetName, meetFreq, setMeetFreq, meetDay, setMeetDay, meetTime, setMeetTime, meetDuration, setMeetDuration, clientContacts, showAddContactInline, setShowAddContactInline, contactName, setContactName, contactRole, setContactRole, contactEmail, setContactEmail, contactPhone, setContactPhone, handleChannelBlur, handleApplySuggestedFreq,
    integrations, handleToggleIntegration,
    milestones, showAddMilestoneInline, setShowAddMilestoneInline, msTitle, setMsTitle, msDesc, setMsDesc, msStart, setMsStart, msEnd, setMsEnd, handleAddMilestoneSubmit, handleDeleteMilestone, handleAddSuggestedMilestone, risks, setRisks, deliverables, setDeliverables
  } = formState;

  return (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 6: Review & Generate</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Validate details and select export format packages</p>
                  </div>

                  {/* Summary card review */}
                  <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-4 space-y-4 shadow-sm text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Project Identity</span>
                        <p className="font-bold text-on-surface text-sm mt-1">{formData.projectName || 'Unnamed Project'}</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Client: {formData.clientName || 'N/A'} • {formData.projectType || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Priority & Schedule</span>
                        <p className="font-bold text-on-surface capitalize mt-1">{priority} Priority</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">{formData.startDate || 'No start'} to {formData.endDate || 'No end'}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-border-subtle grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div>
                        <span className="text-outline font-bold uppercase block mb-1">Consultants</span>
                        <span className="font-bold text-on-surface text-xs">{teamMembers.length} Assigned</span>
                      </div>
                      <div>
                        <span className="text-outline font-bold uppercase block mb-1">Milestones</span>
                        <span className="font-bold text-on-surface text-xs">{milestones.length} Scheduled</span>
                      </div>
                      <div>
                        <span className="text-outline font-bold uppercase block mb-1">Credentials Required</span>
                        <span className="font-bold text-on-surface text-xs">{integrations.filter(i => i.required).length} Required</span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="inventory" size={16} className="text-primary" /> Deliverables Checklists
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'kickoffDocument', label: 'Kickoff Document', desc: 'Kickoff strategy presentation deck & initial agenda.' },
                        { key: 'projectCharter', label: 'Project Charter', desc: 'Core alignment charter signed by sponsors.' },
                        { key: 'teamDirectory', label: 'Team Directory', desc: 'Roles roster and escalation contacts directory.' },
                        { key: 'communicationMatrix', label: 'Communication Matrix', desc: 'Slack guidelines and meeting schedules.' },
                        { key: 'timelinePlan', label: 'Timeline Plan', desc: 'Target milestones and delivery deadlines.' },
                        { key: 'credentialsSheet', label: 'Credentials Sheet', desc: 'AWS/GitHub secure environments catalog.' }
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
                            <p className="text-[10px] text-on-surface-variant opacity-75 mt-0.5 leading-normal">{item.desc}</p>
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
                      className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95"
                    >
                      <Icon name="download" size={16} /> Download JSON
                    </button>
                    <button
                      type="button"
                      onClick={formState.handleSharePackage}
                      className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95"
                    >
                      <Icon name="share" size={16} /> Share Link
                    </button>
                  </div>
                </div>
  );
};
