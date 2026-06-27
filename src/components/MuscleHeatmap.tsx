import { useMemo, useState } from "react";
import { ScanSearch } from "lucide-react";
import { MuscleMap2D } from "./muscle-map/MuscleMap2D";
import { recoveryGradients, recoveryLevel, scoreValue } from "./muscle-map/muscleColor";
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
  const recoveryStatus: MuscleScore["recoveryStatus"] =
    matching.some((score) => score.recoveryStatus === "Fatigued")
      ? "Fatigued"
      : matching.some((score) => score.recoveryStatus === "Recovering")
        ? "Recovering"
        : matching.some((score) => score.recoveryStatus === "Almost Ready")
          ? "Almost Ready"
          : "Ready";
  return { ...matching[0], finalScore, recoveryStatus, groupName: matching[0].groupName };
}

function groupSummary(group: MuscleGroup, scores: MuscleScore[]) {
  const items = scores.filter((score) => score.groupName === group);
  return {
    group,
    score: items.reduce((total, item) => total + item.finalScore, 0)
  };
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

      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <ScanSearch className="h-4 w-4" />
            Selected muscle
          </p>
          {selectedMuscle ? (
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{muscleLabels[selectedMuscle]}</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {muscleGroups[selectedMuscle]} / Score {scoreValue(selectedScore)}
                </p>
              </div>
              <span
                className="rounded-md px-3 py-1 text-sm font-bold text-iron-950 shadow-[0_0_14px_rgba(255,255,255,0.08)]"
                style={{ background: `linear-gradient(180deg, ${recoveryGradients[selectedRecovery].top}, ${recoveryGradients[selectedRecovery].bottom})` }}
              >
                {selectedRecovery}
              </span>
            </div>
          ) : (
            <div className="mt-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-4 text-center text-sm text-zinc-500">Select a muscle to view recovery details</div>
          )}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
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

        <div className="grid max-h-[620px] gap-2 overflow-auto pr-1">
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
