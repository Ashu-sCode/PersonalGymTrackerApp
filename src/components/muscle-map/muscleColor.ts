import type { MuscleScore } from "../../types";
import type { MusclePathId, RecoveryInput, RecoveryLevel } from "./muscleTypes";

export const recoveryColors: Record<RecoveryLevel, string> = {
  none: "#2b2f36",
  low: "#ff4d4d",
  medium: "#ff9f43",
  good: "#a3ff3d",
  high: "#39e75f"
};

export const recoveryGradients: Record<RecoveryLevel, { top: string; bottom: string }> = {
  none: { top: "#3A414D", bottom: "#262C35" },
  low: { top: "#FF5B5B", bottom: "#E53935" },
  medium: { top: "#FFB347", bottom: "#FF8C42" },
  good: { top: "#B8FF65", bottom: "#6EDC44" },
  high: { top: "#5BFF8F", bottom: "#2ECC71" }
};

export function recoveryLevel(input: RecoveryInput): RecoveryLevel {
  if (!input) return "none";
  if (typeof input === "string") return input;
  if (typeof input === "number") {
    if (input <= 0) return "none";
    if (input < 35) return "low";
    if (input < 65) return "medium";
    if (input < 85) return "good";
    return "high";
  }
  if (input.finalScore <= 0) return "none";
  if (input.recoveryStatus === "Fatigued") return input.finalScore > 900 ? "low" : "medium";
  if (input.recoveryStatus === "Recovering") return "medium";
  if (input.recoveryStatus === "Almost Ready") return "good";
  return input.finalScore > 1400 ? "high" : "good";
}

export function colorForMuscle(muscleId: MusclePathId, scores: Partial<Record<string, RecoveryInput>>) {
  return recoveryColors[recoveryLevel(scores[muscleId])];
}

export function scoreValue(score?: MuscleScore) {
  return Math.round(score?.finalScore ?? 0);
}
