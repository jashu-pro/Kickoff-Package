import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';

export const Step3Communication = ({ formState }) => {
  const {
    channels, handleChannelChange, handleChannelBlur, meetings, clientContacts, showAddContactInline, setShowAddContactInline, contactName, setContactName, contactRole, setContactRole, contactEmail, setContactEmail, contactPhone, setContactPhone, showAddMeetingInline, setShowAddMeetingInline, meetName, setMeetName, meetFreq, setMeetFreq, meetDay, setMeetDay, meetTime, setMeetTime, meetDuration, setMeetDuration, setDbError, db, setMeetings, refreshProjects, saveProjectDetails, localProjectId, setClientContacts, teamMembers, formData
  } = formState;

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simplified view handles the primary inputs directly
  // Platform Dropdown, Channel Name, Weekly Meeting, Client Contact

  return (
    <div className="space-y-10">
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 3: Communication Setup</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Set up the primary communication platform, meetings, and client contacts</p>
      </div>

      <section className="space-y-6 bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm">
        <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 mb-4">
          <Icon name="hub" size={18} className="text-primary" /> Primary Setup
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-surface-container-lowest border border-border-subtle rounded-xl">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant">Communication Platform</label>
            <select
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              defaultValue="Slack"
            >
              <option value="Slack">Slack</option>
              <option value="Microsoft Teams">Microsoft Teams</option>
              <option value="Google Meet">Google Meet</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
             <label className="font-label-md text-label-md text-on-surface-variant">Primary Channel Name</label>
             <input
              type="text"
              placeholder="#proj-clientname"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={channels.length > 0 ? (channels[0].name || '') : ''}
              onChange={(e) => handleChannelChange(0, 'name', e.target.value)}
              onBlur={() => channels.length > 0 && handleChannelBlur(channels[0])}
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border-subtle">
           <div>
             <h5 className="font-label-md text-label-md text-on-surface-variant mb-3">Primary Client Contact</h5>
             {clientContacts.length === 0 ? (
               <button
                type="button"
                onClick={() => {
                  setShowAddContactInline(!showAddContactInline)
                  setDbError(null)
                }}
                className="w-full py-3 border border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
               >
                 <Icon name="person_add" size={18} /> Add Main Stakeholder
               </button>
             ) : (
                <div className="bg-surface-base border border-border-subtle rounded-xl p-3 flex justify-between items-center shadow-sm">
                  <div>
                    <h5 className="font-bold text-on-surface text-sm">{clientContacts[0].name}</h5>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-0.5">{clientContacts[0].role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (clientContacts[0].id) await db.stakeholders.delete(clientContacts[0].id)
                      setClientContacts(clientContacts.slice(1))
                    }}
                    className="text-outline hover:bg-status-error/10 hover:text-status-error p-1.5 rounded-md transition-all"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
             )}
           </div>

           <div>
             <h5 className="font-label-md text-label-md text-on-surface-variant mb-3">Weekly Status Meeting</h5>
             {meetings.length === 0 ? (
               <button
                type="button"
                onClick={() => {
                  setShowAddMeetingInline(!showAddMeetingInline)
                  setDbError(null)
                }}
                className="w-full py-3 border border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
               >
                 <Icon name="event" size={18} /> Add Weekly Sync
               </button>
             ) : (
                <div className="bg-surface-base border border-border-subtle rounded-xl p-3 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="font-bold text-on-surface">{meetings[0].name}</span>
                    <span className="text-[10px] text-on-surface-variant ml-2 bg-surface-container px-2.5 py-0.5 rounded-full font-bold uppercase">{meetings[0].frequency}</span>
                    <div className="text-[10px] text-on-surface-variant opacity-80 mt-1">
                      {meetings[0].day_of_week} • {meetings[0].time}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (meetings[0].id) await db.meetings.delete(meetings[0].id)
                      setMeetings(meetings.slice(1))
                    }}
                    className="text-outline hover:bg-status-error/10 hover:text-status-error p-1.5 rounded-md transition-all"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
             )}
           </div>
        </div>

        {/* Add Contact Form (Primary) */}
        {showAddContactInline && clientContacts.length === 0 && (
          <div className="p-4 bg-surface-base border border-border-subtle rounded-xl space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
            <h5 className="font-bold text-xs uppercase tracking-wider">Stakeholder Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name (e.g. Alice Smith)"
                className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Role (e.g. Sponsor)"
                className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddContactInline(false)}
                className="px-3 py-1.5 border border-border-subtle rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!contactName.trim()) return
                  try {
                    setDbError(null)
                    await saveProjectDetails()
                    const savedContact = await db.stakeholders.save({
                      project_id: localProjectId,
                      name: contactName.trim(),
                      role: contactRole.trim() || 'Sponsor',
                      organization: formData.clientName || 'Draft Client',
                      email: contactEmail.trim(),
                      phone: contactPhone.trim()
                    })
                    setClientContacts([...clientContacts, {
                      id: savedContact.id,
                      name: contactName.trim(),
                      role: contactRole.trim() || 'Sponsor',
                      organization: formData.clientName,
                      email: contactEmail.trim(),
                      phone: contactPhone.trim()
                    }])
                    setContactName('')
                    setContactRole('')
                    setContactEmail('')
                    setContactPhone('')
                    setShowAddContactInline(false)
                  } catch (err) {
                    console.error(err)
                    setDbError("Failed to save contact: " + err.message)
                  }
                }}
                className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Add Meeting Form (Primary) */}
        {showAddMeetingInline && meetings.length === 0 && (
          <div className="p-4 bg-surface-base border border-border-subtle rounded-xl space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
            <h5 className="font-bold text-xs uppercase tracking-wider">Meeting Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name (e.g. Weekly Status)"
                className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm"
                value={meetName}
                onChange={(e) => setMeetName(e.target.value)}
              />
              <select
                className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm"
                value={meetDay}
                onChange={(e) => setMeetDay(e.target.value)}
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
              </select>
              <input
                type="text"
                placeholder="Time (e.g. 10:00 AM)"
                className="bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm"
                value={meetTime}
                onChange={(e) => setMeetTime(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMeetingInline(false)}
                className="px-3 py-1.5 border border-border-subtle rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!meetName.trim()) return
                  try {
                    setDbError(null)
                    await saveProjectDetails()
                    const savedMeet = await db.meetings.save({
                      project_id: localProjectId,
                      name: meetName.trim(),
                      frequency: 'Weekly',
                      day_of_week: meetDay,
                      time: meetTime || '10:00 AM',
                      duration: '30 mins',
                      attendees: ''
                    })
                    setMeetings([...meetings, {
                      id: savedMeet.id,
                      name: meetName.trim(),
                      frequency: 'Weekly',
                      day_of_week: meetDay,
                      time: meetTime || '10:00 AM',
                      duration: '30 mins'
                    }])
                    setMeetName('')
                    setShowAddMeetingInline(false)
                  } catch (err) {
                    console.error(err)
                    setDbError("Failed to save meeting: " + err.message)
                  }
                }}
                className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ADVANCED SETTINGS TOGGLE */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border-subtle"></div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors outline-none"
        >
          <Icon name={showAdvanced ? "expand_less" : "expand_more"} size={16} />
          {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
        </button>
        <div className="flex-1 h-px bg-border-subtle"></div>
      </div>

      {showAdvanced && (
        <section className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
           
          {/* Advanced Slack channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="chat" size={16} className="text-primary" /> Additional Channels
            </h4>
            {channels.slice(1).map((ch, idx) => (
              <div key={idx + 1} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-surface-container-low border border-border-subtle rounded-xl">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase">Channel Name</label>
                  <input
                    type="text"
                    className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                    value={ch.name}
                    onChange={(e) => handleChannelChange(idx + 1, 'name', e.target.value)}
                    onBlur={() => handleChannelBlur(ch)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase">Channel URL</label>
                  <input
                    type="text"
                    className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                    value={ch.channel_url}
                    onChange={(e) => handleChannelChange(idx + 1, 'channel_url', e.target.value)}
                    onBlur={() => handleChannelBlur(ch)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Advanced Stakeholders */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="contact_phone" size={16} className="text-primary" /> Additional Stakeholders
              </h4>
              <button
                type="button"
                onClick={() => setShowAddContactInline(true)}
                className="text-primary hover:bg-primary-fixed/20 px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-0.5"
              >
                <Icon name="add" size={14} /> Add Contact
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientContacts.slice(1).map((cc, idx) => (
                <div key={idx + 1} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm flex justify-between items-start text-xs">
                  <div>
                    <h5 className="font-bold text-on-surface text-sm">{cc.name}</h5>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-0.5">{cc.role}</p>
                    <div className="text-xs text-on-surface-variant opacity-85 mt-2 space-y-1">
                      <p className="flex items-center gap-1"><Icon name="mail" size={12} /> {cc.email}</p>
                      <p className="flex items-center gap-1"><Icon name="phone" size={12} /> {cc.phone}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (cc.id) await db.stakeholders.delete(cc.id)
                      setClientContacts(clientContacts.filter((c) => c.id !== cc.id))
                    }}
                    className="text-outline hover:text-status-error transition-all"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            {showAddContactInline && clientContacts.length > 0 && (
              <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                <h5 className="font-bold uppercase tracking-wider">Add Additional Stakeholder</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Name" className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  <input type="text" placeholder="Role" className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5" value={contactRole} onChange={(e) => setContactRole(e.target.value)} />
                  <input type="email" placeholder="Email" className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  <input type="text" placeholder="Phone" className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddContactInline(false)} className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold">Cancel</button>
                  <button type="button" onClick={async () => {
                    if (!contactName.trim()) return
                    try {
                      setDbError(null)
                      const savedContact = await db.stakeholders.save({
                        project_id: localProjectId, name: contactName.trim(), role: contactRole.trim(), email: contactEmail.trim(), phone: contactPhone.trim(), organization: formData.clientName
                      })
                      setClientContacts([...clientContacts, savedContact])
                      setShowAddContactInline(false)
                    } catch (err) {
                      console.error(err)
                      setDbError("Failed to save advanced contact: " + err.message)
                    }
                  }} className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold">Save Contact</button>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Meetings */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="meeting_room" size={16} className="text-primary" /> Additional Meetings
              </h4>
              <button
                type="button"
                onClick={() => setShowAddMeetingInline(true)}
                className="text-primary hover:bg-primary-fixed/20 px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-0.5"
              >
                <Icon name="add" size={14} /> Add Sync
              </button>
            </div>
            
            <div className="space-y-2">
              {meetings.slice(1).map((m, idx) => (
                <div key={idx + 1} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-3 flex justify-between items-center text-xs shadow-sm">
                  <div>
                    <span className="font-bold text-on-surface">{m.name}</span>
                    <span className="text-[10px] text-on-surface-variant ml-2 bg-surface-container px-2.5 py-0.5 rounded-full font-bold uppercase">{m.frequency}</span>
                    <div className="text-[10px] text-on-surface-variant opacity-80 mt-1">
                      Day: {m.day_of_week} • Time: {m.time} • Duration: {m.duration}
                    </div>
                  </div>
                  <button type="button" onClick={async () => {
                      if (m.id) await db.meetings.delete(m.id)
                      setMeetings(meetings.filter((met) => met.id !== m.id))
                    }} className="text-outline hover:text-status-error transition-all"><Icon name="close" size={16} /></button>
                </div>
              ))}
            </div>

            {showAddMeetingInline && meetings.length > 0 && (
              <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                <h5 className="font-bold uppercase tracking-wider">Add Additional Meeting</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" placeholder="Name" className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5" value={meetName} onChange={(e) => setMeetName(e.target.value)} />
                  <select className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5" value={meetFreq} onChange={(e) => setMeetFreq(e.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
                  <select className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5" value={meetDay} onChange={(e) => setMeetDay(e.target.value)}><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddMeetingInline(false)} className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold">Cancel</button>
                  <button type="button" onClick={async () => {
                    if (!meetName.trim()) return
                    try {
                      setDbError(null)
                      const savedMeet = await db.meetings.save({ project_id: localProjectId, name: meetName.trim(), frequency: meetFreq, day_of_week: meetDay, time: '10:00 AM', duration: '30 mins' })
                      setMeetings([...meetings, savedMeet])
                      setShowAddMeetingInline(false)
                    } catch (err) {
                      console.error(err)
                      setDbError("Failed to save advanced sync: " + err.message)
                    }
                  }} className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold">Save Sync</button>
                </div>
              </div>
            )}
          </div>
          
        </section>
      )}

    </div>
  );
};
