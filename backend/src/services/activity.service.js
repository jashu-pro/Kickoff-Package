import { getScopedClient } from '../config/supabase.js'

export const logActivity = async (token, projectId, action, description, createdBy = 'System') => {
  try {
    const supabase = getScopedClient(token)
    const payload = {
      project_id: projectId,
      action,
      description,
      created_by: createdBy
    }
    const { error } = await supabase.from('activities').insert(payload)
    if (error) {
      console.error('Failed to log activity:', error)
    }
  } catch (error) {
    console.error('Activity Logging Error:', error)
  }
}
