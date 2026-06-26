import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const Credentials = () => {
  const { projectId } = useProject()
  const { showToast } = useToast()

  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Form states
  const [service, setService] = useState('Slack')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('connected')
  const [modalLoading, setModalLoading] = useState(false)

  const fetchIntegrations = useCallback(async () => {
    if (!projectId) {
      setIntegrations([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await db.integrations.list(projectId)
      setIntegrations(data)
    } catch (e) {
      console.error(e)
      showToast('Failed to load integrations', 'error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.cred-row-menu')) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddIntegration = async (e) => {
    e.preventDefault()
    console.log("Clicked: Submit Add Integration Form")
    if (!projectId) {
      showToast('Please select or create a project first', 'error')
      return
    }

    setModalLoading(true)
    try {
      await db.integrations.save({
        project_id: projectId,
        service,
        description,
        status,
        last_used: 'Just now'
      })
      showToast(`${service} integration added successfully!`, 'success')
      setShowAddModal(false)
      setDescription('')
      fetchIntegrations()
    } catch (err) {
      showToast(err.message || 'Failed to add integration', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  const handleOpenEdit = (integ) => {
    setSelectedIntegration(integ)
    setService(integ.service)
    setDescription(integ.description || '')
    setStatus(integ.status)
    setShowEditModal(true)
    setActiveMenuId(null)
  }

  const handleEditIntegration = async (e) => {
    e.preventDefault()
    console.log("Clicked: Submit Edit Integration Form")
    if (!selectedIntegration) return

    setModalLoading(true)
    try {
      await db.integrations.save({
        ...selectedIntegration,
        service,
        description,
        status,
        last_used: 'Updated just now'
      })
      showToast('Integration updated successfully!', 'success')
      setShowEditModal(false)
      setSelectedIntegration(null)
      fetchIntegrations()
    } catch (err) {
      showToast(err.message || 'Failed to update integration', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteIntegration = async (id) => {
    setActiveMenuId(null)
    if (!window.confirm('Are you sure you want to disconnect this integration?')) return

    try {
      await db.integrations.delete(id)
      showToast('Integration disconnected successfully!', 'success')
      fetchIntegrations()
    } catch (err) {
      showToast(err.message || 'Failed to disconnect integration', 'error')
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Credentials</h2>
            <p className="text-body-lg text-on-surface-variant">
              Manage integrations and authentication for your project tools.
            </p>
          </div>
          <button
            onClick={() => {
              console.log("Clicked: Add Integration Button");
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <Icon name="add" size={18} />
            Add Integration
          </button>
        </div>

        <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm overflow-hidden relative">
          <div className="px-margin-md py-4 border-b border-border-subtle bg-surface-muted/50 flex justify-between items-center">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Connected Services
            </h3>
            {loading && (
              <Icon name="sync" size={18} className="animate-spin text-primary" />
            )}
          </div>
          <div className="divide-y divide-border-subtle">
            {integrations.map((cred, idx) => (
              <div key={cred.id || idx} className="p-margin-md flex items-center justify-between hover:bg-surface-container-low transition-colors relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <Icon name="vpn_key" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">{cred.service}</h4>
                    <p className="text-label-md text-on-surface-variant">{cred.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span
                      className={`text-label-sm font-label-sm px-2 py-0.5 rounded ${
                        cred.status === 'connected'
                          ? 'bg-status-success/10 text-status-success'
                          : cred.status === 'pending'
                            ? 'bg-status-warning/10 text-status-warning'
                            : 'bg-status-error/10 text-status-error'
                      }`}
                    >
                      {cred.status.charAt(0).toUpperCase() + cred.status.slice(1)}
                    </span>
                    <p className="text-label-sm text-on-surface-variant mt-1">Last used: {cred.last_used}</p>
                  </div>
                  <div className="relative cred-row-menu">
                    <button
                      onClick={() => {
                        console.log("Clicked: Integration Action Menu Toggle", cred.id);
                        setActiveMenuId(activeMenuId === cred.id ? null : cred.id)
                      }}
                      className="p-2 hover:bg-surface-container rounded-full"
                    >
                      <Icon name="more_vert" size={20} className="text-outline" />
                    </button>
                    {activeMenuId === cred.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-border-subtle rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => {
                            console.log("Clicked: Edit Integration Action", cred.id);
                            handleOpenEdit(cred);
                          }}
                          className="w-full text-left px-4 py-2 text-body-md hover:bg-surface-container-low flex items-center gap-2"
                        >
                          <Icon name="edit" size={16} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            console.log("Clicked: Disconnect Integration Action", cred.id);
                            handleDeleteIntegration(cred.id);
                          }}
                          className="w-full text-left px-4 py-2 text-body-md hover:bg-error-container/10 text-status-error flex items-center gap-2"
                        >
                          <Icon name="delete" size={16} /> Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {integrations.length === 0 && !loading && (
              <div className="p-8 text-center text-on-surface-variant">
                <Icon name="link_off" size={48} className="mx-auto text-outline mb-2" />
                <p className="font-semibold">No integrations connected</p>
                <p className="text-body-md text-outline">Connect tools like Slack, Jira, or GitHub to keep teams synced.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add Integration</h3>
              <button
                onClick={() => {
                  console.log("Clicked: Close Add Integration Modal");
                  setShowAddModal(false);
                }}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddIntegration} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="i-service">
                  Service Provider
                </label>
                <select
                  id="i-service"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option>Slack</option>
                  <option>Jira</option>
                  <option>Microsoft Teams</option>
                  <option>Confluence</option>
                  <option>GitHub</option>
                  <option>GitLab</option>
                  <option>Asana</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="i-desc">
                  Description
                </label>
                <input
                  id="i-desc"
                  type="text"
                  required
                  placeholder="Team communication workspace"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="i-status">
                  Initial Status
                </label>
                <select
                  id="i-status"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="connected">Connected</option>
                  <option value="pending">Pending Connection</option>
                  <option value="error">Connection Error</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Clicked: Close Add Integration Modal");
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 bg-primary text-white font-label-md font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  {modalLoading ? 'Connecting...' : 'Connect Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Configure Integration</h3>
              <button
                onClick={() => {
                  console.log("Clicked: Close Edit Integration Modal");
                  setShowEditModal(false);
                }}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditIntegration} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">
                  Service Provider (read-only)
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full bg-surface-container border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md opacity-80 cursor-not-allowed"
                  value={service}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="i-edit-desc">
                  Description
                </label>
                <input
                  id="i-edit-desc"
                  type="text"
                  required
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="i-edit-status">
                  Connection Status
                </label>
                <select
                  id="i-edit-status"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="connected">Connected</option>
                  <option value="pending">Pending</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Clicked: Close Edit Integration Modal");
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 bg-primary text-white font-label-md font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  {modalLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
