import { ArrowRight, Dumbbell, LineChart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="min-h-screen bg-iron-950 text-zinc-100">
      <section className="relative grid min-h-screen content-center overflow-hidden px-5 py-10">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(182,255,77,0.2),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,91,74,0.18),transparent_30%)]" />
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-volt-500/30 bg-volt-500/10 px-3 py-1 text-sm text-volt-500">
            <ShieldCheck size={16} /> Offline-first PWA
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-tight sm:text-7xl">Personal Gym Tracker</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-300">
            Log workouts, measure recovery, and see exactly which muscles are getting the most work with a live training heatmap.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
              Open app <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
              Account <Dumbbell size={18} />
            </Link>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              ["Visual heatmap", "Simple and detailed muscle views driven by set volume."],
              ["Local first", "Workouts and measurements save to IndexedDB before sync."],
              ["Reports", "Export workout history, recovery, and measurements to PDF."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <LineChart className="mb-6 text-volt-500" />
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
