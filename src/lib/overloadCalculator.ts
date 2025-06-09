// lib/logic/overloadCalculator.ts
export function calculateOverload(exercise) {
  const { reps, sets, performedReps, weight, overload = 2.5 } = exercise

  const success = performedReps.length === sets &&
    performedReps.every((r) => r >= reps)

  const totalReps = performedReps.reduce((sum, r) => sum + r, 0)

  return {
    ...exercise,
    success,
    totalReps,
    suggestedNextWeight: success ? weight + overload : weight,
  }
}
