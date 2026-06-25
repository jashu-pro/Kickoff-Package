import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
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
  const [session, setSession] = useState(null)

  const [userProfile, setUserProfileState] = useState(() => {
    const saved = localStorage.getItem('ko_user_profile')
    if (saved) return JSON.parse(saved)
    return {
      fullName: 'Alex Morgan',
      emailAddress: 'admin@kickoff.com',
      phoneNumber: '+1 (555) 0199',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7Qk6fsUnOGWZrr6x1jXkrICj7qQZch0GPR6q02C-ag7h7qqBkpwRCkgfLldj01t-GVXAVgkm7b2QAaH3oXtCHE9UdQnvVShiu5nAeTnqzabdQ4GCMEM3s_XmWsb5wKW7DbHf0TtGXHZgY0MpCpCLGsvgpsgH_fR8aGZiYfSzDHOAMp24X5_W_b0uIIfWoJuYHoTne7UwdQPP8rptwHpDvnrCz2nqx37wxVnJHuSO0Na4DbTjYf9HuxpX3AWlafe7VaUoEYdPq-l4'
    }
  })

  const setUserProfile = (profile) => {
    setUserProfileState(profile)
    localStorage.setItem('ko_user_profile', JSON.stringify(profile))
  }

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

  // Check Auth Session
  const checkSession = useCallback(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s)
      })
    } else {
      const mockSession = localStorage.getItem('ko_mock_session')
      setSession(mockSession ? JSON.parse(mockSession) : null)
    }
  }, [])

  useEffect(() => {
    checkSession()
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s)
      })
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [checkSession])

  // Logout Handler
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('ko_mock_session')
      setSession(null)
    }
  }

  // Load Projects
  const refreshProjects = useCallback(async () => {
    if (!session) {
      setProjects([])
      setProject(null)
      setLoading(false)
      return
    }

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
  }, [projectId, session])

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
        session,
        logout,
        checkSession,
        userProfile,
        setUserProfile,
        settings,
        updateSettings
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
