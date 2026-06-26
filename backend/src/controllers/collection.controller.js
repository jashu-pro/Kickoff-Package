import { getScopedClient } from '../config/supabase.js'

export const getCollection = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { table } = req.params
    const searchParams = req.query
    
    if (table === 'notifications') {
      const filter = searchParams.filter || 'all'
      const page = Math.max(Number(searchParams.page || 1), 1)
      const limit = Math.max(Number(searchParams.limit || 20), 1)
      const query = (searchParams.q || '').trim().toLowerCase()
      
      let q = supabase.from('notifications').select('*', { count: 'exact' })
      
      if (filter === 'deleted') {
        q = q.eq('is_deleted', true)
      } else {
        q = q.eq('is_deleted', false)
        if (filter === 'unread') q = q.eq('is_read', false)
        if (filter === 'high_priority') q = q.eq('priority', 'high')
        if (['project', 'task', 'milestone', 'team'].includes(filter)) {
          q = q.eq('category', filter)
        }
      }
      
      if (query) {
        q = q.or(`title.ilike.%${query}%,message.ilike.%${query}%`)
      }
      
      const sortField = filter === 'deleted' ? 'deleted_at' : 'created_at'
      q = q.order(sortField, { ascending: false })
      
      const start = (page - 1) * limit
      q = q.range(start, start + limit - 1)
      
      const { data, count, error } = await q
      if (error) throw error
      return res.status(200).json({ data, count })
    }

    const projectId = searchParams.project_id
    let q = supabase.from(table).select(table === 'tasks' ? '*, team_members(name)' : '*')
    if (projectId) {
      q = q.eq('project_id', projectId)
    }
    
    const { data, error } = await q
    if (error) throw error
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

export const createRecord = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { table } = req.params
    const body = req.body
    
    if (table === 'tasks') {
      body.status = body.status || (body.completed ? 'completed' : 'pending')
      body.progress = body.progress ?? (body.status === 'completed' ? 100 : 0)
      delete body.completed
      delete body.owner_name
    }
    if (table === 'notifications') {
      body.priority = body.priority || 'medium'
      body.is_read = Boolean(body.is_read)
      body.is_deleted = Boolean(body.is_deleted)
    }

    const { data, error } = await supabase.from(table).insert(body).select(table === 'tasks' ? '*, team_members(name)' : '*').single()
    if (error) throw error
    return res.status(201).json(data)
  } catch (error) {
    next(error)
  }
}

export const deleteCollection = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { table } = req.params
    if (table === 'notifications') {
      const { error } = await supabase.from('notifications').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('is_deleted', false)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }
    return res.status(404).json({ error: 'Not found' })
  } catch (error) {
    next(error)
  }
}
