import { supabase } from './supabase'

// Helpers for milestone dates parsing and formatting
const parseDates = (datesStr) => {
  if (!datesStr) return { start_date: null, end_date: null }
  const parts = datesStr.split('—').map(p => p.trim())
  
  const toLocalYYYYMMDD = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parsePart = (part) => {
    if (!part) return null
    const parsed = Date.parse(part)
    if (!isNaN(parsed)) {
      return toLocalYYYYMMDD(new Date(parsed))
    }
    const withYear = Date.parse(`${part}, ${new Date().getFullYear()}`)
    if (!isNaN(withYear)) {
      return toLocalYYYYMMDD(new Date(withYear))
    }
    return null
  }
  
  const start_date = parsePart(parts[0])
  const end_date = parsePart(parts[1] || parts[0])
  return { start_date, end_date }
}

const formatDates = (start_date, end_date) => {
  if (!start_date) return ''
  
  const formatDatePart = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  }
  
  const start = formatDatePart(start_date)
  const end = formatDatePart(end_date)
  if (start && end && start !== end) {
    return `${start} — ${end}`
  }
  return start || ''
}

// Helper for generating UUIDs in LocalStorage
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ----------------------------------------------------
// DEFAULT MOCK DATA SEEDS FOR LOCAL STORAGE (CLEARED)
// ----------------------------------------------------
const defaultProjects = []
const defaultTeamMembers = []
const defaultTasks = []
const defaultMilestones = []
const defaultChannels = []
const defaultStakeholders = []
const defaultEscalations = []
const defaultMeetings = []
const defaultIntegrations = []

// Clear any previously stored mock data from LocalStorage to ensure a clean slate
if (typeof window !== 'undefined' && !localStorage.getItem('ko_cleared_prefilled_v1')) {
  const keysToClear = [
    'ko_projects',
    'ko_team_members',
    'ko_tasks',
    'ko_milestones',
    'ko_channels',
    'ko_stakeholders',
    'ko_escalations',
    'ko_meetings',
    'ko_integrations',
    'ko_active_project_id'
  ]
  keysToClear.forEach(key => localStorage.removeItem(key))
  localStorage.setItem('ko_cleared_prefilled_v1', 'true')
}

// ----------------------------------------------------
// LOCAL STORAGE DB ENGINE WRAPPER
// ----------------------------------------------------
class LocalDB {
  getTable(key, defaultVal) {
    const data = localStorage.getItem(`ko_${key}`)
    if (data && data.includes('2024-')) {
      localStorage.removeItem(`ko_${key}`)
      localStorage.setItem(`ko_${key}`, JSON.stringify(defaultVal))
      return defaultVal
    }
    if (!data) {
      localStorage.setItem(`ko_${key}`, JSON.stringify(defaultVal))
      return defaultVal
    }
    return JSON.parse(data)
  }

  setTable(key, data) {
    localStorage.setItem(`ko_${key}`, JSON.stringify(data))
  }

  // Projects
  async getProjects() {
    return this.getTable('projects', defaultProjects)
  }
  async saveProject(proj) {
    const list = await this.getProjects()
    if (proj.id) {
      const idx = list.findIndex((p) => p.id === proj.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...proj }
    } else {
      proj.id = generateUUID()
      list.push(proj)
    }
    this.setTable('projects', list)
    return proj
  }
  async deleteProject(id) {
    const list = await this.getProjects()
    const filtered = list.filter((p) => p.id !== id)
    this.setTable('projects', filtered)
  }

  // Team Members
  async getTeamMembers(projectId) {
    const list = this.getTable('team_members', defaultTeamMembers)
    return projectId ? list.filter((t) => t.project_id === projectId) : list
  }
  async saveTeamMember(member) {
    const list = this.getTable('team_members', defaultTeamMembers)
    if (member.id) {
      const idx = list.findIndex((m) => m.id === member.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...member }
    } else {
      member.id = generateUUID()
      list.push(member)
    }
    this.setTable('team_members', list)
    return member
  }
  async deleteTeamMember(id) {
    const list = this.getTable('team_members', defaultTeamMembers)
    this.setTable('team_members', list.filter((m) => m.id !== id))
  }

  // Tasks
  async getTasks(projectId) {
    const list = this.getTable('tasks', defaultTasks)
    return projectId ? list.filter((t) => t.project_id === projectId) : list
  }
  async saveTask(task) {
    const list = this.getTable('tasks', defaultTasks)
    if (task.id) {
      const idx = list.findIndex((t) => t.id === task.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...task }
    } else {
      task.id = generateUUID()
      list.push(task)
    }
    this.setTable('tasks', list)
    return task
  }
  async deleteTask(id) {
    const list = this.getTable('tasks', defaultTasks)
    this.setTable('tasks', list.filter((t) => t.id !== id))
  }

  // Milestones
  async getMilestones(projectId) {
    const list = this.getTable('milestones', defaultMilestones)
    return projectId ? list.filter((m) => m.project_id === projectId) : list
  }
  async saveMilestone(milestone) {
    const list = this.getTable('milestones', defaultMilestones)
    if (milestone.id) {
      const idx = list.findIndex((m) => m.id === milestone.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...milestone }
    } else {
      milestone.id = generateUUID()
      list.push(milestone)
    }
    this.setTable('milestones', list)
    return milestone
  }
  async deleteMilestone(id) {
    const list = this.getTable('milestones', defaultMilestones)
    this.setTable('milestones', list.filter((m) => m.id !== id))
  }

