import React, { useState, useEffect, useCallback } from 'react'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const Timeline = () => {
  const { projectId, project, refreshProjects } = useProject()
  const { showToast } = useToast()

  const [milestones, setMilestones] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showBlockersModal, setShowBlockersModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)

  // Milestone Form state
  const [mTitle, setMTitle] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mDates, setMDates] = useState('')
  const [mStatus, setMStatus] = useState('scheduled')
  const [mProgress, setMProgress] = useState('0')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setMilestones([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const msData = await db.milestones.list(projectId)
      const tasksData = await db.tasks.list(projectId)
      // Sort milestones chronologically by start_date
      const sortedMs = [...msData].sort((a, b) => {
        if (!a.start_date) return 1
        if (!b.start_date) return -1
        return a.start_date.localeCompare(b.start_date)
      })
      setMilestones(sortedMs)
      setTasks(tasksData)
    } catch (e) {
      console.error(e)
      showToast('Error loading timeline details', 'error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpenAdd = () => {
    setSelectedMilestone(null)
    setMTitle('')
    setMDesc('')
    setMDates('')
    setMStatus('scheduled')
    setMProgress('0')
    setShowModifyModal(true)
  }

  const handleOpenEdit = (ms) => {
    setSelectedMilestone(ms)
    setMTitle(ms.title)
    setMDesc(ms.description || '')
    setMDates(ms.dates || '')
    setMStatus(ms.status)
    setMProgress(String(ms.progress || 0))
    setShowModifyModal(true)
  }

  const handleSaveMilestone = async (e) => {
    e.preventDefault()
    if (!projectId) return
    if (!mTitle.trim()) {
      showToast('Milestone title is required', 'error')
      return
    }

    setActionLoading(true)
    try {
      await db.milestones.save({
        id: selectedMilestone?.id || undefined,
        project_id: projectId,
        title: mTitle,
        description: mDesc,
        dates: mDates,
        status: mStatus,
        progress: parseInt(mProgress) || 0
      })
      await refreshProjects()
      // showToast(selectedMilestone ? 'Milestone updated!' : 'Milestone added!', 'success')
      setShowModifyModal(false)
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to save milestone', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteMilestone = async (id) => {
    if (!window.confirm('Are you sure you want to remove this milestone?')) return
    try {
      await db.milestones.delete(id)
      await refreshProjects()
      // showToast('Milestone removed successfully', 'success')
      setShowModifyModal(false)
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to remove milestone', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { border: 'border-status-success/60', bg: 'bg-status-success/10', text: 'text-status-success' }
      case 'delayed':
        return { border: 'border-status-error/60', bg: 'bg-status-error/10', text: 'text-status-error' }
      case 'in_progress':
        return { border: 'border-primary/60', bg: 'bg-primary/10', text: 'text-primary' }
      default:
        return { border: 'border-indigo-400/60', bg: 'bg-indigo-50/60', text: 'text-indigo-600' }
    }
  }

  const getProgressColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-status-success'
      case 'delayed':
        return 'bg-status-error'
      case 'in_progress':
        return 'bg-primary'
      default:
        return 'bg-indigo-400'
    }
  }

  const pendingTasks = tasks.filter((t) => !t.completed && t.status !== 'completed')

  return (
    <Layout>
      <div className="p-container-padding-desktop bg-surface-bright border-b border-border-subtle -mx-margin-md -mt-margin-md mb-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary bg-surface-container-high px-2 py-0.5 rounded text-label-sm font-label-sm uppercase">
                PROJECT ID: #{projectId ? projectId.substring(0, 8) : '2026-081'}
              </span>
              <h2 className="text-on-surface-variant font-label-md text-label-md">
                {project ? project.client_name : 'Consultancy Engagements'}
              </h2>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface">Execution Timeline</h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-border-subtle shadow-sm flex items-center gap-4 min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-status-success/10 text-status-success flex items-center justify-center">
                <Icon name="event_available" size={24} />
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Start Date</p>
                <p className="font-headline-sm text-headline-sm">
                  {project?.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jan 12'}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-border-subtle shadow-sm flex items-center gap-4 min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Icon name="event_upcoming" size={24} />
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Target End</p>
                <p className="font-headline-sm text-headline-sm">
                  {project?.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Aug 15'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-container-padding-desktop bg-background scroll-hide">
        <div className="max-w-6xl mx-auto relative py-12">
          {milestones.length > 0 && (
            <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-0.5 timeline-line -translate-x-1/2 z-0 opacity-50" />
          )}

          <div className="space-y-16 relative z-10">
            {milestones.map((milestone, idx) => {
              const colors = getStatusColor(milestone.status)
              const isLeft = idx % 2 === 0
              const isScheduled = milestone.status === 'scheduled'

              return (
                <div
                  key={milestone.id}
                  onClick={() => {
                    console.log("Clicked: Timeline Row / Milestone", milestone.id);
                    handleOpenEdit(milestone);
                  }}
                  className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center md:justify-center group cursor-pointer hover:scale-[1.01] transition-all duration-300`}
                >
                  {isLeft ? (
                    <>
                      <div className="hidden md:block w-1/2 pr-12 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full border ${
                            milestone.status === 'completed'
                              ? 'bg-status-success/10 text-status-success border-status-success/20'
                              : milestone.status === 'delayed'
                                ? 'bg-status-error/10 text-status-error border-status-error/20'
                                : milestone.status === 'in_progress'
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          } text-label-sm font-label-sm mb-2 uppercase tracking-wide`}
                        >
                          {milestone.status.replace('_', ' ')}
                        </span>
                        <h3 className="font-headline-sm text-headline-sm mb-1">{milestone.title}</h3>
                        <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2">{milestone.description}</p>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full border-4 ${colors.border} shadow-md flex items-center justify-center ${colors.text} group-hover:scale-115 group-hover:rotate-6 transition-all duration-300 ${
                            milestone.status === 'in_progress'
                              ? 'animate-pulse bg-primary text-white border-primary'
                              : milestone.status === 'completed'
                                ? 'bg-status-success/10 text-status-success border-status-success/40'
                                : milestone.status === 'delayed'
                                  ? 'bg-status-error/10 text-status-error border-status-error/40'
                                  : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}
                        >
                          <Icon
                            name={
                              milestone.status === 'completed'
                                ? 'check_circle'
                                : milestone.status === 'delayed'
                                  ? 'warning'
                                  : milestone.status === 'in_progress'
                                    ? 'sync'
                                    : 'calendar_today'
                            }
                            size={24}
                            filled={milestone.status === 'completed'}
                          />
                        </div>
                        <span
                          className={`mt-4 font-label-md text-label-md border ${
                            milestone.status === 'completed'
                              ? 'bg-status-success/10 text-status-success border-status-success/20'
                              : milestone.status === 'delayed'
                                ? 'bg-status-error/10 text-status-error border-status-error/20'
                                : milestone.status === 'in_progress'
                                  ? 'bg-primary text-white border-primary font-semibold'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                          } px-3 py-1 rounded-full whitespace-nowrap`}
                        >
                          {milestone.dates || 'TBD'}
                        </span>
                      </div>
                      <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0 w-full">
                        <div className="md:hidden">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full border ${
                              milestone.status === 'completed'
                                ? 'bg-status-success/10 text-status-success border-status-success/20'
                                : milestone.status === 'delayed'
                                  ? 'bg-status-error/10 text-status-error border-status-error/20'
                                  : milestone.status === 'in_progress'
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            } text-label-sm font-label-sm mb-2 uppercase tracking-wide`}
                          >
                            {milestone.status.replace('_', ' ')}
                          </span>
                          <h3 className="font-headline-sm text-headline-sm mb-1" onClick={() => {
                            console.log("Clicked: Card Title / Milestone Title", milestone.id);
                            handleOpenEdit(milestone);
                          }}>{milestone.title}</h3>
                        </div>
                        <div
                          onClick={() => {
                            console.log("Clicked: Milestone Card", milestone.id);
                            handleOpenEdit(milestone);
                          }}
                          className={`bg-surface-container-lowest p-5 rounded-xl border shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 ${
                            milestone.status === 'in_progress'
                              ? 'border-primary ring-4 ring-primary/5 border-l-primary'
                              : milestone.status === 'completed'
                                ? 'border-border-subtle border-l-status-success'
                                : milestone.status === 'delayed'
                                  ? 'border-border-subtle border-l-status-error'
                                  : 'border-border-subtle border-dashed border-l-indigo-400'
                          } ${
                            milestone.status === 'in_progress'
                              ? 'bg-gradient-to-br from-white to-blue-50/10'
                              : milestone.status === 'completed'
                                ? 'bg-gradient-to-br from-white to-emerald-50/15'
                                : milestone.status === 'delayed'
                                  ? 'bg-gradient-to-br from-white to-red-50/15'
                                  : 'bg-gradient-to-br from-white to-indigo-50/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-label-sm font-label-sm text-outline">PROGRESS</span>
                            <span className={`text-label-sm font-label-sm ${colors.text} font-bold`}>
                              {milestone.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className={`${getProgressColor(milestone.status)} h-full transition-all duration-500`} style={{ width: `${milestone.progress}%` }} />
                          </div>
                          
                          {milestone.status === 'delayed' && (
                            <div className="mt-4 flex justify-between items-center">
                              <button
                                onClick={(e) => {
                                  console.log("Clicked: View Blockers Button for Milestone", milestone.id);
                                  e.stopPropagation()
                                  setShowBlockersModal(true)
                                }}
                                className="text-primary font-label-sm text-label-sm hover:underline font-semibold"
                              >
                                View Blockers
                              </button>
                            </div>
                          )}
                          {milestone.status === 'in_progress' && (
                            <div className="mt-4 flex items-center gap-2">
                              <Icon name="schedule" size={16} className="text-outline" />
                              <p className="text-label-sm font-label-sm text-on-surface-variant italic">Next review upcoming</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block w-1/2 pl-12 text-left">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full border ${
                            milestone.status === 'completed'
                              ? 'bg-status-success/10 text-status-success border-status-success/20'
                              : milestone.status === 'delayed'
                                ? 'bg-status-error/10 text-status-error border-status-error/20'
                                : milestone.status === 'in_progress'
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          } text-label-sm font-label-sm mb-2 uppercase tracking-wide`}
                        >
                          {milestone.status.replace('_', ' ')}
                        </span>
                        <h3 className="font-headline-sm text-headline-sm mb-1">{milestone.title}</h3>
                        <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2">{milestone.description}</p>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full border-4 ${colors.border} shadow-md flex items-center justify-center ${colors.text} group-hover:scale-115 group-hover:rotate-6 transition-all duration-300 ${
                            milestone.status === 'in_progress'
                              ? 'animate-pulse bg-primary text-white border-primary'
                              : milestone.status === 'completed'
                                ? 'bg-status-success/10 text-status-success border-status-success/40'
                                : milestone.status === 'delayed'
                                  ? 'bg-status-error/10 text-status-error border-status-error/40'
                                  : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}
                        >
                          <Icon
                            name={
                              milestone.status === 'completed'
                                ? 'check_circle'
                                : milestone.status === 'delayed'
                                  ? 'warning'
                                  : milestone.status === 'in_progress'
                                    ? 'sync'
                                    : 'calendar_today'
                            }
                            size={24}
                            filled={milestone.status === 'completed'}
                          />
                        </div>
                        <span
                          className={`mt-4 font-label-md text-label-md border ${
                            milestone.status === 'completed'
                              ? 'bg-status-success/10 text-status-success border-status-success/20'
                              : milestone.status === 'delayed'
                                ? 'bg-status-error/10 text-status-error border-status-error/20'
                                : milestone.status === 'in_progress'
                                  ? 'bg-primary text-white border-primary font-semibold'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                          } px-3 py-1 rounded-full whitespace-nowrap`}
                        >
                          {milestone.dates || 'TBD'}
                        </span>
                      </div>
                      <div className="md:w-1/2 md:pr-12 mt-4 md:mt-0 w-full">
                        <div className="md:hidden">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full border ${
                              milestone.status === 'completed'
                                ? 'bg-status-success/10 text-status-success border-status-success/20'
                                : milestone.status === 'delayed'
                                  ? 'bg-status-error/10 text-status-error border-status-error/20'
                                  : milestone.status === 'in_progress'
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            } text-label-sm font-label-sm mb-2 uppercase tracking-wide`}
                          >
                            {milestone.status.replace('_', ' ')}
                          </span>
                          <h3 className="font-headline-sm text-headline-sm mb-1" onClick={() => {
                            console.log("Clicked: Card Title / Milestone Title", milestone.id);
                            handleOpenEdit(milestone);
                          }}>{milestone.title}</h3>
                        </div>
                        <div
                          onClick={() => {
                            console.log("Clicked: Milestone Card", milestone.id);
                            handleOpenEdit(milestone);
                          }}
                          className={`bg-surface-container-lowest p-5 rounded-xl border shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 ${
                            milestone.status === 'in_progress'
                              ? 'border-primary ring-4 ring-primary/5 border-l-primary'
                              : milestone.status === 'completed'
                                ? 'border-border-subtle border-l-status-success'
                                : milestone.status === 'delayed'
                                  ? 'border-border-subtle border-l-status-error'
                                  : 'border-border-subtle border-dashed border-l-indigo-400'
                          } ${
                            milestone.status === 'in_progress'
                              ? 'bg-gradient-to-br from-white to-blue-50/10'
                              : milestone.status === 'completed'
                                ? 'bg-gradient-to-br from-white to-emerald-50/15'
                                : milestone.status === 'delayed'
                                  ? 'bg-gradient-to-br from-white to-red-50/15'
                                  : 'bg-gradient-to-br from-white to-indigo-50/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-label-sm font-label-sm text-outline">PROGRESS</span>
                            <span className={`text-label-sm font-label-sm ${colors.text} font-bold`}>
                              {milestone.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className={`${getProgressColor(milestone.status)} h-full transition-all duration-500`} style={{ width: `${milestone.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {milestones.length === 0 && !loading && (
              <div className="text-center py-12">
                <Icon name="event_busy" size={48} className="mx-auto text-outline mb-2" />
                <h3 className="font-headline-sm">No Milestones</h3>
                <p className="text-on-surface-variant text-body-md max-w-sm mx-auto">Create schedule milestones by clicking "Modify Schedule".</p>
              </div>
            )}

            <div className="mt-16 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-outline-variant ring-8 ring-surface-container-low mb-6" />
              <div className="text-center">
                <p className="text-label-sm font-label-sm text-outline uppercase tracking-tighter">PROJECT COMPLETION</p>
                <p className="font-headline-md text-headline-md">
                  {project?.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'August 15, 2026'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-margin-md border-t border-border-subtle bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center gap-4 -mx-margin-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-status-success" />
            <span className="text-label-sm font-label-sm">
              {milestones.filter((m) => m.status === 'completed').length} Completed
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-label-sm font-label-sm">
              {milestones.filter((m) => m.status === 'in_progress').length} In Progress
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-status-error" />
            <span className="text-label-sm font-label-sm">
              {milestones.filter((m) => m.status === 'delayed').length} Warnings
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-border-subtle rounded-lg text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md flex items-center gap-2 bg-white"
          >
            <Icon name="download" size={18} />
            Export PDF
          </button>
          <button
            onClick={() => {
              console.log("Clicked: Modify Schedule Button");
              handleOpenAdd();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 active:scale-95 duration-100 shadow-sm font-label-md text-label-md flex items-center gap-2"
          >
            <Icon name="edit" size={18} />
            Modify Schedule
          </button>
        </div>
      </div>

      {/* Modify Milestone Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {selectedMilestone ? 'Configure Milestone' : 'Add Milestone'}
              </h3>
              <button onClick={() => setShowModifyModal(false)} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMilestone} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Infrastructure Provisioning"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Description</label>
                <textarea
                  placeholder="Network configuration, cloud VMs..."
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Target Dates</label>
                <input
                  type="text"
                  required
                  placeholder="Feb 01 — Feb 15"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={mDates}
                  onChange={(e) => setMDates(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Status</label>
                  <select
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={mStatus}
                    onChange={(e) => setMStatus(e.target.value)}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={mProgress}
                    onChange={(e) => setMProgress(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-between gap-3">
                {selectedMilestone ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                    className="px-4 py-2 border border-status-error text-status-error rounded-lg hover:bg-red-50 text-label-md font-semibold"
                  >
                    Delete
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModifyModal(false)}
                    className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-md"
                  >
                    {actionLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blockers Modal */}
      {showBlockersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Timeline Blockers</h3>
              <button onClick={() => setShowBlockersModal(false)} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-body-md text-on-surface-variant">
                The following tasks are currently blocking this timeline phase:
              </p>
              <div className="space-y-2">
                {pendingTasks.map((t) => (
                  <div key={t.id} className="p-3 bg-red-50 border border-status-error/15 rounded-lg">
                    <p className="font-semibold text-on-surface text-body-md">{t.title}</p>
                    <div className="flex justify-between items-center mt-2 text-label-sm text-on-surface-variant">
                      <span>Owner: {t.owner_name || 'Unassigned'}</span>
                      <span className="text-status-error font-semibold uppercase">{t.priority}</span>
                    </div>
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <p className="text-center text-outline py-4">No pending tasks detected blocking the timeline!</p>
                )}
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-end">
                <button
                  onClick={() => setShowBlockersModal(false)}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-md"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
