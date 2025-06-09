'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/AuthProvider'
import { saveTrainingEntry } from '@/lib/saveTraining'
import { generateId, getNow } from '@/lib/utils'

export default function AddTrainingForm() {
  const { user } = useAuth()
  const router = useRouter()

  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [exercise, setExercise] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Niet ingelogd')
      return
    }

    const training = {
      id: generateId(),
      user_id: user.id,
      date: getNow(),
      exercise,
      sets,
      reps,
      weight,
      note,
    }

    const { error } = await saveTrainingEntry(training)

    if (error) {
      alert('Fout bij opslaan: ' + error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Oefening"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder="Aantal sets"
        value={sets}
        onChange={(e) => setSets(Number(e.target.value))}
        required
      />
      <Input
        type="text"
        placeholder="Herhalingen per set (bv. 10 / 8 / 6)"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Gewicht per set (bv. 60 / 65 / 70)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        required
      />
      <Textarea
        placeholder="Notities over techniek, gevoel, etc."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit">Training opslaan</Button>
    </form>
  )
}
