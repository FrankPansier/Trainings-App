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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function CreateTrainingLogPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [type, setType] = useState<'fitness' | 'circuit'>('fitness')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [defaultSets, setDefaultSets] = useState(3)
  const [defaultReps, setDefaultReps] = useState(10)
  const [defaultWeight, setDefaultWeight] = useState(0)
  const [defaultRest, setDefaultRest] = useState(60)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [openItems, setOpenItems] = useState<string[]>([])

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
    setOpenItems((prev) => prev.filter((item) => item !== `exercise-${index}`))
  }

  const addExercise = () => {
    const newIndex = exercises.length
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
        customSets: [],
        customMode: false,
      },
    ])
  }

  const handleCustomToggle = (index: number, useCustom: boolean) => {
    updateExercise(index, { ...exercises[index], useCustom })
    const key = `exercise-${index}`
    if (useCustom) {
      setOpenItems((prev) => [...prev, key])
    } else {
      setOpenItems((prev) => prev.filter((item) => item !== key))
    }
  }

  const toggleCustomMode = (index: number, mode: boolean) => {
    updateExercise(index, { ...exercises[index], customMode: mode })
  }

  const handleSave = async () => {
    if (!user || isSaving) return
    setIsSaving(true)

    const training = {
      id: uuidv4(),
      userId: user.id,
      date: new Date().toISOString(),
      type,
      name,
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Training aanmaken</h1>
        <Link href="/dashboard" className="text-sm text-lime-400 underline">← Terug</Link>
      </div>

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

        <div>
          <label className="text-sm text-lime-400">Naam trainingsreeks:</label>
          <Input
            type="text"
            placeholder="Bijv. Full-Body Workout A, Push, Pull..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <h2 className="text-lime-400 font-semibold text-sm">
          Standaardwaarden voor nieuwe oefeningen:
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Aantal sets</label>
            <Input
              type="number"
              value={defaultSets}
              onChange={(e) => setDefaultSets(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Aantal herhalingen (reps)</label>
            <Input
              type="number"
              value={defaultReps}
              onChange={(e) => setDefaultReps(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Startgewicht (kg)</label>
            <Input
              type="number"
              value={defaultWeight}
              onChange={(e) => setDefaultWeight(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Rust tussen sets (seconden)</label>
            <Input
              type="number"
              value={defaultRest}
              onChange={(e) => setDefaultRest(Number(e.target.value))}
            />
          </div>
        </div>

        <Textarea
          placeholder="Algemene opmerkingen"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-2">
          {exercises.map((exercise, i) => {
            const accKey = `exercise-${i}`
            return (
              <AccordionItem value={accKey} key={i}>
                <AccordionTrigger>
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={exercise.useCustom}
                          onChange={(e) => handleCustomToggle(i, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs text-gray-300">Gebruik aangepaste instellingen</span>
                        <input
                          className="bg-transparent border-b border-lime-400 focus:outline-none text-white"
                          placeholder="Naam"
                          value={exercise.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateExercise(i, { ...exercise, name: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-1 items-center text-zinc-400">
                        <span className="text-sm">kg:</span>
                        <input
                          type="number"
                          className="bg-transparent border-b border-lime-400 w-16 focus:outline-none text-white"
                          value={exercise.weight}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateExercise(i, { ...exercise, weight: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                {exercise.useCustom && (
                  <AccordionContent>
                    <div className="mb-2">
                      <label className="text-xs text-gray-400">
                        <input
                          type="checkbox"
                          checked={exercise.customMode}
                          onChange={(e) => toggleCustomMode(i, e.target.checked)}
                          className="mr-2"
                        />
                        Aparte waarden per set (reps & gewicht)
                      </label>
                    </div>
                    <ExerciseCard
                      index={i}
                      exercise={exercise}
                      onChange={updateExercise}
                      onRemove={removeExercise}
                    />
                  </AccordionContent>
                )}
              </AccordionItem>
            )
          })}
        </Accordion>

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
