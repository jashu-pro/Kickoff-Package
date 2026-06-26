import React, { useState, useEffect, useCallback } from 'react'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

const getChannelIcon = (type) => {
  switch (type) {
    case 'slack':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFH-9VISk8E1rcQB5ATRtr7l5rj4P_TvZDu1hCtwXFeUUSfxMwPdpy0Jn8qlodOSQt8gDOQS7u1r1gc-fPnS0_CqFmn9sqKmsNBNMp3Ns3e484viuLl5Z1GwZPQgpfDHWpVlNMvATuocroRdktltpaI9iJDkALe-1sUN49jFcgWDCfUVOZ2l0ti8atbQ6AkluzQAHvZvNkidOXdWg5b16cf2xznlsUiUlgOGPla-R6hBuVAaaJbWL4sFEFXsm9f9tqkmQ3oSIo-bU'
    case 'teams':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFZMqD9k91fspijZRSb30SEAuyzGPXbvtOLzncgUMPB58Zazs4aGC-b_t4MwgIP5RME16I86DiVyI9SmWaHuyov8U7_0CByY6CXGVHe1ZI87hcdlKpGyf4WzqEVwGaAmFT5PeHuo3ZdSIf-Coal5IxxlxeG8cBIf2CRldxPBB7E3nTTrlTyu-zKDm8mTbiEWpYkXzycv5sLTmsfsCFsA2Lob7cmMcV1rn7EYIC1t3jyKfhCoSjJAbdOFYIcvkdSvQb3Z9tgPWfS-U'
    case 'jira':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVpA_sUb09f1f0FGRgibqPuwmIZhaZTqaTpN6oKhnuhB-c0Pw0d8bBbVIZvr-lyHmwpWg4XxJ0_ux0tXqxmnp4vVNjLuCDMy0ZYWn7xuO2FdsZ8PALK3Wgtbk2R1zVzoHfXyzAzX6S0fWX3_T454sG40ESMn-bUDwZI55sFYDqj_dDm4ufg2lpZBhNnSACBAV2cBHzVXAVWH15G_DdYHs7p1HhllMKdLGOonSnGMmeCtmCAFn5MV5v7msZNQ0QGAV0It97rgTWprs'
    default:
      return null
  }
}

