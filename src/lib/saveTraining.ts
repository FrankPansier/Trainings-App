// ✅ saveTraining.ts – verwerkt previous_exercise_id en slaat training + oefeningen op

import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import type { Training, Exercise } from '@/app/types/training'

export async function saveTraining(training: Training) {
  const { id, userId, type, notes, date, exercises } = training

  // 🔹 1. Training opslaan
  const { error: trainingError } = await supabase.from('trainings').insert({
    id,
    user_id: userId,
    type,
    notes,
    date,
  })

  if (trainingError) throw new Error('Fout bij opslaan training: ' + trainingError.message)

  // 🔹 2. Oefeningen opslaan (incl. previous_exercise_id als die er is)
  const oefeningenInDb = exercises.map((ex) => ({
    id: uuidv4(),
    training_id: id,
    user_id: userId,
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.weight,
    rest: ex.rest,
    overload: ex.overload ?? 2.5,
    performed_reps: ex.performedReps ?? [],
    notes: ex.notes,
    use_custom: ex.useCustom ?? false,
    previous_exercise_id: ex.previous_exercise_id ?? null,
  }))

  const { error: oefError } = await supabase.from('exercises').insert(oefeningenInDb)
  if (oefError) throw new Error('Fout bij opslaan oefeningen: ' + oefError.message)
}
