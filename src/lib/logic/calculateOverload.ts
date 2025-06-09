// src/lib/logic/calculateOverload.ts

type Exercise = {
  name: string
  sets: number
  reps: number
  weight: number
  rest: number
  performedReps?: number[]
  overload?: number // standaard 2.5
  notes?: string
}

type ProcessedExercise = Exercise & {
  success: boolean
  totalReps: number
  suggestedNextWeight: number
}

export function calculateOverload(exercise: Exercise): ProcessedExercise {
  const {
    sets,
    reps,
    weight,
    performedReps = [],
    overload = 2.5,
  } = exercise

  const success =
    performedReps.length === sets &&
    performedReps.every((r) => r >= reps)

  const totalReps = performedReps.reduce((sum, val) => sum + val, 0)

  return {
    ...exercise,
    success,
    totalReps,
    suggestedNextWeight: success ? weight + overload : weight,
  }
}
