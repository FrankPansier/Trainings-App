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
  const [lastTraining, setLastTraining] = useState<Training | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const fetchTrainings = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('trainings')
      .select(`
        id,
        date,
        type,
        name,
        user_id,
        exercises (
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
      console.error('Fout bij ophalen trainingen:', error.message)
    } else {
      const uniqueTrainings: Training[] = []
      const seenNames = new Set<string>()

      for (const training of data as Training[]) {
        const name = training.name ?? 'Naamloze training'
        if (!seenNames.has(name)) {
          seenNames.add(name)
          uniqueTrainings.push(training)
        }
      }

      setTrainings(uniqueTrainings)
      if (data.length > 0) setLastTraining(data[0])
    }

    setLoadingTrainings(false)
  }

  useEffect(() => {
    fetchTrainings()
  }, [user])

  const deleteTraining = async (id: string) => {
    const confirmed = confirm('Weet je zeker dat je deze training wilt verwijderen?')
    if (!confirmed) return

    const { error } = await supabase.from('trainings').delete().eq('id', id)

    if (error) {
      alert('Fout bij verwijderen: ' + error.message)
    } else {
      setTrainings((prev) => prev.filter((t) => t.id !== id))
    }
  }

  if (isLoading || !user) {
    return <p className="text-center mt-10 text-white">Laden...</p>
  }

  return (
    <div className="max-w-5xl mx-auto p-4 text-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welkom {user.email}</h1>
          {lastTraining && (
            <p className="text-sm text-gray-400">
              Laatst getraind op: {new Date(lastTraining.date).toLocaleDateString('nl-NL')} – {lastTraining.name}
            </p>
          )}
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Aangemaakte trainingen</h2>
          <Link
            href="/training/aanmaken"
            className="bg-[#73b847] hover:bg-[#5da639] text-black font-semibold text-sm py-2 px-4 rounded shadow transition"
          >
            ➕ Nieuwe training
          </Link>
        </div>

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
                className="bg-[#1f1f1f] rounded-xl p-4 border border-[#3e3e3e] shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-lg font-bold flex items-center gap-2">🏋️‍♂️ {training.name || 'Naamloze training'}</p>
                    <span className="text-sm px-2 py-1 rounded text-white bg-gray-700 inline-block mt-1">
                      {training.type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 mt-1 flex items-center gap-1">📅 {formattedDate}</span>
                </div>

                <p className="text-sm text-gray-300 mb-2">{oefCount} oefeningen</p>

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
                        <tr key={ex.id} className="border-t border-zinc-700">
                          <td className="p-1 text-white">{ex.name}</td>
                          <td className="p-1 text-center">{ex.sets}</td>
                          <td className="p-1 text-center">{ex.reps}</td>
                          <td className="p-1 text-center">{ex.weight}</td>
                          <td className="p-1 text-center">{ex.rest}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="mt-2 flex gap-3 flex-wrap text-sm">
                  <Link
                    href={`/progress/${training.name ?? training.id}`}
                    className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300"
                  >
                    📈 Geschiedenis
                  </Link>
                  <Link
                    href={`/training/uitvoeren/${training.id}`}
                    className="flex items-center gap-1 text-green-400 hover:text-green-300"
                  >
                    ▶️ Uitvoeren
                  </Link>
                  <button
                    onClick={() => deleteTraining(training.id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    🗑️ Verwijderen
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
