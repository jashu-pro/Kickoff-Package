import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const Management = () => {
  const navigate = useNavigate()
  const { projectId, setProjectId, refreshProjects } = useProject()
  const { showToast } = useToast()

  const filterRef = useRef(null)

  const [localProjects, setLocalProjects] = useState([])
  const [tasks, setTasks] = useState([])

  // Filtering
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Edit Form state
  const [clientName, setClientName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [industry, setIndustry] = useState('Financial Services')
  const [projectType, setProjectType] = useState('')
  const [contractValue, setContractValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('active')
  const [modalLoading, setModalLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const data = await db.projects.list()
      const tData = await db.tasks.list()
      setLocalProjects(data)
      setTasks(tData)
    } catch (e) {
      console.error(e)
      showToast('Error loading projects', 'error')
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
      if (!event.target.closest('.project-row-menu')) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get project progress
  const getProjectProgress = (pId, projStatus) => {
    if (projStatus === 'completed') return 100
    const pTasks = tasks.filter((t) => t.project_id === pId)
    if (pTasks.length === 0) return 0
    const completed = pTasks.filter((t) => t.completed || t.status === 'completed').length
    return Math.round((completed / pTasks.length) * 100)
  }

  // Open Edit Modal
  const handleOpenEdit = (proj) => {
    setSelectedProject(proj)
    setClientName(proj.client_name)
    setProjectName(proj.project_name)
    setIndustry(proj.industry || 'Financial Services')
    setProjectType(proj.project_type || '')
    setContractValue(String(proj.contract_value || ''))
    setStartDate(proj.start_date || '')
    setEndDate(proj.end_date || '')
    setPriority(proj.priority || 'medium')
    setStatus(proj.status || 'active')
    setShowEditModal(true)
    setActiveMenuId(null)
  }

  // Save changes
  const handleEditProject = async (e) => {
    e.preventDefault()
    if (!selectedProject) return
    if (!projectName.trim() || !clientName.trim()) {
      showToast('Project Name and Client Name are required', 'error')
      return
    }

    setModalLoading(true)
    try {
      await db.projects.save({
        id: selectedProject.id,
        client_name: clientName.trim(),
        project_name: projectName.trim(),
        industry,
        project_type: projectType.trim(),
        contract_value: parseFloat(contractValue) || 0,
        start_date: startDate || null,
        end_date: endDate || null,
        priority,
        status
      })
      showToast('Project settings updated successfully!', 'success')
      setShowEditModal(false)
      setSelectedProject(null)
      fetchData()
      refreshProjects()
    } catch (err) {
      showToast(err.message || 'Failed to update project settings', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  // Delete project
  const handleDeleteProject = async (id, name) => {
    setActiveMenuId(null)
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? All associated data will be removed.`)) return
    try {
      await db.projects.delete(id)
      showToast(`Project "${name}" deleted successfully`, 'success')
      fetchData()
      refreshProjects()
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
      case 'on_track':
        return { label: 'Active', class: 'bg-primary/10 text-primary' }
      case 'at_risk':
        return { label: 'At Risk', class: 'bg-status-warning/10 text-status-warning' }
      case 'completed':
        return { label: 'Completed', class: 'bg-status-success/10 text-status-success' }
      case 'on_hold':
        return { label: 'On Hold', class: 'bg-outline-variant/10 text-outline' }
      default:
        return { label: status, class: 'bg-surface-container text-on-surface-variant' }
    }
  }

  // Filter local projects list
  const filteredProjects = localProjects.filter((p) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') return p.status === 'active' || p.status === 'on_track'
    return p.status === statusFilter
  })

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 relative">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Project Management</h2>
            <p className="text-body-lg text-on-surface-variant">
              Track and manage all active consultancy engagements.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Filter button dropdown toggle */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => {
                  console.log("Clicked: Filter dropdown toggle");
                  setShowFilterDropdown(!showFilterDropdown);
                }}
                className="px-4 py-2 border border-border-subtle bg-surface text-primary font-label-md text-label-md rounded-lg flex items-center gap-2 hover:bg-surface-container-low transition-colors bg-white"
              >
                <Icon name="filter_list" size={18} />
                Filter: {statusFilter.toUpperCase()}
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border-subtle rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => { console.log("Clicked: Filter Option All"); setStatusFilter('all'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-body-md"
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => { console.log("Clicked: Filter Option Active"); setStatusFilter('active'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-body-md"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => { console.log("Clicked: Filter Option At Risk"); setStatusFilter('at_risk'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-body-md"
                  >
                    At Risk
                  </button>
                  <button
                    onClick={() => { console.log("Clicked: Filter Option Completed"); setStatusFilter('completed'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-body-md"
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => { console.log("Clicked: Filter Option On Hold"); setStatusFilter('on_hold'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-body-md"
                  >
                    On Hold
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
            >
              <Icon name="add" size={18} />
              New Project
            </button>
          </div>
        </div>

        <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted">
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Project</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Client</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Type</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Progress</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Budget</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredProjects.map((project, idx) => {
                  const statusInfo = getStatusBadge(project.status)
                  const progress = getProjectProgress(project.id, project.status)
                  const isSelected = project.id === projectId

                  return (
                    <tr
                      key={project.id || idx}
                      className={`hover:bg-surface-container-low transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            console.log("Clicked: Set Active Project from Management Table", project.project_name)
                            setProjectId(project.id)
                            showToast(`Active project switched to: ${project.project_name}`, 'success')
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setProjectId(project.id)
                              showToast(`Active project switched to: ${project.project_name}`, 'success')
                            }
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group/name outline-none rounded"
                        >
                          <p className="font-semibold text-on-surface group-hover/name:text-primary">{project.project_name}</p>
                          {isSelected && (
                            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-body-md text-on-surface-variant">{project.client_name}</td>
                      <td className="px-6 py-5 text-body-md text-on-surface-variant">{project.project_type || 'Transformation'}</td>
                      <td className="px-6 py-5">
                        <span className={`text-label-sm font-label-sm px-2 py-0.5 rounded ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                project.status === 'at_risk' ? 'bg-status-warning' : project.status === 'completed' ? 'bg-status-success' : 'bg-primary'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-label-md font-label-md text-on-surface-variant">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-body-md text-on-surface">
                          ₹{(project.contract_value || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              console.log("Clicked: Preview Action for Project", project.id);
                              setProjectId(project.id)
                              navigate('/preview')
                              showToast(`Loaded details for: ${project.project_name}`, 'success')
                            }}
                            title="Preview Kickoff strategy"
                            className="p-2 hover:bg-surface-container rounded-full"
                          >
                            <Icon name="visibility" size={18} className="text-outline hover:text-primary" />
                          </button>
                          <button
                            onClick={() => {
                              console.log("Clicked: Edit Action for Project", project.id);
                              handleOpenEdit(project);
                            }}
                            title="Edit Project parameters"
                            className="p-2 hover:bg-surface-container rounded-full"
                          >
                            <Icon name="edit" size={18} className="text-outline hover:text-primary" />
                          </button>
                          
                          {/* Row actions dropdown */}
                          <div className="relative project-row-menu">
                            <button
                              onClick={() => {
                                console.log("Clicked: Project Action Menu Toggle", project.id);
                                setActiveMenuId(activeMenuId === project.id ? null : project.id)
                              }}
                              className="p-2 hover:bg-surface-container rounded-full"
                            >
                              <Icon name="more_vert" size={18} className="text-outline hover:text-primary" />
                            </button>
                            {activeMenuId === project.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-border-subtle rounded-lg shadow-lg py-1 z-10">
                                <button
                                  onClick={() => {
                                    console.log("Clicked: Delete Action for Project", project.id);
                                    handleDeleteProject(project.id, project.project_name);
                                  }}
                                  className="w-full text-left px-4 py-2 text-label-md hover:bg-error-container/10 text-status-error flex items-center gap-1.5"
                                >
                                  <Icon name="delete" size={16} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                      No projects found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Project Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Edit Project Settings</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditProject} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="e-client">
                    Client Name
                  </label>
                  <input
                    id="e-client"
                    type="text"
                    required
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="e-project">
                    Project Name
                  </label>
                  <input
                    id="e-project"
                    type="text"
                    required
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="e-ind">
                    Industry
                  </label>
                  <select
                    id="e-ind"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option>Financial Services</option>
                    <option>Healthcare</option>
                    <option>Technology</option>
                    <option>Manufacturing</option>
                    <option>Retail</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="e-type">
                    Project Type
                  </label>
                  <input
                    id="e-type"
                    type="text"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                  />
                </div>
                 <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="e-val">
                    Contract Value (₹)
                  </label>
                  <input
                    id="e-val"
                    type="number"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="e-start">
                    Start Date
                  </label>
                  <input
                    id="e-start"
                    type="date"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="e-end">
                    End Date
                  </label>
                  <input
                    id="e-end"
                    type="date"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Priority</label>
                  <select
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Status</label>
                  <select
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="at_risk">At Risk</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 bg-primary text-white font-label-md font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  {modalLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
