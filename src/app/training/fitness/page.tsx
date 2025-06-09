'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function FitnessTrainingPage() {
  const [sets, setSets] = useState(3)
  const [repsPerSet, setRepsPerSet] = useState<number[]>([8, 8, 8])
  const [weightPerSet, setWeightPerSet] = useState<number[]>([60, 60, 60])
  const [note, setNote] = useState('')

  const handleRepClick = (index: number) => {
    setRepsPerSet((prev) => {
      const newReps = [...prev]
      newReps[index] = newReps[index] === 0 ? 8 : newReps[index] - 1
      return newReps
    })
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">🏋️‍♂️ Fitness Training</h1>

      {Array.from({ length: sets }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <button
            type="button"
            className={`w-12 h-12 rounded-full text-white font-bold text-lg transition-colors
              ${repsPerSet[i] === 0 ? 'bg-red-500' : repsPerSet[i] < 8 ? 'bg-orange-400' : 'bg-green-500'}`}
            onClick={() => handleRepClick(i)}
          >
            {repsPerSet[i]}
          </button>

          <Input
            type="number"
            value={weightPerSet[i]}
            onChange={(e) => {
              const newWeights = [...weightPerSet]
              newWeights[i] = Number(e.target.value)
              setWeightPerSet(newWeights)
            }}
            className="w-20"
            placeholder="kg"
          />
        </div>
      ))}

      <Textarea
        placeholder="Notities over techniek, gevoel, etc."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Button>Training opslaan</Button>
    </div>
  )
}
