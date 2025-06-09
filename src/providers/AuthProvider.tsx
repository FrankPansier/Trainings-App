'use client'

import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        console.log('🔑 Init session:', data.session)
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
      } catch (err) {
        console.error('❌ Fout bij ophalen sessie:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('🔁 Auth state changed:', newSession)
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
