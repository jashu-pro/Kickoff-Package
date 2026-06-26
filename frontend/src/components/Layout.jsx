import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNavbar } from '../features/top-navbar/TopNavbar'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'

export const Layout = ({ children, title, activeTab }) => {
  const { loading: projectLoading, project } = useProject()
  const { session, loading: authLoading } = useAuth()
  const location = useLocation()

  if (authLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const navbarTitle = title || (project ? project.project_name : 'KickoffGen')

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-60 flex flex-col min-h-screen">
        <TopNavbar title={navbarTitle} activeTab={activeTab} />
        <div className="p-margin-md flex-1">{children}</div>
      </main>
    </div>
  )
}
