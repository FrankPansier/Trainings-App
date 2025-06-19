// app/progressie/[exerciseName]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Exercise {
  name: string;
  weight: number;
  reps: number;
  performed_reps: number[] | null;
}

interface Training {
  date: string;
  exercises: Exercise[];
}

export default function ProgressiePerOefening() {
  const { exerciseName } = useParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<
    { date: string; exercise: Exercise }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const {
        data,
        error,
      } = await supabase
        .from('trainings')
        .select(
          `
          date,
          exercises (
            name,
            weight,
            reps,
            performed_reps
          )
        `
        )
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching training data:', error);
        return;
      }

      const flattened: { date: string; exercise: Exercise }[] = [];

      data.forEach((training: Training) => {
        training.exercises.forEach((exercise) => {
          if (
            exercise.name.toLowerCase() ===
            (exerciseName as string).toLowerCase()
          ) {
            flattened.push({ date: training.date, exercise });
          }
        });
      });

      setFilteredData(flattened);
      setLoading(false);
    }

    fetchData();
  }, [exerciseName, supabase]);

  if (loading) return <p className="p-4">Gegevens worden geladen...</p>;

  if (filteredData.length === 0)
    return (
      <p className="p-4">
        Geen gegevens gevonden voor: <strong>{exerciseName}</strong>
      </p>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Progressie: {exerciseName}
      </h1>

      {/* Hier komt straks de grafiek */}
      <div className="bg-zinc-900 p-4 rounded-xl mb-6 shadow-inner">
        <p className="text-sm text-zinc-400 mb-2">📈 Gewicht over tijd (placeholder)</p>
        {/* TODO: Graph component */}
      </div>

      {/* Tabel met alle entries */}
      <div className="bg-zinc-900 p-4 rounded-xl shadow-md">
        <h2 className="text-lg font-medium mb-2">Historie</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-700">
              <th className="py-1">Datum</th>
              <th className="py-1">Gewicht</th>
              <th className="py-1">Reps</th>
              <th className="py-1">Uitgevoerd</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(({ date, exercise }, i) => (
              <tr key={i} className="border-b border-zinc-800">
                <td className="py-1">{new Date(date).toLocaleDateString()}</td>
                <td className="py-1">{exercise.weight} kg</td>
                <td className="py-1">{exercise.reps}</td>
                <td className="py-1">
                  {exercise.performed_reps?.join(', ') ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
