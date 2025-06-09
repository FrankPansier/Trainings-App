'use client'

import { useEffect, useState, useRef } from 'react'
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
  performedReps?: number[] | null[]
}

export default function ExecuteTrainingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [training, setTraining] = useState<any>(null)
  const [performedReps, setPerformedReps] = useState<(number | null)[][]>([])
  const [startTime] = useState<number>(Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [restTimers, setRestTimers] = useState<{ [key: string]: number }>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const trainingRef = useRef<any>(null)

  useEffect(() => {
    trainingRef.current = training
  }, [training])

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  useEffect(() => {
    if (id) {
      supabase
        .from('trainings')
        .select('*, exercises(*)')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setTraining(data)
            setPerformedReps(
              data.exercises.map((ex: Exercise) => Array(ex.sets).fill(null))
            )
          }
        })
    }
  }, [id])

  const handleSetClick = (exerciseIndex: number, setIndex: number) => {
    setPerformedReps((prev) => {
      const updated = prev.map((sets) => [...sets])
      const current = updated[exerciseIndex][setIndex]
      const maxReps = training.exercises[exerciseIndex].reps

      if (current === null) {
        updated[exerciseIndex][setIndex] = maxReps
      } else if (current > 1) {
        updated[exerciseIndex][setIndex] = current - 1
      } else if (current === 1) {
        updated[exerciseIndex][setIndex] = 0
      } else {
        updated[exerciseIndex][setIndex] = null
      }

      const allSetsDone = updated[exerciseIndex].every((val) => val === 0)
      if (allSetsDone) {
        const exId = training.exercises[exerciseIndex].id
        setRestTimers((prev) => ({ ...prev, [exId]: 0 }))
      }

      return updated
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRestTimers((prev) => {
        const updated: typeof prev = {}
        const currentTraining = trainingRef.current
        if (!currentTraining?.exercises) return prev

        for (const key in prev) {
          const current = prev[key]
          const exercise = currentTraining.exercises.find((e: Exercise) => e.id === key)
          if (exercise) {
            if (current === exercise.rest - 1 && audioRef.current) {
              audioRef.current.play().catch(() => {})
            }
            updated[key] = current + 1
          }
        }
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleFieldChange = async (exerciseId: string, field: keyof Exercise, value: number) => {
    await supabase
      .from('exercises')
      .update({ [field]: value })
      .eq('id', exerciseId)
  }

  const handleSubmit = async () => {
    if (!training) return

    const enrichedExercises = training.exercises.map((ex: Exercise, i: number) =>
      calculateOverload({
        ...ex,
        performedReps: performedReps[i].map((val) => val ?? 0),
      })
    )

    const { error } = await supabase.from('training_results').insert({
      training_id: training.id,
      user_id: training.user_id,
      date: new Date().toISOString(),
      exercises: enrichedExercises,
    })

    if (error) {
      console.error('Fout bij opslaan van resultaten:', error)
      alert('Opslaan mislukt')
    } else {
      alert('Training succesvol voltooid ✅')
      router.push('/dashboard')
    }
  }

  const renderTimer = () => {
    const minutes = Math.floor(elapsedSeconds / 60)
    const seconds = elapsedSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!training) return <p className="text-white p-4">Laden...</p>

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <audio ref={audioRef} src="/beep.mp3" preload="auto" />

      <div className="sticky top-0 bg-black z-10 p-2 mb-4 border-b border-zinc-700">
        <p className="text-center text-lime-400 font-mono">⏱️ Tijd: {renderTimer()}</p>
      </div>

      <h1 className="text-2xl font-bold mb-4">Training uitvoeren</h1>
      <p className="text-sm text-zinc-400 mb-4">
        {training.type} — {new Date(training.date).toLocaleDateString()}
      </p>

      {training.exercises.map((exercise: Exercise, i: number) => {
        const restTime = restTimers[exercise.id] ?? 0
        const restTarget = exercise.rest || 0
        const restDisplay = `${Math.floor(restTime / 60)}:${(restTime % 60).toString().padStart(2, '0')} / ${Math.floor(restTarget / 60)}:${(restTarget % 60).toString().padStart(2, '0')}`

        return (
          <div key={i} className="mb-6 border border-lime-600 p-4 rounded">
            <h2 className="text-lime-400 font-semibold mb-2">{exercise.name}</h2>

            <div className="flex gap-3 flex-wrap mb-3">
              {performedReps[i]?.map((reps, setIndex) => {
                const isStarted = reps !== null
                const isComplete = reps === 0

                return (
                  <button
                    key={setIndex}
                    onClick={() => handleSetClick(i, setIndex)}
                    className={`w-12 h-12 flex items-center justify-center rounded-full border text-sm font-bold transition-all
                      ${isComplete ? 'bg-lime-500 text-black border-lime-400'
                      : isStarted ? 'bg-lime-700 text-white border-lime-400'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-500'}`}
                  >
                    {isStarted ? reps : ''}
                  </button>
                )
              })}
            </div>

            <p className="text-sm text-zinc-400 mb-2">🕒 Rusttijd: {restDisplay}</p>

            <table className="w-full text-sm text-zinc-300">
              <thead>
                <tr>
                  <th className="text-left">Sets</th>
                  <th className="text-left">Reps</th>
                  <th className="text-left">Rust (s)</th>
                  <th className="text-left">Gewicht (kg)</th>
                  <th className="text-left">Overload</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="number" defaultValue={exercise.sets} onBlur={(e) => handleFieldChange(exercise.id, 'sets', Number(e.target.value))} className="bg-zinc-800 border border-zinc-600 p-1 w-full" /></td>
                  <td><input type="number" defaultValue={exercise.reps} onBlur={(e) => handleFieldChange(exercise.id, 'reps', Number(e.target.value))} className="bg-zinc-800 border border-zinc-600 p-1 w-full" /></td>
                  <td><input type="number" defaultValue={exercise.rest} onBlur={(e) => handleFieldChange(exercise.id, 'rest', Number(e.target.value))} className="bg-zinc-800 border border-zinc-600 p-1 w-full" /></td>
                  <td><input type="number" defaultValue={exercise.weight} onBlur={(e) => handleFieldChange(exercise.id, 'weight', Number(e.target.value))} className="bg-zinc-800 border border-zinc-600 p-1 w-full" /></td>
                  <td><input type="number" defaultValue={exercise.overload ?? 0} onBlur={(e) => handleFieldChange(exercise.id, 'overload', Number(e.target.value))} className="bg-zinc-800 border border-zinc-600 p-1 w-full" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      })}

      <Button onClick={handleSubmit} className="bg-lime-600 text-black mt-4">
        ✅ Training voltooien en opslaan
      </Button>
    </div>
  )
}