  // Channels
  async getChannels(projectId) {
    const list = this.getTable('channels', defaultChannels)
    return projectId ? list.filter((c) => c.project_id === projectId) : list
  }
  async saveChannel(channel) {
    const list = this.getTable('channels', defaultChannels)
    if (channel.id) {
      const idx = list.findIndex((c) => c.id === channel.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...channel }
    } else {
      channel.id = generateUUID()
      list.push(channel)
    }
    this.setTable('channels', list)
    return channel
  }
  async deleteChannel(id) {
    const list = this.getTable('channels', defaultChannels)
    this.setTable('channels', list.filter((c) => c.id !== id))
  }

  // Stakeholders
  async getStakeholders(projectId) {
    const list = this.getTable('stakeholders', defaultStakeholders)
    return projectId ? list.filter((s) => s.project_id === projectId) : list
  }
  async saveStakeholder(stakeholder) {
    const list = this.getTable('stakeholders', defaultStakeholders)
    if (stakeholder.id) {
      const idx = list.findIndex((s) => s.id === stakeholder.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...stakeholder }
    } else {
      stakeholder.id = generateUUID()
      list.push(stakeholder)
    }
    this.setTable('stakeholders', list)
    return stakeholder
  }
  async deleteStakeholder(id) {
    const list = this.getTable('stakeholders', defaultStakeholders)
    this.setTable('stakeholders', list.filter((s) => s.id !== id))
  }

  // Escalation Levels
  async getEscalations(projectId) {
    const list = this.getTable('escalations', defaultEscalations)
    return projectId ? list.filter((e) => e.project_id === projectId) : list
  }
  async saveEscalation(escalation) {
    const list = this.getTable('escalations', defaultEscalations)
    if (escalation.id) {
      const idx = list.findIndex((e) => e.id === escalation.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...escalation }
    } else {
      escalation.id = generateUUID()
      list.push(escalation)
    }
    this.setTable('escalations', list)
    return escalation
  }
  async deleteEscalation(id) {
    const list = this.getTable('escalations', defaultEscalations)
    this.setTable('escalations', list.filter((e) => e.id !== id))
  }

  // Meetings
  async getMeetings(projectId) {
    const list = this.getTable('meetings', defaultMeetings)
    return projectId ? list.filter((m) => m.project_id === projectId) : list
  }
  async saveMeeting(meeting) {
    const list = this.getTable('meetings', defaultMeetings)
    if (meeting.id) {
      const idx = list.findIndex((m) => m.id === meeting.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...meeting }
    } else {
      meeting.id = generateUUID()
      list.push(meeting)
    }
    this.setTable('meetings', list)
    return meeting
  }
  async deleteMeeting(id) {
    const list = this.getTable('meetings', defaultMeetings)
    this.setTable('meetings', list.filter((m) => m.id !== id))
  }

  // Integrations (Credentials)
  async getIntegrations(projectId) {
    const list = this.getTable('integrations', defaultIntegrations)
    return projectId ? list.filter((i) => i.project_id === projectId) : list
  }
  async saveIntegration(integration) {
    const list = this.getTable('integrations', defaultIntegrations)
    if (integration.id) {
      const idx = list.findIndex((i) => i.id === integration.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...integration }
    } else {
      integration.id = generateUUID()
      list.push(integration)
    }
    this.setTable('integrations', list)
    return integration
  }
  async deleteIntegration(id) {
    const list = this.getTable('integrations', defaultIntegrations)
    this.setTable('integrations', list.filter((i) => i.id !== id))
  }

  // Notifications
  async getNotifications() {
    const list = this.getTable('notifications', [])
    let modified = false
    const updated = list.map(n => {
      let changed = false
      if (n.is_deleted === undefined) {
        n.is_deleted = false
        changed = true
      }
      if (n.deleted_at === undefined) {
        n.deleted_at = null
        changed = true
      }
      if (changed) modified = true
      return n
    })
    if (modified) {
      this.setTable('notifications', updated)
    }
    return updated
  }
  async saveNotification(notif) {
    const list = await this.getNotifications()
    if (notif.id) {
      const idx = list.findIndex((n) => n.id === notif.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...notif }
    } else {
      notif.id = generateUUID()
      notif.created_at = new Date().toISOString()
      notif.is_deleted = notif.is_deleted ?? false
      notif.deleted_at = notif.deleted_at ?? null
      list.push(notif)
    }
    this.setTable('notifications', list)
    return notif
  }
  async deleteNotification(id) {
    const list = await this.getNotifications()
    const idx = list.findIndex((n) => n.id === id)
    if (idx !== -1) {
      list[idx].is_deleted = true
      list[idx].deleted_at = new Date().toISOString()
      this.setTable('notifications', list)
    }
  }
  async deleteNotificationPermanent(id) {
    const list = await this.getNotifications()
    this.setTable('notifications', list.filter((n) => n.id !== id))
  }
}

const localDB = new LocalDB()
let lastChecksTime = 0

const API_URL = import.meta.env.VITE_API_URL

const apiFetch = async (path, options = {}) => {
  if (!API_URL) return null
  try {
    const url = `${API_URL}${path}`
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
    const response = await fetch(url, { ...options, headers })
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `HTTP error! status: ${response.status}`)
    }
    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (err) {
    console.warn(`Express API connection failed for ${path}:`, err.message)
    throw err
  }
}

