// pages/training/[type].tsx

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import React from 'react'

// Optioneel: dynamisch importeren als je trainingscomponenten groot zijn
const FitnessTraining = dynamic(() => import('@/components/training/FitnessTraining'))
const CircuitTraining = dynamic(() => import('@/components/training/CircuitTraining'))

export default function TrainingPage() {
  const router = useRouter()
  const { type } = router.query

  if (!type || typeof type !== 'string') return <p>Type wordt geladen...</p>

  switch (type) {
    case 'fitness':
      return <FitnessTraining />
    case 'circuit':
      return <CircuitTraining />
    default:
      return <p>Onbekend trainingstype: {type}</p>
  }
}
