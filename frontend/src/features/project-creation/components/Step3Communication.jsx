import React from 'react';
import { Icon } from '../../../components/Icon';

export const Step3Communication = ({ formState }) => {
  const {
    channels, handleChannelChange, handleChannelBlur, meetings, clientContacts, showAddContactInline, setShowAddContactInline, contactName, setContactName, contactRole, setContactRole, contactEmail, setContactEmail, contactPhone, setContactPhone, showAddMeetingInline, setShowAddMeetingInline, meetName, setMeetName, meetFreq, setMeetFreq, meetDay, setMeetDay, meetTime, setMeetTime, meetDuration, setMeetDuration, setDbError, db, setMeetings, refreshProjects, saveProjectDetails, localProjectId, setClientContacts, teamMembers, formData
  } = formState;

  return (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 3: Communication Setup</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Set up Slack channels, meetings, and client contacts</p>
                  </div>

                  {/* Slack channels */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="chat" size={16} className="text-primary" /> Slack Channels
                    </h4>
                    {channels.map((ch, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-surface-container-low border border-border-subtle rounded-xl">
                        <div className="space-y-1">
                          <label className="text-[10px] text-on-surface-variant font-bold uppercase">Channel Name</label>
                          <input
                            type="text"
                            className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={ch.name}
                            onChange={(e) => handleChannelChange(idx, 'name', e.target.value)}
                            onBlur={() => handleChannelBlur(ch)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-on-surface-variant font-bold uppercase">Channel URL / Handle</label>
                          <input
                            type="text"
                            placeholder="#proj-acme-cloud"
                            className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={ch.channel_url}
                            onChange={(e) => handleChannelChange(idx, 'channel_url', e.target.value)}
                            onBlur={() => handleChannelBlur(ch)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meeting Frequency */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                        <Icon name="meeting_room" size={16} className="text-primary" /> Meetings Cadence
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMeetingInline(!showAddMeetingInline)
                          setDbError(null)
                        }}
                        className="text-primary hover:bg-primary-fixed/20 px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-0.5"
                      >
                        <Icon name="add" size={14} /> Add Sync
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {meetings.map((m, idx) => (
                        <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-3 flex justify-between items-center text-xs shadow-sm">
                          <div>
                            <span className="font-bold text-on-surface">{m.name}</span>
                            <span className="text-[10px] text-on-surface-variant ml-2 bg-surface-container px-2.5 py-0.5 rounded-full font-bold uppercase">{m.frequency}</span>
                            <div className="text-[10px] text-on-surface-variant opacity-80 mt-1">
                              Day: {m.day_of_week} • Time: {m.time} • Duration: {m.duration} • Attendees: {m.attendees}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (m.id) await db.meetings.delete(m.id)
                                setMeetings(meetings.filter((_, i) => i !== idx))
                                await refreshProjects()
                              } catch (err) {
                                setDbError("Failed to delete meeting: " + err.message)
                              }
                            }}
                            className="text-outline hover:text-status-error transition-all"
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {showAddMeetingInline && (
                      <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                        <h5 className="font-bold uppercase tracking-wider">Add Meeting Sync</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Meeting Name (e.g. Daily Standup)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetName}
                            onChange={(e) => setMeetName(e.target.value)}
                          />
                          <select
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetFreq}
                            onChange={(e) => setMeetFreq(e.target.value)}
                          >
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Bi-weekly</option>
                            <option>Monthly</option>
                          </select>
                          <select
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetDay}
                            onChange={(e) => setMeetDay(e.target.value)}
                          >
                            <option>Monday</option>
                            <option>Tuesday</option>
                            <option>Wednesday</option>
                            <option>Thursday</option>
                            <option>Friday</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Time (e.g. 10:00 AM)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetTime}
                            onChange={(e) => setMeetTime(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 30 mins)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetDuration}
                            onChange={(e) => setMeetDuration(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddMeetingInline(false)}
                              className="flex-1 border border-border-subtle rounded font-semibold text-xs py-1"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!meetName.trim()) {
                                  setDbError('Meeting name is required')
                                  return
                                }
                                try {
                                  setDbError(null)
                                  await saveProjectDetails()
                                  
                                  const attendeesText = teamMembers.map(t => t.name).join(', ')
                                  const savedMeet = await db.meetings.save({
                                    project_id: localProjectId,
                                    name: meetName.trim(),
                                    frequency: meetFreq,
                                    day_of_week: meetDay,
                                    time: meetTime || '10:00 AM',
                                    duration: meetDuration || '30 mins',
                                    attendees: teamMembers.map(t => t.name)
                                  })

                                  setMeetings([...meetings, {
                                    id: savedMeet.id,
                                    name: meetName.trim(),
                                    frequency: meetFreq,
                                    day_of_week: meetDay,
                                    time: meetTime || '10:00 AM',
                                    duration: meetDuration || '30 mins',
                                    attendees: attendeesText
                                  }])
                                  setMeetName('')
                                  setShowAddMeetingInline(false)
                                  await refreshProjects()
                                } catch (err) {
                                  setDbError("Failed to save meeting: " + err.message)
                                }
                              }}
                              className="flex-1 bg-primary text-white rounded font-bold text-xs hover:opacity-90 active:scale-95 transition-all py-1"
                            >
                              Save Sync
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Client Contacts */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                        <Icon name="contact_phone" size={16} className="text-primary" /> Client Stakeholders
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddContactInline(!showAddContactInline)
                          setDbError(null)
                        }}
                        className="text-primary hover:bg-primary-fixed/20 px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-0.5"
                      >
                        <Icon name="add" size={14} /> Add Contact
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clientContacts.map((cc, idx) => (
                        <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm flex justify-between items-start text-xs">
                          <div>
                            <h5 className="font-bold text-on-surface text-sm">{cc.name}</h5>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-0.5">{cc.role} {cc.organization ? `at ${cc.organization}` : ''}</p>
                            <div className="text-xs text-on-surface-variant opacity-85 mt-2 space-y-1">
                              <p className="flex items-center gap-1"><Icon name="mail" size={12} /> {cc.email}</p>
                              <p className="flex items-center gap-1"><Icon name="phone" size={12} /> {cc.phone}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (cc.id) await db.stakeholders.delete(cc.id)
                                setClientContacts(clientContacts.filter((_, i) => i !== idx))
                                await refreshProjects()
                              } catch (err) {
                                setDbError("Failed to delete contact: " + err.message)
                              }
                            }}
                            className="text-outline hover:text-status-error transition-all"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {showAddContactInline && (
                      <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                        <h5 className="font-bold uppercase tracking-wider">Add Stakeholder</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Name (e.g. Alice Smith)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Role (e.g. Sponsor)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactRole}
                            onChange={(e) => setContactRole(e.target.value)}
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Phone Number"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddContactInline(false)}
                            className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!contactName.trim()) {
                                setDbError('Stakeholder name is required')
                                return
                              }
                              try {
                                setDbError(null)
                                await saveProjectDetails()

                                const savedContact = await db.stakeholders.save({
                                  project_id: localProjectId,
                                  name: contactName.trim(),
                                  role: contactRole.trim() || 'Stakeholder',
                                  organization: formData.clientName || 'Draft Client',
                                  email: contactEmail.trim(),
                                  phone: contactPhone.trim()
                                })

                                setClientContacts([...clientContacts, {
                                  id: savedContact.id,
                                  name: contactName.trim(),
                                  role: contactRole.trim() || 'Stakeholder',
                                  organization: formData.clientName,
                                  email: contactEmail.trim(),
                                  phone: contactPhone.trim()
                                }])
                                setContactName('')
                                setContactRole('')
                                setContactEmail('')
                                setContactPhone('')
                                setShowAddContactInline(false)
                                await refreshProjects()
                              } catch (err) {
                                setDbError("Failed to save contact: " + err.message)
                              }
                            }}
                            className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                          >
                            Save Contact
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
  );
};
