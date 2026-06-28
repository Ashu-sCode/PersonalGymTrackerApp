import { Dumbbell, Save, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { AppData } from "../hooks/useAppData";
import { addCustomExercise, deleteExercise, replaceExerciseMuscleMap, updateExercise } from "../services/workoutService";

export function ExerciseLibrary({ data }: { data: AppData }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(data.exercises[0]?.id ?? "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Custom");
  const selected = data.exercises.find((exercise) => exercise.id === selectedId) ?? data.exercises[0];
  const selectedMappings = data.mappings.filter((mapping) => mapping.exerciseId === selected?.id);
  const [mappingDraft, setMappingDraft] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return data.exercises.filter((exercise) => exercise.name.toLowerCase().includes(lower) || exercise.category.toLowerCase().includes(lower));
  }, [data.exercises, query]);

  function selectExercise(exerciseId: string) {
    const exercise = data.exercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    setSelectedId(exercise.id);
    setName(exercise.name);
    setCategory(exercise.category);
    const next: Record<string, number> = {};
    data.mappings.filter((mapping) => mapping.exerciseId === exercise.id).forEach((mapping) => {
      next[mapping.muscleId] = mapping.contributionPercentage;
    });
    setMappingDraft(next);
  }

  async function createExercise() {
    if (!name.trim()) return;
    const exercise = await addCustomExercise(name.trim(), category.trim() || "Custom");
    setSelectedId(exercise.id);
    setMappingDraft({});
    await data.refresh();
  }

  async function saveExercise() {
    if (!selected) return;
    if (selected.isCustom) await updateExercise(selected.id, { name: name.trim() || selected.name, category: category.trim() || selected.category });
    await replaceExerciseMuscleMap(
      selected.id,
      Object.entries(mappingDraft).map(([muscleId, contributionPercentage]) => ({ muscleId, contributionPercentage }))
    );
    await data.refresh();
  }

  async function removeExercise() {
    if (!selected?.isCustom) return;
    await deleteExercise(selected.id);
    setSelectedId(data.exercises.find((exercise) => !exercise.isCustom)?.id ?? "");
    setName("");
    setCategory("Custom");
    setMappingDraft({});
    await data.refresh();
  }

  return (
    <div className="mx-auto grid max-w-[1180px] gap-5 xl:grid-cols-[360px_1fr]">
      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">EXERCISE LIBRARY</p>
        <h1 className="mt-2 text-3xl font-black text-white">Exercises</h1>
        <label className="mt-4 flex h-12 items-center gap-3 rounded-[14px] border border-white/[0.05] bg-[#11161F] px-3 focus-within:border-volt-500 focus-within:shadow-[0_0_0_4px_rgba(182,255,77,0.12)]">
          <Search size={18} className="text-[#6D7684]" />
          <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#6D7684]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises" />
        </label>
        <div className="mt-4 max-h-[62vh] space-y-2 overflow-y-auto pr-1">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              className={`w-full rounded-[14px] border p-3 text-left transition duration-200 hover:-translate-y-0.5 ${
                selected?.id === exercise.id ? "border-volt-500/35 bg-volt-500/10" : "border-white/[0.05] bg-[#11161F] hover:border-white/[0.08] hover:bg-white/[0.05]"
              }`}
              onClick={() => selectExercise(exercise.id)}
            >
              <span className="block font-black text-white">{exercise.name}</span>
              <span className="text-xs font-bold text-[#8B95A7]">{exercise.category}{exercise.isCustom ? " · Custom" : ""}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6D7684]">Mapping editor</p>
            <h2 className="mt-1 text-2xl font-black text-white">{selected?.name ?? "New custom exercise"}</h2>
            <p className="mt-1 text-sm text-[#A1A8B3]">Set muscle contributions so custom exercises update recovery and the heatmap.</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-volt-500/12 text-volt-500">
            <Dumbbell size={20} />
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">Name</span>
            <input className="input" value={name || selected?.name || ""} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">Category</span>
            <input className="input" value={category || selected?.category || ""} onChange={(event) => setCategory(event.target.value)} />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {data.muscles.map((muscle) => (
            <label key={muscle.id} className="rounded-[16px] border border-white/[0.05] bg-[#11161F] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-black text-white">{muscle.name}</span>
                <span className="text-xs font-bold text-[#8B95A7]">{mappingDraft[muscle.id] ?? selectedMappings.find((mapping) => mapping.muscleId === muscle.id)?.contributionPercentage ?? 0}%</span>
              </div>
              <input
                className="w-full accent-[#A8FF3D]"
                type="range"
                min="0"
                max="100"
                value={mappingDraft[muscle.id] ?? selectedMappings.find((mapping) => mapping.muscleId === muscle.id)?.contributionPercentage ?? 0}
                onChange={(event) => setMappingDraft((current) => ({ ...current, [muscle.id]: Number(event.target.value) }))}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="btn-secondary inline-flex items-center justify-center gap-2" onClick={createExercise}>
            <Dumbbell size={18} /> Create custom
          </button>
          <button className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 px-4 py-3 font-black text-[#FF6B6B] transition hover:-translate-y-0.5 hover:bg-ember-500/15 disabled:opacity-40" disabled={!selected?.isCustom} onClick={removeExercise}>
            <Trash2 className="mr-2 inline" size={18} /> Delete
          </button>
          <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={saveExercise} disabled={!selected}>
            <Save size={18} /> Save mapping
          </button>
        </div>
      </section>
    </div>
  );
}
