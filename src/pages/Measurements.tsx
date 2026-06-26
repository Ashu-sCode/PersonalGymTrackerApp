import { Save } from "lucide-react";
import { useState } from "react";
import type { AppData } from "../hooks/useAppData";
import { addMeasurement } from "../services/workoutService";
import type { BodyMeasurement } from "../types";

const fields: Array<keyof Omit<BodyMeasurement, "id" | "userId" | "date" | "synced">> = ["bodyWeight", "chest", "waist", "arms", "thighs", "shoulders", "calves"];

export function Measurements({ data }: { data: AppData }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Record<string, string>>({});

  async function save() {
    const payload = fields.reduce<Record<string, number | undefined>>((acc, field) => {
      acc[field] = values[field] ? Number(values[field]) : undefined;
      return acc;
    }, {});
    await addMeasurement({ date, ...payload });
    setValues({});
    await data.refresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h1 className="mb-4 text-3xl font-black">Measurements</h1>
        <label className="mb-3 block">
          <span className="mb-1 block text-sm text-zinc-400">Date</span>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {fields.map((field) => (
            <label key={field}>
              <span className="mb-1 block text-sm capitalize text-zinc-400">{field.replace(/([A-Z])/g, " $1")}</span>
              <input className="input" type="number" min="0" value={values[field] ?? ""} onChange={(e) => setValues((current) => ({ ...current, [field]: e.target.value }))} />
            </label>
          ))}
        </div>
        <button onClick={save} className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2">
          <Save size={18} /> Save measurement
        </button>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h2 className="mb-4 text-xl font-bold">Progress Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-zinc-400">
              <tr>
                <th className="py-2">Date</th>
                {fields.map((field) => <th key={field}>{field.replace(/([A-Z])/g, " $1")}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.measurements.map((measurement) => (
                <tr key={measurement.id} className="border-t border-white/10">
                  <td className="py-3">{measurement.date}</td>
                  {fields.map((field) => <td key={field}>{measurement[field] ?? ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
