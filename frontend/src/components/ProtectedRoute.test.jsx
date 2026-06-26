import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import * as AuthContextModule from '../context/AuthContext'

describe('Protected Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when user is not authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ session: null, loading: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Dashboard Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ session: { user: { id: '123' } }, role: 'Admin', loading: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Dashboard Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })

  it('blocks access if user role is insufficient', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ session: { user: { id: '123' } }, role: 'Member', loading: false })

    render(
      <MemoryRouter initialEntries={['/admin-panel']}>
        <Routes>
          <Route path="/admin-panel" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <div>Secret Admin Content</div>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={<div>Dashboard Fallback</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Secret Admin Content')).not.toBeInTheDocument()
  })
})
