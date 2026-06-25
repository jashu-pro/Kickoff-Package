import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getTypeColor = (type) => {
  switch (type) {
    case 'overdue':
    case 'danger':
      return { border: 'border-l-status-error', badge: 'bg-status-error/10 text-status-error' }
    case 'due_soon':
    case 'warning':
      return { border: 'border-l-status-warning', badge: 'bg-status-warning/10 text-status-warning' }
    case 'completed':
    case 'success':
      return { border: 'border-l-status-success', badge: 'bg-status-success/10 text-status-success' }
    case 'new_activity':
    case 'info':
    default:
      return { border: 'border-l-primary', badge: 'bg-primary/10 text-primary' }
  }
}

export const TopNavbar = () => {
  const {
    project,
    projects,
    setProjectId,
    session,
    logout,
    userProfile,
    setUserProfile,
    settings,
    updateSettings
  } = useProject()

  const { showToast } = useToast()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState({ projects: [], tasks: [], members: [] })

  // Popover states
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Modals states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)

  // Edit Profile Fields
  const [tempFullName, setTempFullName] = useState(userProfile.fullName)
  const [tempEmailAddress, setTempEmailAddress] = useState(userProfile.emailAddress)
  const [tempPhoneNumber, setTempPhoneNumber] = useState(userProfile.phoneNumber)
  const [tempAvatarPreview, setTempAvatarPreview] = useState(userProfile.avatarUrl)

  // Sync temp profile state when modal opens
  useEffect(() => {
    if (isEditProfileOpen) {
      setTempFullName(userProfile.fullName)
      setTempEmailAddress(userProfile.emailAddress)
      setTempPhoneNumber(userProfile.phoneNumber)
      setTempAvatarPreview(userProfile.avatarUrl)
    }
  }, [isEditProfileOpen, userProfile])

  // Settings Fields
  const [activeSettingsTab, setActiveSettingsTab] = useState('notifications')
  const [tempTheme, setTempTheme] = useState(settings.theme)
  const [tempEmailNotifications, setTempEmailNotifications] = useState(settings.emailNotifications)
  const [tempRemindersFrequency, setTempRemindersFrequency] = useState(settings.remindersFrequency)
  const [tempTwoFactorAuth, setTempTwoFactorAuth] = useState(settings.twoFactorAuth)
  const [tempSessionTimeout, setTempSessionTimeout] = useState(settings.sessionTimeout)
  const [tempPublicProfile, setTempPublicProfile] = useState(settings.publicProfile)
  const [tempShareStats, setTempShareStats] = useState(settings.shareStats)

  // Sync temp settings state when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setTempTheme(settings.theme)
      setTempEmailNotifications(settings.emailNotifications)
      setTempRemindersFrequency(settings.remindersFrequency)
      setTempTwoFactorAuth(settings.twoFactorAuth)
      setTempSessionTimeout(settings.sessionTimeout)
      setTempPublicProfile(settings.publicProfile)
      setTempShareStats(settings.shareStats)
    }
  }, [isSettingsOpen, settings])

  // Password fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notifications State
  const [notifications, setNotifications] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [notificationsPage, setNotificationsPage] = useState(1)
  const [totalNotificationsCount, setTotalNotificationsCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(() => parseInt(localStorage.getItem('unread_notifications_count') || '0'))

  // Project Stats state
  const [activeProjectStats, setActiveProjectStats] = useState({
    total: 0,
    completed: 0,
    progress: 0,
    remaining: 0
  })

  // Refs for click outside
  const searchRef = useRef(null)
  const notificationsRef = useRef(null)
  const profileRef = useRef(null)

  // Fetch project stats when project changes
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

  // Sync unread count helper with table existence fallback
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

  // Fetch notifications list
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
      
      // Update unread count
      await syncUnreadCount()
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Run daily checks when active project changes
  useEffect(() => {
    const runChecks = async () => {
      try {
        await db.notifications.runDailyChecks(project?.id)
      } catch (err) {
        console.error('Daily notifications sync warning:', err)
      }
    }
    runChecks()
  }, [project?.id])

  // Fetch notifications list when project or activeFilter changes
  useEffect(() => {
    fetchNotificationsData(1, false)
  }, [project?.id, activeFilter])

  // Realtime subscription setup
  useEffect(() => {
    if (!db.isSupabase || !supabase) return

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Realtime notification payload:', payload)
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
  }, [activeFilter])

  // Notification navigation helper
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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search query effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ projects: [], tasks: [], members: [] })
      return
    }

    const performSearch = async () => {
      const q = searchQuery.toLowerCase()
      try {
        const filteredProjects = projects.filter(
          (p) =>
            p.project_name.toLowerCase().includes(q) ||
            p.client_name.toLowerCase().includes(q)
        )

        const allMembers = await db.team_members.list()
        const filteredMembers = allMembers.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            (m.department && m.department.toLowerCase().includes(q))
        )

        const allTasks = await db.tasks.list()
        const filteredTasks = allTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.owner_name && t.owner_name.toLowerCase().includes(q))
        )

        setSearchResults({
          projects: filteredProjects.slice(0, 3),
          members: filteredMembers.slice(0, 3),
          tasks: filteredTasks.slice(0, 3),
        })
      } catch (err) {
        console.error('Search error:', err)
      }
    }

    const timer = setTimeout(performSearch, 150)
    return () => clearTimeout(timer)
  }, [searchQuery, projects])

  // Image Upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save profile edits
  const handleSaveProfile = () => {
    if (!tempFullName.trim()) {
      showToast('Full name is required', 'error')
      return
    }
    setUserProfile({
      fullName: tempFullName,
      emailAddress: tempEmailAddress,
      phoneNumber: tempPhoneNumber,
      avatarUrl: tempAvatarPreview || userProfile.avatarUrl
    })
    showToast('Profile updated successfully!', 'success')
    setIsEditProfileOpen(false)
  }

  // Save Settings
  const handleSaveSettings = () => {
    updateSettings({
      theme: tempTheme,
      language: 'English',
      emailNotifications: tempEmailNotifications,
      remindersFrequency: tempRemindersFrequency,
      twoFactorAuth: tempTwoFactorAuth,
      sessionTimeout: tempSessionTimeout,
      publicProfile: tempPublicProfile,
      shareStats: tempShareStats
    })
    showToast('Settings saved successfully!', 'success')
    setIsSettingsOpen(false)
  }

  // Password update simulation
  const handleUpdatePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required', 'warning')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    showToast('Password updated successfully!', 'success')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <header className="h-16 bg-surface border-b border-border-subtle shadow-sm flex justify-between items-center px-container-padding-desktop sticky top-0 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-headline-sm font-headline-sm font-bold text-primary hover:opacity-90 transition-opacity">
          KickoffGen
        </Link>
      </div>

      {/* Centered Search Bar */}
      <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <Icon name="search" size={20} />
            </span>
            <input
              type="text"
              placeholder="Search projects, tasks, team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-slate-100 dark:bg-slate-850 text-on-surface placeholder:text-outline/70 pl-10 pr-9 py-2 rounded-full border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-body-md text-body-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              {!searchQuery ? (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-2">Recent Projects</div>
                  {projects.length > 0 ? (
                    <div className="space-y-1">
                      {projects.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setProjectId(p.id)
                            showToast(`Switched to project: ${p.project_name}`, 'success')
                            setIsSearchFocused(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                        >
                          <Icon name="folder" size={18} className="text-primary" />
                          <div className="truncate">
                            <div className="text-body-md font-medium text-on-surface truncate">{p.project_name}</div>
                            <div className="text-[11px] text-outline truncate">{p.client_name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-body-md text-outline px-3 py-1">No projects found.</div>
                  )}
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {searchResults.projects.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Projects</div>
                      <div className="space-y-0.5">
                        {searchResults.projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setProjectId(p.id)
                              showToast(`Switched to project: ${p.project_name}`, 'success')
                              setIsSearchFocused(false)
                              setSearchQuery('')
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                          >
                            <Icon name="folder" size={18} className="text-primary" />
                            <div className="truncate">
                              <div className="text-body-md font-medium text-on-surface truncate">{p.project_name}</div>
                              <div className="text-[11px] text-outline truncate">{p.client_name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Tasks</div>
                      <div className="space-y-0.5">
                        {searchResults.tasks.map((t) => {
                          const p = projects.find((proj) => proj.id === t.project_id)
                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                if (t.project_id) setProjectId(t.project_id)
                                navigate('/milestones')
                                setIsSearchFocused(false)
                                setSearchQuery('')
                                showToast(`Navigated to task: ${t.title}`, 'success')
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                            >
                              <Icon name="check_circle" size={18} className={t.completed ? "text-status-success" : "text-outline"} />
                              <div className="truncate">
                                <div className="text-body-md font-medium text-on-surface truncate">{t.title}</div>
                                <div className="text-[11px] text-outline truncate">{p ? p.project_name : 'General'}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {searchResults.members.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Team Members</div>
                      <div className="space-y-0.5">
                        {searchResults.members.map((m) => {
                          const p = projects.find((proj) => proj.id === m.project_id)
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                if (m.project_id) setProjectId(m.project_id)
                                navigate('/team')
                                setIsSearchFocused(false)
                                setSearchQuery('')
                                showToast(`Navigated to member: ${m.name}`, 'success')
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                            >
                              <Icon name="person" size={18} className="text-accent-vivid" />
                              <div className="truncate">
                                <div className="text-body-md font-medium text-on-surface truncate">{m.name}</div>
                                <div className="text-[11px] text-outline truncate">{m.role} {p ? `• ${p.project_name}` : ''}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {searchResults.projects.length === 0 &&
                    searchResults.tasks.length === 0 &&
                    searchResults.members.length === 0 && (
                      <div className="p-4 text-center text-outline text-body-md">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Far Right Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Active Project stats display replacing the clock */}
        {project ? (
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-slate-550/20 dark:bg-slate-800/30 rounded-xl border border-border-subtle dark:border-slate-800 mr-2 shrink-0">
            <div className="flex flex-col min-w-0 max-w-[180px]">
              <span className="text-xs font-bold text-on-surface truncate">
                {project.project_name}
              </span>
              <span className="text-[10px] text-outline truncate">
                Client: {project.client_name}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 select-none">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-outline font-medium">
                  {activeProjectStats.remaining} task{activeProjectStats.remaining !== 1 ? 's' : ''} left
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  {activeProjectStats.progress}%
                </span>
              </div>
              <div className="w-24 bg-slate-200 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${activeProjectStats.progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-border-subtle dark:border-slate-800 mr-2 shrink-0 text-[11px] text-outline font-medium">
            <Icon name="folder_open" size={14} />
            No active project selected
          </div>
        )}

        {/* Smart Notifications Bell */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
            className="relative p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full"
          >
            <Icon name="notifications" size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-error text-[9px] font-bold text-white border border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[340px] bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border-subtle dark:border-slate-800 flex justify-between items-center bg-slate-550 dark:bg-slate-800/50">
                <span className="font-semibold text-body-md text-on-surface">Smart Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        try {
                          await db.notifications.markAllAsRead()
                          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                          setUnreadCount(0)
                          localStorage.setItem('unread_notifications_count', '0')
                        } catch (err) {
                          showToast('Failed to mark all as read', 'error')
                        }
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Mark all
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotifications(false)
                      navigate('/delete-history')
                    }}
                    className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <Icon name="history" size={13} />
                    Delete History
                  </button>
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteAllConfirm(true)
                      }}
                      className="text-[11px] text-status-error hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Icon name="delete" size={14} />
                      Delete all
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Horizontal Bar */}
              <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scroll-hide border-b border-border-subtle dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'high_priority', label: 'Priority' },
                  { value: 'project', label: 'Projects' },
                  { value: 'task', label: 'Tasks' },
                  { value: 'milestone', label: 'Milestones' }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveFilter(f.value)
                      setNotificationsPage(1)
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                      activeFilter === f.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-700 border border-border-subtle dark:border-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-border-subtle dark:divide-slate-800 max-h-80 overflow-y-auto custom-scrollbar">
                {loadingNotifications && notifications.length === 0 ? (
                  <div className="p-8 text-center flex justify-center items-center">
                    <Icon name="sync" size={24} className="animate-spin text-primary" />
                  </div>
                ) : notifications.length > 0 ? (
                  <>
                    {notifications.map((n) => {
                      const colors = getTypeColor(n.type)
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 border-l-4 ${colors.border} ${
                            !n.is_read ? 'bg-primary/5 dark:bg-primary/5' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            <span className={`w-2 h-2 rounded-full inline-block ${!n.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-body-md font-semibold text-on-surface flex items-center justify-between gap-2">
                              <span className="truncate">{n.title}</span>
                              <span className="text-[10px] text-outline font-normal shrink-0">{formatRelativeTime(n.created_at)}</span>
                            </div>
                            <div className="text-label-md text-outline mt-1 whitespace-pre-wrap leading-relaxed">{n.message}</div>
                          </div>
                          
                          <div className="self-center shrink-0">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                  await db.notifications.delete(n.id)
                                  setNotifications(prev => prev.filter(item => item.id !== n.id))
                                  setTotalNotificationsCount(prev => Math.max(0, prev - 1))
                                  if (!n.is_read) {
                                    setUnreadCount(prev => {
                                      const next = Math.max(0, prev - 1)
                                      localStorage.setItem('unread_notifications_count', String(next))
                                      return next
                                    })
                                  }
                                } catch (err) {
                                  showToast('Failed to delete notification', 'error')
                                }
                              }}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-outline hover:text-status-error transition-colors"
                              title="Delete notification"
                            >
                              <Icon name="delete" size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    
                    {notifications.length < totalNotificationsCount && (
                      <div className="p-2.5 text-center bg-slate-50/50 dark:bg-slate-800/10 border-t border-border-subtle dark:border-slate-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const nextPage = notificationsPage + 1
                            setNotificationsPage(nextPage)
                            fetchNotificationsData(nextPage, true)
                          }}
                          className="text-xs text-primary hover:underline font-bold"
                        >
                          Load older notifications
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-outline text-body-md flex flex-col items-center justify-center gap-2">
                    <Icon name="notifications_off" size={32} className="opacity-40" />
                    <span>No new notifications</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Cog (triggers settings modal) */}
        <div>
          <button
            onClick={() => {
              setIsSettingsOpen(true)
              setShowNotifications(false)
              setShowProfile(false)
            }}
            className="p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full"
          >
            <Icon name="settings" size={22} />
          </button>
        </div>

        {/* User Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
            className="flex items-center focus:outline-none ml-2"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle hover:border-primary transition-all">
              <img
                alt="User profile"
                className="w-full h-full object-cover"
                src={userProfile.avatarUrl}
              />
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border-subtle shrink-0">
                  <img
                    alt="User profile"
                    className="w-full h-full object-cover"
                    src={userProfile.avatarUrl}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-body-md font-bold text-on-surface truncate">
                    {userProfile.fullName}
                  </div>
                  <div className="text-label-md text-outline truncate">
                    {userProfile.emailAddress}
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle dark:border-slate-800 pt-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfile(false)
                    navigate('/dashboard')
                    showToast('Navigated to profile dashboard', 'success')
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-body-md text-on-surface font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="dashboard" size={18} className="text-outline" />
                  My Dashboard
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false)
                    setIsEditProfileOpen(true)
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-body-md text-on-surface font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="person" size={18} className="text-outline" />
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false)
                    setIsSettingsOpen(true)
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-body-md text-on-surface font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="settings" size={18} className="text-outline" />
                  Settings
                </button>

                <button
                  onClick={async () => {
                    setShowProfile(false)
                    await logout()
                    showToast('Successfully signed out', 'success')
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-body-md text-status-error font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="logout" size={18} className="text-status-error" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border-subtle dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="font-semibold text-headline-sm text-on-surface">Edit Profile</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                  <img
                    alt="User avatar preview"
                    className="w-full h-full object-cover"
                    src={tempAvatarPreview}
                  />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
                    <Icon name="photo_camera" size={20} className="mb-0.5" />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]')
                    if (fileInput) fileInput.click()
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Upload Image
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={tempFullName}
                    onChange={(e) => setTempFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={tempEmailAddress}
                    onChange={(e) => setTempEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={tempPhoneNumber}
                    onChange={(e) => setTempPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-subtle dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-2.5">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface font-semibold text-body-md rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-body-md rounded-xl shadow-md shadow-primary/10 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] min-h-[500px]">
            {/* Sidebar navigation */}
            <div className="w-full md:w-60 bg-slate-50 dark:bg-slate-955 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-headline-sm text-on-surface">Settings</h3>
                  <p className="text-[11px] text-outline mt-0.5">Manage preferences</p>
                </div>
                <nav className="space-y-1">
                  {[
                    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
                    { id: 'security', label: 'Security', icon: 'lock' },
                    { id: 'privacy', label: 'Privacy', icon: 'shield' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-body-md font-medium transition-all ${
                        activeSettingsTab === tab.id
                          ? 'bg-primary text-white shadow-md shadow-primary/10'
                          : 'text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-on-surface'
                      }`}
                    >
                      <Icon name={tab.icon} size={18} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="hidden md:block text-[10px] text-outline font-medium border-t border-border-subtle dark:border-slate-800 pt-4">
                Version 1.0.0 • KickoffGen
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
              <div className="px-6 py-4 border-b border-border-subtle dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50 shrink-0">
                <span className="font-bold text-body-lg text-on-surface capitalize">
                  {activeSettingsTab} Preferences
                </span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">

                {activeSettingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Email Notifications</h4>
                        <p className="text-label-md text-outline mt-1">
                          Receive email updates about active project progress, deadlines, and milestones.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempEmailNotifications(!tempEmailNotifications)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempEmailNotifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempEmailNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Reminders Frequency</label>
                      <select
                        value={tempRemindersFrequency}
                        onChange={(e) => setTempRemindersFrequency(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md"
                      >
                        <option value="Real-time">Real-time alerts</option>
                        <option value="Daily Digest">Daily Digest</option>
                        <option value="Weekly Summary">Weekly Summary</option>
                        <option value="Never">Never</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-4">
                      <h4 className="text-body-md font-bold text-on-surface">Change Password</h4>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current Password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2 text-body-md"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2 text-body-md"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2 text-body-md"
                        />
                        <button
                          onClick={handleUpdatePassword}
                          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs rounded-lg transition-all"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Two-Factor Authentication (2FA)</h4>
                        <p className="text-label-md text-outline mt-1">
                          Protect your account by requiring an extra code from your authenticator app during login.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempTwoFactorAuth(!tempTwoFactorAuth)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempTwoFactorAuth ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempTwoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Session Timeout</label>
                      <select
                        value={tempSessionTimeout}
                        onChange={(e) => setTempSessionTimeout(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md"
                      >
                        <option value="15 min">15 minutes of inactivity</option>
                        <option value="30 min">30 minutes of inactivity</option>
                        <option value="1 hour">1 hour of inactivity</option>
                        <option value="4 hours">4 hours of inactivity</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Public Profile</h4>
                        <p className="text-label-md text-outline mt-1">
                          Allow other consultants to view your email and phone number inside project worksheets.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempPublicProfile(!tempPublicProfile)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempPublicProfile ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempPublicProfile ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Share Project Statistics</h4>
                        <p className="text-label-md text-outline mt-1">
                          Share your task completion stats and metrics automatically with project delivery leads.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempShareStats(!tempShareStats)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempShareStats ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempShareStats ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border-subtle dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-2.5 shrink-0">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface font-semibold text-body-md rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-body-md rounded-xl shadow-md shadow-primary/10 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-headline-sm text-on-surface">Confirm Delete All</h3>
            <p className="text-body-md text-outline">Are you sure you want to delete all notifications?</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface font-semibold text-body-md rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowDeleteAllConfirm(false)
                  try {
                    await db.notifications.deleteAll()
                    setNotifications([])
                    setTotalNotificationsCount(0)
                    setUnreadCount(0)
                    localStorage.setItem('unread_notifications_count', '0')
                  } catch (err) {
                    showToast('Failed to delete all notifications', 'error')
                  }
                }}
                className="px-4 py-2 bg-status-error hover:bg-status-error/95 text-white font-semibold text-body-md rounded-xl shadow-md transition-all"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
