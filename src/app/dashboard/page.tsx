'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/providers/AuthProvider'
import type { Training } from '@/app/types/training'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loadingTrainings, setLoadingTrainings] = useState(true)

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
          name,
          notes,
          user_id,
          exercises:exercises (
            id,
            name,
            sets,
            reps,
            weight,
            rest
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ Fout bij ophalen trainingen:', error.message)
      } else {
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
    <div className="max-w-5xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">👋 Welkom {user.email}</h1>

      <div className="flex justify-center mb-8">
        <Link
          href="/training/aanmaken"
          className="bg-lime-600 hover:bg-lime-700 text-center py-3 px-6 rounded"
        >
          ➕ Nieuwe training aanmaken
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">📋 Aangemaakte trainingen</h2>

        {loadingTrainings && <p>Laden...</p>}
        {!loadingTrainings && trainings.length === 0 && (
          <p className="text-gray-400">Nog geen trainingen gevonden.</p>
        )}

        <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {trainings.map((training) => {
            const formattedDate = new Date(training.date).toLocaleDateString('nl-NL')
            const oefCount = training.exercises?.length ?? 0

            return (
              <li
                key={training.id}
                className="bg-[#1a2236] rounded p-4 border border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm px-2 py-1 rounded text-white bg-gray-600">
                    {training.type}
                  </span>
                  <span className="text-sm text-gray-400">📅 {formattedDate}</span>
                </div>

                <p className="text-sm text-gray-300 mb-2">💪 {oefCount} oefeningen</p>

                {oefCount > 0 && (
                  <table className="w-full text-sm text-zinc-300 mb-3">
                    <thead>
                      <tr className="bg-zinc-800">
                        <th className="text-left p-1">Oefening</th>
                        <th className="p-1">Sets</th>
                        <th className="p-1">Reps</th>
                        <th className="p-1">Kg</th>
                        <th className="p-1">Rust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {training.exercises.map((ex) => (
                        <tr key={ex.id}>
                          <td className="p-1">{ex.name}</td>
                          <td className="p-1 text-center">{ex.sets}</td>
                          <td className="p-1 text-center">{ex.reps}</td>
                          <td className="p-1 text-center">{ex.weight}</td>
                          <td className="p-1 text-center">{ex.rest}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="mt-2 flex gap-4 text-sm flex-wrap">
                  <Link
                    href={`/training/herhalen?id=${training.id}`}
                    className="text-blue-400 underline"
                  >
                    ➕ Volgende training
                  </Link>
                  <Link
                    href={`/progress/${training.name ?? training.id}`}
                    className="text-yellow-400 underline"
                  >
                    🧾 Bekijk geschiedenis
                  </Link>
                  <Link
                    href={`/training/uitvoeren/${training.id}`}
                    className="text-green-400 underline"
                  >
                    ▶️ Training uitvoeren
                  </Link>
                  <Link
                    href={`/training/verwijderen?id=${training.id}`}
                    className="text-red-400 underline"
                  >
                    ❌ Verwijder training
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
