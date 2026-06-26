import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/Icon';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';

import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/Toast';

export const UserProfileDropdown = ({ profileState }) => {
  const { showProfile, setShowProfile, profileRef, setIsEditProfileOpen, setIsSettingsOpen } = profileState;
  const { setProjectId } = useProject();
  const { logout, profile, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentFullName = profile?.full_name || 'Kickoff User'
  const currentEmail = profile?.email || user?.email || 'user@example.com'
  const currentAvatar = profile?.avatar_url || 'https://i.pravatar.cc/150?u=kickoff'

  return (
    <>
        {/* User Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile)
            }}
            className="flex items-center focus:outline-none ml-2"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle hover:border-primary transition-all">
              <img
                alt="User profile"
                className="w-full h-full object-cover"
                src={currentAvatar}
              />
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border-subtle shrink-0">
                  <img
                    alt="User profile"
                    className="w-full h-full object-cover"
                    src={currentAvatar}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-body-md font-bold text-on-surface truncate">
                    {currentFullName}
                  </div>
                  <div className="text-label-md text-outline truncate">
                    {currentEmail}
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle dark:border-slate-800 pt-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfile(false)
                    navigate('/dashboard')
                    showToast('Navigated to profile dashboard', 'success')
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-body-md text-on-surface font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="dashboard" size={18} className="text-outline" />
                  My Dashboard
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false)
                    setIsEditProfileOpen(true)
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-body-md text-on-surface font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="person" size={18} className="text-outline" />
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false)
                    setIsSettingsOpen(true)
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-body-md text-on-surface font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="settings" size={18} className="text-outline" />
                  Settings
                </button>

                <button
                  onClick={async () => {
                    setShowProfile(false)
                    await logout()
                    showToast('Successfully signed out', 'success')
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-body-md text-status-error font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="logout" size={18} className="text-status-error" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
    </>
  );
};
