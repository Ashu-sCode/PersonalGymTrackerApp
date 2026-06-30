import { AlertTriangle, BarChart3, CalendarDays, ClipboardList, Copy, Dumbbell, Layers3, Plus, RotateCcw, Save, Trash2, X, type LucideIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const unitLabel = data.settings?.unitSystem ?? "kg";

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

  useEffect(() => {
    const templateId = searchParams.get("template");
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setDraftSets(template.sets.map((set) => ({ ...set })));
    setNotes(template.notes ?? `${template.day} - ${template.title} (${template.focus})`);
    setNotice(`Loaded ${template.day} ${template.title}. Add your working weights before saving.`);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, templates]);

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
    <div className="mx-auto max-w-[1180px] space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-volt-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">WORKOUT ENTRY</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">Add Workout</h1>
            <p className="mt-2 text-sm text-[#A1A8B3]">Fast logging with live volume, reusable loadouts, and mistake recovery.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[560px]">
            <EntryStat icon={ClipboardList} label="Exercises" value={validSets.length.toString()} />
            <EntryStat icon={Layers3} label="Sets" value={totalSets.toString()} />
            <EntryStat icon={BarChart3} label="Volume" value={`${Math.round(totalVolume).toLocaleString()} ${unitLabel}`} />
          </div>
        </div>
      </header>

      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="text-volt-500" size={19} />
          <h2 className="text-lg font-black text-white">Session setup</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <label>
            <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">Date</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">Notes</span>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional session notes" />
          </label>
        </div>
      </section>

      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-volt-500">Loadouts</p>
            <h2 className="mt-1 text-xl font-black text-white">Preloaded workout</h2>
            <p className="mt-1 text-sm text-[#A1A8B3]">Load the weekly routine, copy a plan, or save your own reusable workout.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary px-3 py-2 text-sm" onClick={() => openTemplateBuilder()}>
              New custom
            </button>
            <button className="btn-secondary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40" onClick={() => selectedTemplate && openTemplateBuilder(selectedTemplate)} disabled={!selectedTemplate}>
              {selectedTemplate?.isCustom ? "Edit custom" : "Copy selected"}
            </button>
            <button className="btn-primary px-3 py-2 text-sm" onClick={() => loadTemplate()}>
              Load selected
            </button>
            <button className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 px-3 py-2 text-sm font-black text-[#FF6B6B] transition hover:-translate-y-0.5 hover:bg-ember-500/15 disabled:cursor-not-allowed disabled:opacity-40" onClick={removeSelectedTemplate} disabled={!selectedTemplate?.isCustom}>
              Delete custom
            </button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(220px,320px)_1fr]">
          <label>
            <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">Routine day</span>
            <select className="input" value={selectedTemplateId} onChange={(event) => loadTemplate(event.target.value)}>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.day} - {template.title}{template.isCustom ? " (Custom)" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => loadTemplate(template.id)}
                className={`rounded-[18px] border p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,.22)] transition duration-200 hover:-translate-y-0.5 ${
                  selectedTemplateId === template.id ? "border-volt-500/35 bg-volt-500/10 text-white" : "border-white/[0.06] bg-[#11161F] text-zinc-300 hover:border-white/[0.08] hover:bg-white/[0.06]"
                }`}
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#6D7684]">{template.day}</span>
                <span className="mt-1 block font-black text-white">{template.title}</span>
                <span className="text-xs font-bold text-[#A1A8B3]">{template.focus}{template.isCustom ? " - Custom" : ""}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {builderOpen ? (
        <LoadoutModal
          builderMode={builderMode}
          data={data}
          templateTitle={templateTitle}
          templateDay={templateDay}
          templateFocus={templateFocus}
          templateNotes={templateNotes}
          templateSets={templateSets}
          setTemplateTitle={setTemplateTitle}
          setTemplateDay={setTemplateDay}
          setTemplateFocus={setTemplateFocus}
          setTemplateNotes={setTemplateNotes}
          setTemplateSets={setTemplateSets}
          updateTemplateSet={updateTemplateSet}
          saveTemplateBuilder={saveTemplateBuilder}
          close={() => setBuilderOpen(false)}
        />
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6D7684]">Builder</p>
            <h2 className="text-xl font-black text-white">Exercise sets</h2>
          </div>
          <button className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => setDraftSets((current) => [...current, initialDraft(data.exercises[0]?.id ?? "")])}>
            <Plus size={16} /> Add
          </button>
        </div>
        {draftSets.map((set, index) => {
          const rowVolume = calculateVolume(set);
          return (
            <div key={index} className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/25">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-volt-500/12 text-sm font-black text-volt-500">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="font-black text-white">Set group</p>
                    <p className="text-xs font-bold text-[#6D7684]">{Math.round(rowVolume).toLocaleString()} volume</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-[14px] border border-white/[0.05] bg-[#11161F] p-2 text-[#A1A8B3] transition hover:bg-white/[0.06] hover:text-white" onClick={() => duplicateSet(index)} aria-label="Duplicate exercise">
                    <Copy size={16} />
                  </button>
                  <button
                    className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 p-2 text-[#FF6B6B] transition hover:bg-ember-500/15 disabled:opacity-40"
                    onClick={() => setDraftSets((current) => (current.length === 1 ? [initialDraft(data.exercises[0]?.id ?? "")] : current.filter((_, itemIndex) => itemIndex !== index)))}
                    aria-label="Remove exercise"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <WorkoutSetFields data={data} set={set} unitLabel={unitLabel} update={(patch) => update(index, patch)} />
            </div>
          );
        })}
      </section>

      {notice ? <div className="rounded-[14px] border border-volt-500/20 bg-volt-500/10 px-4 py-3 text-sm font-bold text-volt-500 shadow-[0_8px_30px_rgba(0,0,0,.24)]">{notice}</div> : null}

      <div className="sticky bottom-3 z-10 flex flex-wrap gap-3 rounded-[18px] border border-white/[0.06] bg-[#0F131A]/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,.45)] backdrop-blur">
        <button className="btn-secondary inline-flex items-center gap-2" onClick={clearDraft}>
          <RotateCcw size={18} /> Reset draft
        </button>
        <button className="btn-primary inline-flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={save} disabled={!canSave}>
          <Save size={18} /> {saving ? "Saving..." : "Save workout"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-white">
            <Dumbbell className="text-volt-500" size={19} /> Custom exercise
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input className="input" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Exercise name" />
            <button className="btn-secondary min-w-40 disabled:opacity-50" onClick={createCustom} disabled={!customName.trim()}>
              Create
            </button>
          </div>
        </section>

        <section className="rounded-[18px] border border-ember-500/15 bg-[linear-gradient(180deg,rgba(255,91,74,0.08),rgba(15,19,26,1))] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-black text-[#FF6B6B]">
            <AlertTriangle size={19} /> Clear mistaken data
          </h2>
          <p className="mb-3 text-sm text-[#A1A8B3]">Remove workouts logged by mistake. This also updates recovery scores and the muscle map after refresh.</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select className="input" value={clearRange} onChange={(e) => setClearRange(e.target.value as ClearRange)}>
              <option value="day">Today only</option>
              <option value="week">Last 7 days</option>
            </select>
            <button className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 px-4 py-2 font-black text-[#FF6B6B] transition hover:-translate-y-0.5 hover:bg-ember-500/15" onClick={() => setConfirmClear(true)}>
              Clear range
            </button>
          </div>
          {confirmClear ? (
            <div className="mt-3 rounded-[18px] border border-ember-500/15 bg-[#11161F] p-3">
              <p className="text-sm text-zinc-200">Confirm clearing {clearRange === "day" ? "today's workouts" : "workouts from the last 7 days"}?</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
                <button className="rounded-[14px] bg-ember-500/20 px-3 py-2 text-sm font-bold text-[#FF6B6B]" onClick={clearRecentData}>
                  Yes, clear it
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function EntryStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30">
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-volt-500/12 text-volt-500">
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6D7684]">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <div className="mt-3 h-1 w-10 rounded-full bg-volt-500/70" />
    </div>
  );
}

function WorkoutSetFields({ data, set, unitLabel, update }: { data: AppData; set: WorkoutDraftSet; unitLabel: string; update: (patch: Partial<WorkoutDraftSet>) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_100px_100px_120px]">
      <label>
        <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">Exercise</span>
        <select className="input" value={set.exerciseId} onChange={(e) => update({ exerciseId: e.target.value })}>
          {data.exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </label>
      <NumberField label="Sets" value={set.sets} onChange={(value) => update({ sets: value })} min={1} />
      <NumberField label="Reps" value={set.reps} onChange={(value) => update({ reps: value })} min={1} />
      <NumberField label={`Weight (${unitLabel})`} value={set.weight} onChange={(value) => update({ weight: value })} min={0} allowDecimal />
    </div>
  );
}

function sanitizeNumberInput(value: string, allowDecimal: boolean) {
  const cleaned = value.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
  if (!allowDecimal) return cleaned.replace(/^0+(?=\d)/, "");
  const [head, ...tail] = cleaned.split(".");
  return `${head.replace(/^0+(?=\d)/, "")}${tail.length ? `.${tail.join("")}` : ""}`;
}

function NumberField({ label, value, min, allowDecimal = false, onChange }: { label: string; value: number; min: number; allowDecimal?: boolean; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit(nextValue: string) {
    if (nextValue === "" || nextValue === ".") return;
    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) return;
    const normalized = Math.max(min, allowDecimal ? parsed : Math.floor(parsed));
    onChange(normalized);
  }

  function normalize() {
    const parsed = Number(draft);
    const normalized = Number.isFinite(parsed) ? Math.max(min, allowDecimal ? parsed : Math.floor(parsed)) : min;
    setDraft(String(normalized));
    onChange(normalized);
  }

  return (
    <label>
      <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">{label}</span>
      <input
        className="input"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        min={min}
        value={draft}
        onBlur={normalize}
        onChange={(event) => {
          const nextValue = sanitizeNumberInput(event.target.value, allowDecimal);
          setDraft(nextValue);
          commit(nextValue);
        }}
      />
    </label>
  );
}

function LoadoutModal({
  builderMode,
  data,
  templateTitle,
  templateDay,
  templateFocus,
  templateNotes,
  templateSets,
  setTemplateTitle,
  setTemplateDay,
  setTemplateFocus,
  setTemplateNotes,
  setTemplateSets,
  updateTemplateSet,
  saveTemplateBuilder,
  close
}: {
  builderMode: TemplateBuilderMode;
  data: AppData;
  templateTitle: string;
  templateDay: string;
  templateFocus: string;
  templateNotes: string;
  templateSets: WorkoutDraftSet[];
  setTemplateTitle: (value: string) => void;
  setTemplateDay: (value: string) => void;
  setTemplateFocus: (value: string) => void;
  setTemplateNotes: (value: string) => void;
  setTemplateSets: Dispatch<SetStateAction<WorkoutDraftSet[]>>;
  updateTemplateSet: (index: number, patch: Partial<WorkoutDraftSet>) => void;
  saveTemplateBuilder: () => void;
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#151922,#0F131A)] shadow-[0_18px_60px_rgba(0,0,0,.55)] sm:max-w-4xl sm:rounded-[18px]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] bg-white/[0.025] p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-volt-500">{builderMode === "edit" ? "Edit custom loadout" : "Custom loadout builder"}</p>
            <h2 className="mt-1 text-2xl font-black">{builderMode === "edit" ? "Update preloaded workout" : "Add preloaded workout"}</h2>
            <p className="text-sm text-[#A1A8B3]">Add exercises here like a workout plan, then load it anytime.</p>
          </div>
          <button className="rounded-[14px] border border-white/[0.05] bg-[#11161F] p-2 text-[#A1A8B3] transition hover:bg-white/[0.06] hover:text-white" onClick={close} aria-label="Close loadout builder">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_150px_150px]">
            <TextField label="Loadout name" value={templateTitle} onChange={setTemplateTitle} placeholder="Workout name, e.g. Upper Power" />
            <TextField label="Day" value={templateDay} onChange={setTemplateDay} placeholder="Day" />
            <TextField label="Focus" value={templateFocus} onChange={setTemplateFocus} placeholder="Focus" />
          </div>
          <div className="mt-3">
            <TextField label="Template notes" value={templateNotes} onChange={setTemplateNotes} placeholder="Optional notes for this loadout" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-white">Exercises in loadout</h3>
              <button className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => setTemplateSets((current) => [...current, initialDraft(data.exercises[0]?.id ?? "")])}>
                <Plus size={16} /> Add exercise
              </button>
            </div>
            {templateSets.map((set, index) => (
              <div key={index} className="rounded-[18px] border border-white/[0.06] bg-[#11161F] p-3 shadow-[0_8px_30px_rgba(0,0,0,.22)]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#A1A8B3]">Exercise {index + 1}</span>
                  <button
                    className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 p-2 text-[#FF6B6B] transition hover:bg-ember-500/15"
                    onClick={() => setTemplateSets((current) => (current.length === 1 ? [initialDraft(data.exercises[0]?.id ?? "")] : current.filter((_, itemIndex) => itemIndex !== index)))}
                    aria-label="Remove loadout exercise"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <WorkoutSetFields data={data} set={set} unitLabel={data.settings?.unitSystem ?? "kg"} update={(patch) => updateTemplateSet(index, patch)} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] bg-[#0F131A]/95 p-4 sm:flex-row sm:justify-end">
          <button className="btn-secondary px-4 py-2" onClick={close}>
            Cancel
          </button>
          <button className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40" onClick={saveTemplateBuilder} disabled={!templateTitle.trim() || templateSets.every((set) => !set.exerciseId)}>
            {builderMode === "edit" ? "Update loadout" : "Save loadout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">{label}</span>
      <input className="input" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
