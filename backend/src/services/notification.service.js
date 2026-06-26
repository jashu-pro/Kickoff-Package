import { getScopedClient } from '../config/supabase.js'

export const checkDuplicate = async (authHeader, related_id, category, type) => {
  const supabase = getScopedClient(authHeader)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data, error } = await supabase.from('notifications')
    .select('id')
    .eq('related_id', related_id)
    .eq('category', category)
    .eq('type', type)
    .or(`is_read.eq.false,created_at.gt.${oneDayAgo}`)
    .limit(1)
    
  if (error) throw error
  return data.length > 0
}

export const markAllRead = async () => {
  const { error } = await supabase.from('notifications')
    .update({ is_read: true })
    .eq('is_deleted', false)
    .eq('is_read', false)
  if (error) throw error
}
