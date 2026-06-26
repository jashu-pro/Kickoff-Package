import React from 'react'
import { Icon } from '../../components/Icon'
import { useSearch } from './hooks/useSearch'
import { useNotifications } from './hooks/useNotifications'
import { useProfileSettings } from './hooks/useProfileSettings'
import { GlobalSearch } from './components/GlobalSearch'
import { ProjectProgress } from './components/ProjectProgress'
import { NotificationsDropdown } from './components/NotificationsDropdown'
import { UserProfileDropdown } from './components/UserProfileDropdown'
import { EditProfileModal } from './components/EditProfileModal'
import { SettingsModal } from './components/SettingsModal'

export const TopNavbar = () => {
  const searchState = useSearch()
  const notificationState = useNotifications()
  const profileState = useProfileSettings()

  return (
    <div className="h-16 border-b border-border-subtle bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 w-64 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Icon name="rocket_launch" size={18} className="text-white" />
        </div>
        <span className="font-display-sm font-bold text-on-surface tracking-tight text-lg">Kickoff</span>
      </div>

      <GlobalSearch searchState={searchState} />

      {/* Far Right Navigation Controls */}
      <div className="flex items-center justify-end gap-3 w-64 shrink-0">
        <ProjectProgress activeProjectStats={notificationState.activeProjectStats} />
        
        <NotificationsDropdown notificationState={notificationState} profileState={profileState} />

        {/* Settings Cog (triggers settings modal) */}
        <button
          onClick={() => profileState.setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-95 border border-transparent hover:border-border-subtle group"
          title="Global Settings"
        >
          <Icon name="settings" size={20} className="group-hover:rotate-45 transition-transform duration-300" />
        </button>

        <UserProfileDropdown profileState={profileState} />
      </div>

      <EditProfileModal profileState={profileState} />
      <SettingsModal profileState={profileState} />
    </div>
  )
}