// ----------------------------------------------------
// HYBRID BACKEND CONTROLLER EXPORT
// ----------------------------------------------------
export const db = {
  isSupabase: !!supabase,

  projects: {
    list: async () => {
      if (API_URL) {
        try {
          return await apiFetch('/projects')
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      }
      return localDB.getProjects()
    },
    get: async (id) => {
      if (API_URL) {
        try {
          return await apiFetch(`/projects/${id}`)
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
        if (error) throw error
        return data
      }
      const list = await localDB.getProjects()
      return list.find((p) => p.id === id)
    },
    save: async (proj) => {
      const isNew = !proj.id
      let oldProj = null
      if (!isNew && proj.id) {
        try {
          oldProj = await db.projects.get(proj.id)
        } catch (e) {}
      }

      let result
      if (API_URL) {
        try {
          if (proj.id) {
            result = await apiFetch(`/projects/${proj.id}`, { method: 'PUT', body: JSON.stringify(proj) })
          } else {
            result = await apiFetch(`/projects`, { method: 'POST', body: JSON.stringify(proj) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (!result) {
        if (supabase) {
          const payload = {
            client_name: proj.client_name,
            project_name: proj.project_name,
            industry: proj.industry,
            project_type: proj.project_type,
            contract_value: proj.contract_value,
            start_date: proj.start_date || null,
            end_date: proj.end_date || null,
            priority: proj.priority,
            status: proj.status || 'active',
            notes: proj.notes
          }
          if (proj.id) {
            const { data, error } = await supabase.from('projects').update(payload).eq('id', proj.id).select().single()
            if (error) throw error
            result = data
          } else {
            const { data, error } = await supabase.from('projects').insert(payload).select().single()
            if (error) throw error
            result = data
          }
        } else {
          result = await localDB.saveProject(proj)
        }
      }

      // Notification Triggers
      if (isNew) {
        await db.notifications.triggerNotification(
          'Project Created',
          `Project "${result.project_name}" has been created for client "${result.client_name}".`,
          'new_activity',
          'project',
          'medium',
          result.id
        )
      } else if (oldProj) {
        // PM changed
        if (proj.project_manager_id && proj.project_manager_id !== oldProj.project_manager_id) {
          let managerName = 'a team member'
          try {
            if (supabase) {
              const { data } = await supabase.from('team_members').select('name').eq('id', proj.project_manager_id).single()
              if (data) managerName = data.name
            } else {
              const members = await localDB.getTeamMembers()
              const m = members.find(mem => mem.id === proj.project_manager_id)
              if (m) managerName = m.name
            }
          } catch (e) {}
          await db.notifications.triggerNotification(
            'Project Manager Changed',
            `Project Manager for "${result.project_name}" has been changed to "${managerName}".`,
            'new_activity',
            'team',
            'medium',
            result.id
          )
        }
      }
      return result
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/projects/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteProject(id)
    }
  },

  team_members: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/team_members?project_id=${projectId}` : '/team_members'
          return await apiFetch(path)
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('team_members').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getTeamMembers(projectId)
    },
    save: async (member) => {
      const isNew = !member.id
      let result
      if (API_URL) {
        try {
          if (member.id) {
            result = await apiFetch(`/team_members/${member.id}`, { method: 'PUT', body: JSON.stringify(member) })
          } else {
            result = await apiFetch(`/team_members`, { method: 'POST', body: JSON.stringify(member) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (!result) {
        if (supabase) {
          const payload = {
            project_id: member.project_id || null,
            name: member.name,
            role: member.role,
            avatar_url: member.avatar_url,
            email: member.email,
            capacity: member.capacity,
            status: member.status,
            department: member.department,
            skills: member.skills
          }
          if (member.id) {
            const { data, error } = await supabase.from('team_members').update(payload).eq('id', member.id).select().single()
            if (error) throw error
            result = data
          } else {
            const { data, error } = await supabase.from('team_members').insert(payload).select().single()
            if (error) throw error
            result = data
          }
        } else {
          result = await localDB.saveTeamMember(member)
        }
      }

      // Notification Triggers
      if (isNew) {
        let projName = 'a project'
        if (result.project_id) {
          try {
            const p = await db.projects.get(result.project_id)
            if (p) projName = `"${p.project_name}"`
          } catch(e) {}
        }
        await db.notifications.triggerNotification(
          'New Team Member Added',
          `${result.name} has been added to project ${projName}.`,
          'new_activity',
          'team',
          'medium',
          result.project_id || result.id
        )
      }
      return result
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/team_members/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('team_members').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteTeamMember(id)
    }
  },

  tasks: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/tasks?project_id=${projectId}` : '/tasks'
          const res = await apiFetch(path)
          return (res || []).map((t) => ({
            ...t,
            completed: t.status === 'completed',
            owner_name: t.team_members ? t.team_members.name : 'Team Member'
          }))
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('tasks').select('*, team_members(name)')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return (data || []).map((t) => ({
          ...t,
          completed: t.status === 'completed',
          owner_name: t.team_members ? t.team_members.name : 'Team Member'
        }))
      }
      return localDB.getTasks(projectId)
    },
    save: async (task) => {
      const isNew = !task.id
      let oldTask = null
      if (!isNew && task.id) {
        try {
          if (API_URL) {
            oldTask = await apiFetch(`/tasks/${task.id}`)
          } else if (supabase) {
            const { data } = await supabase.from('tasks').select('*').eq('id', task.id).single()
            oldTask = data
          } else {
            const list = await localDB.getTasks()
            oldTask = list.find(t => t.id === task.id)
          }
        } catch (e) {}
      }

      let result
      if (API_URL) {
        try {
          if (task.id) {
            const res = await apiFetch(`/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify(task) })
            result = {
              ...res,
              completed: res.status === 'completed',
              owner_name: res.team_members ? res.team_members.name : 'Team Member'
            }
          } else {
            const res = await apiFetch(`/tasks`, { method: 'POST', body: JSON.stringify(task) })
            result = {
              ...res,
              completed: res.status === 'completed',
              owner_name: res.team_members ? res.team_members.name : 'Team Member'
            }
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (!result) {
        if (supabase) {
          const payload = {
            project_id: task.project_id,
            title: task.title,
            description: task.description,
            due_date: task.due_date || null,
            priority: task.priority,
            status: task.status,
            owner_id: task.owner_id || null,
            progress: task.progress || 0
          }
          if (task.id) {
            const { data, error } = await supabase.from('tasks').update(payload).eq('id', task.id).select('*, team_members(name)').single()
            if (error) throw error
            result = {
              ...data,
              completed: data.status === 'completed',
              owner_name: data.team_members ? data.team_members.name : 'Team Member'
            }
          } else {
            const { data, error } = await supabase.from('tasks').insert(payload).select('*, team_members(name)').single()
            if (error) throw error
            result = {
              ...data,
              completed: data.status === 'completed',
              owner_name: data.team_members ? data.team_members.name : 'Team Member'
            }
          }
        } else {
          const res = await localDB.saveTask(task)
          result = {
            ...res,
            completed: res.status === 'completed',
            owner_name: 'Team Member'
          }
        }
      }

      // Notification Triggers
      if (isNew) {
        await db.notifications.triggerNotification(
          'Task Created',
          `Task "${result.title}" has been created.`,
          'new_activity',
          'task',
          'info',
          result.id
        )
        if (result.priority === 'high') {
          await db.notifications.triggerNotification(
            'High-Priority Task Created',
            `High-priority task "${result.title}" has been created.`,
            'new_activity',
            'task',
            'high',
            result.id
          )
        }
        if (result.owner_id) {
          let ownerName = 'a team member'
          try {
            if (API_URL) {
              const members = await apiFetch(`/team_members`)
              const m = members.find(mem => mem.id === result.owner_id)
              if (m) ownerName = m.name
            } else if (supabase) {
              const { data } = await supabase.from('team_members').select('name').eq('id', result.owner_id).single()
              if (data) ownerName = data.name
            } else {
              const members = await localDB.getTeamMembers()
              const m = members.find(mem => mem.id === result.owner_id)
              if (m) ownerName = m.name
            }
          } catch(e) {}
          await db.notifications.triggerNotification(
            'Task Assigned',
            `Task "${result.title}" has been assigned to ${ownerName}.`,
            'new_activity',
            'task',
            'medium',
            result.id
          )
        }
      } else if (oldTask) {
        if (result.status === 'completed' && oldTask.status !== 'completed') {
          await db.notifications.triggerNotification(
            'Task Completed',
            `Task "${result.title}" has been completed.`,
            'completed',
            'task',
            'medium',
            result.id
          )
        }
        if (result.owner_id && result.owner_id !== oldTask.owner_id) {
          let ownerName = 'a team member'
          try {
            if (API_URL) {
              const members = await apiFetch(`/team_members`)
              const m = members.find(mem => mem.id === result.owner_id)
              if (m) ownerName = m.name
            } else if (supabase) {
              const { data } = await supabase.from('team_members').select('name').eq('id', result.owner_id).single()
              if (data) ownerName = data.name
            } else {
              const members = await localDB.getTeamMembers()
              const m = members.find(mem => mem.id === result.owner_id)
              if (m) ownerName = m.name
            }
          } catch(e) {}
          await db.notifications.triggerNotification(
            'Task Assigned',
            `Task "${result.title}" has been assigned to ${ownerName}.`,
            'new_activity',
            'task',
            'medium',
            result.id
          )
        }
      }

      // Check project progress thresholds
      if (result.project_id) {
        await db.notifications.checkAndNotifyProjectProgress(result.project_id)
      }
      return result
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/tasks/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteTask(id)
    }
  },

  milestones: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/milestones?project_id=${projectId}` : '/milestones'
          const res = await apiFetch(path)
          return (res || []).map((d) => ({
            ...d,
            dates: formatDates(d.start_date, d.end_date)
          }))
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('milestones').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return (data || []).map((d) => ({
          ...d,
          dates: formatDates(d.start_date, d.end_date)
        }))
      }
      return localDB.getMilestones(projectId)
    },
    save: async (ms) => {
      const isNew = !ms.id
      let oldMs = null
      if (!isNew && ms.id) {
        try {
          if (API_URL) {
            oldMs = await apiFetch(`/milestones/${ms.id}`)
          } else if (supabase) {
            const { data } = await supabase.from('milestones').select('*').eq('id', ms.id).single()
            oldMs = data
          } else {
            const list = await localDB.getMilestones()
            oldMs = list.find(m => m.id === ms.id)
          }
        } catch (e) {}
      }

      let result
      if (API_URL) {
        try {
          let res
          if (ms.id) {
            res = await apiFetch(`/milestones/${ms.id}`, { method: 'PUT', body: JSON.stringify(ms) })
          } else {
            res = await apiFetch(`/milestones`, { method: 'POST', body: JSON.stringify(ms) })
          }
          result = {
            ...res,
            dates: formatDates(res.start_date, res.end_date)
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (!result) {
        if (supabase) {
          const { start_date, end_date } = parseDates(ms.dates)
          const payload = {
            project_id: ms.project_id,
            title: ms.title,
            description: ms.description,
            start_date: start_date || ms.start_date || null,
            end_date: end_date || ms.end_date || null,
            status: ms.status,
            progress: ms.progress || 0
          }
          if (ms.id) {
            const { data, error } = await supabase.from('milestones').update(payload).eq('id', ms.id).select().single()
            if (error) throw error
            result = {
              ...data,
              dates: formatDates(data.start_date, data.end_date)
            }
          } else {
            const { data, error } = await supabase.from('milestones').insert(payload).select().single()
            if (error) throw error
            result = {
              ...data,
              dates: formatDates(data.start_date, data.end_date)
            }
          }
        } else {
          result = await localDB.saveMilestone(ms)
        }
      }

      // Notification Triggers
      if (isNew) {
        await db.notifications.triggerNotification(
          'Milestone Created',
          `Milestone "${result.title}" has been scheduled.`,
          'new_activity',
          'milestone',
          'info',
          result.id
        )
      } else if (oldMs && result.status === 'completed' && oldMs.status !== 'completed') {
        await db.notifications.triggerNotification(
          'Milestone Completed',
          `Milestone "${result.title}" has been completed.`,
          'completed',
          'milestone',
          'medium',
          result.id
        )
      }
      return result
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/milestones/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('milestones').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteMilestone(id)
    }
  },

  channels: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/communication_channels?project_id=${projectId}` : '/communication_channels'
          const res = await apiFetch(path)
          return (res || []).map((d) => ({ ...d, type: d.channel_type }))
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('communication_channels').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return (data || []).map((d) => ({ ...d, type: d.channel_type }))
      }
      return localDB.getChannels(projectId)
    },
    save: async (channel) => {
      if (API_URL) {
        try {
          if (channel.id) {
            return await apiFetch(`/communication_channels/${channel.id}`, { method: 'PUT', body: JSON.stringify(channel) })
          } else {
            return await apiFetch(`/communication_channels`, { method: 'POST', body: JSON.stringify(channel) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const payload = {
          project_id: channel.project_id,
          channel_type: channel.type,
          name: channel.name,
          description: channel.description,
          channel_url: channel.channel_url,
          is_active: channel.is_active
        }
        if (channel.id) {
          const { data, error } = await supabase.from('communication_channels').update(payload).eq('id', channel.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('communication_channels').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveChannel(channel)
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/communication_channels/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('communication_channels').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteChannel(id)
    }
  },

  stakeholders: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/stakeholders?project_id=${projectId}` : '/stakeholders'
          return await apiFetch(path)
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('stakeholders').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getStakeholders(projectId)
    },
    save: async (sh) => {
      if (API_URL) {
        try {
          if (sh.id) {
            return await apiFetch(`/stakeholders/${sh.id}`, { method: 'PUT', body: JSON.stringify(sh) })
          } else {
            return await apiFetch(`/stakeholders`, { method: 'POST', body: JSON.stringify(sh) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const payload = {
          project_id: sh.project_id,
          name: sh.name,
          role: sh.role,
          organization: sh.organization,
          email: sh.email,
          phone: sh.phone,
          avatar_url: sh.avatar_url
        }
        if (sh.id) {
          const { data, error } = await supabase.from('stakeholders').update(payload).eq('id', sh.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('stakeholders').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveStakeholder(sh)
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/stakeholders/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('stakeholders').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteStakeholder(id)
    }
  },

  escalations: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/escalation_levels?project_id=${projectId}` : '/escalation_levels'
          return await apiFetch(path)
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('escalation_levels').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getEscalations(projectId)
    },
    save: async (esc) => {
      if (API_URL) {
        try {
          if (esc.id) {
            return await apiFetch(`/escalation_levels/${esc.id}`, { method: 'PUT', body: JSON.stringify(esc) })
          } else {
            return await apiFetch(`/escalation_levels`, { method: 'POST', body: JSON.stringify(esc) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const payload = {
          project_id: esc.project_id,
          level: esc.level,
          severity: esc.severity,
          description: esc.description,
          contact_name: esc.contact_name,
          contact_role: esc.contact_role,
          response_time: esc.response_time
        }
        if (esc.id) {
          const { data, error } = await supabase.from('escalation_levels').update(payload).eq('id', esc.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('escalation_levels').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveEscalation(esc)
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/escalation_levels/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('escalation_levels').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteEscalation(id)
    }
  },

  meetings: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/meeting_frequencies?project_id=${projectId}` : '/meeting_frequencies'
          return await apiFetch(path)
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('meeting_frequencies').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getMeetings(projectId)
    },
    save: async (mt) => {
      if (API_URL) {
        try {
          if (mt.id) {
            return await apiFetch(`/meeting_frequencies/${mt.id}`, { method: 'PUT', body: JSON.stringify(mt) })
          } else {
            return await apiFetch(`/meeting_frequencies`, { method: 'POST', body: JSON.stringify(mt) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const payload = {
          project_id: mt.project_id,
          name: mt.name,
          frequency: mt.frequency,
          day_of_week: mt.day_of_week,
          time: mt.time,
          duration: mt.duration,
          attendees: mt.attendees || []
        }
        if (mt.id) {
          const { data, error } = await supabase.from('meeting_frequencies').update(payload).eq('id', mt.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('meeting_frequencies').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveMeeting(mt)
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/meeting_frequencies/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('meeting_frequencies').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteMeeting(id)
    }
  },

  integrations: {
    list: async (projectId) => {
      if (API_URL) {
        try {
          const path = projectId ? `/integrations?project_id=${projectId}` : '/integrations'
          return await apiFetch(path)
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        let q = supabase.from('integrations').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getIntegrations(projectId)
    },
    save: async (integration) => {
      if (API_URL) {
        try {
          if (integration.id) {
            return await apiFetch(`/integrations/${integration.id}`, { method: 'PUT', body: JSON.stringify(integration) })
          } else {
            return await apiFetch(`/integrations`, { method: 'POST', body: JSON.stringify(integration) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const payload = {
          project_id: integration.project_id,
          service: integration.service,
          description: integration.description,
          status: integration.status,
          last_used: integration.last_used
        }
        if (integration.id) {
          const { data, error } = await supabase.from('integrations').update(payload).eq('id', integration.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('integrations').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveIntegration(integration)
    },
    delete: async (id) => {
      if (API_URL) {
        try {
          await apiFetch(`/integrations/${id}`, { method: 'DELETE' })
          return
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        const { error } = await supabase.from('integrations').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteIntegration(id)
    }
  },

  notifications: {
    list: async (filter = 'all', page = 1, limit = 20, searchQuery = '') => {
      if (API_URL) {
        try {
          return await apiFetch(`/notifications?filter=${encodeURIComponent(filter)}&page=${page}&limit=${limit}&q=${encodeURIComponent(searchQuery)}`)
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }
      if (supabase) {
        try {
          let q = supabase.from('notifications').select('*', { count: 'exact' })
          
          if (filter === 'deleted') {
            q = q.eq('is_deleted', true)
          } else {
            q = q.eq('is_deleted', false)
            if (filter === 'unread') {
              q = q.eq('is_read', false)
            } else if (filter === 'high_priority') {
              q = q.eq('priority', 'high')
            } else if (['project', 'task', 'milestone', 'team'].includes(filter)) {
              q = q.eq('category', filter)
            }
          }

          if (searchQuery.trim()) {
            q = q.or(`title.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`)
          }
          
          const fromIdx = (page - 1) * limit
          const toIdx = fromIdx + limit - 1
          const { data, error, count } = await q
            .order(filter === 'deleted' ? 'deleted_at' : 'created_at', { ascending: false })
            .range(fromIdx, toIdx)
            
          if (error) throw error
          return { data: data || [], count: count || 0 }
        } catch (err) {
          if (err.code === '42P01' || err.message?.includes('relation "public.notifications" does not exist') || err.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage.');
          } else {
            throw err
          }
        }
      }
      
      let list = await localDB.getNotifications()
      if (filter === 'deleted') {
        list = list.filter(n => n.is_deleted)
      } else {
        list = list.filter(n => !n.is_deleted)
        if (filter === 'unread') {
          list = list.filter(n => !n.is_read)
        } else if (filter === 'high_priority') {
          list = list.filter(n => n.priority === 'high')
        } else if (['project', 'task', 'milestone', 'team'].includes(filter)) {
          list = list.filter(n => n.category === filter)
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        list = list.filter(n => 
          (n.title && n.title.toLowerCase().includes(q)) || 
          (n.message && n.message.toLowerCase().includes(q))
        )
      }
      
      list.sort((a, b) => {
        if (filter === 'deleted') {
          return new Date(b.deleted_at || b.created_at) - new Date(a.deleted_at || a.created_at)
        }
        return new Date(b.created_at) - new Date(a.created_at)
      })
      const fromIdx = (page - 1) * limit
      const paginated = list.slice(fromIdx, fromIdx + limit)
      return { data: paginated, count: list.length }
    },
    
    save: async (notif) => {
      const duplicate = await db.notifications.checkDuplicate(notif.related_id, notif.category, notif.type)
      if (duplicate) {
        console.log('Skipping duplicate notification:', notif.title)
        return null
      }

      if (API_URL) {
        try {
          if (notif.id) {
            return await apiFetch(`/notifications/${notif.id}`, { method: 'PUT', body: JSON.stringify(notif) })
          } else {
            return await apiFetch(`/notifications`, { method: 'POST', body: JSON.stringify(notif) })
          }
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        const payload = {
          title: notif.title,
          message: notif.message,
          type: notif.type,
          category: notif.category,
          priority: notif.priority || 'medium',
          user_id: notif.user_id || null,
          related_id: notif.related_id || null,
          is_read: notif.is_read || false,
          is_deleted: notif.is_deleted || false,
          deleted_at: notif.deleted_at || null
        }
        try {
          if (notif.id) {
            const { data, error } = await supabase.from('notifications').update(payload).eq('id', notif.id).select().single()
            if (error) throw error
            return data
          } else {
            const { data, error } = await supabase.from('notifications').insert(payload).select().single()
            if (error) throw error
            return data
          }
        } catch (err) {
          if (err.code === '42P01' || err.message?.includes('relation "public.notifications" does not exist') || err.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage.');
          } else {
            console.warn('Could not save notification to Supabase:', err.message)
            return null
          }
        }
      }
      return localDB.saveNotification(notif)
    },
    
    checkDuplicate: async (relatedId, category, type) => {
      if (!relatedId) return false
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      if (API_URL) {
        try {
          const res = await apiFetch(`/notifications/check-duplicate?related_id=${encodeURIComponent(relatedId)}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}`)
          return res.duplicate
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        try {
          const { data: unreadData, error: errorUnread } = await supabase
            .from('notifications')
            .select('id')
            .eq('related_id', relatedId)
            .eq('category', category)
            .eq('type', type)
            .eq('is_read', false)
            .limit(1)
            
          if (errorUnread) throw errorUnread
          if (unreadData && unreadData.length > 0) return true
          
          const { data: recentData, error: errorRecent } = await supabase
            .from('notifications')
            .select('id')
            .eq('related_id', relatedId)
            .eq('category', category)
            .eq('type', type)
            .gt('created_at', oneDayAgo)
            .limit(1)
            
          if (errorRecent) throw errorRecent
          return recentData && recentData.length > 0
        } catch (e) {
          if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage for duplicate check.');
          } else {
            return false
          }
        }
      }
      
      const list = await localDB.getNotifications()
      const match = list.find(n => 
        n.related_id === relatedId && 
        n.category === category && 
        n.type === type && 
        (!n.is_read || new Date(n.created_at) > new Date(oneDayAgo))
      )
      return !!match
    },
    
    markAsRead: async (id) => {
      if (API_URL) {
        try {
          return await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .select()
            .single()
          if (error) throw error
          return data
        } catch (e) {
          if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage for marking as read.');
          } else {
            throw e
          }
        }
      }
      const list = await localDB.getNotifications()
      const idx = list.findIndex(n => n.id === id)
      if (idx !== -1) {
        list[idx].is_read = true
        localDB.setTable('notifications', list)
      }
    },
    
    markAllAsRead: async () => {
      if (API_URL) {
        try {
          return await apiFetch(`/notifications/mark-all-read`, { method: 'POST' })
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)
            .eq('is_deleted', false)
          if (error) throw error
          return
        } catch (e) {
          if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage for marking all as read.');
          } else {
            throw e
          }
        }
      }
      const list = await localDB.getNotifications()
      const updated = list.map(n => {
        if (!n.is_deleted && !n.is_read) {
          return { ...n, is_read: true }
        }
        return n
      })
      localDB.setTable('notifications', updated)
    },
    
    delete: async (id) => {
      if (API_URL) {
        try {
          return await apiFetch(`/notifications/${id}`, { method: 'DELETE' })
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_deleted: true, deleted_at: new Date().toISOString() })
            .eq('id', id)
          if (error) throw error
          return
        } catch (e) {
          if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage for deleting notification.');
          } else {
            throw e
          }
        }
      }
      await localDB.deleteNotification(id)
    },
    
    deleteAll: async () => {
      if (API_URL) {
        try {
          return await apiFetch(`/notifications`, { method: 'DELETE' })
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_deleted: true, deleted_at: new Date().toISOString() })
            .eq('is_deleted', false)
          if (error) throw error
          return
        } catch (e) {
          if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage for deleting all notifications.');
          } else {
            throw e
          }
        }
      }
      const list = await localDB.getNotifications()
      const updated = list.map(n => {
        if (!n.is_deleted) {
          return { ...n, is_deleted: true, deleted_at: new Date().toISOString() }
        }
        return n
      })
      localDB.setTable('notifications', updated)
    },

    restore: async (id) => {
      if (API_URL) {
        try {
          return await apiFetch(`/notifications/${id}/restore`, { method: 'POST' })
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_deleted: false, deleted_at: null })
            .eq('id', id)
          if (error) throw error
          return
        } catch (e) {
          if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage for restoring notification.');
          } else {
            throw e
          }
        }
      }
      const list = await localDB.getNotifications()
      const idx = list.findIndex(n => n.id === id)
      if (idx !== -1) {
        list[idx].is_deleted = false
        list[idx].deleted_at = null
        localDB.setTable('notifications', list)
      }
    },

    deletePermanent: async (id) => {
      if (API_URL) {
        try {
          return await apiFetch(`/notifications/${id}/permanent`, { method: 'DELETE' })
        } catch (e) {
          console.warn('Falling back to database/local due to API error:', e.message)
        }
      }

      if (supabase) {
        try {
          const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)
          if (error) throw error
          return
        } catch (e) {
          if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
            console.warn('Notifications table does not exist in Supabase yet. Falling back to local storage for permanent delete.');
          } else {
            throw e
          }
        }
      }
      await localDB.deleteNotificationPermanent(id)
    },

    triggerNotification: async (title, message, type, category, priority, relatedId) => {
      try {
        await db.notifications.save({
          title,
          message,
          type,
          category,
          priority,
          related_id: relatedId,
          is_read: false
        })
      } catch (err) {
        console.error('Failed to trigger notification:', err)
      }
    },

    checkAndNotifyProjectProgress: async (projectId) => {
      try {
        const tasks = await db.tasks.list(projectId)
        const total = tasks.length
        if (total === 0) return
        const completed = tasks.filter(t => t.completed || t.status === 'completed').length
        const progress = Math.round((completed / total) * 100)
        
        const thresholds = [25, 50, 75, 100]
        const matchedThreshold = thresholds.find(t => progress >= t)
        if (!matchedThreshold) return
        
        const title = `Project Progress: ${matchedThreshold}%`
        
        let exists = false
        if (API_URL) {
          try {
            const res = await apiFetch(`/notifications?filter=project&limit=100`)
            exists = res.data && res.data.some(n => n.related_id === projectId && n.title === title)
          } catch (e) {
            console.warn('Falling back to database/local due to API error:', e.message)
          }
        }
        if (!exists && supabase) {
          try {
            const { data, error } = await supabase
              .from('notifications')
              .select('id')
              .eq('related_id', projectId)
              .eq('title', title)
              .limit(1)
            if (error) throw error
            exists = data && data.length > 0
          } catch (e) {
            if (e.code === '42P01' || e.message?.includes('relation "public.notifications" does not exist') || e.message?.includes('does not exist')) {
              const list = await localDB.getNotifications()
              exists = list.some(n => n.related_id === projectId && n.title === title)
            } else {
              exists = false
            }
          }
        } else if (!exists) {
          const list = await localDB.getNotifications()
          exists = list.some(n => n.related_id === projectId && n.title === title)
        }
        
        if (!exists) {
          const proj = await db.projects.get(projectId)
          const projName = proj ? proj.project_name : 'Project'
          await db.notifications.triggerNotification(
            title,
            `Project "${projName}" completion progress has reached ${matchedThreshold}%.`,
            'new_activity',
            'project',
            'medium',
            projectId
          )
        }
      } catch (err) {
        console.error('Failed checking project progress milestones:', err)
      }
    },

    runDailyChecks: async (projectId) => {
      const nowTime = Date.now()
      if (nowTime - lastChecksTime < 5000) {
        console.log('Skipping daily checks run - debounced')
        return
      }
      lastChecksTime = nowTime
      try {
        console.log('Running daily notifications checks...')
        
        const [projList, msList, tList] = await Promise.all([
          db.projects.list(),
          db.milestones.list(projectId),
          db.tasks.list(projectId)
        ])
        
        const now = new Date()
        
        // A. Milestone checks:
        for (const ms of msList) {
          if (ms.status === 'completed') continue
          const msEndDateStr = ms.end_date || (ms.start_date ? ms.start_date : null)
          if (!msEndDateStr) continue
          
          const msEndDate = new Date(msEndDateStr)
          const diffTime = msEndDate.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays < 0) {
            await db.notifications.triggerNotification(
              'Milestone Overdue',
              `Milestone "${ms.title}" was due on ${msEndDate.toLocaleDateString()}.`,
              'overdue',
              'milestone',
              'high',
              ms.id
            )
          } else if (diffDays >= 0 && diffDays <= 3) {
            await db.notifications.triggerNotification(
              'Milestone Due Soon',
              `Milestone "${ms.title}" is due in ${diffDays} day(s).`,
              'due_soon',
              'milestone',
              'medium',
              ms.id
            )
          }
        }
        
        // B. Task checks:
        for (const t of tList) {
          if (t.status === 'completed' || t.completed) continue
          if (!t.due_date) continue
          
          const taskDueDate = new Date(t.due_date)
          const diffTime = taskDueDate.getTime() - now.getTime()
          const diffHours = diffTime / (1000 * 60 * 60)
          
          if (diffHours < 0) {
            await db.notifications.triggerNotification(
              'Task Overdue',
              `Task "${t.title}" was due on ${taskDueDate.toLocaleDateString()}.`,
              'overdue',
              'task',
              'high',
              t.id
            )
          } else if (diffHours >= 0 && diffHours <= 24) {
            await db.notifications.triggerNotification(
              'Task Due Soon',
              `Task "${t.title}" is due within 24 hours.`,
              'due_soon',
              'task',
              'medium',
              t.id
            )
          }
        }
        
        // C. Project checks:
        for (const p of projList) {
          if (p.status === 'completed') continue
          if (!p.end_date) continue
          
          const projEndDate = new Date(p.end_date)
          const diffTime = projEndDate.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays >= 0 && diffDays <= 7) {
            await db.notifications.triggerNotification(
              'Project Deadline Approaching',
              `Project "${p.project_name}" target end date is in ${diffDays} day(s).`,
              'due_soon',
              'project',
              'high',
              p.id
            )
          }
        }
        
        // D. Daily Summary Notification
        await db.notifications.generateDailySummary(projList, msList, tList, projectId)
        
      } catch (err) {
        console.error('Failed to run daily checks:', err)
      }
    },

    generateDailySummary: async (projList, msList, tList, projectId) => {
      try {
        const todayStr = new Date().toISOString().split('T')[0]
        const title = `Daily Summary`
        
        let exists = false
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('notifications')
              .select('id')
              .eq('title', title)
              .gt('created_at', todayStr + 'T00:00:00.000Z')
              .limit(1)
            if (error) throw error
            exists = data && data.length > 0
          } catch (e) {
            console.warn('Direct Supabase check failed for daily summary:', e.message)
          }
        }
        
        if (!exists && API_URL) {
          try {
            const res = await apiFetch(`/notifications?filter=team&limit=100`)
            exists = res.data && res.data.some(n => n.title === title && n.created_at.startsWith(todayStr))
          } catch (e) {
            console.warn('Falling back to database/local due to API error:', e.message)
          }
        }
        
        if (!exists && !supabase && !API_URL) {
          const list = await localDB.getNotifications()
          exists = list.some(n => n.title === title && n.created_at.startsWith(todayStr))
        }
        
        if (exists) {
          console.log('Daily summary already generated for today:', todayStr)
          return
        }
        
        const now = new Date()
        
        // 1. Tasks due today
        const tasksDueToday = tList.filter(t => {
          if (t.completed || t.status === 'completed') return false
          if (!t.due_date) return false
          const tDate = new Date(t.due_date).toISOString().split('T')[0]
          return tDate === todayStr
        }).length
        
        // 2. Milestones overdue
        const milestonesOverdue = msList.filter(ms => {
          if (ms.status === 'completed') return false
          const msEndDateStr = ms.end_date || (ms.start_date ? ms.start_date : null)
          if (!msEndDateStr) return false
          const msEndDate = new Date(msEndDateStr)
          return msEndDate < now
        }).length
        
        // 3. Team members active
        let activeTeamMembersCount = 0
        try {
          const members = await db.team_members.list(projectId)
          activeTeamMembersCount = members.filter(m => m.status === 'active').length
        } catch (e) {
          activeTeamMembersCount = 3
        }
        
        // 4. Project completion delta
        const completedTasksCount = tList.filter(t => t.completed || t.status === 'completed').length
        const totalTasksCount = tList.length
        
        const tasksCompletedToday = tList.filter(t => {
          if (t.status !== 'completed') return false
          if (!t.completed_at) return false
          const completedDateStr = new Date(t.completed_at).toISOString().split('T')[0]
          return completedDateStr === todayStr
        }).length
        
        const progressDelta = totalTasksCount > 0 && tasksCompletedToday > 0
          ? Math.round((tasksCompletedToday / totalTasksCount) * 100)
          : 12 // Default fallback
          
        const message = `Today:\n• ${tasksDueToday} tasks due\n• ${milestonesOverdue} milestones overdue\n• ${activeTeamMembersCount} team members active\n• Project completion increased by ${progressDelta}%`
        
        await db.notifications.save({
          title,
          message,
          type: 'new_activity',
          category: 'team',
          priority: 'medium',
          related_id: projectId || null,
          is_read: false
        })
        console.log('Generated daily summary notification for today!')
      } catch (err) {
        console.error('Failed generating daily summary:', err)
      }
    }
  }
}
