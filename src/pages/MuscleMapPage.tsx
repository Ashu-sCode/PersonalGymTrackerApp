import { MuscleHeatmap } from "../components/MuscleHeatmap";
import type { AppData } from "../hooks/useAppData";

export function MuscleMapPage({ data }: { data: AppData }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-volt-500">RECOVERY HEATMAP</p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Muscle Map</h1>
        </div>
        <p className="max-w-xl text-sm text-[#8B95A7]">Tap a muscle for recovery, volume, and readiness.</p>
      </div>
      <MuscleHeatmap scores={data.scores} />
    </div>
  );
}
