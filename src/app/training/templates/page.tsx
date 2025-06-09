'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

type Exercise = {
  name: string
  sets: number
  reps: number
  rest: number
  customInterval?: boolean
  workDuration?: number
  restDuration?: number
  rounds?: number
  tempo?: string
  notes?: string
}

export default function CreateTrainingTemplatePage() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [type, setType] = useState('Fitness')
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 3, reps: 10, rest: 60 },
  ])

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: '', sets: 3, reps: 10, rest: 60 },
    ])
  }

  const updateExercise = (
    index: number,
    field: keyof Exercise,
    value: any
  ) => {
    const updated = [...exercises]
    updated[index][field] = value
    setExercises(updated)
  }

  const handleSave = async () => {
    if (!user) return alert('Niet ingelogd')

    const { error } = await supabase.from('training_templates').insert({
      user_id: user.id,
      name,
      type,
      exercises,
    })

    if (error) {
      console.error('Fout bij opslaan:', error)
      alert('Opslaan mislukt.')
    } else {
      alert('Training opgeslagen ✅')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Training aanmaken</h1>

      <div className="space-y-4 border border-lime-600 p-4 rounded-lg bg-zinc-900">
        <div>
          <label className="block text-sm text-lime-400">Type Training:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-black border border-lime-500 rounded px-2 py-1 w-full"
          >
            <option>Fitness</option>
            <option>Circuittraining</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-lime-400">Titel Workout:</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {exercises.map((ex, i) => (
          <div key={i} className="border-t border-lime-500 pt-4 mt-4 space-y-2">
            <h2 className="font-bold text-lime-400">Oefening {i + 1}</h2>

            <Input
              placeholder="Naam oefening"
              value={ex.name}
              onChange={(e) => updateExercise(i, 'name', e.target.value)}
            />
            <Input
              placeholder="Sets"
              type="number"
              value={ex.sets}
              onChange={(e) => updateExercise(i, 'sets', Number(e.target.value))}
            />
            <Input
              placeholder="Reps"
              type="number"
              value={ex.reps}
              onChange={(e) => updateExercise(i, 'reps', Number(e.target.value))}
            />
            <Input
              placeholder="Rusttijd (sec)"
              type="number"
              value={ex.rest}
              onChange={(e) => updateExercise(i, 'rest', Number(e.target.value))}
            />
            <Textarea
              placeholder="Opmerkingen"
              value={ex.notes || ''}
              onChange={(e) => updateExercise(i, 'notes', e.target.value)}
            />
          </div>
        ))}

        <Button type="button" onClick={addExercise} variant="outline">
          + Oefening toevoegen
        </Button>

        <Button onClick={handleSave} className="bg-lime-600 text-black mt-4">
          Training opslaan
        </Button>
      </div>
    </div>
  )
}
