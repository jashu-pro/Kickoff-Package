import { Routes, Route, Navigate } from 'react-router-dom'
import { ProjectCreation } from './pages/ProjectCreation'
import { Communication } from './pages/Communication'
import { Milestones } from './pages/Milestones'
import { Preview } from './pages/Preview'
import { Timeline } from './pages/Timeline'
import { Dashboard } from './pages/Dashboard'
import { Credentials } from './pages/Credentials'
import { Team } from './pages/Team'
import { Management } from './pages/Management'
import { Login } from './pages/Login'
import { DeleteHistory } from './pages/DeleteHistory'
import { Layout } from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/delete-history" element={<DeleteHistory />} />
      <Route path="/projects/new" element={<ProjectCreation />} />
      <Route path="/projects" element={<Management />} />
      <Route path="/credentials" element={<Credentials />} />
      <Route path="/communication" element={<Communication />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/team" element={<Team />} />
      <Route path="/tasks" element={<Milestones />} />
      <Route path="/milestones" element={<Milestones />} />
      <Route path="/preview" element={<Preview />} />
      <Route path="/management" element={<Management />} />

    </Routes>
  )
}

export default App
