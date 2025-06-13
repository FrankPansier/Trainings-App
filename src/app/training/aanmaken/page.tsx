'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/providers/AuthProvider'
import { saveTraining } from '@/lib/saveTraining'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import ExerciseCard, { Exercise } from '@/components/ExerciseCard'
import { Input } from '@/components/ui/input'

export default function CreateTrainingLogPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [type, setType] = useState<'fitness' | 'circuit'>('fitness')
  const [notes, setNotes] = useState('')
  const [defaultSets, setDefaultSets] = useState(3)
  const [defaultReps, setDefaultReps] = useState(10)
  const [defaultWeight, setDefaultWeight] = useState(0)
  const [defaultRest, setDefaultRest] = useState(60)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  const updateExercise = (index: number, updated: Exercise) => {
    setExercises((prev) => {
      const copy = [...prev]
      copy[index] = updated
      return copy
    })
  }

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        name: '',
        sets: defaultSets,
        reps: defaultReps,
        weight: defaultWeight,
        rest: defaultRest,
        overload: 2.5,
        performedReps: [],
        notes: '',
        useCustom: false,
      },
    ])
  }

  const handleSave = async () => {
    if (!user || isSaving) return
    setIsSaving(true)

    const training = {
      id: uuidv4(),
      userId: user.id,
      date: new Date().toISOString(),
      type,
      notes,
      exercises,
    }

    try {
      await saveTraining(training)
      alert('Training opgeslagen ✅')
      router.push('/dashboard')
    } catch (err) {
      console.error('❌ Fout bij opslaan:', err)
      alert('Fout bij opslaan')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="text-center mt-10 text-white">Laden...</p>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold">Training aanmaken</h1>

      <div className="space-y-4 border border-lime-600 p-4 rounded-lg bg-zinc-900">
        <div>
          <label className="text-sm text-lime-400">Type Training:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'fitness' | 'circuit')}
            className="bg-black border border-lime-500 rounded px-2 py-1 w-full"
          >
            <option value="fitness">Fitness</option>
            <option value="circuit">Circuit</option>
          </select>
        </div>

        <h2 className="text-lime-400 font-semibold text-sm">
          Standaardwaarden voor nieuwe oefeningen:
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Sets"
            value={defaultSets}
            onChange={(e) => setDefaultSets(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Reps"
            value={defaultReps}
            onChange={(e) => setDefaultReps(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Gewicht (kg)"
            value={defaultWeight}
            onChange={(e) => setDefaultWeight(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Rust (sec)"
            value={defaultRest}
            onChange={(e) => setDefaultRest(Number(e.target.value))}
          />
        </div>

        <Textarea
          placeholder="Algemene opmerkingen"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {exercises.map((exercise, i) => (
          <ExerciseCard
            key={i}
            index={i}
            exercise={exercise}
            onChange={updateExercise}
            onRemove={removeExercise}
          />
        ))}

        <Button variant="outline" type="button" onClick={addExercise}>
          + Oefening toevoegen
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-lime-600 text-black mt-4"
        >
          {isSaving ? 'Bezig met opslaan...' : '✅ Training opslaan'}
        </Button>
      </div>
    </div>
  )
}
