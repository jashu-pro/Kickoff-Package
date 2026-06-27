import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/Icon';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';



export const SettingsModal = ({ profileState }) => {
  const { isSettingsOpen, setIsSettingsOpen, activeSettingsTab, setActiveSettingsTab, tempTheme, setTempTheme, tempEmailNotifications, setTempEmailNotifications, tempRemindersFrequency, setTempRemindersFrequency, tempTwoFactorAuth, setTempTwoFactorAuth, tempSessionTimeout, setTempSessionTimeout, tempPublicProfile, setTempPublicProfile, tempShareStats, setTempShareStats, oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, handleSaveSettings, handleChangePassword } = profileState;


  const { settings } = useProject();
  return (
    <>
      {/* Settings Modal */}
      {isSettingsOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-all duration-300" onClick={() => setIsSettingsOpen(false)}></div>
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-[calc(100%-2rem)] max-w-3xl rounded-2xl shadow-2xl flex flex-col md:flex-row min-h-[500px] z-[101] overflow-hidden"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: '90vh'
            }}
          >
            {/* Sidebar navigation */}
            <div className="w-full md:w-60 bg-slate-50 dark:bg-slate-955 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-headline-sm text-on-surface">Settings</h3>
                  <p className="text-[11px] text-outline mt-0.5">Manage preferences</p>
                </div>
                <nav className="space-y-1">
                  {[
                    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
                    { id: 'security', label: 'Security', icon: 'lock' },
                    { id: 'privacy', label: 'Privacy', icon: 'shield' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-body-md font-medium transition-all ${
                        activeSettingsTab === tab.id
                          ? 'bg-primary text-white shadow-md shadow-primary/10'
                          : 'text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-on-surface'
                      }`}
                    >
                      <Icon name={tab.icon} size={18} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="hidden md:block text-[10px] text-outline font-medium border-t border-border-subtle dark:border-slate-800 pt-4">
                Version 1.0.0 • KickoffGen
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
              <div className="px-6 py-4 border-b border-border-subtle dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50 shrink-0">
                <span className="font-bold text-body-lg text-on-surface capitalize">
                  {activeSettingsTab} Preferences
                </span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">

                {activeSettingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Email Notifications</h4>
                        <p className="text-label-md text-outline mt-1">
                          Receive email updates about active project progress, deadlines, and milestones.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempEmailNotifications(!tempEmailNotifications)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempEmailNotifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempEmailNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Reminders Frequency</label>
                      <select
                        value={tempRemindersFrequency}
                        onChange={(e) => setTempRemindersFrequency(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md"
                      >
                        <option value="Real-time">Real-time alerts</option>
                        <option value="Daily Digest">Daily Digest</option>
                        <option value="Weekly Summary">Weekly Summary</option>
                        <option value="Never">Never</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-4">
                      <h4 className="text-body-md font-bold text-on-surface">Change Password</h4>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current Password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2 text-body-md"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2 text-body-md"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2 text-body-md"
                        />
                        <button
                          onClick={handleChangePassword}
                          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs rounded-lg transition-all"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Two-Factor Authentication (2FA)</h4>
                        <p className="text-label-md text-outline mt-1">
                          Protect your account by requiring an extra code from your authenticator app during login.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempTwoFactorAuth(!tempTwoFactorAuth)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempTwoFactorAuth ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempTwoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Session Timeout</label>
                      <select
                        value={tempSessionTimeout}
                        onChange={(e) => setTempSessionTimeout(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md"
                      >
                        <option value="15 min">15 minutes of inactivity</option>
                        <option value="30 min">30 minutes of inactivity</option>
                        <option value="1 hour">1 hour of inactivity</option>
                        <option value="4 hours">4 hours of inactivity</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Public Profile</h4>
                        <p className="text-label-md text-outline mt-1">
                          Allow other consultants to view your email and phone number inside project worksheets.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempPublicProfile(!tempPublicProfile)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempPublicProfile ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempPublicProfile ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-start justify-between bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <div className="flex-1 pr-4">
                        <h4 className="text-body-md font-bold text-on-surface">Share Project Statistics</h4>
                        <p className="text-label-md text-outline mt-1">
                          Share your task completion stats and metrics automatically with project delivery leads.
                        </p>
                      </div>
                      <button
                        onClick={() => setTempShareStats(!tempShareStats)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                          tempShareStats ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tempShareStats ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border-subtle dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-2.5 shrink-0">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface font-semibold text-body-md rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-body-md rounded-xl shadow-md shadow-primary/10 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};
