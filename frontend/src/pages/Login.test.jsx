import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { Login } from './Login'
import { supabase } from '../lib/supabase'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ session: null }),
  AuthProvider: ({children}) => children
}))

vi.mock('../components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() })
}))

describe('Authentication Flow (Login)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/admin@kickoff\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
  })

  it('displays error on invalid credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
      data: { user: null, session: null }
    })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/admin@kickoff\.com/i), { target: { value: 'wrong@test.com' } })
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument()
    })
  })

  it('successful login handles state', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: null,
      data: { user: { id: '123' }, session: { access_token: 'token' } }
    })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/admin@kickoff\.com/i), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123'
      })
    })
  })
})
