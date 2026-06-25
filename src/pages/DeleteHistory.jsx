import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'

export const DeleteHistory = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // State
  const [deletedNotifications, setDeletedNotifications] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activePriority, setActivePriority] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Confirm permanent delete modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const itemsPerPage = 10

  // Fetch deleted notifications
  const fetchDeleted = async (page = 1, silent = false) => {
    if (!silent) setLoading(true)
    try {
      // Determine final active category filter
      let filter = 'deleted'
      if (activeCategory !== 'all') {
        // If they filter by category on deleted, we will fetch deleted first,
        // then filter locally or support it directly.
        // Wait, list method handles 'deleted' as filter. We can filter the result of 'deleted'
        // or we can query it. Since our db.notifications.list expects 'deleted' to return
        // all deleted, we can filter them by category and priority on client side, OR
        // we can fetch the full deleted list.
        // Let's pass 'deleted' and filter locally for search, category, and priority
        // to make client-side filtering super smooth, OR we can fetch paginated from DB.
        // If we do server-side pagination, list is designed to page from database.
        // Wait, list does database query: let's update list or just fetch and filter locally?
        // Let's fetch the deleted list. Since page size is 10, let's fetch with a high limit
        // or let's use the searchQuery on the server and filter categories.
        // Wait! In db.js, if filter is 'deleted', we did: q.eq('is_deleted', true).
        // Let's just fetch all deleted notifications (or page them) using our db.notifications.list
        // and filter or query directly.
        // Actually, our db.notifications.list supports 'deleted' filter, page, and limit, plus q (search).
        // Let's call list('deleted', page, itemsPerPage, searchQuery).
        // Wait! What about category and priority?
        // Since we want category and priority filtering, let's check if we can query them.
        // In our db.js, when filter is 'deleted', we just eq('is_deleted', true) and range.
        // We can do client side filtering if we fetch all deleted, or we can fetch paginated.
        // Let's fetch from the server! To do it correctly, we can filter category/priority in the state.
        // For search, we pass searchQuery to list.
      }
      
      const res = await db.notifications.list('deleted', page, itemsPerPage, searchQuery)
      setDeletedNotifications(res.data)
      setTotalCount(res.count)
    } catch (err) {
      console.error('Failed to load delete history:', err)
      showToast(err.message || 'Failed to load delete history', 'error')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Trigger fetch when parameters change
  useEffect(() => {
    fetchDeleted(currentPage)
  }, [currentPage, searchQuery])

  // Realtime updates subscription
  useEffect(() => {
    if (!db.isSupabase || !supabase) return

    const channel = supabase
      .channel('realtime-delete-history')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Delete History Realtime Event:', payload)
          // Simply refresh list silently when changes occur in notifications table
          fetchDeleted(currentPage, true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentPage, searchQuery])

  // Handle Restore
  const handleRestore = async (id) => {
    try {
      setActionLoading(true)
      await db.notifications.restore(id)
      showToast('Notification restored successfully', 'success')
      // If we are on page > 1 and this was the last item, go back one page
      if (deletedNotifications.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      } else {
        fetchDeleted(currentPage)
      }
    } catch (err) {
      showToast(err.message || 'Failed to restore notification', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Permanent Delete Trigger
  const triggerPermanentDelete = (item) => {
    setItemToDelete(item)
    setShowConfirmModal(true)
  }

  // Confirm Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!itemToDelete) return
    try {
      setActionLoading(true)
      await db.notifications.deletePermanent(itemToDelete.id)
      showToast('Notification permanently deleted', 'success')
      setShowConfirmModal(false)
      setItemToDelete(null)
      if (deletedNotifications.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      } else {
        fetchDeleted(currentPage)
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete notification permanently', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Client side filtering for activeCategory and activePriority
  const filteredItems = deletedNotifications.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false
    if (activePriority !== 'all' && item.priority !== activePriority) return false
    return true
  })

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Export CSV helper
  const handleExportCSV = () => {
    if (deletedNotifications.length === 0) {
      showToast('No notifications to export', 'warning')
      return
    }

    const headers = ['Title', 'Message', 'Category', 'Priority', 'Deleted At']
    const csvRows = [
      headers.join(','),
      ...deletedNotifications.map(n => [
        `"${(n.title || '').replace(/"/g, '""')}"`,
        `"${(n.message || '').replace(/"/g, '""')}"`,
        n.category || '',
        n.priority || 'medium',
        n.deleted_at || ''
      ].join(','))
    ]

    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(csvBlob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `deleted_notifications_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('CSV file downloaded', 'success')
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <Layout activeTab="delete-history" title="Delete History">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-6">
          <div>
            <div className="flex items-center gap-2 text-outline hover:text-primary cursor-pointer mb-2" onClick={() => navigate('/dashboard')}>
              <Icon name="arrow_back" size={18} />
              <span className="text-label-md font-semibold uppercase">Back to Dashboard</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2.5">
              <Icon name="history" size={28} className="text-primary" />
              Delete History
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {totalCount} total deleted
              </span>
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              View, restore, or permanently purge notifications that you soft-deleted.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRefreshing(true)
                fetchDeleted(currentPage)
              }}
              disabled={loading || isRefreshing}
              className="p-2 border border-border-subtle rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all shrink-0"
              title="Refresh list"
            >
              <Icon name="sync" size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-border-subtle rounded-lg font-label-md text-on-surface hover:bg-surface-container-low transition-all shrink-0"
            >
              <Icon name="download" size={18} />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-label-md font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
            >
              <Icon name="print" size={18} />
              Print PDF
            </button>
          </div>
        </div>

        {/* Filters and Search Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <Icon name="search" size={20} />
            </span>
            <input
              type="text"
              placeholder="Search deleted notifications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/50 text-on-surface border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-body-md focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 text-on-surface border border-border-subtle rounded-lg px-3 py-2 text-body-md focus:border-primary transition-all"
            >
              <option value="all">All Categories</option>
              <option value="project">Projects</option>
              <option value="task">Tasks</option>
              <option value="milestone">Milestones</option>
              <option value="team">Team Members</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={activePriority}
              onChange={(e) => setActivePriority(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 text-on-surface border border-border-subtle rounded-lg px-3 py-2 text-body-md focus:border-primary transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Content Table / List */}
        <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
              <Icon name="sync" size={36} className="animate-spin text-primary" />
              <span className="text-body-lg text-outline">Loading deleted notifications...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-slate-50/50 dark:bg-slate-800/10">
                    <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Type / Category</th>
                    <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Notification Title</th>
                    <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Message Description</th>
                    <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Deleted Time</th>
                    <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredItems.map((n) => {
                    // Category icon mapping
                    let catIcon = 'notifications'
                    if (n.category === 'project') catIcon = 'folder'
                    if (n.category === 'task') catIcon = 'check_circle'
                    if (n.category === 'milestone') catIcon = 'flag'
                    if (n.category === 'team') catIcon = 'person'

                    // Priority Badge colors
                    let prioColor = 'bg-slate-100 text-slate-700'
                    if (n.priority === 'high') prioColor = 'bg-status-error/10 text-status-error'
                    if (n.priority === 'medium') prioColor = 'bg-status-warning/10 text-status-warning'
                    if (n.priority === 'low') prioColor = 'bg-primary/10 text-primary'

                    return (
                      <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-outline">
                              <Icon name={catIcon} size={16} />
                            </span>
                            <span className="text-body-md font-semibold capitalize text-on-surface">{n.category || 'General'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-body-md text-on-surface">{n.title}</td>
                        <td className="px-6 py-4 text-body-md text-on-surface-variant max-w-xs truncate" title={n.message}>
                          {n.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-label-sm font-semibold px-2 py-0.5 rounded-full capitalize ${prioColor}`}>
                            {n.priority || 'medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-body-sm text-outline">{formatDate(n.deleted_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-body-md">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestore(n.id)}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all font-label-md"
                              title="Restore to Active Notifications"
                            >
                              <Icon name="restore" size={16} />
                              Restore
                            </button>
                            <button
                              onClick={() => triggerPermanentDelete(n)}
                              disabled={actionLoading}
                              className="p-2 text-outline hover:text-status-error hover:bg-status-error/5 rounded-lg transition-all"
                              title="Permanently Delete"
                            >
                              <Icon name="delete_forever" size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
              <span className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-outline opacity-60">
                <Icon name="delete_outline" size={32} />
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">No deleted notifications found</h3>
                <p className="text-body-md text-outline mt-1">
                  Notifications you soft-delete will show up here to be restored or purged.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
            <span className="text-body-sm text-outline">
              Showing page {currentPage} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 border border-border-subtle rounded-lg font-label-md text-on-surface hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Icon name="chevron_left" size={18} />
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-9 h-9 rounded-lg font-label-md flex items-center justify-center transition-all ${
                    currentPage === idx + 1
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'border border-border-subtle text-on-surface hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 border border-border-subtle rounded-lg font-label-md text-on-surface hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <Icon name="chevron_right" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Permanent Delete */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-border-subtle dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-status-error/10 text-status-error flex items-center justify-center mb-4">
                <Icon name="warning" size={24} />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Delete Permanently?</h3>
              <p className="text-body-md text-on-surface-variant">
                Are you sure you want to permanently delete "<strong>{itemToDelete?.title}</strong>"? This action is irreversible.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-border-subtle dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setItemToDelete(null)
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant font-label-md hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                disabled={actionLoading}
                className="px-5 py-2 bg-status-error text-white font-label-md font-bold rounded-lg shadow-md hover:opacity-95 transition-all"
              >
                {actionLoading ? 'Purging...' : 'Purge Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
