import { supabase } from '@/lib/supabaseClient'
import { AnyTraining } from '@/types/training'
import { v4 as uuidv4 } from 'uuid'
import { calculateOverload } from '@/lib/logic/calculateOverload'

export async function saveTraining(training: AnyTraining) {
  console.log('💡 training.userId:', training.userId)
  console.log('💡 training.id:', training.id)

  // Stap 1: Training opslaan
  const { error: trainingError } = await supabase.from('trainings').insert([
    {
      id: training.id,
      user_id: training.userId,
      date: training.date,
      type: training.type,
      notes: training.notes ?? '',
    },
  ])

  if (trainingError) {
    console.error('❌ Fout bij opslaan van training:', trainingError)
    throw trainingError
  }

  // Stap 2: Oefeningen verrijken
  const processedExercises = training.exercises.map((exercise) => {
    const enriched = calculateOverload(exercise)

    return {
      id: uuidv4(),
      training_id: training.id,
      user_id: training.userId,
      name: enriched.name,
      sets: enriched.sets ?? 0,
      reps: enriched.reps ?? 0,
      weight: enriched.weight ?? 0,
      rest: enriched.rest ?? 0,
      overload: enriched.overload ?? 0,
      performed_reps: enriched.performedReps?.join(',') ?? '',
      notes: enriched.notes ?? '',
      use_custom: enriched.useCustom ?? false,
    }
  })

  // Stap 3: Oefeningen invoegen
  const { error: exercisesError } = await supabase
    .from('exercises')
    .insert(processedExercises)

  if (exercisesError) {
    console.error('❌ Fout bij opslaan van oefeningen:', exercisesError)
    throw exercisesError
  }

  return { trainingId: training.id }
}
