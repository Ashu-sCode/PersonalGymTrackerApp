import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Copy,
  Dumbbell,
  Edit3,
  ListFilter,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  type LucideIcon
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { calculateVolume } from "../algorithms/muscleScores";
import type { AppData } from "../hooks/useAppData";
import { deleteWorkout, updateWorkout } from "../services/workoutService";
import type { Workout, WorkoutDraftSet } from "../types";

type SortMode = "newest" | "oldest" | "volume";

const emptyDraft = (exerciseId = ""): WorkoutDraftSet => ({ exerciseId, sets: 3, reps: 10, weight: 0 });
const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "volume", label: "Highest volume" }
];

export function History({ data }: { data: AppData }) {
  const exerciseById = useMemo(() => new Map(data.exercises.map((exercise) => [exercise.id, exercise.name])), [data.exercises]);
  const muscleById = useMemo(() => new Map(data.muscles.map((muscle) => [muscle.id, muscle.name])), [data.muscles]);
  const primaryMuscleByExercise = useMemo(() => {
    const result = new Map<string, string>();
    for (const exercise of data.exercises) {
      const primary = data.mappings.filter((item) => item.exerciseId === exercise.id).sort((a, b) => b.contributionPercentage - a.contributionPercentage)[0];
      result.set(exercise.id, primary ? muscleById.get(primary.muscleId) ?? "General" : "General");
    }
    return result;
  }, [data.exercises, data.mappings, muscleById]);

  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortOpen, setSortOpen] = useState(false);
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

  const filteredWorkouts = workoutSummaries
    .filter(({ workout, exerciseNames }) => {
      const queryText = `${workout.notes ?? ""} ${exerciseNames.join(" ")}`.toLowerCase();
      const matchesQuery = query.trim() ? queryText.includes(query.trim().toLowerCase()) : true;
      const matchesDate = dateFilter ? workout.date === dateFilter : true;
      return matchesQuery && matchesDate;
    })
    .sort((a, b) => {
      if (sortMode === "volume") return b.volume - a.volume;
      return sortMode === "oldest" ? a.workout.date.localeCompare(b.workout.date) : b.workout.date.localeCompare(a.workout.date);
    });

  const visibleVolume = filteredWorkouts.reduce((sum, item) => sum + item.volume, 0);
  const visibleSets = filteredWorkouts.reduce((sum, item) => sum + item.sets.reduce((setSum, set) => setSum + set.sets, 0), 0);
  const selectedSortLabel = sortOptions.find((option) => option.value === sortMode)?.label ?? "Newest first";

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

  function resetFilters() {
    setQuery("");
    setDateFilter("");
    setSortMode("newest");
    setSortOpen(false);
  }

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-volt-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">TRAINING LOG</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">Workout History</h1>
            <p className="mt-2 text-sm text-[#A1A8B3]">Review, edit, and manage saved workouts.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <HistoryStat icon={ClipboardList} label="Sessions" value={filteredWorkouts.length.toString()} />
            <HistoryStat icon={Activity} label="Sets" value={visibleSets.toString()} />
            <HistoryStat icon={BarChart3} label="Volume" value={Math.round(visibleVolume).toLocaleString()} />
          </div>
        </div>
      </header>

      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922,#0F131A)] p-3 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_190px_auto]">
          <label className="flex h-12 items-center gap-3 rounded-[14px] border border-white/[0.05] bg-[#11161F] px-3 transition duration-200 focus-within:border-volt-500 focus-within:shadow-[0_0_0_4px_rgba(182,255,77,0.12)]">
            <Search size={18} className="shrink-0 text-[#6D7684]" />
            <input className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-[#6D7684]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercise or note" />
          </label>
          <label className="flex h-12 items-center gap-3 rounded-[14px] border border-white/[0.05] bg-[#11161F] px-3 transition duration-200 focus-within:border-volt-500 focus-within:shadow-[0_0_0_4px_rgba(182,255,77,0.12)]">
            <CalendarDays size={18} className="shrink-0 text-[#6D7684]" />
            <input className="min-w-0 flex-1 bg-transparent text-sm font-bold text-zinc-200 outline-none [color-scheme:dark]" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </label>
          <div className="relative">
            <button
              className="flex h-12 w-full items-center justify-between gap-3 rounded-[14px] border border-white/[0.05] bg-[#11161F] px-3 text-sm font-bold text-zinc-200 transition duration-200 hover:border-white/[0.08] focus:border-volt-500 focus:shadow-[0_0_0_4px_rgba(182,255,77,0.12)] focus:outline-none"
              onClick={() => setSortOpen((current) => !current)}
              type="button"
            >
              <span className="flex items-center gap-2">
                <ListFilter size={17} className="text-[#6D7684]" />
                {selectedSortLabel}
              </span>
              <ChevronDown className={`text-[#6D7684] transition ${sortOpen ? "rotate-180 text-volt-500" : ""}`} size={17} />
            </button>
            {sortOpen ? (
              <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#11161F] p-1 shadow-[0_18px_40px_rgba(0,0,0,.48)]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${sortMode === option.value ? "bg-volt-500/14 text-volt-500" : "text-[#A1A8B3] hover:bg-white/[0.05] hover:text-white"}`}
                    onClick={() => {
                      setSortMode(option.value);
                      setSortOpen(false);
                    }}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-white/[0.05] bg-[#11161F] px-4 text-sm font-black text-[#A1A8B3] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30 hover:bg-volt-500/10 hover:text-white" onClick={resetFilters}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </section>

      {notice ? <div className="rounded-[14px] border border-volt-500/20 bg-volt-500/10 px-4 py-3 text-sm font-bold text-volt-500 shadow-[0_8px_30px_rgba(0,0,0,.24)]">{notice}</div> : null}

      {filteredWorkouts.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922,#0F131A)] p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-volt-500/12 text-volt-500">
              <Dumbbell size={26} />
            </div>
            <h2 className="mt-4 text-2xl font-black text-white">No workouts found</h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">Try changing your filters or add a new workout.</p>
            <Link to="/add-workout" className="btn-primary mt-5 inline-flex items-center gap-2 px-4 py-2">
              <Plus size={18} /> Add workout
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredWorkouts.map(({ workout, sets, volume, exerciseNames }) => {
            const expanded = expandedWorkoutId === workout.id;
            const totalSets = sets.reduce((sum, set) => sum + set.sets, 0);
            const date = new Date(`${workout.date}T00:00:00`);
            const day = date.toLocaleDateString(undefined, { day: "2-digit" });
            const month = date.toLocaleDateString(undefined, { month: "short" });
            const year = date.toLocaleDateString(undefined, { year: "numeric" });
            const title = workout.notes || exerciseNames.slice(0, 2).join(" + ") || "Workout session";

            return (
              <section
                key={workout.id}
                className="group overflow-hidden rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30 hover:shadow-[0_14px_42px_rgba(0,0,0,.42)]"
              >
                <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                  <button className="min-w-0 flex-1 text-left" onClick={() => setExpandedWorkoutId(expanded ? null : workout.id)}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/[0.05] bg-[#11161F] text-center shadow-inner shadow-black/40">
                        <span className="text-lg font-black leading-none text-white">{day}</span>
                        <span className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">{month}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h2 className="truncate text-lg font-black text-white sm:text-xl">{title}</h2>
                          <span className="hidden rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-black text-zinc-500 sm:inline">{year}</span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-[#A1A8B3]">{exerciseNames.slice(0, 4).join(", ") || "No exercises logged"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Chip label={`${sets.length} exercises`} />
                      <Chip label={`${totalSets} sets`} />
                      <Chip label={`${Math.round(volume).toLocaleString()} volume`} accent />
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.05] bg-[#11161F] px-3 text-sm font-bold text-zinc-200 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.08] hover:bg-white/[0.06]" onClick={() => openEditor(workout)}>
                      <Edit3 size={16} /> Edit
                    </button>
                    <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-ember-500/15 bg-ember-500/10 px-3 text-sm font-bold text-[#FF6B6B] transition duration-200 hover:-translate-y-0.5 hover:bg-ember-500/15" onClick={() => setDeleteTarget(workout)}>
                      <Trash2 size={16} /> Delete
                    </button>
                    <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.05] bg-[#11161F] text-[#A1A8B3] transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white" onClick={() => setExpandedWorkoutId(expanded ? null : workout.id)} aria-label="Toggle session details">
                      <ChevronDown className={`transition ${expanded ? "rotate-180 text-volt-500" : ""}`} size={19} />
                    </button>
                  </div>
                </div>

                <div className={`grid transition-all duration-200 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-white/[0.06] px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-base font-black text-white">Session Details</h3>
                          <p className="mt-1 text-sm text-[#A1A8B3]">{workout.notes?.trim() ? workout.notes : "No notes added"}</p>
                        </div>
                        <div className="flex gap-2 text-xs font-bold text-zinc-500">
                          <Chip label={`${sets.length} movements`} />
                          <Chip label={`${Math.round(volume).toLocaleString()} volume`} accent />
                        </div>
                      </div>

                      <div className="grid gap-2 md:hidden">
                        {sets.map((set) => (
                          <ExerciseDetailCard key={set.id} exerciseName={exerciseById.get(set.exerciseId) ?? set.exerciseId} targetMuscle={primaryMuscleByExercise.get(set.exerciseId) ?? "General"} set={set} />
                        ))}
                      </div>

                      <div className="hidden overflow-x-auto rounded-2xl border border-white/[0.05] bg-[#11161F]/70 md:block">
                        <table className="w-full min-w-[760px] text-left text-sm">
                          <thead className="text-xs uppercase tracking-[0.14em] text-[#6D7684]">
                            <tr>
                              <th className="px-4 py-3">Exercise</th>
                              <th>Target</th>
                              <th>Sets</th>
                              <th>Reps</th>
                              <th>Weight</th>
                              <th>Volume</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.05]">
                            {sets.map((set) => (
                              <tr key={set.id} className="text-zinc-200">
                                <td className="px-4 py-3 font-bold text-white">{exerciseById.get(set.exerciseId) ?? set.exerciseId}</td>
                                <td className="text-zinc-400">{primaryMuscleByExercise.get(set.exerciseId) ?? "General"}</td>
                                <td>{set.sets}</td>
                                <td>{set.reps}</td>
                                <td>{set.weight}</td>
                                <td className="font-black text-volt-500">{Math.round(calculateVolume(set)).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {editingWorkout ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#151922,#0F131A)] shadow-[0_18px_60px_rgba(0,0,0,.55)] sm:max-w-4xl sm:rounded-[18px]">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] bg-white/[0.025] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-volt-500">Edit session</p>
                <h2 className="mt-1 text-2xl font-black">Workout details</h2>
              </div>
              <button className="rounded-[14px] border border-white/[0.05] bg-[#11161F] p-2 text-[#A1A8B3] transition hover:bg-white/[0.06] hover:text-white" onClick={() => setEditingWorkout(null)} aria-label="Close workout editor">
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
                  <div key={index} className="rounded-[18px] border border-white/[0.06] bg-[#11161F] p-3 shadow-[0_8px_30px_rgba(0,0,0,.22)]">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#A1A8B3]">Exercise {index + 1}</span>
                      <div className="flex gap-2">
                        <button className="rounded-[14px] border border-white/[0.05] bg-[#0F131A] p-2 text-[#A1A8B3] transition hover:bg-white/[0.06] hover:text-white" onClick={() => setEditSets((current) => current.flatMap((item, itemIndex) => (itemIndex === index ? [item, { ...item }] : [item])))} aria-label="Duplicate exercise">
                          <Copy size={16} />
                        </button>
                        <button className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 p-2 text-[#FF6B6B] transition hover:bg-ember-500/15" onClick={() => setEditSets((current) => (current.length === 1 ? [emptyDraft(data.exercises[0]?.id ?? "")] : current.filter((_, itemIndex) => itemIndex !== index)))} aria-label="Remove exercise">
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
            <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] bg-[#0F131A]/95 p-4 sm:flex-row sm:justify-end">
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
          <div className="w-full rounded-t-2xl border border-ember-500/20 bg-[linear-gradient(180deg,#151922,#0F131A)] p-4 shadow-[0_18px_60px_rgba(0,0,0,.55)] sm:max-w-md sm:rounded-[18px]">
            <h2 className="text-2xl font-black">Delete workout?</h2>
            <p className="mt-2 text-sm text-zinc-400">This removes the session and updates the muscle map recovery data.</p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className="btn-secondary px-4 py-2" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="rounded-[14px] bg-ember-500/20 px-4 py-2 font-bold text-[#FF6B6B] transition hover:bg-ember-500/25" onClick={confirmDeleteWorkout}>
                Delete workout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HistoryStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="group rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-volt-500/12 text-volt-500">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Chip({ label, accent = false }: { label: string; accent?: boolean }) {
  return <span className={`rounded-full px-3 py-1.5 text-xs font-black ${accent ? "bg-volt-500/12 text-volt-500" : "bg-white/[0.06] text-zinc-400"}`}>{label}</span>;
}

function ExerciseDetailCard({ exerciseName, targetMuscle, set }: { exerciseName: string; targetMuscle: string; set: WorkoutDraftSet }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-[#11161F]/80 p-3 shadow-[0_8px_30px_rgba(0,0,0,.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{exerciseName}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">{targetMuscle}</p>
        </div>
        <p className="text-sm font-black text-volt-500">{Math.round(calculateVolume(set)).toLocaleString()}</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniMetric label="Sets" value={set.sets.toString()} />
        <MiniMetric label="Reps" value={set.reps.toString()} />
        <MiniMetric label="Weight" value={set.weight.toString()} />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.045] px-2 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}
