export type ExerciseTemplate = {
  id: string
  name: string
  sets: number
  targetReps: number[]
  targetWeights: number[]
  restSeconds: number
  customInterval?: {
    work: number
    rest: number
    rounds: number
    tempo?: string
  }
  notes?: string
  order: number
}

export type TrainingTemplate = {
  id: string
  name: string
  userId: string
  createdAt: string
  type: 'fitness'
  exercises: ExerciseTemplate[]
}
