import { useState, useEffect, useRef } from 'react'
import { useProject } from '../../../context/ProjectContext'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../components/Toast'
import { supabase } from '../../../lib/supabase'

export const useProfileSettings = () => {
  const { settings, updateSettings } = useProject()
  const { profile, user } = useAuth()
  const { showToast } = useToast()

  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)

  // Map database profile to internal state safely
  const currentFullName = profile?.full_name || ''
  const currentEmail = profile?.email || user?.email || ''
  const currentPhone = profile?.phone || ''
  const currentAvatar = profile?.avatar_url || ''

  const [tempFullName, setTempFullName] = useState(currentFullName)
  const [tempEmailAddress, setTempEmailAddress] = useState(currentEmail)
  const [tempPhoneNumber, setTempPhoneNumber] = useState(currentPhone)
  const [tempAvatarPreview, setTempAvatarPreview] = useState(currentAvatar)

  useEffect(() => {
    if (isEditProfileOpen) {
      setTempFullName(currentFullName)
      setTempEmailAddress(currentEmail)
      setTempPhoneNumber(currentPhone)
      setTempAvatarPreview(currentAvatar)
    }
  }, [isEditProfileOpen, profile, user])

  const [activeSettingsTab, setActiveSettingsTab] = useState('notifications')
  const [tempTheme, setTempTheme] = useState(settings.theme)
  const [tempEmailNotifications, setTempEmailNotifications] = useState(settings.emailNotifications)
  const [tempRemindersFrequency, setTempRemindersFrequency] = useState(settings.remindersFrequency)
  const [tempTwoFactorAuth, setTempTwoFactorAuth] = useState(settings.twoFactorAuth)
  const [tempSessionTimeout, setTempSessionTimeout] = useState(settings.sessionTimeout)
  const [tempPublicProfile, setTempPublicProfile] = useState(settings.publicProfile)
  const [tempShareStats, setTempShareStats] = useState(settings.shareStats)

  useEffect(() => {
    if (isSettingsOpen) {
      setTempTheme(settings.theme)
      setTempEmailNotifications(settings.emailNotifications)
      setTempRemindersFrequency(settings.remindersFrequency)
      setTempTwoFactorAuth(settings.twoFactorAuth)
      setTempSessionTimeout(settings.sessionTimeout)
      setTempPublicProfile(settings.publicProfile)
      setTempShareStats(settings.shareStats)
    }
  }, [isSettingsOpen, settings])

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!tempFullName.trim()) {
      showToast('Full name is required', 'error')
      return
    }
    
    if (supabase) {
      try {
        if (user) {
          const { error } = await supabase.from('user_profiles').update({
            full_name: tempFullName,
            avatar_url: tempAvatarPreview
          }).eq('id', user.id)
          
          if (error) {
            console.error('Error updating supabase profile:', error)
            showToast('Failed to save profile: ' + error.message, 'error')
            return
          }
        }
      } catch (err) {
        console.error('Supabase update failed:', err)
        showToast('Update failed', 'error')
        return
      }
    }

    setIsEditProfileOpen(false)
    showToast('Profile updated successfully! Refresh to see changes.', 'success')
  }

  const handleSaveSettings = () => {
    updateSettings({
      theme: tempTheme,
      emailNotifications: tempEmailNotifications,
      remindersFrequency: tempRemindersFrequency,
      twoFactorAuth: tempTwoFactorAuth,
      sessionTimeout: tempSessionTimeout,
      publicProfile: tempPublicProfile,
      shareStats: tempShareStats
    })
    setIsSettingsOpen(false)
    showToast('Settings saved successfully', 'success')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error')
      return
    }
    
    if (supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) {
        showToast(error.message, 'error')
        return
      }
    }

    showToast('Password updated successfully', 'success')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return {
    showProfile, setShowProfile, profileRef,
    isEditProfileOpen, setIsEditProfileOpen,
    isSettingsOpen, setIsSettingsOpen,
    showDeleteAllConfirm, setShowDeleteAllConfirm,
    tempFullName, setTempFullName,
    tempEmailAddress, setTempEmailAddress,
    tempPhoneNumber, setTempPhoneNumber,
    tempAvatarPreview, setTempAvatarPreview,
    activeSettingsTab, setActiveSettingsTab,
    tempTheme, setTempTheme,
    tempEmailNotifications, setTempEmailNotifications,
    tempRemindersFrequency, setTempRemindersFrequency,
    tempTwoFactorAuth, setTempTwoFactorAuth,
    tempSessionTimeout, setTempSessionTimeout,
    tempPublicProfile, setTempPublicProfile,
    tempShareStats, setTempShareStats,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    handleAvatarChange, handleSaveProfile,
    handleSaveSettings, handleChangePassword
  }
}
