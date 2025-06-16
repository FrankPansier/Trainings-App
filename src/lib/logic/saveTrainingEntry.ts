import { supabase } from '@/lib/supabaseClient'


export async function saveTrainingEntry(training: {
  id: string
  user_id: string
  date: string
  exercise: string
  sets: number
  reps: string
  weight: string
  note: string
}) {
  const { error } = await supabase.from('trainings').insert(training)
  return { error }
}
