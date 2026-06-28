import { useMemo, useState } from "react";
import { CalendarClock, ScanSearch, X } from "lucide-react";
import { MuscleMap2D } from "./muscle-map/MuscleMap2D";
import { recoveryGradients, recoveryLevel } from "./muscle-map/muscleColor";
import { muscleGroups, muscleLabels } from "./muscle-map/musclePaths";
import type { MuscleGroup, MuscleScore } from "../types";
import type { MuscleMapRecoveryScores, MusclePathId } from "./muscle-map/muscleTypes";

const groupOrder: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Calves"];

const scoreAliases: Partial<Record<MusclePathId, string[]>> = {
  abs: ["core"],
  "upper-abs": ["core"],
  "lower-abs": ["core"],
  obliques: ["core"],
  serratus: ["core"],
  chest: ["middle-chest"],
  "upper-chest": ["upper-chest"],
  "lower-chest": ["lower-chest"],
  deltoids: ["shoulders"],
  "front-deltoid": ["shoulders"],
  "rear-deltoid": ["shoulders"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  forearm: ["forearms"],
  trapezius: ["traps"],
  "upper-trapezius": ["traps"],
  "lower-trapezius": ["traps", "lower-back"],
  "upper-back": ["lats", "rhomboids"],
  rhomboids: ["rhomboids"],
  "lower-back": ["lower-back"],
  quadriceps: ["quads"],
  "inner-quad": ["quads"],
  "outer-quad": ["quads"],
  "hip-flexors": ["quads", "core"],
  adductors: ["quads", "hamstrings"],
  gluteal: ["glutes"],
  hamstring: ["hamstrings"],
  calves: ["calves"],
  tibialis: ["calves"]
};

function combinedScore(pathId: MusclePathId, scores: MuscleScore[]) {
  const ids = scoreAliases[pathId] ?? [];
  const matching = scores.filter((score) => ids.includes(score.muscleId));
  if (matching.length === 0) return undefined;
  const finalScore = matching.reduce((sum, score) => sum + score.finalScore, 0) / matching.length;
  const volumeScore = matching.reduce((sum, score) => sum + score.volumeScore, 0);
  const frequencyScore = matching.reduce((sum, score) => sum + score.frequencyScore, 0) / matching.length;
  const recoveryPenalty = matching.reduce((sum, score) => sum + score.recoveryPenalty, 0) / matching.length;
  const lastTrainedAt = matching.reduce<string | undefined>((latest, score) => {
    if (!score.lastTrainedAt) return latest;
    if (!latest || new Date(score.lastTrainedAt) > new Date(latest)) return score.lastTrainedAt;
    return latest;
  }, undefined);
  const recoveryStatus: MuscleScore["recoveryStatus"] =
    matching.some((score) => score.recoveryStatus === "Fatigued")
      ? "Fatigued"
      : matching.some((score) => score.recoveryStatus === "Recovering")
        ? "Recovering"
        : matching.some((score) => score.recoveryStatus === "Almost Ready")
        ? "Almost Ready"
        : "Ready";
  return { ...matching[0], volumeScore, frequencyScore, recoveryPenalty, finalScore, recoveryStatus, lastTrainedAt, groupName: matching[0].groupName };
}

function groupSummary(group: MuscleGroup, scores: MuscleScore[]) {
  const items = scores.filter((score) => score.groupName === group);
  return {
    group,
    score: items.reduce((total, item) => total + item.finalScore, 0)
  };
}

function formatScore(value?: number) {
  return Math.round(value ?? 0).toLocaleString();
}

function formatLastTrained(value?: string) {
  if (!value) return "No recent workout";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recent workout";
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function readinessCopy(score: MuscleScore | undefined) {
  if (!score) return "Pick a muscle to see fatigue, volume, and recovery context.";
  if (!score.lastTrainedAt) return "No workout data logged for this muscle yet.";
  if (score.recoveryStatus === "Fatigued") return "High recent load. Prioritize recovery or train lightly.";
  if (score.recoveryStatus === "Recovering") return "Recovery is in progress. Keep intensity controlled.";
  if (score.recoveryStatus === "Almost Ready") return "Nearly ready. A moderate session should be fine.";
  return "Recovered and ready for hard work.";
}

function scorePercent(score?: MuscleScore) {
  return Math.min(100, Math.round(((score?.finalScore ?? 0) / 1600) * 100));
}

function recoveryLabel(level: ReturnType<typeof recoveryLevel>) {
  return {
    none: "No data",
    low: "Loaded",
    medium: "Recovering",
    good: "Good",
    high: "Recovered"
  }[level];
}

function readyFor(score?: MuscleScore) {
  if (!score?.lastTrainedAt) return "Baseline";
  if (score.recoveryStatus === "Fatigued") return "Light";
  if (score.recoveryStatus === "Recovering") return "Moderate";
  if (score.recoveryStatus === "Almost Ready") return "Moderate";
  return "Heavy";
}

function fullRecovery(score?: MuscleScore) {
  if (!score?.lastTrainedAt) return "--";
  if (score.recoveryStatus === "Fatigued") return "2d";
  if (score.recoveryStatus === "Recovering") return "1d";
  if (score.recoveryStatus === "Almost Ready") return "<1d";
  return "Now";
}

function frequencyText(score?: MuscleScore) {
  const sessions = Math.round((score?.frequencyScore ?? 0) / 80);
  return `${sessions}x this week`;
}

function SelectedMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-[#29303b]/78 px-4 py-3 shadow-inner shadow-white/[0.025]">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export function MuscleHeatmap({ scores }: { scores: MuscleScore[] }) {
  const [selectedMuscle, setSelectedMuscle] = useState<MusclePathId>();

  const recoveryScores = useMemo(() => {
    return (Object.keys(muscleLabels) as MusclePathId[]).reduce<MuscleMapRecoveryScores>((acc, muscleId) => {
      acc[muscleId] = combinedScore(muscleId, scores);
      return acc;
    }, {});
  }, [scores]);

  const selectedScore = selectedMuscle ? combinedScore(selectedMuscle, scores) : undefined;
  const selectedRecovery = recoveryLevel(selectedScore);
  const summaries = groupOrder.map((group) => groupSummary(group, scores));
  const selectableMuscles = (Object.keys(muscleLabels) as MusclePathId[]).filter((id) => muscleGroups[id] !== "Neutral" && id !== "hair" && id !== "head");

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(520px,1fr)_360px]">
      <MuscleMap2D selectedMuscle={selectedMuscle} recoveryScores={recoveryScores} onMuscleClick={setSelectedMuscle} showLabels={false} model="male" />

      <div
        className={
          selectedMuscle
            ? "fixed inset-x-3 bottom-3 z-50 max-h-[72dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-transparent p-0 shadow-2xl shadow-black/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:relative xl:inset-auto xl:max-h-none xl:overflow-visible xl:rounded-lg xl:bg-white/[0.035] xl:p-4 xl:shadow-none"
            : "hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 xl:block"
        }
      >
        <div
          className={`overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_28%_0%,rgba(57,231,95,0.13),transparent_34%),radial-gradient(circle_at_70%_10%,rgba(255,159,67,0.1),transparent_32%),linear-gradient(180deg,rgba(42,48,60,0.96),rgba(28,32,39,0.96))] p-4 shadow-2xl shadow-black/35 backdrop-blur-xl ${
            selectedMuscle ? "mb-0 rounded-[2rem] xl:mb-4 xl:rounded-xl" : "mb-4 rounded-xl"
          }`}
        >
          {selectedMuscle ? <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/35 md:hidden" /> : null}
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
            <ScanSearch className="h-4 w-4" />
            Selected muscle
          </p>
          {selectedMuscle ? (
            <div className="mt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-4xl font-black leading-none tracking-tight text-white md:text-3xl">{muscleLabels[selectedMuscle]}</h2>
                  <p className="mt-3 text-lg font-semibold text-zinc-400 md:text-base">
                    <span style={{ color: recoveryGradients[selectedRecovery].bottom }}>{scorePercent(selectedScore)}%</span>
                    <span className="mx-2 text-zinc-600">/</span>
                    {recoveryLabel(selectedRecovery)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Clear selected muscle"
                  onClick={() => setSelectedMuscle(undefined)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#596172]/70">
                <div
                  className="h-full rounded-full transition-[width,background] duration-300"
                  style={{
                    width: `${scorePercent(selectedScore)}%`,
                    background: `linear-gradient(90deg, ${recoveryGradients[selectedRecovery].bottom}, ${recoveryGradients[selectedRecovery].top})`
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <SelectedMetric label="Ready for" value={readyFor(selectedScore)} />
                <SelectedMetric label="Full recovery" value={fullRecovery(selectedScore)} />
              </div>

              <div className="mt-7">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">History</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <SelectedMetric label="Last trained" value={formatLastTrained(selectedScore?.lastTrainedAt)} />
                  <SelectedMetric label="Frequency" value={frequencyText(selectedScore)} />
                </div>
              </div>

              <div className="mt-3 rounded-[1.35rem] border border-white/10 bg-[#29303b]/78 p-4 shadow-inner shadow-white/[0.025]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">Volume this week</p>
                    <p className="mt-2 text-4xl font-black leading-none tracking-tight text-white">{formatScore(selectedScore?.volumeScore)}</p>
                    <p className="mt-2 text-sm text-zinc-500">score load</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">Penalty</p>
                    <p className="mt-2 text-xl font-black text-zinc-200">{formatScore(selectedScore?.recoveryPenalty)}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500">Recovery note</p>
                  <p className="mt-2 text-sm leading-5 text-zinc-300">{readinessCopy(selectedScore)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-white/10 bg-white/[0.035] px-3 py-5 text-center">
              <CalendarClock className="mx-auto h-6 w-6 text-zinc-600" />
              <p className="mt-2 text-sm font-semibold text-zinc-300">Select a muscle to view recovery details</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">You will see readiness, weekly load, frequency, and recovery status here.</p>
            </div>
          )}
        </div>

        <div className="mb-5 hidden grid-cols-2 gap-2 xl:grid">
          {summaries.map((summary) => (
            <button
              key={summary.group}
              type="button"
              onClick={() => {
                const first = selectableMuscles.find((id) => muscleGroups[id] === summary.group);
                if (first) setSelectedMuscle(first);
              }}
              className={`rounded-md px-3 py-2 text-left text-sm transition ${selectedMuscle && muscleGroups[selectedMuscle] === summary.group ? "bg-white text-iron-950" : "bg-white/8 text-zinc-200 hover:bg-white/12"}`}
            >
              <span className="block font-bold">{summary.group}</span>
              <span className="text-xs opacity-70">{Math.round(summary.score)}</span>
            </button>
          ))}
        </div>

        <div className="hidden max-h-[620px] gap-2 overflow-auto pr-1 xl:grid">
          {selectableMuscles.map((muscleId) => {
            const active = selectedMuscle === muscleId;
            const level = recoveryLevel(recoveryScores[muscleId]);
            return (
              <button
                key={muscleId}
                type="button"
                title={muscleLabels[muscleId]}
                onClick={() => setSelectedMuscle(muscleId)}
                className={`flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                  active ? "border-white/40 bg-white/14 text-white shadow-[0_0_18px_rgba(163,255,61,0.16)]" : "border-white/10 bg-white/[0.045] text-zinc-200 hover:bg-white/10"
                }`}
              >
                <span className="font-semibold">{muscleLabels[muscleId]}</span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.08)]"
                  style={{ background: `linear-gradient(180deg, ${recoveryGradients[level].top}, ${recoveryGradients[level].bottom})` }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
