export type BaseExercise = {
  name: string
  sets: number
  reps: number
  weight: number
  rest: number
  performedReps?: number[]
  overload?: number
  notes?: string
}

export type FitnessTraining = {
  id: string
  userId: string
  date: string
  type: 'fitness'
  notes?: string
  exercises: BaseExercise[]
}

export type CircuitTraining = {
  id: string
  userId: string
  date: string
  type: 'circuit'
  notes?: string
  exercises: BaseExercise[]
  rounds: number
  restBetweenRounds: number
}

export type RunningTraining = {
  id: string
  userId: string
  date: string
  type: 'running'
  notes?: string
  exercises: [] // leeg of optioneel
  distanceKm: number
  durationMinutes: number
  heartRateAvg?: number | null
}

export type AnyTraining = FitnessTraining | CircuitTraining | RunningTraining
