import { Download } from "lucide-react";
import type { AppData } from "../hooks/useAppData";
import { exportPdfReport } from "../services/pdfService";

export function ExportReport({ data }: { data: AppData }) {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/[0.035] p-6">
      <h1 className="text-3xl font-black">Export Report</h1>
      <p className="mt-2 text-zinc-400">Create a PDF backup with workout history, volume, muscle summary, recovery, and measurement progress.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white/8 p-4">
          <p className="text-2xl font-black">{data.workouts.length}</p>
          <p className="text-sm text-zinc-400">Workouts</p>
        </div>
        <div className="rounded-lg bg-white/8 p-4">
          <p className="text-2xl font-black">{data.measurements.length}</p>
          <p className="text-sm text-zinc-400">Measurements</p>
        </div>
        <div className="rounded-lg bg-white/8 p-4">
          <p className="text-2xl font-black">{data.scores.filter((score) => score.finalScore > 0).length}</p>
          <p className="text-sm text-zinc-400">Active muscles</p>
        </div>
      </div>
      <button
        className="btn-primary mt-6 inline-flex items-center gap-2"
        onClick={() => exportPdfReport({ userName: data.user?.name ?? "Local Athlete", workouts: data.workouts, sets: data.sets, exercises: data.exercises, measurements: data.measurements, scores: data.scores })}
      >
        <Download size={18} /> Download PDF
      </button>
    </div>
  );
}
