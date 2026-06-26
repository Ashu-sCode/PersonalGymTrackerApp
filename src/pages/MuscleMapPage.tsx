import { MuscleHeatmap } from "../components/MuscleHeatmap";
import type { AppData } from "../hooks/useAppData";

export function MuscleMapPage({ data }: { data: AppData }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">Muscle Map</h1>
        <p className="mt-1 text-zinc-400">Tap a group for detailed contribution, recovery, and score intensity.</p>
      </div>
      <MuscleHeatmap scores={data.scores} />
    </div>
  );
}
