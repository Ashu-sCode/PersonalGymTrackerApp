import { Activity, BarChart3, Dumbbell, Scale, TrendingDown, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateVolume } from "../algorithms/muscleScores";
import { MuscleHeatmap } from "../components/MuscleHeatmap";
import { StatCard } from "../components/StatCard";
import { workoutTemplates as builtInWorkoutTemplates } from "../data/seed";
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
  const unit = data.settings?.unitSystem ?? "kg";
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayTemplate = [...builtInWorkoutTemplates, ...data.workoutTemplates].find((template) => template.day.toLowerCase() === dayName.toLowerCase());

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-5">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">TODAY'S TRAINING</p>
            <h1 className="mt-1.5 text-2xl font-black text-white sm:text-3xl">{todayTemplate ? todayTemplate.title : "Ready when you are"}</h1>
            <p className="mt-1.5 text-sm text-[#A1A8B3]">{todayTemplate ? `${todayTemplate.day} · ${todayTemplate.focus} · ${todayTemplate.sets.length} exercises` : "No planned workout for today. Build a session or adjust the plan calendar."}</p>
          </div>
          <Link to={todayTemplate ? `/add-workout?template=${todayTemplate.id}` : "/add-workout"} className="btn-primary inline-flex items-center justify-center gap-2">
            <Dumbbell size={18} /> {todayTemplate ? "Start planned workout" : "Add workout"}
          </Link>
        </div>
      </header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today" value={`${todayCount} workouts`} icon={Dumbbell} tone="good" />
        <StatCard label="This week" value={weekWorkouts.length} icon={Activity} />
        <StatCard label="Volume lifted" value={`${Math.round(totalVolume)} ${unit}`} icon={BarChart3} />
        <StatCard label="Most trained" value={most} icon={Trophy} tone="hot" />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black sm:text-xl">Weekly Muscle Heatmap</h2>
            <span className="text-sm text-zinc-400">Least trained: {least}</span>
          </div>
          <MuscleHeatmap scores={data.scores} />
        </div>
        <div className="space-y-4">
          <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-3 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-4">
            <h2 className="mb-3 text-lg font-bold">Recovery Suggestions</h2>
            {fatigued.length ? (
              <div className="space-y-2">
                {fatigued.map((score) => (
                  <div key={score.muscleId} className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 p-3 text-sm font-bold text-[#FF6B6B]">
                    Reduce load for {score.muscleName}; recovery is still low.
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No major fatigue flags. Build the next session around your least trained areas.</p>
            )}
          </div>
          <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-3 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <Scale className="text-volt-500" size={19} />
              <h2 className="text-lg font-bold">Body Weight Trend</h2>
            </div>
            <div className="h-44 sm:h-52">
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
