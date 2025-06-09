'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'

export default function NewWorkoutPage() {
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [type, setType] = useState('Fitness')
  const [exercises, setExercises] = useState([
    { name: '', sets: 3, reps: '', weight: '', rest: '', overload: '', note: '' },
  ])

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: '', sets: 3, reps: '', weight: '', rest: '', overload: '', note: '' },
    ])
  }

  const updateExercise = (index: number, field: string, value: string) => {
    const updated = [...exercises]
    updated[index][field] = value
    setExercises(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      alert('Je bent niet ingelogd.')
      return
    }

    const { error } = await supabase.from('trainings').insert({
      user_id: user.id,
      title,
      type,
      created_at: new Date().toISOString(),
      exercises: JSON.stringify(exercises),
    })

    if (error) {
      console.error('Fout bij opslaan:', error)
      alert('Er is iets misgegaan bij het opslaan.')
    } else {
      alert('Training succesvol opgeslagen!')
      // eventueel: router.push('/dashboard')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Nieuwe Training</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Titel training" value={title} onChange={(e) => setTitle(e.target.value)} />
        
        {exercises.map((exercise, i) => (
          <div key={i} className="space-y-2 border rounded p-4">
            <Input
              placeholder="Naam oefening"
              value={exercise.name}
              onChange={(e) => updateExercise(i, 'name', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Sets"
              value={exercise.sets}
              onChange={(e) => updateExercise(i, 'sets', e.target.value)}
            />
            <Input
              placeholder="Reps"
              value={exercise.reps}
              onChange={(e) => updateExercise(i, 'reps', e.target.value)}
            />
            <Input
              placeholder="Gewicht (kg)"
              value={exercise.weight}
              onChange={(e) => updateExercise(i, 'weight', e.target.value)}
            />
            <Input
              placeholder="Overload (kg)"
              value={exercise.overload}
              onChange={(e) => updateExercise(i, 'overload', e.target.value)}
            />
            <Textarea
              placeholder="Notitie over techniek, gevoel, etc."
              value={exercise.note}
              onChange={(e) => updateExercise(i, 'note', e.target.value)}
            />
          </div>
        ))}

        <Button type="button" onClick={addExercise} variant="outline">
          + Oefening toevoegen
        </Button>
        <Button type="submit">Training opslaan</Button>
      </form>
    </div>
  )
}
