'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Training = {
  id: string
  date: string
  type: string
  exercises: any[]
  notes?: string
}

export default function TrainingsPage() {
  const { user, isLoading } = useAuth()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || isLoading) return

    const fetchTrainings = async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*, exercises(*)') // ✅ ook oefeningen ophalen
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ Fout bij ophalen:', error)
      } else {
        setTrainings(data)
      }

      setLoading(false)
    }

    fetchTrainings()
  }, [user, isLoading])

  if (loading || isLoading) return <p className="p-4 text-center">Laden...</p>
  if (!user) return <p className="p-4 text-center">Niet ingelogd</p>

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📘 Mijn trainingen</h1>

      {trainings.length === 0 && (
        <p className="text-gray-500 text-center">Nog geen trainingen gevonden.</p>
      )}

      <ul className="space-y-4">
        {trainings.map((training) => (
          <li key={training.id} className="p-4 rounded border bg-zinc-900 text-white shadow">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold capitalize">
                  {training.type} – {new Date(training.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-zinc-400">
                  {training.exercises?.length || 0} oefeningen
                </p>
                {training.notes && (
                  <p className="text-sm mt-1 text-zinc-300">📝 {training.notes}</p>
                )}
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <Link href={`/training/${training.id}`} className="text-lime-400 underline">
                  Bekijken
                </Link>
                <Link href={`/training/herhalen?id=${training.id}`} className="text-blue-400 underline">
                  Herhalen
                </Link>
                <Link href={`/training/uitvoeren/${training.id}`} className="text-yellow-400 underline">
                  Uitvoeren
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
