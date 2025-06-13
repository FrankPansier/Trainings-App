'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/providers/AuthProvider'

type Training = {
  id: string
  type: string
  date: string
  notes?: string
  exercises: { id: string }[]
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loadingTrainings, setLoadingTrainings] = useState(true)

  console.log('Ingelogde user ID:', user?.id)

  // 🔐 Redirect naar login als user niet is ingelogd
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchTrainings = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('trainings')
        .select(`
          id,
          type,
          date,
          notes,
          exercises (
            id
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10)

      if (error) {
        console.error('❌ Fout bij ophalen trainingen:', error.message)
      } else {
        console.log('✅ Trainings opgehaald:', data)
        setTrainings(data as Training[])
      }

      setLoadingTrainings(false)
    }

    fetchTrainings()
  }, [user])

  if (isLoading || !user) {
    return <p className="text-center mt-10 text-white">Laden...</p>
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">👋 Welkom {user.email}</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Link
          href="/training/aanmaken"
          className="flex-1 bg-lime-600 hover:bg-lime-700 text-center py-3 rounded"
        >
          ➕ Nieuwe training aanmaken
        </Link>
        <Link
          href="/trainings"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-center py-3 rounded"
        >
          📘 Bekijk opgeslagen trainingen
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">📋 Recente trainingen</h2>

        {loadingTrainings && <p>Laden...</p>}
        {!loadingTrainings && trainings.length === 0 && (
          <p className="text-gray-400">Nog geen trainingen gevonden.</p>
        )}

        <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {trainings.map((training) => {
            const formattedDate = new Date(training.date).toLocaleDateString('nl-NL')
            const oefCount = training.exercises?.length ?? 0

            const badgeColor =
              training.type === 'Fitness'
                ? 'bg-green-500'
                : training.type === 'Kickboksen'
                ? 'bg-red-500'
                : 'bg-gray-500'

            return (
              <li
                key={training.id}
                className="bg-[#1a2236] rounded p-4 border border-gray-700"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs px-2 py-1 rounded text-white ${badgeColor}`}>
                    {training.type}
                  </span>
                  <span className="text-sm text-gray-400">📅 {formattedDate}</span>
                </div>

                <p className="text-sm text-gray-300 mb-1">💪 {oefCount} oefeningen</p>

                <div className="mt-2 flex gap-4 text-sm flex-wrap">
                  <Link
                    href={`/training/${training.id}`}
                    className="text-lime-400 underline"
                  >
                    Bekijken
                  </Link>
                  <Link
                    href={`/training/herhalen?id=${training.id}`}
                    className="text-blue-400 underline"
                  >
                    Herhalen
                  </Link>
                  <Link
                    href={`/training/uitvoeren/${training.id}`}
                    className="text-yellow-400 underline"
                  >
                    Uitvoeren
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
