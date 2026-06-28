import { AlertTriangle, Copy, Dumbbell, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateVolume } from "../algorithms/muscleScores";
import { workoutTemplates as builtInWorkoutTemplates } from "../data/seed";
import type { AppData } from "../hooks/useAppData";
import { addCustomExercise, addWorkout, addWorkoutTemplate, clearWorkoutRange, deleteWorkoutTemplate, updateWorkoutTemplate } from "../services/workoutService";
import type { WorkoutDraftSet, WorkoutTemplate } from "../types";

type ClearRange = "day" | "week";
type TemplateBuilderMode = "create" | "edit";

const initialDraft = (exerciseId = ""): WorkoutDraftSet => ({ exerciseId, sets: 3, reps: 10, weight: 40 });

export function AddWorkout({ data }: { data: AppData }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [customName, setCustomName] = useState("");
  const [draftSets, setDraftSets] = useState<WorkoutDraftSet[]>([initialDraft(data.exercises[0]?.id ?? "")]);
  const [saving, setSaving] = useState(false);
  const [clearRange, setClearRange] = useState<ClearRange>("day");
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(builtInWorkoutTemplates[0]?.id ?? "");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderMode, setBuilderMode] = useState<TemplateBuilderMode>("create");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDay, setTemplateDay] = useState("Custom");
  const [templateFocus, setTemplateFocus] = useState("Custom");
  const [templateNotes, setTemplateNotes] = useState("");
  const [templateSets, setTemplateSets] = useState<WorkoutDraftSet[]>([initialDraft(data.exercises[0]?.id ?? "")]);

  const templates = useMemo(() => [...builtInWorkoutTemplates, ...data.workoutTemplates], [data.workoutTemplates]);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  const validSets = draftSets.filter((set) => set.exerciseId && set.sets > 0 && set.reps > 0 && set.weight >= 0);
  const totalVolume = validSets.reduce((sum, set) => sum + calculateVolume(set), 0);
  const totalSets = validSets.reduce((sum, set) => sum + Number(set.sets || 0), 0);
  const canSave = validSets.length > 0 && !saving;

  function update(index: number, patch: Partial<WorkoutDraftSet>) {
    setDraftSets((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    await addWorkout(date, notes, validSets);
    await data.refresh();
    setSaving(false);
    navigate("/dashboard");
  }

  async function createCustom() {
    if (!customName.trim()) return;
    const exercise = await addCustomExercise(customName.trim(), "Custom");
    setDraftSets((current) => [...current, { exerciseId: exercise.id, sets: 3, reps: 10, weight: 0 }]);
    setCustomName("");
    await data.refresh();
  }

  function duplicateSet(index: number) {
    setDraftSets((current) => {
      const next = [...current];
      next.splice(index + 1, 0, { ...current[index] });
      return next;
    });
  }

  function updateTemplateSet(index: number, patch: Partial<WorkoutDraftSet>) {
    setTemplateSets((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function openTemplateBuilder(source?: WorkoutTemplate) {
    const canEditSource = source?.isCustom;
    setBuilderMode(canEditSource ? "edit" : "create");
    setEditingTemplateId(canEditSource ? source.id : null);
    setTemplateTitle(source ? (canEditSource ? source.title : `${source.title} Custom`) : "");
    setTemplateDay(source?.day ?? "Custom");
    setTemplateFocus(source?.focus ?? "Custom");
    setTemplateNotes(source?.notes ?? "");
    setTemplateSets((source?.sets.length ? source.sets : validSets.length ? validSets : [initialDraft(data.exercises[0]?.id ?? "")]).map((set) => ({ ...set })));
    setBuilderOpen(true);
  }

  function loadTemplate(templateId = selectedTemplateId) {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setDraftSets(template.sets.map((set) => ({ ...set })));
    setNotes(template.notes ?? `${template.day} - ${template.title} (${template.focus})`);
    setNotice(`Loaded ${template.day} ${template.title}. Add your working weights before saving.`);
  }

  async function saveTemplateBuilder() {
    const cleanSets = templateSets.filter((set) => set.exerciseId && set.sets > 0 && set.reps > 0 && set.weight >= 0);
    if (!templateTitle.trim() || cleanSets.length === 0) return;
    const payload = {
      day: templateDay.trim() || "Custom",
      title: templateTitle.trim(),
      focus: templateFocus.trim() || "Custom",
      notes: templateNotes.trim() || undefined,
      sets: cleanSets
    };
    const template = builderMode === "edit" && editingTemplateId ? await updateWorkoutTemplate(editingTemplateId, payload) : await addWorkoutTemplate(payload);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setBuilderOpen(false);
    await data.refresh();
    setNotice(`${builderMode === "edit" ? "Updated" : "Saved"} ${template.title} as a preloaded workout.`);
  }

  async function removeSelectedTemplate() {
    if (!selectedTemplate?.isCustom) return;
    const removed = await deleteWorkoutTemplate(selectedTemplate.id);
    if (!removed) return;
    const fallbackTemplate = builtInWorkoutTemplates[0];
    setSelectedTemplateId(fallbackTemplate?.id ?? "");
    await data.refresh();
    setNotice(`Deleted ${selectedTemplate.title} from preloaded workouts.`);
  }

  function clearDraft() {
    setDraftSets([initialDraft(data.exercises[0]?.id ?? "")]);
    setNotes("");
    setNotice("Workout draft reset.");
  }

  async function clearRecentData() {
    const result = await clearWorkoutRange(clearRange);
    setConfirmClear(false);
    clearDraft();
    await data.refresh();
    setNotice(`Cleared ${result.workouts} workout${result.workouts === 1 ? "" : "s"} and ${result.sets} set${result.sets === 1 ? "" : "s"} from ${clearRange === "day" ? "today" : "the last 7 days"}.`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-volt-500">Workout entry</p>
          <h1 className="mt-1 text-3xl font-black">Add Workout</h1>
          <p className="mt-1 text-zinc-400">Fast logging with live volume and mistake recovery.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-72">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Sets</p>
            <p className="mt-1 text-xl font-black">{totalSets}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Volume</p>
            <p className="mt-1 text-xl font-black">{Math.round(totalVolume).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.12),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-4">
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

      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Preloaded workout</h2>
            <p className="text-sm text-zinc-400">Load the weekly routine, or save your own reusable workouts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary px-3 py-2 text-sm" onClick={() => openTemplateBuilder()}>
              New custom
            </button>
            <button className="btn-secondary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40" onClick={() => selectedTemplate && openTemplateBuilder(selectedTemplate)} disabled={!selectedTemplate}>
              {selectedTemplate?.isCustom ? "Edit custom" : "Copy selected"}
            </button>
            <button className="btn-secondary px-3 py-2 text-sm" onClick={() => loadTemplate()}>
              Load selected
            </button>
            <button className="btn-secondary border-ember-500/30 px-3 py-2 text-sm text-ember-500 hover:bg-ember-500/10 disabled:cursor-not-allowed disabled:opacity-40" onClick={removeSelectedTemplate} disabled={!selectedTemplate?.isCustom}>
              Delete custom
            </button>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,320px)_1fr]">
          <label>
            <span className="mb-1 block text-sm text-zinc-400">Routine day</span>
            <select className="input" value={selectedTemplateId} onChange={(event) => loadTemplate(event.target.value)}>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.day} - {template.title}{template.isCustom ? " (Custom)" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => loadTemplate(template.id)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  selectedTemplateId === template.id ? "border-volt-500/60 bg-volt-500/12 text-white" : "border-white/10 bg-white/[0.035] text-zinc-300 hover:bg-white/[0.07]"
                }`}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{template.day}</span>
                <span className="mt-1 block font-bold">{template.title}</span>
                <span className="text-xs text-zinc-400">{template.focus}{template.isCustom ? " - Custom" : ""}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {builderOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-2xl border border-white/10 bg-iron-900 shadow-2xl shadow-black/60 sm:max-w-4xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.035] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-volt-500">{builderMode === "edit" ? "Edit custom loadout" : "Custom loadout builder"}</p>
                <h2 className="mt-1 text-2xl font-black">{builderMode === "edit" ? "Update preloaded workout" : "Add preloaded workout"}</h2>
                <p className="text-sm text-zinc-400">Add exercises here like a workout plan, then load it anytime.</p>
              </div>
              <button className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" onClick={() => setBuilderOpen(false)} aria-label="Close loadout builder">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_150px_150px]">
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Loadout name</span>
                  <input className="input" value={templateTitle} onChange={(event) => setTemplateTitle(event.target.value)} placeholder="Workout name, e.g. Upper Power" />
                </label>
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Day</span>
                  <input className="input" value={templateDay} onChange={(event) => setTemplateDay(event.target.value)} placeholder="Day" />
                </label>
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Focus</span>
                  <input className="input" value={templateFocus} onChange={(event) => setTemplateFocus(event.target.value)} placeholder="Focus" />
                </label>
              </div>
              <label className="mt-3 block">
                <span className="mb-1 block text-sm text-zinc-400">Template notes</span>
                <input className="input" value={templateNotes} onChange={(event) => setTemplateNotes(event.target.value)} placeholder="Optional notes for this loadout" />
              </label>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">Exercises in loadout</h3>
                  <button className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => setTemplateSets((current) => [...current, initialDraft(data.exercises[0]?.id ?? "")])}>
                    <Plus size={16} /> Add exercise
                  </button>
                </div>
                {templateSets.map((set, index) => (
                  <div key={index} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-300">Exercise {index + 1}</span>
                      <button
                        className="rounded-md border border-white/10 p-2 text-zinc-400 transition hover:bg-ember-500/10 hover:text-ember-500"
                        onClick={() => setTemplateSets((current) => (current.length === 1 ? [initialDraft(data.exercises[0]?.id ?? "")] : current.filter((_, itemIndex) => itemIndex !== index)))}
                        aria-label="Remove loadout exercise"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_100px_100px_120px]">
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Exercise</span>
                        <select className="input" value={set.exerciseId} onChange={(event) => updateTemplateSet(index, { exerciseId: event.target.value })}>
                          {data.exercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Sets</span>
                        <input className="input" type="number" min="1" value={set.sets} onChange={(event) => updateTemplateSet(index, { sets: Number(event.target.value) })} />
                      </label>
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Reps</span>
                        <input className="input" type="number" min="1" value={set.reps} onChange={(event) => updateTemplateSet(index, { reps: Number(event.target.value) })} />
                      </label>
                      <label>
                        <span className="mb-1 block text-sm text-zinc-400">Weight</span>
                        <input className="input" type="number" min="0" value={set.weight} onChange={(event) => updateTemplateSet(index, { weight: Number(event.target.value) })} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-white/10 bg-iron-900/95 p-4 sm:flex-row sm:justify-end">
              <button className="btn-secondary px-4 py-2" onClick={() => setBuilderOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40" onClick={saveTemplateBuilder} disabled={!templateTitle.trim() || templateSets.every((set) => !set.exerciseId)}>
                {builderMode === "edit" ? "Update loadout" : "Save loadout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Exercise sets</h2>
          <button className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => setDraftSets((current) => [...current, initialDraft(data.exercises[0]?.id ?? "")])}>
            <Plus size={16} /> Add
          </button>
        </div>
        {draftSets.map((set, index) => {
          const rowVolume = calculateVolume(set);
          return (
            <div key={index} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-volt-500/15 text-sm font-black text-volt-500">{index + 1}</span>
                  <div>
                    <p className="font-bold">Set group</p>
                    <p className="text-xs text-zinc-500">{Math.round(rowVolume).toLocaleString()} volume</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" onClick={() => duplicateSet(index)} aria-label="Duplicate exercise">
                    <Copy size={16} />
                  </button>
                  <button
                    className="rounded-md border border-white/10 p-2 text-zinc-400 transition hover:bg-ember-500/10 hover:text-ember-500 disabled:opacity-40"
                    onClick={() => setDraftSets((current) => (current.length === 1 ? [initialDraft(data.exercises[0]?.id ?? "")] : current.filter((_, itemIndex) => itemIndex !== index)))}
                    aria-label="Remove exercise"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_100px_100px_120px]">
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Exercise</span>
                  <select className="input" value={set.exerciseId} onChange={(e) => update(index, { exerciseId: e.target.value })}>
                    {data.exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Sets</span>
                  <input className="input" type="number" min="1" value={set.sets} onChange={(e) => update(index, { sets: Number(e.target.value) })} />
                </label>
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Reps</span>
                  <input className="input" type="number" min="1" value={set.reps} onChange={(e) => update(index, { reps: Number(e.target.value) })} />
                </label>
                <label>
                  <span className="mb-1 block text-sm text-zinc-400">Weight</span>
                  <input className="input" type="number" min="0" value={set.weight} onChange={(e) => update(index, { weight: Number(e.target.value) })} />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {notice ? <div className="rounded-lg border border-volt-500/20 bg-volt-500/10 px-4 py-3 text-sm text-volt-500">{notice}</div> : null}

      <div className="sticky bottom-3 z-10 flex flex-wrap gap-3 rounded-lg border border-white/10 bg-iron-900/90 p-3 shadow-2xl shadow-black/35 backdrop-blur">
        <button className="btn-secondary inline-flex items-center gap-2" onClick={clearDraft}>
          <RotateCcw size={18} /> Reset draft
        </button>
        <button className="btn-primary inline-flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={save} disabled={!canSave}>
          <Save size={18} /> {saving ? "Saving..." : "Save workout"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Dumbbell size={19} /> Custom exercise
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input className="input" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Exercise name" />
            <button className="btn-secondary min-w-40 disabled:opacity-50" onClick={createCustom} disabled={!customName.trim()}>
              Create
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-ember-500/20 bg-ember-500/5 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-ember-500">
            <AlertTriangle size={19} /> Clear mistaken data
          </h2>
          <p className="mb-3 text-sm text-zinc-400">Remove workouts logged by mistake. This also updates recovery scores and the muscle map after refresh.</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select className="input" value={clearRange} onChange={(e) => setClearRange(e.target.value as ClearRange)}>
              <option value="day">Today only</option>
              <option value="week">Last 7 days</option>
            </select>
            <button className="btn-secondary border-ember-500/30 text-ember-500 hover:bg-ember-500/10" onClick={() => setConfirmClear(true)}>
              Clear range
            </button>
          </div>
          {confirmClear ? (
            <div className="mt-3 rounded-lg border border-ember-500/30 bg-black/20 p-3">
              <p className="text-sm text-zinc-200">Confirm clearing {clearRange === "day" ? "today's workouts" : "workouts from the last 7 days"}?</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
                <button className="rounded-md bg-ember-500 px-3 py-2 text-sm font-bold text-white" onClick={clearRecentData}>
                  Yes, clear it
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
