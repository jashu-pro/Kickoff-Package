import React, { useState, useEffect, useCallback } from 'react'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const Milestones = () => {
  const { projectId, project, refreshProjects } = useProject()
  const { showToast } = useToast()

  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  // Modals state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  
  // Add Task Form
  const [taskTitle, setTaskTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [ownerId, setOwnerId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Add Note Form
  const [projectNote, setProjectNote] = useState('')

  // File attach reference
  const fileInputRef = React.useRef(null)

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setTasks([])
      setTeamMembers([])
      return
    }
    try {
      const tasksData = await db.tasks.list(projectId)
      const teamData = await db.team_members.list(projectId)
      setTasks(tasksData)
      setTeamMembers(teamData)
      if (teamData.length > 0) {
        setOwnerId(teamData[0].id)
      }
    } catch (e) {
      console.error(e)
      showToast('Error loading milestones task list', 'error')
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (project) {
      setProjectNote(project.notes || '')
    }
  }, [project])

  // Toggle checklist task status in database
  const toggleTask = async (task) => {
    try {
      const newStatus = task.completed ? 'pending' : 'completed'
      await db.tasks.save({
        ...task,
        completed: !task.completed,
        status: newStatus
      })
      await refreshProjects()
      // showToast(`Task marked as ${newStatus}`, 'success')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to toggle task status', 'error')
    }
  }

  // Save new task
  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!projectId) return
    if (!taskTitle.trim()) {
      showToast('Task title is required', 'error')
      return
    }

    setActionLoading(true)
    try {
      const selectedOwner = teamMembers.find(t => t.id === ownerId)
      await db.tasks.save({
        project_id: projectId,
        title: taskTitle.trim(),
        due_date: dueDate || new Date().toISOString().split('T')[0],
        priority,
        status: 'pending',
        owner_id: ownerId || null,
        owner_name: selectedOwner ? selectedOwner.name : 'Team Member',
        owner_avatar: '',
        completed: false
      })
      await refreshProjects()
      // showToast('Task added to checklist!', 'success')
      setShowAddTaskModal(false)
      setTaskTitle('')
      setDueDate('')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Error adding task', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Save project note updates
  const handleSaveNote = async (e) => {
    e.preventDefault()
    if (!project) return
    setActionLoading(true)
    try {
      await db.projects.save({
        ...project,
        notes: projectNote
      })
      await refreshProjects()
      // showToast('Project notes updated successfully!', 'success')
      setShowAddNoteModal(false)
    } catch (err) {
      showToast(err.message || 'Failed to update notes', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Trigger file attachment selection
  const handleTriggerAttach = () => {
    fileInputRef.current?.click()
  }

  // Handle file attachment selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      showToast(`Successfully uploaded and attached file: ${file.name}`, 'success')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-status-error/10 text-status-error'
      case 'high':
        return 'bg-primary/10 text-primary'
      case 'medium':
        return 'bg-status-warning/10 text-status-warning'
      default:
        return 'bg-on-surface-variant/10 text-on-surface-variant'
    }
  }

  const completedTasks = tasks.filter((t) => t.completed || t.status === 'completed').length
  const totalTasks = tasks.length

  // Sort tasks: pending first, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 }
    return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
  })

  // Format date nicely
  const formatDateLabel = (dStr) => {
    if (!dStr) return ''
    try {
      const dateObj = new Date(dStr)
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dStr
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <nav className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant mb-2">
              <span>Active Projects</span>
              <Icon name="chevron_right" size={14} />
              <span className="font-semibold">{project ? project.project_name : 'Loading...'}</span>
            </nav>
            <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight">First Milestone Checklist</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant mt-1">
              Project Initiation & Requirements Gathering phase.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-border-subtle bg-surface-base text-primary font-label-md text-label-md rounded-lg flex items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <Icon name="share" size={18} />
              Share Report
            </button>
            <button
              onClick={() => {
                console.log("Clicked: Add Task Button");
                setShowAddTaskModal(true);
              }}
              className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <Icon name="add" size={18} />
              Add Task
            </button>
          </div>
        </div>

        {/* Progress Metrics Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-8">
          <div className="md:col-span-3 bg-surface-base border border-border-subtle p-margin-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
              <Icon name="query_stats" size={120} className="-rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Overall Milestone Progress
                </h3>
                <p className="font-headline-md text-headline-md mt-1">
                  Status: {totalTasks > 0 && completedTasks === totalTasks ? 'Completed' : 'On Track'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display-lg text-display-lg text-primary">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface-variant">
                  {completedTasks} of {totalTasks} tasks completed
                </span>
                <span className="text-primary font-bold">8 days remaining</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-primary text-on-primary p-margin-md rounded-xl shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-on-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                <Icon name="flag" size={24} />
              </div>
              <h3 className="font-label-sm text-label-sm opacity-80 uppercase">Target Date</h3>
              <p className="font-headline-sm text-headline-sm mt-1">
                {project?.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2026'}
              </p>
              <p className="text-label-md font-label-md mt-2 opacity-70">Q4 Kickoff Goal</p>
            </div>
          </div>
        </div>

        {/* Tasks Table & Phase Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
          <div className="lg:col-span-2 bg-surface-base border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <div className="px-margin-md py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Milestone Checklist
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log("Clicked: Filter List Button")
                    showToast("Filter options for the task checklist are not configured in mock mode", "info")
                  }}
                  className="p-1 hover:bg-surface-container rounded transition-colors text-outline hover:text-on-surface"
                >
                  <Icon name="filter_list" size={20} />
                </button>
                <button
                  onClick={() => {
                    console.log("Clicked: Milestone Checklist More Vert Menu")
                    showToast("Actions menu under development", "info")
                  }}
                  className="p-1 hover:bg-surface-container rounded transition-colors text-outline hover:text-on-surface"
                >
                  <Icon name="more_vert" size={20} />
                </button>
              </div>
            </div>

            <div className="divide-y divide-border-subtle">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-4 p-margin-md hover:bg-surface-container-low transition-all ${
                    task.completed ? 'opacity-60 bg-surface-muted' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={() => {
                        console.log("Clicked: Toggle Task Checkbox", task.id);
                        toggleTask(task);
                      }}
                      className="task-checkbox w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex-grow">
                    <label
                      onClick={() => {
                        console.log("Clicked: Toggle Task Label", task.id);
                        toggleTask(task);
                      }}
                      className={`font-body-md text-body-md text-on-surface cursor-pointer block ${
                        task.completed ? 'line-through text-on-surface-variant' : ''
                      }`}
                    >
                      {task.title}
                    </label>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
                        <Icon name="calendar_today" size={14} />
                        {formatDateLabel(task.due_date)}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-surface-container flex items-center justify-center text-[8px] font-bold">
                          {task.owner_name ? task.owner_name.split(' ').map((n) => n[0]).join('') : 'TM'}
                        </div>
                        <span className="text-label-sm font-label-sm text-on-surface-variant">{task.owner_name || 'Team Member'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span className={`${getPriorityColor(task.priority)} px-2 py-0.5 rounded text-label-sm font-label-sm uppercase`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center text-outline">No tasks mapped to this milestone yet.</div>
              )}
            </div>

            <div className="p-4 bg-surface-muted/30 text-center">
              <button
                onClick={() => {
                  console.log("Clicked: View All Tasks Button")
                  showToast("All tasks for the initiation phase are currently displayed", "success")
                }}
                className="text-primary font-label-md text-label-md hover:underline font-semibold"
              >
                View All {totalTasks} Tasks
              </button>
            </div>
          </div>

          {/* Sidebar Metrics */}
          <div className="flex flex-col gap-gutter">
            {/* Phase Ownership */}
            <div className="bg-surface-base border border-border-subtle p-margin-md rounded-xl shadow-sm">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">
                Phase Ownership
              </h3>
              <div className="space-y-4">
                {teamMembers.slice(0, 2).map((member, idx) => (
                  <div key={member.id || idx} className="flex items-center justify-between border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon name="account_circle" size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{member.name}</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">{member.role}</p>
                      </div>
                    </div>
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="p-1 hover:bg-surface-container rounded-full text-outline hover:text-primary transition-all">
                        <Icon name="mail" size={20} />
                      </a>
                    )}
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <p className="text-label-sm text-outline">No owners assigned to this project.</p>
                )}
              </div>
            </div>

            {/* Velocity Chart */}
            <div className="bg-surface-base border border-border-subtle p-margin-md rounded-xl shadow-sm overflow-hidden">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">
                Milestone Velocity
              </h3>
              <div className="h-32 flex items-end gap-2 px-1">
                {[30, 45, 20, 60, 80, 95, 5].map((height, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-t-sm transition-all hover:bg-primary/40 ${
                      idx < 4 ? 'bg-surface-container-high' : idx === 5 ? 'bg-primary' : 'bg-primary/40'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-label-sm text-on-surface-variant uppercase">
                <span>Mon</span>
                <span>Today</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Note & Attach Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  console.log("Clicked: View/Edit Notes Button");
                  setShowAddNoteModal(true);
                }}
                className="p-3 bg-surface-base border border-border-subtle rounded-lg text-center hover:bg-surface-container-low transition-colors group bg-white"
              >
                <Icon name="note_add" size={24} className="text-primary mb-1 block group-hover:scale-110 transition-transform mx-auto" />
                <span className="text-label-sm font-label-sm text-on-surface font-semibold">View/Edit Notes</span>
              </button>
              <button
                onClick={() => {
                  console.log("Clicked: Attach File Button");
                  handleTriggerAttach();
                }}
                className="p-3 bg-surface-base border border-border-subtle rounded-lg text-center hover:bg-surface-container-low transition-colors group bg-white"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Icon name="attach_file" size={24} className="text-primary mb-1 block group-hover:scale-110 transition-transform mx-auto" />
                <span className="text-label-sm font-label-sm text-on-surface font-semibold">Attach File</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto p-margin-md border-t border-border-subtle bg-surface-base/50 text-center -mx-margin-md -mb-margin-md">
        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2026 KickoffGen Consultancy Suite • v2.4.1-Stable</p>
      </footer>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add Task</h3>
              <button onClick={() => {
                console.log("Clicked: Close Add Task Modal");
                setShowAddTaskModal(false);
              }} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Conduct stakeholder technical alignment interview"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Priority</label>
                  <select
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Owner</label>
                  <select
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                    {teamMembers.length === 0 && (
                      <option value="">No members available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Clicked: Close Add Task Modal");
                    setShowAddTaskModal(false);
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
                  {actionLoading ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Notes Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Project Notes</h3>
              <button onClick={() => {
                console.log("Clicked: Close Notes Modal");
                setShowAddNoteModal(false);
              }} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Notes Content</label>
                <textarea
                  rows={6}
                  placeholder="Insert critical security compliance regulations, client architectural bottlenecks..."
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={projectNote}
                  onChange={(e) => setProjectNote(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Clicked: Close Notes Modal");
                    setShowAddNoteModal(false);
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
                  {actionLoading ? 'Saving...' : 'Update Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
