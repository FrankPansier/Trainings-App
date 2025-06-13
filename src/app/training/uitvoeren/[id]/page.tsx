'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { calculateOverload } from '@/lib/logic/calculateOverload'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest: number
  weight: number
  overload?: number
  performedReps?: (number | null)[]
}

/* -------------------- helpers -------------------- */
const debounce = <T extends (...args: any[]) => void>(fn: T, ms = 600) => {
  let h: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(h)
    h = setTimeout(() => fn(...args), ms)
  }
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
/* ------------------------------------------------- */

export default function ExecuteTrainingPage() {
  const { id } = useParams()
  const router = useRouter()

  const [training, setTraining] = useState<any>(null)
  const [performedReps, setPerformedReps] = useState<(number | null)[][]>([])
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [restTimers, setRestTimers] = useState<Record<string, number | null>>({})

  const trainingRef = useRef<any>()
  const beepRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    trainingRef.current = training
  }, [training])

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startTime])

  useEffect(() => {
    const id = setInterval(() => {
      setRestTimers((prev) => {
        const cur = trainingRef.current
        if (!cur) return prev
        const next = { ...prev }
        cur.exercises.forEach((e: Exercise) => {
          if (prev[e.id] !== null) {
            const v = (prev[e.id] ?? 0) + 1
            if (v === e.rest && beepRef.current) beepRef.current.play().catch(() => {})
            next[e.id] = v
          }
        })
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!id) return

    ;(async () => {
      console.log('Training ID uit URL:', id)

      const { data: trainingData, error: trainingError } = await supabase
        .from('trainings')
        .select('*, exercises(*)')
        .eq('id', id)
        .single()

      if (trainingError) {
        console.error('❌ Fout bij ophalen training:', trainingError.message)
        return
      }

      if (!trainingData) {
        console.warn('⚠️ Geen training gevonden.')
        return
      }

      let exercises: Exercise[] = []

      if (trainingData.exercises?.length) {
        exercises = trainingData.exercises
      } else {
        const { data: fallbackExercises, error: fallbackError } = await supabase
          .from('exercises')
          .select('*')
          .eq('training_id', id)

        if (fallbackError) {
          console.error('❌ Fout bij ophalen losse oefeningen:', fallbackError.message)
        }
        exercises = fallbackExercises ?? []
      }

      console.log('✅ Oefeningen opgehaald:', exercises)

      setTraining({ ...trainingData, exercises })
      setPerformedReps(exercises.map((e) => Array(e.sets).fill(null)))

      const initialTimers: Record<string, number | null> = {}
      exercises.forEach((e) => (initialTimers[e.id] = null))
      setRestTimers(initialTimers)
    })()
  }, [id])

  const handleCircle = (exIdx: number, setIdx: number) => {
    setPerformedReps((prev) => {
      const cp = prev.map((arr) => [...arr])
      const cur = cp[exIdx][setIdx]
      const max = training.exercises[exIdx].reps
      cp[exIdx][setIdx] = cur === null ? max : cur > 0 ? cur - 1 : null
      if (cp[exIdx][setIdx] === 0) {
        setRestTimers((rt) => ({
          ...rt,
          [training.exercises[exIdx].id]: 0,
        }))
      }
      return cp
    })
  }

  const saveField = useCallback(
    debounce((exId: string, field: keyof Exercise, val: number) => {
      supabase.from('exercises').update({ [field]: val }).eq('id', exId)
    }),
    []
  )

  const handleField = (exId: string, field: keyof Exercise, val: number) => {
    setTraining((p: any) => {
      if (!p) return p
      const idx = p.exercises.findIndex((e: Exercise) => e.id === exId)
      const exArr = [...p.exercises]
      exArr[idx] = { ...exArr[idx], [field]: val }
      return { ...p, exercises: exArr }
    })
    saveField(exId, field, val)
  }

  const handleFinish = async () => {
    if (!training) return
    const enriched = training.exercises.map((e: Exercise, i) =>
      calculateOverload({ ...e, performedReps: performedReps[i].map((v) => v ?? 0) })
    )
    const { error } = await supabase.from('training_results').insert({
      training_id: training.id,
      user_id: training.user_id,
      date: new Date().toISOString(),
      exercises: enriched,
    })

    if (error) alert('Opslaan mislukt')
    else router.push('/dashboard')
  }

  if (!training) return <p className="text-white p-6">Laden…</p>

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <audio ref={beepRef} src="/beep.mp3" preload="auto" />

      <div className="sticky top-0 bg-black font-mono text-lime-400 text-center p-2 mb-4">
        ⏱️ Tijd: {fmt(elapsed)}
      </div>

      <h1 className="text-2xl font-bold mb-4">Training uitvoeren</h1>
      <p className="text-sm text-zinc-400 mb-6">
        {training.type} — {new Date(training.date).toLocaleDateString()}
      </p>

      {training.exercises.map((e: Exercise, exIdx: number) => (
        <div key={e.id} className="border border-lime-600 rounded p-4 mb-6">
          <h2 className="text-lime-400 font-semibold mb-3">{e.name}</h2>

          <div className="flex flex-wrap gap-3 mb-4">
            {performedReps[exIdx].map((rep, setIdx) => {
              const state = rep === null ? 'idle' : rep === 0 ? 'done' : 'act'
              const cls =
                state === 'idle'
                  ? 'bg-zinc-800 border-zinc-500 text-zinc-500'
                  : state === 'act'
                  ? 'bg-lime-600 border-lime-400'
                  : 'bg-lime-500 text-black border-lime-400'
              return (
                <button
                  key={setIdx}
                  onClick={() => handleCircle(exIdx, setIdx)}
                  className={`w-12 h-12 rounded-full border font-bold flex items-center justify-center ${cls}`}
                >
                  {rep ?? ''}
                </button>
              )
            })}
          </div>

          <p className="text-sm text-zinc-400 mb-2">
            🕒 Rusttijd: {fmt(restTimers[e.id] ?? 0)} / {fmt(e.rest)}
          </p>

          <table className="w-full text-sm text-zinc-300 mb-2">
            <thead>
              <tr className="bg-zinc-800">
                <th className="text-left p-1">Sets</th>
                <th className="p-1">Reps</th>
                <th className="p-1">Gewicht (kg)</th>
                <th className="p-1">Rust (s)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1">{e.sets}</td>
                <td className="p-1">
                  <input
                    type="number"
                    value={e.reps}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1"
                    onChange={(ev) => handleField(e.id, 'reps', parseInt(ev.target.value))}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    value={e.weight}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1"
                    onChange={(ev) => handleField(e.id, 'weight', parseInt(ev.target.value))}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    value={e.rest}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1"
                    onChange={(ev) => handleField(e.id, 'rest', parseInt(ev.target.value))}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      <Button onClick={handleFinish}>Training afronden</Button>
    </div>
  )
}