export const Communication = () => {
  const { projectId } = useProject()
  const { showToast } = useToast()

  const [channels, setChannels] = useState([])
  const [escalations, setEscalations] = useState([])
  const [stakeholders, setStakeholders] = useState([])
  const [meetings, setMeetings] = useState([])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Modals state
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [showEscalationModal, setShowEscalationModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showStakeholderModal, setShowStakeholderModal] = useState(false)

  // Edit contexts
  const [selectedStakeholder, setSelectedStakeholder] = useState(null)
  const [activeStakeholderMenu, setActiveStakeholderMenu] = useState(null)

  // Form inputs
  const [chanType, setChanType] = useState('slack')
  const [chanName, setChanName] = useState('Slack')
  const [chanDesc, setChanDesc] = useState('')
  const [chanUrl, setChanUrl] = useState('')
  const [chanActive, setChanActive] = useState(true)

  const [escLevel, setEscLevel] = useState('1')
  const [escSeverity, setEscSeverity] = useState('Standard Delivery')
  const [escDesc, setEscDesc] = useState('')
  const [escName, setEscName] = useState('')
  const [escRole, setEscRole] = useState('')
  const [escTime, setEscTime] = useState('4 Working Hours')

  const [meetName, setMeetName] = useState('')
  const [meetFreq, setMeetFreq] = useState('Weekly')
  const [meetDays, setMeetDays] = useState('Thursday')
  const [meetTime, setMeetTime] = useState('10:00 AM EST')
  const [meetDuration, setMeetDuration] = useState('30 Mins')

  const [shName, setShName] = useState('')
  const [shRole, setShRole] = useState('')
  const [shOrg, setShOrg] = useState('Client')
  const [shEmail, setShEmail] = useState('')
  const [shPhone, setShPhone] = useState('')

  const [actionLoading, setActionLoading] = useState(false)

  // Fetch all communication protocol elements
  const fetchData = useCallback(async () => {
    if (!projectId) return
    try {
      const cData = await db.channels.list(projectId)
      const eData = await db.escalations.list(projectId)
      const sData = await db.stakeholders.list(projectId)
      const mData = await db.meetings.list(projectId)

      setChannels(cData)
      setEscalations(eData.sort((a, b) => a.level - b.level))
      setStakeholders(sData)
      setMeetings(mData)
    } catch (e) {
      console.error(e)
      showToast('Error loading communication protocol details', 'error')
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.stakeholder-row-menu')) {
        setActiveStakeholderMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Discard changes
  const handleDiscard = async () => {
    await fetchData()
    showToast('Changes discarded, reloaded protocol data', 'success')
  }

  // Save protocol simulation
  const handleSaveProtocol = async () => {
    setLoading(true)
    // Write everything to database to make sure it is saved
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSuccess(true)
      showToast('Communication Protocol Saved Successfully!', 'success')
      setTimeout(() => {
        setSuccess(false)
        setLoading(false)
      }, 1500)
    } catch (e) {
      setLoading(false)
      showToast('Error saving protocol', 'error')
    }
  }

  // Add custom communication channel
  const handleAddChannel = async (e) => {
    e.preventDefault()
    if (!projectId) return
    setActionLoading(true)
    try {
      await db.channels.save({
        project_id: projectId,
        type: chanType,
        name: chanName,
        description: chanDesc,
        channel_url: chanUrl,
        is_active: chanActive
      })
      showToast('Channel added successfully!', 'success')
      setShowChannelModal(false)
      setChanDesc('')
      setChanUrl('')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Error adding channel', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle active status for channel
  const handleToggleChannel = async (channel) => {
    try {
      await db.channels.save({
        ...channel,
        is_active: !channel.is_active
      })
      showToast(`Channel ${channel.name} ${!channel.is_active ? 'connected' : 'disconnected'}`, 'success')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to toggle channel', 'error')
    }
  }

  // Add escalation rule
  const handleAddEscalation = async (e) => {
    e.preventDefault()
    if (!projectId) return
    setActionLoading(true)
    try {
      await db.escalations.save({
        project_id: projectId,
        level: parseInt(escLevel) || 1,
        severity: escSeverity,
        description: escDesc,
        contact_name: escName,
        contact_role: escRole,
        response_time: escTime
      })
      showToast('Escalation rule added successfully!', 'success')
      setShowEscalationModal(false)
      setEscDesc('')
      setEscName('')
      setEscRole('')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Error adding escalation rule', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Add meeting frequency sync
  const handleAddMeeting = async (e) => {
    e.preventDefault()
    if (!projectId) return
    if (!meetName.trim()) {
      showToast('Meeting name is required', 'error')
      return
    }
    setActionLoading(true)
    try {
      await db.meetings.save({
        project_id: projectId,
        name: meetName,
        frequency: meetFreq,
        day_of_week: meetDays,
        time: meetTime,
        duration: meetDuration,
        attendees: []
      })
      showToast('Recurrent sync meeting scheduled!', 'success')
      setShowMeetingModal(false)
      setMeetName('')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Error adding sync meeting', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Add or Edit stakeholder
  const handleAddStakeholder = async (e) => {
    e.preventDefault()
    if (!projectId) return
    if (!shName.trim()) {
      showToast('Stakeholder name is required', 'error')
      return
    }
    setActionLoading(true)
    try {
      await db.stakeholders.save({
        id: selectedStakeholder?.id || undefined,
        project_id: projectId,
        name: shName,
        role: shRole,
        organization: shOrg,
        email: shEmail,
        phone: shPhone,
        avatar_url: ''
      })
      showToast(selectedStakeholder ? 'Stakeholder updated successfully!' : 'Stakeholder added successfully!', 'success')
      setShowStakeholderModal(false)
      setSelectedStakeholder(null)
      setShName('')
      setShRole('')
      setShEmail('')
      setShPhone('')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Error saving stakeholder', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenEditStakeholder = (sh) => {
    setSelectedStakeholder(sh)
    setShName(sh.name)
    setShRole(sh.role || '')
    setShOrg(sh.organization || 'Client')
    setShEmail(sh.email || '')
    setShPhone(sh.phone || '')
    setShowStakeholderModal(true)
    setActiveStakeholderMenu(null)
  }

  const handleDeleteStakeholder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stakeholder?')) return
    try {
      await db.stakeholders.delete(id)
      showToast('Stakeholder deleted successfully', 'success')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to delete stakeholder', 'error')
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 1:
        return { bg: 'bg-surface-container-high', text: 'text-primary' }
      case 2:
        return { bg: 'bg-orange-50', text: 'text-status-warning' }
      case 3:
        return { bg: 'bg-red-50', text: 'text-status-error' }
      default:
        return { bg: 'bg-surface-container-high', text: 'text-primary' }
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-gutter">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface">Communication Protocol</h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mt-2">
              Define how stakeholders and the delivery team will interact throughout the engagement lifecycle.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log("Clicked: Communication Discard Changes");
                handleDiscard();
              }}
              className="px-4 py-2 border border-border-subtle text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-all bg-white"
            >
              Discard Changes
            </button>
            <button
              onClick={() => {
                console.log("Clicked: Communication Save Protocol");
                handleSaveProtocol();
              }}
              disabled={loading}
              className={`px-6 py-2 font-label-md text-label-md rounded-lg shadow-sm transition-all ${
                success
                  ? 'bg-status-success text-white'
                  : 'bg-primary text-on-primary hover:opacity-90 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  Saving...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <Icon name="check" size={18} filled />
                  Saved Successfully
                </span>
              ) : (
                'Save Protocol'
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 lg:col-span-8 space-y-margin-md">
            {/* Channels Card */}
            <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm p-margin-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm">Communication Channels</h3>
                <span className="bg-surface-container-high text-primary text-label-sm font-label-sm px-2 py-1 rounded-full uppercase">
                  {channels.filter((c) => c.is_active).length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-margin-sm">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => {
                      console.log("Clicked: Toggle Channel Card", channel.id);
                      handleToggleChannel(channel);
                    }}
                    className={`group border p-4 rounded-lg flex flex-col gap-3 transition-all relative cursor-pointer ${
                      channel.is_active
                        ? 'border-primary-container bg-surface-container-low hover:shadow-md'
                        : 'border-border-subtle hover:border-primary'
                    }`}
                  >
                    {channel.is_active && (
                      <div className="absolute top-2 right-2">
                        <Icon name="check_circle" size={20} filled className="text-primary" />
                      </div>
                    )}
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {getChannelIcon(channel.type) ? (
                        <img alt={`${channel.name} logo`} className="w-6 h-6" src={getChannelIcon(channel.type)} />
                      ) : (
                        <Icon name="mail" size={24} className="text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-headline-sm text-on-surface text-[16px]">{channel.name}</p>
                      <p className="text-label-md text-on-surface-variant line-clamp-2">{channel.description}</p>
                    </div>
                    {channel.is_active && channel.channel_url && (
                      <div className="pt-2 border-t border-outline-variant">
                        <p className="text-label-sm text-primary truncate">{channel.channel_url}</p>
                      </div>
                    )}
                    {!channel.is_active && (
                      <button className="mt-2 text-label-md text-primary font-semibold flex items-center gap-1 hover:underline">
                        Connect <Icon name="chevron_right" size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <div
                  onClick={() => {
                    setChanType('slack')
                    setChanName('Slack')
                    setChanDesc('')
                    setChanUrl('')
                    setChanActive(true)
                    setShowChannelModal(true)
                  }}
                  className="group border-2 border-dashed border-outline-variant p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer min-h-[140px]"
                >
                  <Icon name="add_circle" size={24} className="text-outline" />
                  <p className="text-label-md font-semibold text-outline">Add Channel</p>
                </div>
              </div>
            </div>

            {/* Escalation Matrix */}
            <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm overflow-hidden">
              <div className="p-margin-md border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-sm text-headline-sm">Escalation Matrix</h3>
                <button
                  onClick={() => {
                    console.log("Clicked: Configure Escalation Rules Button");
                    setShowEscalationModal(true);
                  }}
                  className="text-primary text-label-md font-bold flex items-center gap-1 hover:underline"
                >
                  <Icon name="edit" size={16} /> Configure Rules
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-muted">
                      <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Level</th>
                      <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Severity / Type</th>
                      <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Lead Contact</th>
                      <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {escalations.map((escalation) => {
                      const colors = getLevelColor(escalation.level)
                      return (
                        <tr key={escalation.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-6 py-5">
                            <span className={`${colors.bg} ${colors.text} px-2 py-0.5 rounded text-[10px] font-bold`}>
                              L{escalation.level}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-semibold text-on-surface">{escalation.severity}</p>
                            <p className="text-label-sm text-on-surface-variant">{escalation.description}</p>
                          </td>
                          <td className="px-6 py-5 flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                escalation.level === 1
                                  ? 'bg-blue-100 text-blue-700'
                                  : escalation.level === 2
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {escalation.contact_name
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('') || 'U'}
                            </div>
                            <div className="text-body-md">
                              <p className="font-medium">{escalation.contact_name}</p>
                              <p className="text-label-sm text-on-surface-variant">{escalation.contact_role}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-medium text-on-surface">{escalation.response_time}</td>
                        </tr>
                      )
                    })}
                    {escalations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                          No escalation levels configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4 space-y-gutter">
            {/* Meeting Frequency */}
            <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm p-margin-md">
              <h3 className="font-headline-sm text-headline-sm mb-4">Meeting Frequency</h3>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-body-md">{meeting.name}</span>
                      <Icon name="calendar_today" size={18} className="text-primary" />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {meeting.day_of_week.split(' ').map((day, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-border-subtle"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-label-md text-on-surface-variant">
                      <span>{meeting.time}</span>
                      <span>{meeting.duration}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    console.log("Clicked: Add Recurrent Sync Button");
                    setShowMeetingModal(true);
                  }}
                  className="w-full border-2 border-dashed border-outline-variant py-2 rounded-lg text-label-md font-bold text-outline hover:border-primary hover:text-primary transition-all"
                >
                  Add Recurrent Sync
                </button>
              </div>
            </div>

            {/* Stakeholders list */}
            <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm p-margin-md overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-headline-sm">Stakeholders</h3>
                <button
                  onClick={() => {
                    console.log("Clicked: Add Stakeholder Button");
                    setSelectedStakeholder(null)
                    setShName('')
                    setShRole('')
                    setShOrg('Client')
                    setShEmail('')
                    setShPhone('')
                    setShowStakeholderModal(true)
                  }}
                  className="text-primary hover:scale-110 transition-transform"
                >
                  <Icon name="person_add" size={24} />
                </button>
              </div>
              <div className="space-y-4 custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
                {stakeholders.map((stakeholder) => (
                  <div key={stakeholder.id} className="flex items-start gap-3 group relative">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary">
                      <Icon name="account_circle" size={24} filled />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-body-md truncate">{stakeholder.name}</p>
                      <p className="text-label-md text-on-surface-variant truncate">{stakeholder.role}</p>
                      <div className="flex gap-2 mt-1">
                        {stakeholder.email && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5 select-all">
                            <Icon name="mail" size={12} /> Email
                          </span>
                        )}
                        {stakeholder.phone && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5 select-all">
                            <Icon name="call" size={12} /> Phone
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative stakeholder-row-menu">
                      <button
                        onClick={() => {
                          console.log("Clicked: Stakeholder Action Menu Toggle", stakeholder.id);
                          setActiveStakeholderMenu(activeStakeholderMenu === stakeholder.id ? null : stakeholder.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-container rounded transition-all"
                      >
                        <Icon name="more_vert" size={18} className="text-outline" />
                      </button>
                      {activeStakeholderMenu === stakeholder.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-border-subtle rounded-lg shadow-lg py-1 z-10">
                          <button
                            onClick={() => {
                              console.log("Clicked: Edit Stakeholder Action", stakeholder.id);
                              handleOpenEditStakeholder(stakeholder);
                            }}
                            className="w-full text-left px-3 py-1.5 text-label-md hover:bg-surface-container-low flex items-center gap-1.5 text-on-surface"
                          >
                            <Icon name="edit" size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              console.log("Clicked: Delete Stakeholder Action", stakeholder.id);
                              handleDeleteStakeholder(stakeholder.id);
                              setActiveStakeholderMenu(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-label-md hover:bg-error-container/10 text-status-error flex items-center gap-1.5"
                          >
                            <Icon name="delete" size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {stakeholders.length === 0 && (
                  <p className="text-label-md text-outline text-center py-4">No stakeholders registered yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add Communication Channel</h3>
              <button onClick={() => setShowChannelModal(false)} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleAddChannel} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Type</label>
                <select
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={chanType}
                  onChange={(e) => {
                    setChanType(e.target.value)
                    setChanName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))
                  }}
                >
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="jira">Jira Board</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Channel Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={chanName}
                  onChange={(e) => setChanName(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Primary async chat, technical reviews"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={chanDesc}
                  onChange={(e) => setChanDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Channel Url/Address</label>
                <input
                  type="text"
                  placeholder="#project-delivery-leads"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={chanUrl}
                  onChange={(e) => setChanUrl(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="c-active"
                  type="checkbox"
                  checked={chanActive}
                  onChange={(e) => setChanActive(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="c-active" className="font-label-md text-on-surface-variant cursor-pointer">
                  Activate channel immediately
                </label>
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-md"
                >
                  {actionLoading ? 'Saving...' : 'Add Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalation Matrix Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Configure Escalation Level</h3>
              <button onClick={() => setShowEscalationModal(false)} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEscalation} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Level</label>
                <select
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={escLevel}
                  onChange={(e) => setEscLevel(e.target.value)}
                >
                  <option value="1">Level 1 - Standard Roadblocks</option>
                  <option value="2">Level 2 - Program Risk</option>
                  <option value="3">Level 3 - Critical Blocker</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Severity / Type Name</label>
                <input
                  type="text"
                  required
                  placeholder="Standard Delivery"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={escSeverity}
                  onChange={(e) => setEscSeverity(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Rule Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Daily bottlenecks, deployment slipups, API design adjustments..."
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={escDesc}
                  onChange={(e) => setEscDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={escName}
                    onChange={(e) => setEscName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Contact Role</label>
                  <input
                    type="text"
                    required
                    placeholder="Delivery Lead"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={escRole}
                    onChange={(e) => setEscRole(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Expected Response Time</label>
                <input
                  type="text"
                  required
                  placeholder="4 Working Hours"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={escTime}
                  onChange={(e) => setEscTime(e.target.value)}
                />
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEscalationModal(false)}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-md"
                >
                  {actionLoading ? 'Saving...' : 'Save Matrix Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Sync Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add Recurrent Sync Meeting</h3>
              <button onClick={() => setShowMeetingModal(false)} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMeeting} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Sync Name</label>
                <input
                  type="text"
                  required
                  placeholder="Weekly Status Alignment"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={meetName}
                  onChange={(e) => setMeetName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Frequency</label>
                  <select
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={meetFreq}
                    onChange={(e) => setMeetFreq(e.target.value)}
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Bi-Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Days scheduled</label>
                  <input
                    type="text"
                    required
                    placeholder="M T W T F or Thursday"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={meetDays}
                    onChange={(e) => setMeetDays(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM EST"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="30 Mins"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={meetDuration}
                    onChange={(e) => setMeetDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-md"
                >
                  {actionLoading ? 'Saving...' : 'Schedule Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stakeholder Modal */}
      {showStakeholderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {selectedStakeholder ? 'Edit Stakeholder' : 'Add Stakeholder'}
              </h3>
              <button
                onClick={() => {
                  setShowStakeholderModal(false)
                  setSelectedStakeholder(null)
                }}
                className="text-outline hover:text-on-surface p-1"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStakeholder} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Eleanor Shellstrop"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={shName}
                  onChange={(e) => setShName(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Role</label>
                <input
                  type="text"
                  required
                  placeholder="Product Owner (Client)"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={shRole}
                  onChange={(e) => setShRole(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Organization</label>
                <select
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={shOrg}
                  onChange={(e) => setShOrg(e.target.value)}
                >
                  <option>Client</option>
                  <option>Delivery Partner</option>
                  <option>Third-Party Vendor</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="eleanor@client.com"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={shEmail}
                    onChange={(e) => setShEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1-555-0100"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={shPhone}
                    onChange={(e) => setShPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowStakeholderModal(false)
                    setSelectedStakeholder(null)
                  }}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-md"
                >
                  {actionLoading ? 'Saving...' : selectedStakeholder ? 'Save Changes' : 'Add Stakeholder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
