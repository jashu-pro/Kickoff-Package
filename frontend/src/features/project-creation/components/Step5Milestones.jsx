import React from 'react';
import { Icon } from '../../../components/Icon';

export const Step5Milestones = ({ formState }) => {
  const {
    // Destructure all possible state you might need here
    // or just let it destructure everything blindly.
    // Actually, spreading it makes it easy, but for now we'll destructure commonly used:
    formData, handleInputChange, priority, setPriority,
    teamMembers, showAddMemberInline, setShowAddMemberInline, inlineName, setInlineName, inlineRole, setInlineRole, inlineDept, setInlineDept, inlineSkills, setInlineSkills, handleAddMemberSubmit, handleDeleteMember, handleAddSuggestedRole,
    channels, handleChannelChange, meetings, showAddMeetingInline, setShowAddMeetingInline, meetName, setMeetName, meetFreq, setMeetFreq, meetDay, setMeetDay, meetTime, setMeetTime, meetDuration, setMeetDuration, clientContacts, showAddContactInline, setShowAddContactInline, contactName, setContactName, contactRole, setContactRole, contactEmail, setContactEmail, contactPhone, setContactPhone, handleChannelBlur, handleApplySuggestedFreq,
    integrations, handleToggleIntegration,
    milestones, showAddMilestoneInline, setShowAddMilestoneInline, msTitle, setMsTitle, msDesc, setMsDesc, msStart, setMsStart, msEnd, setMsEnd, handleAddMilestoneSubmit, handleDeleteMilestone, handleAddSuggestedMilestone, risks, setRisks, deliverables, setDeliverables, setDbError
  } = formState;

  return (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 5: Timeline & Milestones</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">Plot scheduled deliverables and inspect onboarding risks</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMilestoneInline(!showAddMilestoneInline)
                        setDbError(null)
                      }}
                      className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Icon name="add" size={16} /> Add Milestone
                    </button>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-3">
                    {milestones.map((m, idx) => (
                      <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-on-surface text-sm">{m.title}</h4>
                            <p className="text-xs text-on-surface-variant mt-0.5">{m.description || 'No description provided.'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMilestone(m.id, idx)}
                            className="text-outline hover:text-status-error transition-all"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border-subtle text-xs text-on-surface-variant font-medium">
                          <span className="flex items-center gap-1"><Icon name="calendar_today" size={14} /> Start: {m.start_date || 'Project Start'}</span>
                          <span className="flex items-center gap-1"><Icon name="event" size={14} /> End: {m.end_date || 'Project Start'}</span>
                          <span className="flex items-center gap-1 capitalize">
                            <span className={`w-2 h-2 rounded-full ${m.status === 'in_progress' ? 'bg-primary' : m.status === 'completed' ? 'bg-status-success' : 'bg-outline-variant'}`} />
                            Status: {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showAddMilestoneInline && (
                    <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                      <h4 className="font-bold uppercase tracking-wider">Add Custom Milestone</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Milestone Title (e.g. Architecture Approval)"
                          className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={msTitle}
                          onChange={(e) => setMsTitle(e.target.value)}
                        />
                        <textarea
                          placeholder="Milestone Description"
                          rows={2}
                          className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={msDesc}
                          onChange={(e) => setMsDesc(e.target.value)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-on-surface-variant">Start Date</label>
                            <input
                              type="date"
                              className="w-full bg-surface-base border border-border-subtle rounded px-2 py-1 text-xs"
                              value={msStart}
                              onChange={(e) => setMsStart(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-on-surface-variant">End Date</label>
                            <input
                              type="date"
                              className="w-full bg-surface-base border border-border-subtle rounded px-2 py-1 text-xs"
                              value={msEnd}
                              onChange={(e) => setMsEnd(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMilestoneInline(false)}
                          className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddMilestoneSubmit}
                          className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                        >
                          Schedule Milestone
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Risks Assessment Section */}
                  <div className="space-y-4 pt-4 border-t border-border-subtle">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="warning" size={16} className="text-status-warning" /> Risk Assessment Matrix
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.keys(risks).map((riskKey) => (
                        <div key={riskKey} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-3 shadow-sm text-center">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-2">{riskKey} Risk</span>
                          <div className="flex flex-col gap-1.5">
                            {['low', 'medium', 'high'].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setRisks({ ...risks, [riskKey]: lvl })}
                                className={`py-1 rounded text-xs font-bold transition-all border capitalize ${
                                  risks[riskKey] === lvl
                                    ? lvl === 'high' ? 'bg-status-error/15 border-status-error text-status-error'
                                      : lvl === 'medium' ? 'bg-status-warning/15 border-status-warning text-status-warning'
                                      : 'bg-status-success/15 border-status-success text-status-success'
                                    : 'border-border-subtle text-outline-variant hover:bg-surface-container-low'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
  );
};
