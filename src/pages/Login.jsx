import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { Icon } from '../components/Icon'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, checkSession } = useProject()
  const { showToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Validation / Error state
  const [validationError, setValidationError] = useState('')

  // Check if email was remembered
  useEffect(() => {
    const savedEmail = localStorage.getItem('ko_remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  // If already authenticated, redirect to dashboard or requested page
  if (session) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!email || !password) {
      setValidationError('Please enter both your email address and password.')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      if (supabase) {
        // Real Supabase Authentication
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        showToast('Successfully signed in!', 'success')
      } else {
        // Mock LocalStorage Fallback Authentication
        const users = JSON.parse(localStorage.getItem('ko_mock_users') || '[]')
        // Ensure default users are registered in mock list
        if (!users.find(u => u.email === 'admin@kickoff.com')) {
          users.push({ email: 'admin@kickoff.com', password: 'password' })
        }
        if (!users.find(u => u.email === 'jaswanthmajji43@gmail.com')) {
          users.push({ email: 'jaswanthmajji43@gmail.com', password: 'jaswanth' })
        }
        localStorage.setItem('ko_mock_users', JSON.stringify(users))

        const user = users.find((u) => u.email === email && u.password === password)
        if (!user && !(email === 'admin@kickoff.com' && password === 'password')) {
          throw new Error('Invalid email or password. Please try again.')
        }

        localStorage.setItem(
          'ko_mock_session',
          JSON.stringify({ email, token: 'mock-session-token' })
        )
        showToast('Successfully signed in (offline mode)!', 'success')
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('ko_remembered_email', email)
      } else {
        localStorage.removeItem('ko_remembered_email')
      }

      // Trigger session check and navigate
      await checkSession()
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setValidationError(err.message || 'Authentication failed. Please check your credentials.')
      showToast(err.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail) {
      showToast('Please enter your email address.', 'error')
      return
    }

    setForgotLoading(true)
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
          redirectTo: `${window.location.origin}/login`,
        })
        if (error) throw error
        showToast('Password reset link has been sent to your email!', 'success')
      } else {
        showToast('Mock reset link has been sent to your email (offline mode)!', 'success')
      }
      setShowForgotModal(false)
      setForgotEmail('')
    } catch (err) {
      showToast(err.message || 'Failed to send recovery email', 'error')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative premium background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-display-lg text-primary font-extrabold tracking-tight">
            Project Kickoff
          </h1>
          <p className="mt-2 text-body-lg text-on-surface-variant font-medium">
            IT Consultancy Suite
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-surface-base py-8 px-6 sm:px-10 border border-border-subtle rounded-xl shadow-lg relative overflow-hidden">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 text-center">
            Sign In
          </h2>

          {validationError && (
            <div className="mb-4 p-3 bg-error-container/20 border border-error-container text-on-error-container rounded-lg flex items-start gap-2 text-body-md">
              <Icon name="error" size={20} className="text-error mt-0.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@kickoff.com"
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2.5 font-body-md text-body-md placeholder:text-outline-variant transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-label-md text-primary font-semibold hover:underline bg-transparent border-0 outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2.5 font-body-md text-body-md placeholder:text-outline-variant transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Remember Me Box */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-body-md text-on-surface-variant cursor-pointer select-none">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-label-md font-semibold text-white bg-primary hover:opacity-95 active:scale-98 duration-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" size={18} className="animate-spin text-white" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {!supabase && (
            <div className="mt-6 p-3 bg-primary-fixed/30 rounded-lg text-center flex items-center gap-2 justify-center border border-primary-fixed-dim/20 text-on-primary-fixed">
              <Icon name="wifi_off" size={18} />
              <span className="text-[11px] font-medium">Offline Fallback: admin@kickoff.com / password</span>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false)
                  setForgotEmail('')
                }}
                className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
              <p className="text-body-md text-on-surface-variant">
                Enter your email address below and we will send you a password recovery link.
              </p>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="forgot-email">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="admin@kickoff.com"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false)
                    setForgotEmail('')
                  }}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-6 py-2 bg-primary text-white font-label-md font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  {forgotLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
