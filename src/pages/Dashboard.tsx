import { Activity, BarChart3, Dumbbell, Scale, TrendingDown, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
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
  const unit = data.settings?.unitSystem ?? "kg";
  const bodyWeightLogs = data.measurements.filter((item) => typeof item.bodyWeight === "number");
  const chartData = bodyWeightLogs.slice(0, 8).reverse().map((item) => ({ date: item.date.slice(5), weight: item.bodyWeight ?? 0 }));
  const latestWeight = bodyWeightLogs[0]?.bodyWeight;
  const previousWeight = bodyWeightLogs[1]?.bodyWeight;
  const weightDelta = latestWeight !== undefined && previousWeight !== undefined ? latestWeight - previousWeight : undefined;
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayTemplate = [...builtInWorkoutTemplates, ...data.workoutTemplates].find((template) => template.day.toLowerCase() === dayName.toLowerCase());
  const todayTemplateMeta = todayTemplate ? `${todayTemplate.day} - ${todayTemplate.focus} - ${todayTemplate.sets.length} exercises` : "No planned workout for today. Build a session or adjust the plan calendar.";

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-5">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">TODAY'S TRAINING</p>
            <h1 className="mt-1.5 text-2xl font-black text-white sm:text-3xl">{todayTemplate ? todayTemplate.title : "Ready when you are"}</h1>
            <p className="mt-1.5 text-sm text-[#A1A8B3]">{todayTemplateMeta}</p>
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

          <div className="overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_80%_0%,rgba(182,255,77,0.12),transparent_34%),linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-3 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6D7684]">Body metric</p>
                <h2 className="mt-1 text-lg font-black text-white">Weight Check-in</h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-volt-500/12 text-volt-500">
                <Scale size={18} />
              </span>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-black leading-none text-white">{latestWeight !== undefined ? latestWeight : "--"}</p>
                <p className="mt-1 text-sm font-bold text-[#8B95A7]">{unit}</p>
              </div>
              <div className={`rounded-full px-3 py-1.5 text-xs font-black ${weightDelta === undefined ? "bg-white/[0.05] text-[#8B95A7]" : weightDelta <= 0 ? "bg-volt-500/12 text-volt-500" : "bg-orange-500/12 text-orange-300"}`}>
                {weightDelta === undefined ? "No comparison" : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} ${unit}`}
              </div>
            </div>

            <div className="mt-4 h-28">
              {chartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bodyWeightGlow" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#A8FF3D" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#A8FF3D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6D7684", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#11161F", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, color: "#fff" }} />
                    <Area type="monotone" dataKey="weight" stroke="#A8FF3D" strokeWidth={3} fill="url(#bodyWeightGlow)" dot={{ r: 3, fill: "#A8FF3D", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#A8FF3D", stroke: "#05070A", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center rounded-[16px] bg-white/[0.035] px-4 text-center">
                  <p className="text-sm font-bold text-[#8B95A7]">Add two body weight logs to show a trend.</p>
                </div>
              )}
            </div>
          </div>

          <StatCard label="Measurement progress" value={`${data.measurements.length} logs`} icon={TrendingDown} />
        </div>
      </section>
    </div>
  );
}
