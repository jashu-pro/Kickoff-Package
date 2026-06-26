import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ProjectProvider } from './context/ProjectContext'
import { PageLoader } from './components/PageLoader'
import { Login } from './pages/Login'

import { useToast } from './components/Toast'

// Lazy Loaded Routes
const ProjectCreation = React.lazy(() => import('./features/project-creation/ProjectCreation').then(m => ({ default: m.ProjectCreation })))
const Communication = React.lazy(() => import('./pages/Communication').then(m => ({ default: m.Communication })))
const Milestones = React.lazy(() => import('./pages/Milestones').then(m => ({ default: m.Milestones })))
const Preview = React.lazy(() => import('./pages/Preview').then(m => ({ default: m.Preview })))
const Timeline = React.lazy(() => import('./pages/Timeline').then(m => ({ default: m.Timeline })))
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Credentials = React.lazy(() => import('./pages/Credentials').then(m => ({ default: m.Credentials })))
const Team = React.lazy(() => import('./pages/Team').then(m => ({ default: m.Team })))
const Management = React.lazy(() => import('./pages/Management').then(m => ({ default: m.Management })))
const DeleteHistory = React.lazy(() => import('./pages/DeleteHistory').then(m => ({ default: m.DeleteHistory })))
const PackageDetails = React.lazy(() => import('./features/packages/PackageDetails').then(m => ({ default: m.PackageDetails })))

function App() {
  const { addToast } = useToast()

  React.useEffect(() => {
    // Parse Supabase Auth Error Hash (e.g., #error=access_denied&error_code=otp_expired)
    if (window.location.hash && window.location.hash.includes('error=')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const errorDescription = hashParams.get('error_description')
      if (errorDescription) {
        addToast(errorDescription.replace(/\+/g, ' '), 'error')
        // Clean up the hash so it doesn't stay in the URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [addToast])
  return (
    <AuthProvider>
      <ProjectProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/delete-history" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DeleteHistory /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ProjectCreation /></ProtectedRoute>} />
            <Route path="/packages/:packageId" element={<ProtectedRoute><PackageDetails /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Management /></ProtectedRoute>} />
            <Route path="/credentials" element={<ProtectedRoute allowedRoles={['admin']}><Credentials /></ProtectedRoute>} />
            <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
            <Route path="/milestones" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
            <Route path="/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
            <Route path="/management" element={<ProtectedRoute><Management /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App
