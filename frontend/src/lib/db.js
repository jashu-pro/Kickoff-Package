import { supabase } from './supabase'

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}


const API_URL = import.meta.env.VITE_API_URL

const apiFetch = async (path, options = {}) => {
  if (!API_URL) throw new Error("VITE_API_URL is missing")
  try {
    const url = `${API_URL}${path}`
    
    let token = null
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      token = session?.access_token
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
    console.error(`API connection failed for ${path}:`, err.message)
    throw err
  }
}

export const db = {
  isSupabase: !!supabase,

  projects: {
    list: async () => apiFetch('/projects'),
    get: async (id) => apiFetch(`/projects/${id}`),
    save: async (proj, isNewOverride) => {
      const isNew = isNewOverride !== undefined ? isNewOverride : !proj.id
      let result
      if (isNew) {
        result = await apiFetch(`/projects`, { method: 'POST', body: JSON.stringify(proj) })
        await db.notifications.triggerNotification('Project Created', `Project "${result.project_name}" has been created.`, 'new_activity', 'project', 'medium', result.id)
      } else {
        result = await apiFetch(`/projects/${proj.id}`, { method: 'PUT', body: JSON.stringify(proj) })
      }
      return result
    },
    delete: async (id) => apiFetch(`/projects/${id}`, { method: 'DELETE' })
  },

  team_members: {
    list: async (projectId) => apiFetch(projectId ? `/team_members?project_id=${projectId}` : '/team_members'),
    save: async (member) => {
      const isNew = !member.id
      let result
      if (isNew) {
        result = await apiFetch(`/team_members`, { method: 'POST', body: JSON.stringify(member) })
        await db.notifications.triggerNotification('New Team Member', `${result.name} joined.`, 'new_activity', 'team', 'medium', result.project_id || result.id)
      } else {
        result = await apiFetch(`/team_members/${member.id}`, { method: 'PUT', body: JSON.stringify(member) })
      }
      return result
    },
    delete: async (id) => apiFetch(`/team_members/${id}`, { method: 'DELETE' })
  },

  tasks: {
    list: async (projectId) => {
      const res = await apiFetch(projectId ? `/tasks?project_id=${projectId}` : '/tasks')
      return (res || []).map(t => ({ ...t, completed: t.status === 'completed', owner_name: t.team_members ? t.team_members.name : 'Team Member' }))
    },
    save: async (task) => {
      const isNew = !task.id
      let result
      if (isNew) {
        const res = await apiFetch(`/tasks`, { method: 'POST', body: JSON.stringify(task) })
        result = { ...res, completed: res.status === 'completed', owner_name: res.team_members ? res.team_members.name : 'Team Member' }
        await db.notifications.triggerNotification('Task Created', `Task "${result.title}" created.`, 'new_activity', 'task', task.priority === 'high' ? 'high' : 'info', result.id)
      } else {
        const res = await apiFetch(`/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify(task) })
        result = { ...res, completed: res.status === 'completed', owner_name: res.team_members ? res.team_members.name : 'Team Member' }
        if (result.status === 'completed') {
           await db.notifications.triggerNotification('Task Completed', `Task "${result.title}" completed.`, 'completed', 'task', 'medium', result.id)
        }
      }
      return result
    },
    delete: async (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' })
  },

  milestones: {
    list: async (projectId) => apiFetch(projectId ? `/milestones?project_id=${projectId}` : '/milestones'),
    save: async (milestone) => {
      const isNew = !milestone.id
      if (isNew) {
        return apiFetch(`/milestones`, { method: 'POST', body: JSON.stringify(milestone) })
      }
      return apiFetch(`/milestones/${milestone.id}`, { method: 'PUT', body: JSON.stringify(milestone) })
    },
    delete: async (id) => apiFetch(`/milestones/${id}`, { method: 'DELETE' })
  },

  channels: {
    list: async (projectId) => apiFetch(projectId ? `/communication_channels?project_id=${projectId}` : '/communication_channels'),
    save: async (channel) => {
      if (!channel.id) return apiFetch(`/communication_channels`, { method: 'POST', body: JSON.stringify(channel) })
      return apiFetch(`/communication_channels/${channel.id}`, { method: 'PUT', body: JSON.stringify(channel) })
    },
    delete: async (id) => apiFetch(`/communication_channels/${id}`, { method: 'DELETE' })
  },

  stakeholders: {
    list: async (projectId) => apiFetch(projectId ? `/stakeholders?project_id=${projectId}` : '/stakeholders'),
    save: async (stakeholder) => {
      if (!stakeholder.id) return apiFetch(`/stakeholders`, { method: 'POST', body: JSON.stringify(stakeholder) })
      return apiFetch(`/stakeholders/${stakeholder.id}`, { method: 'PUT', body: JSON.stringify(stakeholder) })
    },
    delete: async (id) => apiFetch(`/stakeholders/${id}`, { method: 'DELETE' })
  },

  escalations: {
    list: async (projectId) => apiFetch(projectId ? `/escalation_levels?project_id=${projectId}` : '/escalation_levels'),
    save: async (escalation) => {
      if (!escalation.id) return apiFetch(`/escalation_levels`, { method: 'POST', body: JSON.stringify(escalation) })
      return apiFetch(`/escalation_levels/${escalation.id}`, { method: 'PUT', body: JSON.stringify(escalation) })
    },
    delete: async (id) => apiFetch(`/escalation_levels/${id}`, { method: 'DELETE' })
  },

  meetings: {
    list: async (projectId) => apiFetch(projectId ? `/meeting_frequencies?project_id=${projectId}` : '/meeting_frequencies'),
    save: async (meeting) => {
      if (!meeting.id) return apiFetch(`/meeting_frequencies`, { method: 'POST', body: JSON.stringify(meeting) })
      return apiFetch(`/meeting_frequencies/${meeting.id}`, { method: 'PUT', body: JSON.stringify(meeting) })
    },
    delete: async (id) => apiFetch(`/meeting_frequencies/${id}`, { method: 'DELETE' })
  },

  integrations: {
    list: async (projectId) => apiFetch(projectId ? `/integrations?project_id=${projectId}` : '/integrations'),
    save: async (integration) => {
      if (!integration.id) return apiFetch(`/integrations`, { method: 'POST', body: JSON.stringify(integration) })
      return apiFetch(`/integrations/${integration.id}`, { method: 'PUT', body: JSON.stringify(integration) })
    },
    delete: async (id) => apiFetch(`/integrations/${id}`, { method: 'DELETE' })
  },

  notifications: {
    list: async ({ filter = 'all', page = 1, limit = 20, query = '' } = {}) => {
      const q = new URLSearchParams({ filter, page, limit, q: query }).toString()
      return apiFetch(`/notifications?${q}`)
    },
    triggerNotification: async (title, message, type = 'info', category = 'system', priority = 'medium', related_id = null) => {
      // Deduplication check
      const checkParams = new URLSearchParams()
      if (related_id) checkParams.append('related_id', related_id)
      checkParams.append('category', category)
      checkParams.append('type', type)
      
      const res = await apiFetch(`/notifications/check-duplicate?${checkParams.toString()}`)
      if (res && res.duplicate) return null
      
      return apiFetch(`/notifications`, {
        method: 'POST',
        body: JSON.stringify({ title, message, type, category, priority, related_id, is_read: false, is_deleted: false })
      })
    },
    markAsRead: async (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: async () => apiFetch(`/notifications/mark-all-read`, { method: 'POST' }),
    delete: async (id) => apiFetch(`/notifications/${id}`, { method: 'DELETE' }),
    restore: async (id) => apiFetch(`/notifications/${id}/restore`, { method: 'POST' }),
    deletePermanent: async (id) => apiFetch(`/notifications/${id}/permanent`, { method: 'DELETE' })
  }
}
