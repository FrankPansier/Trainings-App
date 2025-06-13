"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { saveTraining } from "@/lib/saveTraining";
import { Button } from "@/components/ui/button";
import ExerciseCard, { Exercise } from "@/components/ExerciseCard";

export default function HerhaalTrainingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [oefeningen, setOefeningen] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("fitness");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchTraining = async () => {
      if (!id || !user) return;

      const { data, error } = await supabase
        .from("trainings")
        .select("id, type, notes, exercises(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("Fout bij ophalen training:", error);
        return;
      }

      const aangepasteOefeningen = data.exercises.map((oef: Exercise) => {
        const gehaald =
          oef.performed_reps?.length > 0 &&
          oef.performed_reps.every((r: number) => r >= oef.reps);

        return {
          ...oef,
          id: uuidv4(),
          training_id: undefined,
          previous_exercise_id: oef.id,
          weight: gehaald ? oef.weight + (oef.overload ?? 2.5) : oef.weight,
          performedReps: [],
        };
      });

      setOefeningen(aangepasteOefeningen);
      setNotes(data.notes ?? "");
      setType(data.type ?? "fitness");
      setLoading(false);
    };

    fetchTraining();
  }, [id, user]);

  const handleSave = async () => {
    if (!user) return;

    const nieuweTraining = {
      id: uuidv4(),
      userId: user.id,
      date: new Date().toISOString(),
      type,
      notes,
      exercises: oefeningen,
    };

    await saveTraining(nieuweTraining);
    router.push("/dashboard");
  };

  if (loading || isLoading) return <p className="text-white text-center mt-10">Laden...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Herhaal training</h1>
      {oefeningen.map((exercise, index) => (
        <ExerciseCard
          key={index}
          index={index}
          exercise={exercise}
          onChange={(i, oef) => {
            const kopie = [...oefeningen];
            kopie[i] = oef;
            setOefeningen(kopie);
          }}
          onRemove={(i) => {
            const kopie = [...oefeningen];
            kopie.splice(i, 1);
            setOefeningen(kopie);
          }}
        />
      ))}
      <Button onClick={handleSave} className="mt-6 bg-lime-600 text-black">
        ✅ Opslaan als nieuwe training
      </Button>
    </div>
  );
}
