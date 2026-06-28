import { CalendarDays, ChevronDown, Copy, Edit3, Filter, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateVolume } from "../algorithms/muscleScores";
import type { AppData } from "../hooks/useAppData";
import { deleteWorkout, updateWorkout } from "../services/workoutService";
import type { Workout, WorkoutDraftSet } from "../types";

const emptyDraft = (exerciseId = ""): WorkoutDraftSet => ({ exerciseId, sets: 3, reps: 10, weight: 0 });

export function History({ data }: { data: AppData }) {
  const exerciseById = useMemo(() => new Map(data.exercises.map((exercise) => [exercise.id, exercise.name])), [data.exercises]);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(data.workouts[0]?.id ?? null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSets, setEditSets] = useState<WorkoutDraftSet[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);
  const [notice, setNotice] = useState("");

  const workoutSummaries = useMemo(
    () =>
      data.workouts.map((workout) => {
        const sets = data.sets.filter((set) => set.workoutId === workout.id);
        const volume = sets.reduce((sum, set) => sum + calculateVolume(set), 0);
        const exerciseNames = sets.map((set) => exerciseById.get(set.exerciseId) ?? set.exerciseId);
        return { workout, sets, volume, exerciseNames };
      }),
    [data.sets, data.workouts, exerciseById]
  );

  const filteredWorkouts = workoutSummaries.filter(({ workout, exerciseNames }) => {
    const queryText = `${workout.notes ?? ""} ${exerciseNames.join(" ")}`.toLowerCase();
    const matchesQuery = query.trim() ? queryText.includes(query.trim().toLowerCase()) : true;
    const matchesDate = dateFilter ? workout.date === dateFilter : true;
    return matchesQuery && matchesDate;
  });

  const visibleVolume = filteredWorkouts.reduce((sum, item) => sum + item.volume, 0);
  const visibleSets = filteredWorkouts.reduce((sum, item) => sum + item.sets.reduce((setSum, set) => setSum + set.sets, 0), 0);

  function openEditor(workout: Workout) {
    const sets = data.sets.filter((set) => set.workoutId === workout.id);
    setEditingWorkout(workout);
    setEditDate(workout.date);
    setEditNotes(workout.notes ?? "");
    setEditSets(sets.length ? sets.map(({ exerciseId, sets, reps, weight }) => ({ exerciseId, sets, reps, weight })) : [emptyDraft(data.exercises[0]?.id ?? "")]);
  }

  function updateEditSet(index: number, patch: Partial<WorkoutDraftSet>) {
    setEditSets((current) => current.map((set, setIndex) => (setIndex === index ? { ...set, ...patch } : set)));
  }

  async function saveEditedWorkout() {
    if (!editingWorkout) return;
    const validSets = editSets.filter((set) => set.exerciseId && set.sets > 0 && set.reps > 0 && set.weight >= 0);
    if (validSets.length === 0) return;
    await updateWorkout(editingWorkout.id, editDate, editNotes, validSets);
    setEditingWorkout(null);
    await data.refresh();
    setNotice("Workout updated. Recovery and history are refreshed.");
  }

  async function confirmDeleteWorkout() {
    if (!deleteTarget) return;
    await deleteWorkout(deleteTarget.id);
    setDeleteTarget(null);
    setExpandedWorkoutId((current) => (current === deleteTarget.id ? null : current));
    await data.refresh();
    setNotice("Workout deleted. Recovery scores were recalculated.");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-volt-500">Training log</p>
          <h1 className="mt-1 text-3xl font-black">Workout History</h1>
          <p className="mt-1 text-sm text-zinc-400">Review, edit, and clean up saved sessions.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Sessions" value={filteredWorkouts.length.toString()} />
          <Stat label="Sets" value={visibleSets.toString()} />
          <Stat label="Volume" value={Math.round(visibleVolume).toLocaleString()} />
        </div>
      </div>

      <section className="rounded-lg border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(182,255,77,0.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-3 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <label>
            <span className="mb-1 flex items-center gap-2 text-sm text-zinc-400">
              <Search size={15} /> Search
            </span>
            <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Exercise or note" />
          </label>
          <label>
            <span className="mb-1 flex items-center gap-2 text-sm text-zinc-400">
              <CalendarDays size={15} /> Date
            </span>
            <input className="input" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </label>
          <button className="btn-secondary mt-auto inline-flex items-center justify-center gap-2 px-3 py-2" onClick={() => { setQuery(""); setDateFilter(""); }}>
            <Filter size={16} /> Clear
          </button>
        </div>
      </section>

      {notice ? <div className="rounded-lg border border-volt-500/20 bg-volt-500/10 px-4 py-3 text-sm text-volt-500">{notice}</div> : null}

      {filteredWorkouts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8 text-center text-zinc-400">No workouts match this view.</div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map(({ workout, sets, volume, exerciseNames }) => {
            const expanded = expandedWorkoutId === workout.id;
            const totalSets = sets.reduce((sum, set) => sum + set.sets, 0);
            return (
              <section key={workout.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
                <button className="w-full p-4 text-left transition hover:bg-white/[0.035]" onClick={() => setExpandedWorkoutId(expanded ? null : workout.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-black">{new Date(`${workout.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</h2>
                      <p className="mt-1 line-clamp-1 text-sm text-zinc-400">{workout.notes || exerciseNames.slice(0, 3).join(", ") || "Workout session"}</p>
                    </div>
                    <ChevronDown className={`mt-1 shrink-0 text-zinc-500 transition ${expanded ? "rotate-180" : ""}`} size={20} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Metric label="Exercises" value={sets.length.toString()} />
                    <Metric label="Sets" value={totalSets.toString()} />
                    <Metric label="Volume" value={Math.round(volume).toLocaleString()} />
                  </div>
                </button>

                {expanded ? (
                  <div className="border-t border-white/10 p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => openEditor(workout)}>
                        <Edit3 size={16} /> Edit
                      </button>
                      <button className="btn-secondary border-ember-500/30 px-3 py-2 text-sm text-ember-500 hover:bg-ember-500/10" onClick={() => setDeleteTarget(workout)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                    <div className="space-y-2 md:hidden">
                      {sets.map((set) => (
                        <div key={set.id} className="rounded-lg border border-white/10 bg-black/15 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-bold">{exerciseById.get(set.exerciseId) ?? set.exerciseId}</p>
                            <p className="text-sm font-bold text-volt-500">{Math.round(calculateVolume(set)).toLocaleString()}</p>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            <Metric label="Sets" value={set.sets.toString()} />
                            <Metric label="Reps" value={set.reps.toString()} />
                            <Metric label="Weight" value={set.weight.toString()} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="text-zinc-400">
                          <tr>
                            <th className="py-2">Exercise</th>
                            <th>Sets</th>
                            <th>Reps</th>
                            <th>Weight</th>
                            <th>Volume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sets.map((set) => (
                            <tr key={set.id} className="border-t border-white/10">
                              <td className="py-3 font-medium">{exerciseById.get(set.exerciseId) ?? set.exerciseId}</td>
                              <td>{set.sets}</td>
                              <td>{set.reps}</td>
                              <td>{set.weight}</td>
                              <td>{Math.round(calculateVolume(set)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      {editingWorkout ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-2xl border border-white/10 bg-iron-900 shadow-2xl shadow-black/60 sm:max-w-4xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.035] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-volt-500">Edit session</p>
                <h2 className="mt-1 text-2xl font-black">Workout details</h2>
              </div>
              <button className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" onClick={() => setEditingWorkout(null)} aria-label="Close workout editor">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-4">
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Date</span>
                  <input className="input" type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} />
                </label>
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Notes</span>
                  <input className="input" value={editNotes} onChange={(event) => setEditNotes(event.target.value)} placeholder="Optional notes" />
                </label>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">Exercises</h3>
                  <button className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => setEditSets((current) => [...current, emptyDraft(data.exercises[0]?.id ?? "")])}>
                    <Plus size={16} /> Add
                  </button>
                </div>
                {editSets.map((set, index) => (
                  <div key={index} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-300">Exercise {index + 1}</span>
                      <div className="flex gap-2">
                        <button className="rounded-md border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" onClick={() => setEditSets((current) => current.flatMap((item, itemIndex) => (itemIndex === index ? [item, { ...item }] : [item])))} aria-label="Duplicate exercise">
                          <Copy size={16} />
                        </button>
                        <button className="rounded-md border border-white/10 p-2 text-zinc-400 transition hover:bg-ember-500/10 hover:text-ember-500" onClick={() => setEditSets((current) => (current.length === 1 ? [emptyDraft(data.exercises[0]?.id ?? "")] : current.filter((_, itemIndex) => itemIndex !== index)))} aria-label="Remove exercise">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_100px_100px_120px]">
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Exercise</span>
                        <select className="input" value={set.exerciseId} onChange={(event) => updateEditSet(index, { exerciseId: event.target.value })}>
                          {data.exercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Sets</span>
                        <input className="input" type="number" min="1" value={set.sets} onChange={(event) => updateEditSet(index, { sets: Number(event.target.value) })} />
                      </label>
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Reps</span>
                        <input className="input" type="number" min="1" value={set.reps} onChange={(event) => updateEditSet(index, { reps: Number(event.target.value) })} />
                      </label>
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Weight</span>
                        <input className="input" type="number" min="0" value={set.weight} onChange={(event) => updateEditSet(index, { weight: Number(event.target.value) })} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-white/10 bg-iron-900/95 p-4 sm:flex-row sm:justify-end">
              <button className="btn-secondary px-4 py-2" onClick={() => setEditingWorkout(null)}>
                Cancel
              </button>
              <button className="btn-primary px-4 py-2" onClick={saveEditedWorkout}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
          <div className="w-full rounded-t-2xl border border-ember-500/30 bg-iron-900 p-4 shadow-2xl shadow-black/60 sm:max-w-md sm:rounded-2xl">
            <h2 className="text-2xl font-black">Delete workout?</h2>
            <p className="mt-2 text-sm text-zinc-400">This removes the session and updates the muscle map recovery data.</p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className="btn-secondary px-4 py-2" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="rounded-md bg-ember-500 px-4 py-2 font-bold text-white" onClick={confirmDeleteWorkout}>
                Delete workout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black sm:text-xl">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-black/20 px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 font-black text-zinc-100">{value}</p>
    </div>
  );
}
