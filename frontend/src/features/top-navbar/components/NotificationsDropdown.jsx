import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/Icon';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';


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
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/Toast';
import { db } from '../../../lib/db';

export const NotificationsDropdown = ({ notificationState, profileState }) => {
  const { showNotifications, setShowNotifications, notifications, activeFilter, setActiveFilter, notificationsPage, setNotificationsPage, totalNotificationsCount, loadingNotifications, unreadCount, notificationsRef, fetchNotificationsData, handleNotificationClick, handleMarkAllRead, handleDeleteAllNotifications, setNotifications, setUnreadCount, setTotalNotificationsCount } = notificationState;
  const { setShowProfile, setShowDeleteAllConfirm } = profileState || {};
  const { setProjectId } = useProject();
  const navigate = useNavigate();
  const { showToast } = useToast();


  return (
    <>
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

      {profileState?.showDeleteAllConfirm && (
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
                  await handleDeleteAllNotifications()
                }}
                className="px-4 py-2 bg-status-error hover:bg-status-error/95 text-white font-semibold text-body-md rounded-xl shadow-md transition-all"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
