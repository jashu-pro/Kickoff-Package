import React from 'react';
import { Icon } from '../../../components/Icon';

export const Step2Team = ({ formState }) => {
  const {
    // Destructure all possible state you might need here
    // or just let it destructure everything blindly.
    // Actually, spreading it makes it easy, but for now we'll destructure commonly used:
    formData, handleInputChange, priority, setPriority, setDbError,
    teamMembers, showAddMemberInline, setShowAddMemberInline, inlineName, setInlineName, inlineRole, setInlineRole, inlineDept, setInlineDept, inlineSkills, setInlineSkills, handleAddMemberSubmit, handleDeleteMember, handleAddSuggestedRole,
    channels, handleChannelChange, meetings, showAddMeetingInline, setShowAddMeetingInline, meetName, setMeetName, meetFreq, setMeetFreq, meetDay, setMeetDay, meetTime, setMeetTime, meetDuration, setMeetDuration, clientContacts, showAddContactInline, setShowAddContactInline, contactName, setContactName, contactRole, setContactRole, contactEmail, setContactEmail, contactPhone, setContactPhone, handleChannelBlur, handleApplySuggestedFreq,
    integrations, handleToggleIntegration,
    milestones, showAddMilestoneInline, setShowAddMilestoneInline, msTitle, setMsTitle, msDesc, setMsDesc, msStart, setMsStart, msEnd, setMsEnd, handleAddMilestoneSubmit, handleDeleteMilestone, handleAddSuggestedMilestone, risks, setRisks, deliverables, setDeliverables
  } = formState;

  return (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 2: Team Assignment</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">Assemble delivery team and define key capabilities</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMemberInline(!showAddMemberInline)
                        setDbError(null)
                      }}
                      className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Icon name="add" size={16} /> Add Consultant
                    </button>
                  </div>

                  {/* Team Member Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold font-headline-sm shrink-0">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-sm">{member.name}</h4>
                            <p className="text-xs text-on-surface-variant opacity-80">{member.role} • {member.department}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(member.skills || []).map((skill, sIdx) => (
                                <span key={sIdx} className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, idx)}
                          className="text-outline hover:text-status-error transition-all"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Member form */}
                  {showAddMemberInline && (
                    <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Add New Consultant</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Consultant Name"
                          className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineName}
                          onChange={(e) => setInlineName(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Lead Dev)"
                          className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineRole}
                          onChange={(e) => setInlineRole(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Department (e.g. Delivery)"
                          className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineDept}
                          onChange={(e) => setInlineDept(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Skills (comma separated, e.g. AWS, Node.js)"
                          className="flex-1 bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineSkills}
                          onChange={(e) => setInlineSkills(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddMemberInline(false)}
                            className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddMemberSubmit}
                            className="px-4 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                          >
                            Add Member
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
  );
};
