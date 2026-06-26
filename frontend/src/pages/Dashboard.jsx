import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { projects, setProjectId, projectId, project } = useProject()
  const { showToast } = useToast()
  
  const [allMembers, setAllMembers] = useState([])
  const [allMilestones, setAllMilestones] = useState([])
  const [activities, setActivities] = useState([])
  const [recentPackages, setRecentPackages] = useState([])
  const [metricsLoading, setMetricsLoading] = useState(true)
  
  // Modals state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  
  // Add Member Form state
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberDept, setNewMemberDept] = useState('')
  const [newMemberCapacity, setNewMemberCapacity] = useState('100')
  const [newMemberSkills, setNewMemberSkills] = useState('')
  const [newMemberProjId, setNewMemberProjId] = useState('')
  const [modalLoading, setModalLoading] = useState(false)

  // Fetch metrics data
  const fetchMetrics = async () => {
    setMetricsLoading(true)
    try {
      const [membersData, msData, activitiesData, packagesData] = await Promise.all([
        db.team_members.list(),
        db.milestones.list(),
        db.activities.list(),
        db.packages.list()
      ])
      setAllMembers(membersData)
      setAllMilestones(msData)
      setActivities(activitiesData || [])
      
      // Sort packages by created_at descending
      const sortedPkgs = (packagesData || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentPackages(sortedPkgs.slice(0, 5));

    } catch (err) {
      console.error('Failed to load dashboard metrics:', err)
    } finally {
      setMetricsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [projects])

  // Reset Add Member form
  useEffect(() => {
    if (projects.length > 0 && !newMemberProjId) {
      setNewMemberProjId(projects[0].id)
    }
  }, [projects, newMemberProjId])

  // Calculations
  const activeProjectsCount = projects.filter((p) => p.status === 'active' || p.status === 'on_track').length
  const totalTeamMembers = Array.from(new Set(allMembers.map((m) => m.name))).length
  const upcomingMilestonesCount = allMilestones.filter((m) => m.status === 'scheduled' || m.status === 'in_progress').length

  const stats = [
    { label: 'Active Projects', value: String(activeProjectsCount), icon: 'folder', trend: '', path: '/projects' },
    { label: 'Team Members', value: String(totalTeamMembers), icon: 'groups', trend: '', path: '/team' },
    { label: 'Upcoming Milestones', value: String(upcomingMilestonesCount), icon: 'flag', trend: '', path: '/milestones' },
  ]

  // Compute progress for each project based on its tasks
  const getProjectProgressAndStatus = (proj) => {
    if (proj.status === 'completed') {
      return { progress: 100, statusLabel: 'Completed', statusColor: 'bg-status-success/10 text-status-success' }
    }
    
    let statusLabel = 'On Track'
    let statusColor = 'bg-status-success/10 text-status-success'
    if (proj.status === 'at_risk') {
      statusLabel = 'At Risk'
      statusColor = 'bg-status-warning/10 text-status-warning'
    } else if (proj.status === 'on_hold') {
      statusLabel = 'On Hold'
      statusColor = 'bg-outline-variant/10 text-outline'
    } else if (proj.status === 'completed') {
      statusLabel = 'Completed'
      statusColor = 'bg-status-success/10 text-status-success'
    }
    return { progress: 0, statusLabel, statusColor }
  }

  // Handle adding team member
  const handleAddMember = async (e) => {
    e.preventDefault()
    console.log("Clicked: Submit Add Member Form")
    if (!newMemberName || !newMemberRole) {
      showToast('Name and Role are required', 'error')
      return
    }

    setModalLoading(true)
    try {
      const skillsArray = newMemberSkills.split(',').map((s) => s.trim()).filter(Boolean)
      await db.team_members.save({
        project_id: newMemberProjId || null,
        name: newMemberName,
        role: newMemberRole,
        email: newMemberEmail,
        department: newMemberDept,
        capacity: parseInt(newMemberCapacity) || 100,
        status: 'available',
        skills: skillsArray,
        avatar_url: ''
      })
      
      showToast('Team member added successfully!', 'success')
      setShowAddMemberModal(false)
      // Reset
      setNewMemberName('')
      setNewMemberRole('')
      setNewMemberEmail('')
      setNewMemberDept('')
      setNewMemberCapacity('100')
      setNewMemberSkills('')
      
      // Refresh metrics
      fetchMetrics()
    } catch (err) {
      showToast(err.message || 'Failed to add team member', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  // Deadlines filtering
  const getUpcomingDeadlines = () => {
    return []
  }

  return (
    <Layout activeTab="dashboard">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Dashboard</h2>
            <p className="text-body-lg text-on-surface-variant">Overview of your consultancy portfolio and active engagements.</p>
          </div>
          {projectId && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-label-md font-label-md text-primary uppercase">
                Active: {projects.find((p) => p.id === projectId)?.project_name || 'NoneSelected'}
              </span>
            </div>
          )}
        </div>

        {/* Active Project Spotlight */}
        {projectId && project && (
          <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="bg-surface-container px-6 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <Icon name="star" className="text-primary" /> Active Project Spotlight
              </h3>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant bg-surface-base px-3 py-1 rounded-full border border-border-subtle shadow-sm">
                {project.project_code || 'CODE-TBD'}
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block mb-1">Project Name</span>
                  <span className="text-sm font-bold text-on-surface">{project.project_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block mb-1">Client</span>
                  <span className="text-sm font-bold text-on-surface">{project.client_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block mb-1">Project Manager</span>
                  <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <Icon name="person" size={14} className="text-primary" /> {project.project_manager || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block mb-1">Status & Priority</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getProjectProgressAndStatus(project).statusColor}`}>
                      {getProjectProgressAndStatus(project).statusLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container-high text-on-surface border border-border-subtle">
                      {project.priority || 'Medium'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex gap-8">
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block mb-1 flex items-center gap-1"><Icon name="play_arrow" size={12}/> Start Date</span>
                    <span className="text-xs font-semibold text-on-surface">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block mb-1 flex items-center gap-1"><Icon name="flag" size={12}/> End Date</span>
                    <span className="text-xs font-semibold text-on-surface">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                </div>
                
                <div className="w-full">
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                    <span className="text-on-surface-variant">Project Completion</span>
                    <span className="text-primary">{getProjectProgressAndStatus(project).progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden border border-border-subtle/50">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getProjectProgressAndStatus(project).progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
          {metricsLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-surface-base border border-border-subtle rounded-xl p-margin-md shadow-sm animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-5 h-5 bg-outline-variant/30 rounded-full" />
                    </div>
                    <div className="w-8 h-4 bg-outline-variant/20 rounded" />
                  </div>
                  <div className="w-16 h-8 bg-outline-variant/30 rounded mb-2" />
                  <div className="w-24 h-4 bg-outline-variant/20 rounded" />
                </div>
              ))
            : stats.map((stat, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    console.log("Clicked: Stats Card", stat.label)
                    navigate(stat.path)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(stat.path)
                    }
                  }}
                  className="bg-surface-base border border-border-subtle rounded-xl p-margin-md shadow-sm cursor-pointer hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name={stat.icon} size={20} className="text-primary" />
                    </div>
                    {stat.trend && (
                      <span className="text-label-sm font-label-sm text-status-success">{stat.trend}</span>
                    )}
                  </div>
                  <p className="font-display-lg text-display-lg text-on-surface">{stat.value}</p>
                  <p className="text-label-md text-on-surface-variant">{stat.label}</p>
                </div>
              ))}
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 bg-surface-base border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <div className="px-margin-md py-4 border-b border-border-subtle bg-surface-muted/50">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Recent Projects
              </h3>
            </div>
            <div className="divide-y divide-border-subtle">
              {projects.map((project, idx) => {
                const { progress, statusLabel, statusColor } = getProjectProgressAndStatus(project)
                const isSelected = project.id === projectId
                
                return (
                  <div
                    key={project.id || idx}
                    className={`p-margin-md hover:bg-surface-container-low transition-all relative ${
                      isSelected ? 'border-l-4 border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div 
                        className="cursor-pointer"
                        onClick={() => {
                          console.log("Clicked: Project Card", project.project_name)
                          setProjectId(project.id)
                          showToast(`Active project switched to: ${project.project_name}`, 'success')
                        }}
                      >
                        <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                          {project.project_name}
                          {isSelected && (
                            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Active</span>
                          )}
                        </h4>
                        <p className="text-label-md text-on-surface-variant">{project.client_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.status === 'active' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/packages/${project.id}`);
                            }}
                            className="bg-primary/10 text-primary hover:bg-primary text-xs hover:text-white font-bold px-3 py-1 rounded transition-colors border border-primary/20 hover:border-primary"
                          >
                            View Package
                          </button>
                        )}
                        <span className={`text-label-sm font-label-sm px-2 py-0.5 rounded ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-label-sm font-label-sm mb-1">
                        <span className="text-on-surface-variant">Progress</span>
                        <span className="text-on-surface">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            project.status === 'at_risk' ? 'bg-status-warning' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
              {projects.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant">
                  <Icon name="folder_open" size={48} className="mx-auto text-outline mb-2" />
                  <p className="font-semibold">No projects available</p>
                  <p className="text-body-md text-outline">Create a new project to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Actions & Deadlines */}
          <div className="space-y-gutter">
            <div className="bg-surface-base border border-border-subtle rounded-xl p-margin-md shadow-sm">
              <h3 className="font-headline-sm text-headline-sm mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    console.log("Clicked: Quick Action - New Project")
                    navigate('/projects/new')
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors text-left"
                >
                  <Icon name="add_box" size={20} className="text-primary" />
                  <span className="font-body-md text-body-md text-on-surface font-semibold">New Project</span>
                </button>
                <button
                  onClick={() => {
                    console.log("Clicked: Quick Action - Add Team Member")
                    setShowAddMemberModal(true)
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors text-left"
                >
                  <Icon name="person_add" size={20} className="text-primary" />
                  <span className="font-body-md text-body-md text-on-surface font-semibold">Add Team Member</span>
                </button>
                <button
                  onClick={() => {
                    console.log("Clicked: Quick Action - Generate Report")
                    window.print()
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors text-left"
                >
                  <Icon name="description" size={20} className="text-primary" />
                  <span className="font-body-md text-body-md text-on-surface font-semibold">Generate Report</span>
                </button>
              </div>
            </div>

            {/* Removed Upcoming Deadlines section since tasks are no longer supported */}

            {/* Recent Packages */}
            <div className="bg-surface-base border border-border-subtle rounded-xl p-margin-md shadow-sm mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-headline-sm">Recent Packages</h3>
              </div>
              <div className="divide-y divide-border-subtle">
                {recentPackages.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <Icon name="inventory_2" size={32} className="mx-auto text-outline mb-2" />
                    <p className="text-body-md text-outline">No packages generated.</p>
                  </div>
                ) : (
                  recentPackages.map((pkg) => {
                    const relatedProject = projects.find(p => p.id === pkg.project_id);
                    return (
                      <div key={pkg.id} className="p-margin-md hover:bg-surface-container-low transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface">
                              {relatedProject?.project_name || 'Unknown Project'}
                            </h4>
                            <p className="text-label-sm text-on-surface-variant">Client: {relatedProject?.client_name || 'N/A'}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-success/10 text-status-success">
                                Version {pkg.version}
                              </span>
                              <span className="text-[10px] text-outline">
                                {new Date(pkg.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/packages/${pkg.id}`)}
                            className="bg-primary/10 text-primary hover:bg-primary text-xs hover:text-white font-bold px-3 py-1 rounded transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-base border border-border-subtle rounded-xl p-margin-md shadow-sm">
              <h3 className="font-headline-sm text-headline-sm mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-body-md text-on-surface-variant italic text-center py-2">No recent activity.</p>
                ) : (
                  activities.slice(0, 5).map((act, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface"><strong>{act.created_by}</strong> {act.action}</p>
                        <p className="text-label-sm text-on-surface-variant mt-0.5">{act.description}</p>
                        <span className="text-[10px] text-outline mt-1 block">{new Date(act.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add Team Member</h3>
              <button
                onClick={() => {
                  console.log("Clicked: Add Member Modal Close Button")
                  setShowAddMemberModal(false)
                }}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="m-name">
                  Full Name
                </label>
                <input
                  id="m-name"
                  type="text"
                  required
                  placeholder="Elena Rodriguez"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="m-role">
                  Role
                </label>
                <input
                  id="m-role"
                  type="text"
                  required
                  placeholder="Lead Architect"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="m-email">
                    Email
                  </label>
                  <input
                    id="m-email"
                    type="email"
                    placeholder="elena@vanguard.com"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="m-dept">
                    Department
                  </label>
                  <input
                    id="m-dept"
                    type="text"
                    placeholder="Consulting"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="m-capacity">
                    Capacity (%)
                  </label>
                  <input
                    id="m-capacity"
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={newMemberCapacity}
                    onChange={(e) => setNewMemberCapacity(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="m-proj">
                    Assign to Project
                  </label>
                  <select
                    id="m-proj"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={newMemberProjId}
                    onChange={(e) => setNewMemberProjId(e.target.value)}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.project_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="m-skills">
                  Skills (comma separated)
                </label>
                <input
                  id="m-skills"
                  type="text"
                  placeholder="AWS, Kubernetes, Cloud Architecture"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={newMemberSkills}
                  onChange={(e) => setNewMemberSkills(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Clicked: Add Member Modal Cancel Button")
                    setShowAddMemberModal(false)
                  }}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 bg-primary text-white font-label-md font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  {modalLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
