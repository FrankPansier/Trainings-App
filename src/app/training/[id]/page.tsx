'use client'
import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'

export default async function TrainingDetailPage({ params }: { params: { id: string } }) {
  const { data: training, error } = await supabase
    .from('trainings')
    .select('*, exercises(*)')
    .eq('id', params.id)
    .single()

  if (error || !training) return notFound()

  return (
    <main className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">
        {training.type} – {new Date(training.date).toLocaleDateString('nl-NL')}
      </h1>

      {training.notes && (
        <p className="mb-6 text-gray-300">
          📝 <strong>Notities:</strong> {training.notes}
        </p>
      )}

      <h2 className="text-xl font-semibold mb-3">Oefeningen ({training.exercises.length})</h2>

      {training.exercises.length === 0 && (
        <p className="text-gray-400">Geen oefeningen toegevoegd aan deze training.</p>
      )}

      <ul className="space-y-4">
        {training.exercises.map((ex: any) => (
          <li
            key={ex.id}
            className="bg-[#1a2236] p-4 rounded border border-gray-700"
          >
            <div className="font-semibold">{ex.name}</div>
            <div className="text-sm text-gray-400">
              {ex.sets} sets × {ex.reps} reps @ {ex.weight} kg  
              &nbsp; | Rust: {ex.rest}s  
              &nbsp; | Overload: {ex.overload}
            </div>
            {ex.notes && (
              <div className="text-sm text-gray-500 mt-2">
                📝 {ex.notes}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
