import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export async function saveTraining(training: {
  id: string
  userId: string
  date: string
  type: string
  notes?: string
  exercises: {
    name: string
    sets: number
    reps: number
    weight: number
    rest: number
    overload: number
    performedReps: number[]
    notes?: string
    useCustom: boolean
    previous_exercise_id?: string | null
  }[]
}) {
  const { id, userId, date, type, notes, exercises } = training

  // 🔹 1. Training opslaan
  const { error: tErr } = await supabase.from('trainings').insert([
    {
      id,
      user_id: userId,
      date,
      type,
      notes,
    },
  ])
  if (tErr) throw tErr

  // 🔹 2. Oefeningen koppelen aan training_id + nieuwe UUID + user_id
  const oefeningenMetId = exercises.map((oef) => ({
    id: uuidv4(),
    training_id: id,
    user_id: userId,
    name: oef.name,
    sets: oef.sets,
    reps: oef.reps,
    weight: oef.weight,
    rest: oef.rest,
    overload: oef.overload,
    performed_reps: oef.performedReps,
    notes: oef.notes,
    use_custom: oef.useCustom,
    previous_exercise_id: oef.previous_exercise_id ?? null,
  }))

  const { error: eErr } = await supabase.from('exercises').insert(oefeningenMetId)
  if (eErr) throw eErr
}
