import { Edit3, Ruler, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppData } from "../hooks/useAppData";
import { addMeasurement, deleteMeasurement, updateMeasurement } from "../services/workoutService";
import type { BodyMeasurement } from "../types";

const fields: Array<keyof Omit<BodyMeasurement, "id" | "userId" | "date" | "synced">> = ["bodyWeight", "chest", "waist", "arms", "thighs", "shoulders", "calves"];

export function Measurements({ data }: { data: AppData }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Record<string, string>>({});
  const unit = data.settings?.unitSystem ?? "kg";

  useEffect(() => {
    if (!editingId) return;
    const row = data.measurements.find((measurement) => measurement.id === editingId);
    if (!row) return;
    setDate(row.date);
    const next: Record<string, string> = {};
    fields.forEach((field) => {
      next[field] = row[field] ? String(row[field]) : "";
    });
    setValues(next);
  }, [data.measurements, editingId]);

  async function save() {
    const payload = fields.reduce<Record<string, number | undefined>>((acc, field) => {
      acc[field] = values[field] ? Number(values[field]) : undefined;
      return acc;
    }, {});
    if (editingId) await updateMeasurement(editingId, { date, ...payload });
    else await addMeasurement({ date, ...payload });
    setValues({});
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    await data.refresh();
  }

  async function remove(id: string) {
    await deleteMeasurement(id);
    await data.refresh();
  }

  return (
    <div className="mx-auto grid max-w-[1180px] gap-5 xl:grid-cols-[400px_1fr]">
      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">BODY METRICS</p>
        <h1 className="mt-2 text-3xl font-black text-white">{editingId ? "Edit Measurement" : "Measurements"}</h1>
        <label className="mt-5 block">
          <span className="mb-1 block text-sm font-bold text-[#A1A8B3]">Date</span>
          <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {fields.map((field) => (
            <label key={field}>
              <span className="mb-1 block text-sm font-bold capitalize text-[#A1A8B3]">{field.replace(/([A-Z])/g, " $1")} {field === "bodyWeight" ? `(${unit})` : ""}</span>
              <input className="input" type="number" min="0" value={values[field] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} />
            </label>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          {editingId ? (
            <button className="btn-secondary flex-1" onClick={() => { setEditingId(null); setValues({}); }}>
              Cancel
            </button>
          ) : null}
          <button onClick={save} className="btn-primary inline-flex flex-1 items-center justify-center gap-2">
            <Save size={18} /> {editingId ? "Update" : "Save"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6D7684]">Progress log</p>
          <h2 className="mt-1 text-2xl font-black text-white">{data.measurements.length} entries</h2>
        </div>
        {data.measurements.length ? (
          data.measurements.map((measurement) => (
            <article key={measurement.id} className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-volt-500/12 text-volt-500">
                    <Ruler size={19} />
                  </span>
                  <div>
                    <h3 className="font-black text-white">{measurement.date}</h3>
                    <p className="text-sm text-[#8B95A7]">Weight {measurement.bodyWeight ?? "-"} {unit}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setEditingId(measurement.id)}>
                    <Edit3 className="mr-2 inline" size={16} /> Edit
                  </button>
                  <button className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 px-3 py-2 text-sm font-black text-[#FF6B6B] transition hover:-translate-y-0.5 hover:bg-ember-500/15" onClick={() => remove(measurement.id)}>
                    <Trash2 className="mr-2 inline" size={16} /> Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                {fields.filter((field) => field !== "bodyWeight").map((field) => (
                  <div key={field} className="rounded-[14px] bg-[#11161F] px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6D7684]">{field.replace(/([A-Z])/g, " $1")}</p>
                    <p className="mt-1 font-black text-white">{measurement[field] ?? "-"}</p>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="grid min-h-72 place-items-center rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922,#0F131A)] p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,.35)]">
            <div>
              <Ruler className="mx-auto text-volt-500" size={34} />
              <h3 className="mt-3 text-xl font-black text-white">No measurements yet</h3>
              <p className="mt-1 text-sm text-[#8B95A7]">Add your first log to track body changes.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
