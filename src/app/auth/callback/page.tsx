// src/app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'


export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📦 callback session:', session)
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/login?message=Kon sessie niet laden')
      }
    })
  }, [router])

  return <p className="p-4 text-center">Bezig met inloggen...</p>
}
