// components/AuthForm.tsx

import { useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'

export default function AuthForm({ type = 'sign-in' }: { type?: 'sign-in' | 'sign-up' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const fn =
      type === 'sign-in'
        ? supabase.auth.signInWithPassword
        : supabase.auth.signUp

    const { error } = await fn({ email, password })

    if (error) return setError(error.message)

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleAuth} className="flex flex-col space-y-4 max-w-sm mx-auto mt-20">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Wachtwoord"
        className="border p-2 rounded"
        required
      />
      <button className="bg-blue-600 text-white p-2 rounded">
        {type === 'sign-in' ? 'Inloggen' : 'Account aanmaken'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
