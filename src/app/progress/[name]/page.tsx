'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Exercise {
  name: string
  weight: number
  performed_reps: number[]
  date: string
}

export default function ProgressPerExercise() {
  const { id } = useParams()
  const [exercises, setExercises] = useState<Exercise[]>([])

  useEffect(() => {
    async function fetchProgress() {
      const { data, error } = await supabase
        .from('training_results')
        .select('date, exercises')
        .eq('user_id', id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Fout bij ophalen progressie:', error)
        return
      }

      const result: Exercise[] = []
      data?.forEach((entry: any) => {
        entry.exercises.forEach((ex: any) => {
          result.push({
            name: ex.name,
            weight: ex.weight,
            performed_reps: ex.performed_reps,
            date: entry.date,
          })
        })
      })
      setExercises(result)
    }
    fetchProgress()
  }, [id])

  const grouped = exercises.reduce((acc, ex) => {
    if (!acc[ex.name]) acc[ex.name] = []
    acc[ex.name].push(ex)
    return acc
  }, {} as Record<string, Exercise[]>)

  return (
    <div className="max-w-2xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-6">📈 Progressie per oefening</h1>
      {Object.entries(grouped).map(([naam, entries]) => (
        <div key={naam} className="mb-6">
          <h2 className="text-lime-400 text-lg font-semibold mb-2">{naam}</h2>
          <ul className="space-y-1">
            {entries.map((ex, idx) => (
              <li key={idx} className="bg-zinc-800 p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span>{new Date(ex.date).toLocaleDateString()}</span>
                  <span>{ex.performed_reps.join(' / ')} reps @ {ex.weight}kg</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
