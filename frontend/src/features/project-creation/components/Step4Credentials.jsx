import React from 'react';
import { Icon } from '../../../components/Icon';

export const Step4Credentials = ({ formState }) => {
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
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 4: Integration Credentials</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Set required environments, repositories, and workspace access</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((inte, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleIntegration(idx)}
                        className={`border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-start ${inte.required ? 'border-primary bg-primary-container/5 shadow-sm' : 'border-border-subtle hover:bg-surface-container-low bg-surface-container-lowest'}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-on-surface text-sm">{inte.service}</h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${inte.required ? 'bg-primary text-white' : 'bg-surface-container text-outline'}`}>
                              {inte.required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant opacity-80 leading-normal">{inte.description}</p>
                          <div className="flex items-center gap-1.5 pt-2.5">
                            <span className={`w-2 h-2 rounded-full ${inte.status === 'active' ? 'bg-status-success' : 'bg-status-warning animate-pulse'}`} />
                            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">{inte.status === 'active' ? 'provisioned' : 'pending generation'}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${inte.required ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'}`}>
                          {inte.required && <Icon name="check" size={14} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
  );
};
