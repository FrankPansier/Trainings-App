'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest: number
  weight: number
  overload?: number
}

export default function TrainingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [training, setTraining] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('trainings')
      .select('*, exercises(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => setTraining(data))
  }, [id])

  if (!training) return <p className="text-center p-8 text-white">Laden…</p>

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-2 capitalize">
        {training.type} – {new Date(training.date).toLocaleDateString('nl-NL')}
      </h1>
      <p className="mb-6 text-zinc-400">{training.exercises.length} oefeningen</p>

      {/* tabel */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-zinc-800 text-zinc-300">
            <th className="p-2 text-left">Oefening</th>
            <th className="p-2">Sets</th>
            <th className="p-2">Reps</th>
            <th className="p-2">Gewicht&nbsp;(kg)</th>
            <th className="p-2">Rust&nbsp;(s)</th>
            <th className="p-2">Overload</th>
          </tr>
        </thead>
        <tbody>
          {training.exercises.map((ex: Exercise, i: number) => (
            <tr key={ex.id} className={i % 2 ? 'bg-zinc-900' : 'bg-zinc-950'}>
              <td className="p-2 font-medium">{ex.name}</td>
              <td className="p-2 text-center">{ex.sets}</td>
              <td className="p-2 text-center">{ex.reps}</td>
              <td className="p-2 text-center">{ex.weight}</td>
              <td className="p-2 text-center">{ex.rest}</td>
              <td className="p-2 text-center">{ex.overload ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <Button onClick={() => router.back()} className="bg-lime-600 text-black">
          ← Terug
        </Button>
      </div>
    </div>
  )
}
