import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'

const ProjectContext = createContext(undefined)

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [projectId, setProjectIdState] = useState(localStorage.getItem('ko_active_project_id'))
  const [project, setProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const [settings, setSettingsState] = useState(() => {
    const saved = localStorage.getItem('ko_settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...parsed, theme: 'light' }
    }
    return {
      theme: 'light',
      language: 'English',
      emailNotifications: true,
      remindersFrequency: 'Daily Digest',
      twoFactorAuth: false,
      sessionTimeout: '30 min',
      publicProfile: true,
      shareStats: true
    }
  })

  const updateSettings = (newSettings) => {
    const cleanSettings = { ...newSettings, theme: 'light' }
    setSettingsState(cleanSettings)
    localStorage.setItem('ko_settings', JSON.stringify(cleanSettings))
    document.documentElement.classList.remove('dark')
  }

  // Ensure dark mode is cleaned up on load
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  // Load Projects
  const refreshProjects = useCallback(async () => {
    try {
      const list = await db.projects.list()
      setProjects(list)

      let activeId = projectId
      if (!activeId && list.length > 0) {
        activeId = list[0].id
        setProjectIdState(activeId)
        localStorage.setItem('ko_active_project_id', activeId)
      }

      if (activeId) {
        const p = list.find((item) => item.id === activeId)
        setProject(p || null)
      } else {
        setProject(null)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  // Set selected project ID
  const setProjectId = (id) => {
    setProjectIdState(id)
    localStorage.setItem('ko_active_project_id', id)
    const p = projects.find((item) => item.id === id)
    setProject(p || null)
  }

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        setProjectId,
        project,
        projects,
        loading,
        refreshProjects,
        settings,
        updateSettings
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
