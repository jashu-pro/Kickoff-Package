import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/Icon';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';



export const EditProfileModal = ({ profileState }) => {
  const { isEditProfileOpen, setIsEditProfileOpen, tempFullName, setTempFullName, tempEmailAddress, setTempEmailAddress, tempPhoneNumber, setTempPhoneNumber, tempAvatarPreview, setTempAvatarPreview, handleAvatarChange, handleSaveProfile } = profileState;


  const { settings } = useProject();
  return (
    <>
      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border-subtle dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="font-semibold text-headline-sm text-on-surface">Edit Profile</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                  <img
                    alt="User avatar preview"
                    className="w-full h-full object-cover"
                    src={tempAvatarPreview}
                  />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
                    <Icon name="photo_camera" size={20} className="mb-0.5" />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]')
                    if (fileInput) fileInput.click()
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Upload Image
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={tempFullName}
                    onChange={(e) => setTempFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={tempEmailAddress}
                    onChange={(e) => setTempEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={tempPhoneNumber}
                    onChange={(e) => setTempPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-on-surface rounded-xl px-4 py-2.5 text-body-md focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-subtle dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-2.5">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface font-semibold text-body-md rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-body-md rounded-xl shadow-md shadow-primary/10 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
