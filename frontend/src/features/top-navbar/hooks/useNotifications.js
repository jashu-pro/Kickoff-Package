
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../../lib/db'
import { supabase } from '../../../lib/supabase'
import { useProject } from '../../../context/ProjectContext'
import { useToast } from '../../../components/Toast'

export const useNotifications = () => {
  const { project, setProjectId } = useProject()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [notificationsPage, setNotificationsPage] = useState(1)
  const [totalNotificationsCount, setTotalNotificationsCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(() => parseInt(localStorage.getItem('unread_notifications_count') || '0'))
  
  const [activeProjectStats, setActiveProjectStats] = useState({
    total: 0,
    completed: 0,
    progress: 0,
    remaining: 0
  })

  useEffect(() => {
    if (!project) return
    const fetchStats = async () => {
      try {
        const tasks = await db.tasks.list(project.id)
        const total = tasks.length
        const completed = tasks.filter(t => t.completed || t.status === 'completed').length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0
        const remaining = total - completed
        setActiveProjectStats({ total, completed, progress, remaining })
      } catch (err) {
        console.error('Failed to load project stats:', err)
      }
    }
    fetchStats()
  }, [project])

  const notificationsRef = useRef(null)

  const syncUnreadCount = async () => {
    let unreadTotal = 0
    if (db.isSupabase && supabase) {
      try {
        const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false).eq('is_deleted', false)
        if (error) throw error
        unreadTotal = count || 0
      } catch (err) {
        if (err.code === '42P01' || err.message?.includes('relation "public.notifications" does not exist') || err.message?.includes('does not exist')) {
          const list = await db.notifications.list('unread')
          unreadTotal = list ? list.count : 0
        } else {
          console.error('Failed to sync unread count:', err)
        }
      }
    } else {
      const list = await db.notifications.list('unread')
      unreadTotal = list ? list.count : 0
    }
    setUnreadCount(unreadTotal)
    localStorage.setItem('unread_notifications_count', String(unreadTotal))
  }

  const fetchNotificationsData = async (page = 1, append = false) => {
    try {
      setLoadingNotifications(true)
      const res = await db.notifications.list(activeFilter, page, 20)
      if (append) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const filteredNew = res.data.filter(n => !existingIds.has(n.id))
          return [...prev, ...filteredNew]
        })
      } else {
        setNotifications(res.data)
      }
      setTotalNotificationsCount(res.count)
      await syncUnreadCount()
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoadingNotifications(false)
    }
  }



  useEffect(() => {
    fetchNotificationsData(1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, activeFilter])

  useEffect(() => {
    if (!db.isSupabase || !supabase) return

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new
            if (newNotif.is_deleted) return
            
            setNotifications(prev => {
              if (activeFilter === 'unread' && newNotif.is_read) return prev
              if (activeFilter === 'high_priority' && newNotif.priority !== 'high') return prev
              if (['project', 'task', 'milestone', 'team'].includes(activeFilter) && newNotif.category !== activeFilter) return prev
              
              const exists = prev.some(n => n.id === newNotif.id)
              if (exists) return prev
              return [newNotif, ...prev]
            })
            
            if (!newNotif.is_read) {
              setUnreadCount(prev => {
                const next = prev + 1
                localStorage.setItem('unread_notifications_count', String(next))
                return next
              })
              showToast(`New Notification: ${newNotif.title}`, 'info')
            }
            setTotalNotificationsCount(prev => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new
            if (updatedNotif.is_deleted) {
              setNotifications(prev => prev.filter(n => n.id !== updatedNotif.id))
              setTotalNotificationsCount(prev => Math.max(0, prev - 1))
            } else {
              setNotifications(prev => {
                const exists = prev.some(n => n.id === updatedNotif.id)
                if (exists) {
                  return prev.map(n => n.id === updatedNotif.id ? { ...n, ...updatedNotif } : n)
                } else {
                  if (activeFilter === 'unread' && updatedNotif.is_read) return prev
                  if (activeFilter === 'high_priority' && updatedNotif.priority !== 'high') return prev
                  if (['project', 'task', 'milestone', 'team'].includes(activeFilter) && updatedNotif.category !== activeFilter) return prev
                  return [updatedNotif, ...prev]
                }
              })
            }
            syncUnreadCount()
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
            setTotalNotificationsCount(prev => Math.max(0, prev - 1))
            syncUnreadCount()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeFilter, showToast])

  const handleNotificationClick = async (notif) => {
    try {
      await db.notifications.markAsRead(notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }

    if (notif.category === 'project') {
      if (notif.related_id) setProjectId(notif.related_id)
      navigate('/dashboard')
    } else if (notif.category === 'task') {
      if (notif.related_id) {
        try {
          let projId = project?.id
          if (db.isSupabase) {
            const { data } = await supabase.from('tasks').select('project_id').eq('id', notif.related_id).single()
            if (data) projId = data.project_id
          } else {
            const list = await db.tasks.list()
            const t = list.find(task => task.id === notif.related_id)
            if (t) projId = t.project_id
          }
          if (projId) setProjectId(projId)
        } catch(e) {}
      }
      navigate('/milestones')
    } else if (notif.category === 'milestone') {
      if (notif.related_id) {
        try {
          let projId = project?.id
          if (db.isSupabase) {
            const { data } = await supabase.from('milestones').select('project_id').eq('id', notif.related_id).single()
            if (data) projId = data.project_id
          } else {
            const list = await db.milestones.list()
            const m = list.find(ms => ms.id === notif.related_id)
            if (m) projId = m.project_id
          }
          if (projId) setProjectId(projId)
        } catch(e) {}
      }
      navigate('/timeline')
    } else if (notif.category === 'team') {
      if (notif.related_id) {
        try {
          let projId = project?.id
          if (db.isSupabase) {
            const { data: p } = await supabase.from('projects').select('id').eq('id', notif.related_id).single()
            if (p) {
              projId = p.id
            } else {
              const { data: tm } = await supabase.from('team_members').select('project_id').eq('id', notif.related_id).single()
              if (tm) projId = tm.project_id
            }
          } else {
            const pList = await db.projects.list()
            const p = pList.find(proj => proj.id === notif.related_id)
            if (p) {
              projId = p.id
            } else {
              const mList = await db.team_members.list()
              const m = mList.find(mem => mem.id === notif.related_id)
              if (m) projId = m.project_id
            }
          }
          if (projId) setProjectId(projId)
        } catch(e) {}
      }
      navigate('/team')
    }
    setShowNotifications(false)
  }
  
  const handleMarkAllRead = async () => {
    try {
      await db.notifications.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      showToast('All notifications marked as read', 'success')
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteAllNotifications = async () => {
    try {
      await db.notifications.deleteAll()
      setNotifications([])
      setTotalNotificationsCount(0)
      setUnreadCount(0)
      showToast('All notifications deleted', 'success')
    } catch (e) {
      console.error(e)
    }
  }

  return {
    showNotifications, setShowNotifications,
    notifications, activeFilter, setActiveFilter,
    notificationsPage, setNotificationsPage,
    totalNotificationsCount, loadingNotifications,
    unreadCount, notificationsRef,
    fetchNotificationsData, handleNotificationClick,
    handleMarkAllRead, handleDeleteAllNotifications,
    activeProjectStats,
    setNotifications, setUnreadCount, setTotalNotificationsCount
  }
}
