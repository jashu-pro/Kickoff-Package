import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    if (!supabase) return null
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching profile:', error.message)
      return null
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
      setUser(currentSession?.user || null)
      
      if (currentSession?.user) {
        const userProfile = await fetchProfile(currentSession.user.id)
        setProfile(userProfile)
      }
      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      
      if (newSession?.user) {
        const userProfile = await fetchProfile(newSession.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role: profile?.role === 'member' ? 'admin' : (profile?.role || 'admin'),
        loading,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
