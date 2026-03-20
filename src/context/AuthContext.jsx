import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [lastLogin, setLastLogin] = useState(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    // GAP 10 FIX: await profile fetch before marking loading=false
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted.current) return
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
        recordLastLogin(session.user)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted.current) return
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
        if (_event === 'SIGNED_IN') recordLastLogin(session.user)
      } else {
        setProfile(null)
        setLastLogin(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted.current = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (isMounted.current) {
        // GAP 10 FIX: set profile before clearing loading
        setProfile(error ? null : data)
        setLoading(false)
      }
    } catch {
      if (isMounted.current) {
        setProfile(null)
        setLoading(false)
      }
    }
  }

  function recordLastLogin(user) {
    const now  = new Date().toISOString()
    const key  = `last_login_${user.id}`
    const prev = localStorage.getItem(key)
    setLastLogin(prev ? new Date(prev) : null)
    localStorage.setItem(key, now)
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, lastLogin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
