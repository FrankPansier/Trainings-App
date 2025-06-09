// Algemene metadata voor een training
export interface TrainingMeta {
  id: string
  userId: string
  date: string
  type: TrainingType
  notes?: string
}

// Soorten trainingsvormen
export type TrainingType = 'fitness' | 'circuit' | 'running' | 'hiit' | 'kettlebell'

// ✅ FITNESS
export interface FitnessExercise {
  name: string
  sets: FitnessSet[]
  restSeconds: number
}

export interface FitnessSet {
  targetReps: number
  actualReps?: number // wordt ingevuld bij logging
  weightKg: number
}

export interface FitnessTraining extends TrainingMeta {
  type: 'fitness'
  exercises: FitnessExercise[]
}

// ✅ CIRCUIT
export interface CircuitExercise {
  name: string
  durationSeconds: number // actieve tijd
  restAfterSeconds: number // rust ná deze oefening
}

export interface CircuitTraining extends TrainingMeta {
  type: 'circuit'
  rounds: number
  restBetweenRounds: number
  exercises: CircuitExercise[]
}

// ✅ RUNNING
export interface RunningTraining extends TrainingMeta {
  type: 'running'
  distanceKm: number
  durationMinutes: number
  heartRateAvg?: number
}

// ✅ HIIT (voorbeeld: alleen structuur)
export interface HiiTTraining extends TrainingMeta {
  type: 'hiit'
  exercises: {
    name: string
    workSeconds: number
    restSeconds: number
  }[]
}

// ✅ KETTLEBELL (voorbeeld)
export interface KettlebellTraining extends TrainingMeta {
  type: 'kettlebell'
  exercises: {
    name: string
    intervalType: 'emom' | 'tabata'
    durationMinutes: number
    repsPerInterval: number
  }[]
}

// ✅ Union van alle trainingsvormen
export type AnyTraining =
  | FitnessTraining
  | CircuitTraining
  | RunningTraining
  | HiiTTraining
  | KettlebellTraining
