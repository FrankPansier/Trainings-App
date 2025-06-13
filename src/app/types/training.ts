export type Exercise = {
  id?: string
  training_id?: string
  user_id?: string
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
}
