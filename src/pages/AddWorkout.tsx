import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AppData } from "../hooks/useAppData";
import { addCustomExercise, addWorkout } from "../services/workoutService";
import type { WorkoutDraftSet } from "../types";

export function AddWorkout({ data }: { data: AppData }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [customName, setCustomName] = useState("");
  const [draftSets, setDraftSets] = useState<WorkoutDraftSet[]>([{ exerciseId: data.exercises[0]?.id ?? "", sets: 3, reps: 10, weight: 40 }]);

  function update(index: number, patch: Partial<WorkoutDraftSet>) {
    setDraftSets((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function save() {
    await addWorkout(date, notes, draftSets.filter((set) => set.exerciseId));
    await data.refresh();
    navigate("/dashboard");
  }

  async function createCustom() {
    if (!customName.trim()) return;
    const exercise = await addCustomExercise(customName.trim(), "Custom");
    setDraftSets((current) => [...current, { exerciseId: exercise.id, sets: 3, reps: 10, weight: 0 }]);
    setCustomName("");
    await data.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-3xl font-black">Add Workout</h1>
        <p className="mt-1 text-zinc-400">Multiple exercises, one fast entry flow.</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <label>
            <span className="mb-1 block text-sm text-zinc-400">Date</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm text-zinc-400">Notes</span>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional session notes" />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {draftSets.map((set, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[1fr_100px_100px_120px_42px]">
            <select className="input" value={set.exerciseId} onChange={(e) => update(index, { exerciseId: e.target.value })}>
              {data.exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
              ))}
            </select>
            <input className="input" type="number" min="1" value={set.sets} onChange={(e) => update(index, { sets: Number(e.target.value) })} aria-label="Sets" />
            <input className="input" type="number" min="1" value={set.reps} onChange={(e) => update(index, { reps: Number(e.target.value) })} aria-label="Reps" />
            <input className="input" type="number" min="0" value={set.weight} onChange={(e) => update(index, { weight: Number(e.target.value) })} aria-label="Weight" />
            <button className="rounded-lg border border-white/10 text-zinc-400 hover:text-ember-500" onClick={() => setDraftSets((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove exercise">
              <Trash2 className="mx-auto" size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn-secondary inline-flex items-center gap-2" onClick={() => setDraftSets((current) => [...current, { exerciseId: data.exercises[0]?.id ?? "", sets: 3, reps: 10, weight: 0 }])}>
          <Plus size={18} /> Add exercise
        </button>
        <button className="btn-primary inline-flex items-center gap-2" onClick={save}>
          <Save size={18} /> Save workout
        </button>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h2 className="mb-3 text-lg font-bold">Custom exercise</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="input" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Exercise name" />
          <button className="btn-secondary min-w-40" onClick={createCustom}>Create</button>
        </div>
      </div>
    </div>
  );
}
