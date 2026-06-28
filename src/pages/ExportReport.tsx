import { Download, FileJson, Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { AppData } from "../hooks/useAppData";
import { exportRawData, importRawData } from "../services/dataPortabilityService";
import { exportPdfReport } from "../services/pdfService";

export function ExportReport({ data }: { data: AppData }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = useState("");

  async function importFile(file?: File) {
    if (!file) return;
    const count = await importRawData(file);
    setNotice(`Imported ${count} data table${count === 1 ? "" : "s"}.`);
    await data.refresh();
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">DATA PORTABILITY</p>
        <h1 className="mt-2 text-3xl font-black text-white">Export & Backup</h1>
        <p className="mt-2 text-sm text-[#A1A8B3]">Download polished reports or raw JSON backups for local-first safety.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric value={data.workouts.length} label="Workouts" />
        <Metric value={data.measurements.length} label="Measurements" />
        <Metric value={data.scores.filter((score) => score.finalScore > 0).length} label="Active muscles" />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <Download className="text-volt-500" size={22} />
          <h2 className="mt-4 text-xl font-black text-white">PDF report</h2>
          <p className="mt-1 text-sm text-[#8B95A7]">Workout history, volume, recovery, and measurement progress.</p>
          <button
            className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2"
            onClick={() => exportPdfReport({ userName: data.user?.name ?? "Local Athlete", workouts: data.workouts, sets: data.sets, exercises: data.exercises, measurements: data.measurements, scores: data.scores })}
          >
            <Download size={18} /> Download PDF
          </button>
        </div>

        <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <FileJson className="text-volt-500" size={22} />
          <h2 className="mt-4 text-xl font-black text-white">Raw data backup</h2>
          <p className="mt-1 text-sm text-[#8B95A7]">Export or import IndexedDB data as JSON. Import merges rows by id.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className="btn-secondary inline-flex items-center justify-center gap-2" onClick={exportRawData}>
              <FileJson size={18} /> Export JSON
            </button>
            <button className="btn-secondary inline-flex items-center justify-center gap-2" onClick={() => inputRef.current?.click()}>
              <Upload size={18} /> Import JSON
            </button>
          </div>
          <input ref={inputRef} className="hidden" type="file" accept="application/json" onChange={(event) => importFile(event.target.files?.[0])} />
        </div>
      </section>

      {notice ? <div className="rounded-[14px] border border-volt-500/20 bg-volt-500/10 px-4 py-3 text-sm font-bold text-volt-500">{notice}</div> : null}
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-[#8B95A7]">{label}</p>
    </div>
  );
}
