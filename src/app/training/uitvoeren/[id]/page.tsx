'use client'

import { useState, useEffect, useRef } from 'react'
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
  performedReps?: (number | null)[]
  notes?: string
  useCustom?: boolean
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

export default function ExecuteTrainingPage() {
  const { id } = useParams()
  const router = useRouter()

  const [training, setTraining] = useState<any>(null)
  const [performedReps, setPerformedReps] = useState<(number | null)[][]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [restTimers, setRestTimers] = useState<Record<string, number | null>>({})
  const restIntervals = useRef<Record<string, NodeJS.Timeout>>({})
  const trainingRef = useRef<any>()
  const beepRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    trainingRef.current = training
  }, [training])

  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [startTime])

  useEffect(() => {
    if (!id) return
    (async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*, exercises(*)')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Fout bij ophalen training:', error?.message)
        return
      }

      const exercises: Exercise[] = data.exercises ?? []
      setTraining({ ...data, exercises })
      setPerformedReps(exercises.map((e) => Array(e.sets).fill(null)))
      setNotes(exercises.map((e) => e.notes ?? ''))

      const timers: Record<string, number | null> = {}
      exercises.forEach((e) => (timers[e.id] = null))
      setRestTimers(timers)
    })()
  }, [id])

  const startRestTimer = (exerciseId: string, targetRest: number) => {
    clearInterval(restIntervals.current[exerciseId])
    setRestTimers((prev) => ({ ...prev, [exerciseId]: 0 }))

    restIntervals.current[exerciseId] = setInterval(() => {
      setRestTimers((prev) => {
        const current = (prev[exerciseId] ?? 0) + 1
        if (current === targetRest && beepRef.current) beepRef.current.play().catch(() => {})
        return { ...prev, [exerciseId]: current }
      })
    }, 1000)
  }

  const handleCircle = (exIdx: number, setIdx: number) => {
    const exerciseId = training.exercises[exIdx].id
    startRestTimer(exerciseId, training.exercises[exIdx].rest)

    setPerformedReps((prev) => {
      const cp = prev.map((arr) => [...arr])
      const cur = cp[exIdx][setIdx]
      const max = training.exercises[exIdx].reps
      cp[exIdx][setIdx] = cur === null ? max : cur > 0 ? cur - 1 : null
      return cp
    })
  }

  const handleNoteChange = (index: number, val: string) => {
    setNotes((prev) => {
      const cp = [...prev]
      cp[index] = val
      return cp
    })
  }

  const handleFinish = async () => {
    if (!training) return

    const newId = crypto.randomUUID()
    const today = new Date().toISOString()

    const newExercises = training.exercises.map((e: Exercise, i) => {
      const repsDone = performedReps[i].map((r) => r ?? 0)
      const success = repsDone.every((r) => r >= e.reps)
      const newWeight = success ? e.weight + (e.overload ?? 2.5) : e.weight

      return {
        id: crypto.randomUUID(),
        training_id: newId,
        user_id: training.user_id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        weight: newWeight,
        rest: e.rest,
        overload: e.overload ?? 2.5,
        performed_reps: repsDone,
        notes: notes[i],
        use_custom: e.useCustom ?? false,
        previous_exercise_id: e.id,
      }
    })

    const { error: tErr } = await supabase.from('trainings').insert({
      id: newId,
      user_id: training.user_id,
      date: today,
      type: training.type,
      notes: training.notes ?? '',
      name: training.name ?? 'Naamloze training',
    })

    if (tErr) {
      alert('Fout bij opslaan training')
      return
    }

    const { error: eErr } = await supabase.from('exercises').insert(newExercises)

    if (eErr) {
      alert('Fout bij opslaan oefeningen')
      return
    }

    router.push('/dashboard')
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  if (!training) return <p className="text-white p-6">Laden…</p>

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <audio ref={beepRef} src="/beep.mp3" preload="auto" />

      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center px-3 py-1 bg-lime-600 text-black font-mono text-sm rounded-full shadow-sm">
          ⏱️ {fmt(elapsed)}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Training uitvoeren</h1>
      <p className="text-sm text-zinc-400 mb-6">
        {training.name ?? 'Naamloze training'} — {new Date(training.date).toLocaleDateString()}
      </p>

      {training.exercises.map((e: Exercise, exIdx: number) => {
        const success = performedReps[exIdx].every((r) => (r ?? 0) >= e.reps)
        const highlight = success ? 'border-green-500' : 'border-lime-400/60'

        return (
          <div key={e.id} className={`border ${highlight} rounded-lg bg-[#1e1e1e] p-4 mb-6 shadow-md`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lime-400 font-semibold text-lg">{e.name}</h2>
              <span className="text-xs text-zinc-400">{e.sets} sets • {e.reps} reps</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {performedReps[exIdx].map((rep, setIdx) => {
                const state = rep === null ? 'idle' : rep === 0 ? 'done' : 'act'
                const cls =
                  state === 'idle'
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-500'
                    : state === 'act'
                    ? 'bg-lime-600 border-lime-400'
                    : 'bg-green-500 text-black border-lime-400'
                return (
                  <button
                    key={setIdx}
                    onClick={() => handleCircle(exIdx, setIdx)}
                    className={`set-circle ${cls} border flex items-center justify-center`}
                  >
                    {rep !== null ? rep : setIdx + 1}
                  </button>
                )
              })}
            </div>

            <div className="text-sm mb-3">
              <p className="text-zinc-400">
                🕒 Rusttijd: {fmt(restTimers[e.id] ?? 0)} / {fmt(e.rest)}{' '}
                {restTimers[e.id] !== null && restTimers[e.id] >= e.rest && (
                  <span className="text-green-400 ml-2 font-semibold">🔔 Tijd om te liften!</span>
                )}
              </p>
            </div>

            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-zinc-300 mb-1">📝 Voeg een opmerking toe</summary>
              <textarea
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-2 text-sm mt-2"
                placeholder="Bijv. focus op houding, ademhaling, etc."
                value={notes[exIdx]}
                onChange={(e) => handleNoteChange(exIdx, e.target.value)}
              />
            </details>

            <div className="text-xs text-zinc-400">
              {e.weight} kg • {e.rest}s rust
            </div>
          </div>
        )
      })}

      <div className="flex gap-4 justify-between mt-6">
        <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-500">✅ Training afronden en herhalen</Button>
        <Button variant="outline" onClick={handleCancel}>❌ Annuleren</Button>
      </div>

      <style jsx>{`
        .set-circle {
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          font-weight: bold;
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  )
}
