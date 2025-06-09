'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ExerciseCard from './ExerciseCard'

export default function TrainingForm() {
  const [exercises, setExercises] = useState<Exercise[]>([])

  const addExercise = () => {
    const newExercise = {
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      rest: 60,
      customInterval: false,
      order: exercises.length + 1
    }
    setExercises([...exercises, newExercise])
  }

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises]
    updated[index][field] = value
    setExercises(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Training opslaan:', exercises)
    // TODO: Supabase insert
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {exercises.map((exercise, i) => (
        <ExerciseCard
          key={i}
          index={i}
          exercise={exercise}
          onChange={updateExercise}
        />
      ))}

      <Button type="button" onClick={addExercise} variant="outline">
        Oefening toevoegen
      </Button>

      <Button type="submit">Training opslaan</Button>
    </form>
  )
}
