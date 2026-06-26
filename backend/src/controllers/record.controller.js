import { getScopedClient } from '../config/supabase.js'

export const getRecord = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { table, id } = req.params
    const { data, error } = await supabase.from(table).select(table === 'tasks' ? '*, team_members(name)' : '*').eq('id', id).single()
    if (error) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

export const updateRecord = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { table, id } = req.params
    const body = req.body
    if (table === 'tasks') {
      body.status = body.status || (body.completed ? 'completed' : 'pending')
      body.progress = body.progress ?? (body.status === 'completed' ? 100 : 0)
      delete body.completed
      delete body.owner_name
    }
    const { data, error } = await supabase.from(table).update(body).eq('id', id).select(table === 'tasks' ? '*, team_members(name)' : '*').single()
    if (error) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

export const deleteRecord = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { table, id } = req.params
    if (table === 'notifications') {
      const { error } = await supabase.from('notifications').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', id)
      if (error) return res.status(404).json({ error: 'Not found' })
    } else {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) return res.status(404).json({ error: 'Not found' })
    }
    return res.status(200).json({ ok: true })
  } catch (error) {
    next(error)
  }
}

export const handleNotificationAction = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { id, action } = req.params
    if (req.method === 'PATCH' && action === 'read') {
      const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select().single()
      if (error) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(data)
    } else if (req.method === 'POST' && action === 'restore') {
      const { data, error } = await supabase.from('notifications').update({ is_deleted: false, deleted_at: null }).eq('id', id).select().single()
      if (error) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(data)
    } else if (req.method === 'DELETE' && action === 'permanent') {
      const { error } = await supabase.from('notifications').delete().eq('id', id)
      if (error) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json({ ok: true })
    }
    return res.status(404).json({ error: 'Not found' })
  } catch (error) {
    next(error)
  }
}
