'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function HerhaalTrainingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const trainingId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchAndCopy = async () => {
      if (!trainingId) return

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Niet ingelogd')
        return
      }

      setUserId(user.id)

      // Stap 1: Haal originele training op
      const { data: training, error: trainingError } = await supabase
        .from('trainings')
        .select('*, exercises(*)')
        .eq('id', trainingId)
        .single()

      if (trainingError || !training) {
        setError('Kon originele training niet vinden')
        setLoading(false)
        return
      }

      // Stap 2: Nieuwe training aanmaken met nieuwe ID
      const newTrainingId = uuidv4()
      const { error: insertTrainingError } = await supabase.from('trainings').insert([
        {
          id: newTrainingId,
          user_id: user.id,
          type: training.type,
          date: new Date().toISOString(),
          notes: training.notes || '',
        },
      ])

      if (insertTrainingError) {
        setError('Fout bij aanmaken training')
        setLoading(false)
        return
      }

      // Stap 3: Oefeningen kopiëren
      const oefeningen = training.exercises.map((oef: any) => ({
        id: uuidv4(),
        training_id: newTrainingId,
        user_id: user.id,
        name: oef.name,
        sets: oef.sets,
        reps: oef.reps,
        weight: oef.weight,
        rest: oef.rest,
        overload: oef.overload,
        performed_reps: '',
        notes: oef.notes,
        use_custom: oef.use_custom,
      }))

      const { error: insertExercisesError } = await supabase
        .from('exercises')
        .insert(oefeningen)

      if (insertExercisesError) {
        setError('Fout bij kopiëren van oefeningen')
        setLoading(false)
        return
      }

      // Stap 4: Doorsturen naar bewerkpagina (of detailpagina)
      router.push(`/training/${newTrainingId}`)
    }

    fetchAndCopy()
  }, [trainingId])

  if (loading) {
    return <p className="text-white text-center mt-10">Training wordt geladen en gekopieerd...</p>
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>
  }

  return null
}
