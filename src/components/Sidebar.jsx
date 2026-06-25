import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { useProject } from '../context/ProjectContext'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/projects/new', icon: 'add_box', label: 'Project Creation' },
  { to: '/credentials', icon: 'vpn_key', label: 'Credentials' },
  { to: '/communication', icon: 'forum', label: 'Communication' },
  { to: '/timeline', icon: 'schedule', label: 'Timeline' },
  { to: '/team', icon: 'groups', label: 'Team Intro' },
  { to: '/milestones', icon: 'checklist', label: 'Milestones' },
  { to: '/preview', icon: 'visibility', label: 'Preview' },
  { to: '/management', icon: 'inventory_2', label: 'Management' },
]

export const Sidebar = () => {
  const navigate = useNavigate()
  const { logout } = useProject()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface-container-lowest border-r border-border-subtle flex flex-col p-margin-sm gap-2 z-50">
      <div className="px-3 py-4 mb-2">
        <h1 className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
          Project Kickoff
        </h1>
        <p className="font-label-md text-label-md text-on-surface-variant opacity-70">
          IT Consultancy Suite
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg font-label-md text-label-md transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 space-y-1">
        <button
          onClick={() => navigate('/projects/new')}
          className="w-full bg-primary text-white font-label-md py-2.5 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all mb-4"
        >
          New Package
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-status-error hover:bg-error-container/10 transition-all rounded-lg font-label-md text-label-md w-full"
        >
          <Icon name="logout" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
