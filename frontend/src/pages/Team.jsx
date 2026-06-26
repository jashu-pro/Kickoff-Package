import React, { useState, useEffect, useCallback } from 'react'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const Team = () => {
  const { projectId } = useProject()
  const { showToast } = useToast()

  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Add Member Form
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [dept, setDept] = useState('')
  const [capacity, setCapacity] = useState('100')
  const [skills, setSkills] = useState('')
  const [status, setStatus] = useState('available')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchTeam = useCallback(async () => {
    if (!projectId) {
      setTeamMembers([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await db.team_members.list(projectId)
      setTeamMembers(data)
    } catch (e) {
      console.error(e)
      showToast('Error loading team members', 'error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!projectId) return
    if (!name.trim() || !role.trim()) {
      showToast('Name and Role are required', 'error')
      return
    }

    setActionLoading(true)
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)
      await db.team_members.save({
        project_id: projectId,
        name: name.trim(),
        role: role.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/[^a-z]/g, '')}@consulting.com`,
        department: dept.trim() || 'Consulting',
        capacity: parseInt(capacity) || 100,
        status,
        skills: skillsArray,
        avatar_url: ''
      })
      showToast('Team member added successfully!', 'success')
      setShowAddModal(false)
      setName('')
      setRole('')
      setEmail('')
      setDept('')
      setCapacity('100')
      setSkills('')
      fetchTeam()
    } catch (err) {
      showToast(err.message || 'Error adding team member', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteMember = async (id, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return
    try {
      await db.team_members.delete(id)
      showToast(`${memberName} removed from the team`, 'success')
      fetchTeam()
    } catch (err) {
      showToast(err.message || 'Failed to remove team member', 'error')
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Team Introduction</h2>
            <p className="text-body-lg text-on-surface-variant">Meet the consultants driving your project forward.</p>
          </div>
          <button
            onClick={() => {
              console.log("Clicked: Add Member Button");
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <Icon name="person_add" size={18} />
            Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {teamMembers.map((member, idx) => (
            <div key={member.id || idx} className="bg-surface-base border border-border-subtle rounded-xl p-margin-md shadow-sm hover:shadow-md transition-all relative group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center">
                    <Icon name="account_circle" size={32} filled className="text-primary" />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-base ${
                      member.status === 'available'
                        ? 'bg-status-success'
                        : member.status === 'busy'
                          ? 'bg-status-warning'
                          : 'bg-outline-variant'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">{member.name}</h4>
                  <p className="text-label-md text-on-surface-variant truncate">{member.role}</p>
                  <p className="text-label-sm text-outline truncate">{member.department}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-1 hover:bg-surface-container rounded-full text-outline hover:text-primary transition-all"
                    >
                      <Icon name="mail" size={18} />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      console.log("Clicked: Delete Member Action", member.id);
                      handleDeleteMember(member.id, member.name);
                    }}
                    className="p-1 hover:bg-error-container/10 rounded-full text-outline hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(member.skills || []).map((skill, i) => (
                  <span key={i} className="text-label-sm font-label-sm bg-surface-container-low px-2 py-0.5 rounded text-on-surface-variant">
                    {skill}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-label-sm font-label-sm mb-1">
                  <span className="text-on-surface-variant">Capacity</span>
                  <span className={`${member.capacity > 80 ? 'text-status-success' : member.capacity > 50 ? 'text-status-warning' : 'text-status-error'}`}>
                    {member.capacity}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      member.capacity > 80
                        ? 'bg-status-success'
                        : member.capacity > 50
                          ? 'bg-status-warning'
                          : member.capacity > 0
                            ? 'bg-status-error'
                            : 'bg-outline-variant'
                    }`}
                    style={{ width: `${member.capacity}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {teamMembers.length === 0 && !loading && (
            <div className="col-span-full bg-white border border-border-subtle rounded-xl p-8 text-center text-on-surface-variant">
              <Icon name="group_off" size={48} className="mx-auto text-outline mb-2" />
              <p className="font-semibold">No Team Members</p>
              <p className="text-body-md text-outline">Click "Add Member" to register consultants to this project.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add Team Member</h3>
              <button onClick={() => {
                console.log("Clicked: Close Add Member Modal");
                setShowAddModal(false);
              }} className="text-outline hover:text-on-surface p-1">
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Elena Rodriguez"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Role</label>
                <input
                  type="text"
                  required
                  placeholder="Lead Architect"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="elena@vanguard.com"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Consulting"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Capacity (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Status</label>
                  <select
                    className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="AWS, Docker, Kubernetes"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Clicked: Close Add Member Modal");
                    setShowAddModal(false);
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
                  {actionLoading ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
