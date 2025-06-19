'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Training } from '@/app/types/training'

export default function ProgressPerTraining() {
  const { name } = useParams()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*, exercises(*)')
        .eq('name', decodeURIComponent(name as string))
        .order('date', { ascending: false })

      if (!error && data) {
        setTrainings(data as Training[])
      }

      setLoading(false)
    }

    fetchHistory()
  }, [name])

  return (
    <div className="max-w-4xl mx-auto p-4 text-white font-[Inter,sans-serif]">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Geschiedenis: {decodeURIComponent(name as string)}
      </h1>

      {loading && <p className="text-zinc-400">Laden...</p>}

      {!loading && trainings.length === 0 && (
        <p className="text-gray-400">Geen trainingen gevonden met deze naam.</p>
      )}

      <ul className="space-y-6">
        {trainings.map((training, trainingIdx) => {
          const completedSets = training.exercises.reduce((acc, ex) => {
            try {
              const reps = JSON.parse(ex.performed_reps as unknown as string)
              return acc + (Array.isArray(reps) ? reps.filter(r => r >= ex.reps).length : 0)
            } catch {
              return acc
            }
          }, 0)

          const totalSets = training.exercises.reduce((acc, ex) => acc + ex.sets, 0)
          const progressPercent = Math.round((completedSets / totalSets) * 100)

          return (
            <li
              key={training.id}
              className="bg-[#1E1E1E] p-4 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.25)] border border-zinc-700"
            >
              <p className="font-semibold mb-2 text-white">
                📅 {new Date(training.date).toLocaleDateString('nl-NL')}
              </p>

              <div className="mb-4">
                <div className="text-sm text-zinc-400 mb-1">Progressie</div>
                <div className="w-full h-0.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-zinc-400 mt-1">
                  {progressPercent}% behaald ({completedSets}/{totalSets} sets)
                </div>
              </div>

              <table className="w-full text-sm text-zinc-300 mb-2">
                <thead>
                  <tr className="bg-zinc-800">
                    <th className="text-left p-2">Oefening</th>
                    <th className="p-2">Sets</th>
                    <th className="p-2">Reps</th>
                    <th className="p-2">Kg</th>
                    <th className="p-2">Rust</th>
                    <th className="p-2">Uitgevoerd</th>
                  </tr>
                </thead>
                <tbody>
                  {training.exercises.map((ex) => {
                    let parsed: number[] = []
                    try {
                      const tmp = JSON.parse(ex.performed_reps as unknown as string)
                      if (Array.isArray(tmp)) parsed = tmp
                    } catch (_) {
                      if (Array.isArray(ex.performed_reps)) parsed = ex.performed_reps
                    }

                    return (
                      <tr key={ex.id} className="border-t border-zinc-700">
                        <td className="p-2 font-medium text-white">{ex.name}</td>
                        <td className="p-2 text-center">{ex.sets}</td>
                        <td className="p-2 text-center">{ex.reps}</td>
                        <td className="p-2 text-center">{ex.weight}</td>
                        <td className="p-2 text-center">{ex.rest}</td>
                        <td className="p-2 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {parsed.length > 0 ? (
                              parsed.map((val, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 text-xs rounded-full font-semibold transition-all duration-300
                                    ${val >= ex.reps ? 'bg-green-600 text-white' : val > 0 ? 'bg-yellow-600 text-black' : 'bg-zinc-600 text-white'}`}
                                >
                                  {val}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-400">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
