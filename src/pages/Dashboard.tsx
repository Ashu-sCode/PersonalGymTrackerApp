import { Activity, BarChart3, Dumbbell, Scale, TrendingDown, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateVolume } from "../algorithms/muscleScores";
import { MuscleHeatmap } from "../components/MuscleHeatmap";
import { StatCard } from "../components/StatCard";
import type { AppData } from "../hooks/useAppData";

export function Dashboard({ data }: { data: AppData }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekWorkouts = data.workouts.filter((workout) => new Date(workout.date).getTime() >= weekAgo);
  const weekWorkoutIds = new Set(weekWorkouts.map((workout) => workout.id));
  const weekSets = data.sets.filter((set) => weekWorkoutIds.has(set.workoutId));
  const totalVolume = weekSets.reduce((sum, set) => sum + calculateVolume(set), 0);
  const todayCount = data.workouts.filter((workout) => workout.date === today).length;
  const sortedScores = [...data.scores].sort((a, b) => b.finalScore - a.finalScore);
  const most = sortedScores[0]?.muscleName ?? "None";
  const least = [...data.scores].filter((score) => score.finalScore > 0).sort((a, b) => a.finalScore - b.finalScore)[0]?.muscleName ?? "Start training";
  const fatigued = data.scores.filter((score) => score.recoveryStatus === "Fatigued").slice(0, 3);
  const chartData = data.measurements.slice(0, 8).reverse().map((item) => ({ date: item.date.slice(5), weight: item.bodyWeight ?? 0 }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today" value={`${todayCount} workouts`} icon={Dumbbell} tone="good" />
        <StatCard label="This week" value={weekWorkouts.length} icon={Activity} />
        <StatCard label="Volume lifted" value={`${Math.round(totalVolume)} kg`} icon={BarChart3} />
        <StatCard label="Most trained" value={most} icon={Trophy} tone="hot" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Weekly Muscle Heatmap</h2>
            <span className="text-sm text-zinc-400">Least trained: {least}</span>
          </div>
          <MuscleHeatmap scores={data.scores} />
        </div>
        <div className="space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <h2 className="mb-4 text-lg font-bold">Recovery Suggestions</h2>
            {fatigued.length ? (
              <div className="space-y-3">
                {fatigued.map((score) => (
                  <div key={score.muscleId} className="rounded-md bg-ember-500/10 p-3 text-sm text-ember-500">
                    Reduce load for {score.muscleName}; recovery is still low.
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No major fatigue flags. Build the next session around your least trained areas.</p>
            )}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Scale className="text-volt-500" size={19} />
              <h2 className="text-lg font-bold">Body Weight Trend</h2>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip contentStyle={{ background: "#111318", border: "1px solid rgba(255,255,255,.1)", color: "#fff" }} />
                  <Bar dataKey="weight" fill="#b6ff4d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <StatCard label="Measurement progress" value={`${data.measurements.length} logs`} icon={TrendingDown} />
        </div>
      </section>
    </div>
  );
}
