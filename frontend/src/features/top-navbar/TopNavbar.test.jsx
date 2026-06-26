import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { TopNavbar } from './TopNavbar'
import { ToastProvider } from '../../components/Toast'

vi.mock('./hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [
      { id: '1', title: 'Test Notification', message: 'Hello World', is_read: false, created_at: new Date().toISOString() }
    ],
    unreadCount: 1,
    handleMarkAsRead: vi.fn(),
    handleMarkAllAsRead: vi.fn(),
    handleClearAll: vi.fn(),
  })
}))

vi.mock('./hooks/useProfileSettings', () => ({
  useProfileSettings: () => ({
    handleProfileUpload: vi.fn(),
    handleSaveProfile: vi.fn(),
    isUploading: false,
    tempFullName: 'Test User',
    setTempFullName: vi.fn(),
    tempEmailAddress: 'test@test.com',
    setTempEmailAddress: vi.fn(),
    tempPhoneNumber: '',
    setTempPhoneNumber: vi.fn(),
    showDeleteAllConfirm: false,
    setShowDeleteAllConfirm: vi.fn()
  })
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    userProfile: { fullName: 'Test User', email: 'test@test.com' },
    signOut: vi.fn()
  })
}))

vi.mock('../../context/ProjectContext', () => ({
  useProject: () => ({
    projects: [],
    project: { name: 'Test Project' }
  })
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

// Mock out the children components
vi.mock('./components/ProjectProgress', () => ({ ProjectProgress: () => <div data-testid="project-progress" /> }))
vi.mock('./components/SettingsModal', () => ({ SettingsModal: () => <div data-testid="settings-modal" /> }))
vi.mock('./components/UserProfileDropdown', () => ({ UserProfileDropdown: () => <div data-testid="user-profile-dropdown" /> }))
vi.mock('./components/NotificationDropdown', () => ({
  NotificationDropdown: ({ isOpen }) => isOpen ? <div data-testid="notification-dropdown">Test Notification Hello World</div> : null
}))

describe('TopNavbar (Notifications)', () => {
  it('renders unread badge correctly', () => {
    render(
      <ToastProvider>
        <TopNavbar />
      </ToastProvider>
    )
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('opens notification dropdown on click', async () => {
    render(
      <ToastProvider>
        <TopNavbar />
      </ToastProvider>
    )
    const bellBtn = screen.getByRole('button', { name: /open notifications/i })
    fireEvent.click(bellBtn)

    await waitFor(() => {
      expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument()
      expect(screen.getByText(/Test Notification/i)).toBeInTheDocument()
    })
  })
})
