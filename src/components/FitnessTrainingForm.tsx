'use client'

import { useState } from 'react'
import { FitnessTraining, FitnessExercise } from '@/types/training'
import { saveTraining } from '@/lib/saveTraining'
import { useAuth } from '@/providers/AuthProvider' // ✅ Nieuw toegevoegd

export default function FitnessTrainingForm() {
  const { user } = useAuth() // ✅ Hier halen we de ingelogde gebruiker op

  const [exercises, setExercises] = useState<FitnessExercise[]>([
    { name: '', targetReps: 5, actualReps: 0, weight: 0 }
  ])

  const handleChange = (index: number, field: keyof FitnessExercise, value: string | number) => {
    const updated = [...exercises]
    updated[index][field] = typeof value === 'string' && field !== 'name' ? Number(value) : value
    setExercises(updated)
  }

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: '', targetReps: 5, actualReps: 0, weight: 0 }
    ])
  }
  
  if (!user) {
    alert('Je moet ingelogd zijn om een training op te slaan.')
    return
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Je moet ingelogd zijn om je training op te slaan.')
      return
    }

    const training: FitnessTraining = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date().toISOString(),
      type: 'fitness',
      exercises
    }

    try {
      await saveTraining(training)
      console.log('✅ Training succesvol opgeslagen:', training)
      alert('Training opgeslagen!')
      setExercises([{ name: '', targetReps: 5, actualReps: 0, weight: 0 }])
    } catch (err) {
      console.error('❌ Fout bij opslaan van training:', err)
      alert('Er ging iets mis bij het opslaan.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold">Fitness Training Log</h2>

      {exercises.map((ex, index) => (
        <div key={index} className="border p-4 rounded space-y-2">
          <input
            type="text"
            value={ex.name}
            onChange={e => handleChange(index, 'name', e.target.value)}
            placeholder="Oefening"
            className="w-full border p-2"
          />
          <input
            type="number"
            value={ex.targetReps}
            onChange={e => handleChange(index, 'targetReps', e.target.value)}
            placeholder="Doel reps"
            className="w-full border p-2"
          />
          <input
            type="number"
            value={ex.actualReps}
            onChange={e => handleChange(index, 'actualReps', e.target.value)}
            placeholder="Gedane reps"
            className="w-full border p-2"
          />
          <input
            type="number"
            value={ex.weight}
            onChange={e => handleChange(index, 'weight', e.target.value)}
            placeholder="Gewicht (kg)"
            className="w-full border p-2"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addExercise}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Oefening toevoegen
      </button>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Training opslaan
      </button>
    </form>
  )
}
