// src/components/ExerciseCard.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { calculateOverload } from '@/lib/logic/calculateOverload'

export type Exercise = {
  name: string
  sets: number
  reps: number | number[]
  weight: number | number[]
  rest: number
  overload?: number
  notes?: string
  useCustom?: boolean
  performedReps?: number[]
  customInterval?: boolean
  workDuration?: number
  restDuration?: number
  rounds?: number
  tempo?: string
  success?: boolean
  totalReps?: number
  suggestedNextWeight?: number
}

type Props = {
  index: number
  exercise: Exercise
  onChange: (index: number, updated: Exercise) => void
  onRemove?: (index: number) => void
}

export default function ExerciseCard({ index, exercise, onChange, onRemove }: Props) {
  const [local, setLocal] = useState<Exercise>(exercise)

  useEffect(() => {
    const updated = calculateOverload(local)
    onChange(index, updated)
  }, [local])

  const update = (field: keyof Exercise, value: any) => {
    setLocal((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayInput = (value: string) =>
    value.split(',').map((v) => Number(v.trim())).filter((n) => !isNaN(n))

  const handlePerformedRepChange = (setIndex: number, value: string) => {
    const repsArray = [...(local.performedReps || [])]
    repsArray[setIndex] = Number(value)
    update('performedReps', repsArray)
  }

  return (
    <div className="border border-lime-600 rounded-lg p-4 space-y-4 bg-zinc-900 relative">
      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          className="absolute top-2 right-3 text-red-400 hover:text-red-600 text-sm"
        >
          ❌ Verwijderen
        </button>
      )}

      <h2 className="text-lg font-semibold text-lime-400">Oefening {index + 1}</h2>

      <Field label="Naam oefening:">
        <Input
          placeholder="Bijv. Bench Press"
          value={local.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={local.useCustom ?? false}
          onChange={(e) => update('useCustom', e.target.checked)}
          className="accent-lime-500 w-4 h-4"
          id={`custom-toggle-${index}`}
        />
        <label htmlFor={`custom-toggle-${index}`} className="text-sm text-white">
          Geavanceerd schema (per set)?
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Aantal sets:">
          <Input
            type="number"
            value={local.sets}
            onChange={(e) => update('sets', Number(e.target.value))}
          />
        </Field>

        <Field label="Rust tussen sets (sec):">
          <Input
            type="number"
            value={local.rest}
            onChange={(e) => update('rest', Number(e.target.value))}
          />
        </Field>

        <Field label="Herhalingen per set:">
          {local.useCustom ? (
            <Input
              placeholder="Bijv. 12,10,8"
              value={Array.isArray(local.reps) ? local.reps.join(',') : ''}
              onChange={(e) => update('reps', handleArrayInput(e.target.value))}
            />
          ) : (
            <Input
              type="number"
              value={typeof local.reps === 'number' ? local.reps : ''}
              onChange={(e) => update('reps', Number(e.target.value))}
            />
          )}
        </Field>

        <Field label="Gewicht (kg):">
          {local.useCustom ? (
            <Input
              placeholder="Bijv. 60,65,70"
              value={Array.isArray(local.weight) ? local.weight.join(',') : ''}
              onChange={(e) => update('weight', handleArrayInput(e.target.value))}
            />
          ) : (
            <Input
              type="number"
              value={typeof local.weight === 'number' ? local.weight : ''}
              onChange={(e) => update('weight', Number(e.target.value))}
            />
          )}
        </Field>

        <Field label="Overload (optioneel):">
          <Input
            type="number"
            value={local.overload ?? ''}
            onChange={(e) => update('overload', Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Opmerkingen:">
        <Textarea
          value={local.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
        />
      </Field>

      <Field label="Uitgevoerde herhalingen per set:">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[...Array(local.sets)].map((_, i) => (
            <Input
              key={i}
              type="number"
              placeholder={`Set ${i + 1}`}
              value={local.performedReps?.[i] || ''}
              onChange={(e) => handlePerformedRepChange(i, e.target.value)}
            />
          ))}
        </div>
      </Field>

      <div className="flex items-center space-x-2 mt-2">
        <input
          type="checkbox"
          checked={local.customInterval}
          onChange={(e) => update('customInterval', e.target.checked)}
          className="accent-lime-500 w-4 h-4"
          id={`custom-interval-${index}`}
        />
        <label htmlFor={`custom-interval-${index}`} className="text-sm text-white">
          Custom Interval?
        </label>
      </div>

      {local.customInterval && (
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Werkduur (sec):">
            <Input
              type="number"
              value={local.workDuration || ''}
              onChange={(e) => update('workDuration', Number(e.target.value))}
            />
          </Field>

          <Field label="Rustduur (sec):">
            <Input
              type="number"
              value={local.restDuration || ''}
              onChange={(e) => update('restDuration', Number(e.target.value))}
            />
          </Field>

          <Field label="Aantal rondes:">
            <Input
              type="number"
              value={local.rounds || ''}
              onChange={(e) => update('rounds', Number(e.target.value))}
            />
          </Field>

          <Field label="Tempo (bijv. 2-1-2):">
            <Input
              value={local.tempo || ''}
              onChange={(e) => update('tempo', e.target.value)}
            />
          </Field>
        </div>
      )}

      {typeof local.totalReps === 'number' && (
        <div className="text-sm text-lime-300">
          🔢 Totaal herhalingen: {local.totalReps}
        </div>
      )}

      {typeof local.success === 'boolean' && (
        <div
          className={`text-sm font-bold ${local.success ? 'text-green-500' : 'text-red-500'}`}
        >
          {local.success ? 'Training gehaald ✅' : 'Niet gehaald ❌'}
        </div>
      )}

      {local.success && typeof local.suggestedNextWeight === 'number' && (
        <div className="text-sm text-lime-400">
          ➕ Volgende gewicht: {local.suggestedNextWeight} kg
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="text-lime-300">{label}</Label>
      {children}
    </div>
  )
}
