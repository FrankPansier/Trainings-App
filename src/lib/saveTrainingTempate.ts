// src/lib/saveTrainingTemplate.ts
import { supabase } from './supabaseClient'
import { TrainingTemplate } from '@/types/training'

export async function saveTrainingTemplate(template: TrainingTemplate) {
  const { error } = await supabase.from('training_templates').insert([template])
  if (error) throw error
}
