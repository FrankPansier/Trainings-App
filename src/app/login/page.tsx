'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { user, session, isLoading } = useAuth()

  // 🔍 Debug
  console.log('🧠 useAuth()', { user, session, isLoading })

  // ⏩ Doorsturen als al ingelogd
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (isLoading) return <p className="text-center mt-10">Laden...</p>

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Inloggen of registreren</h1>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={[]} // Voeg ['google'] toe als je externe providers gebruikt
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Wachtwoord',
                button_label: 'Inloggen',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Wachtwoord',
                button_label: 'Registreren',
              },
            },
          }}
        />
      </div>
    </div>
  )
}
