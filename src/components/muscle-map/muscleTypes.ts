import type { MuscleGroup, MuscleScore } from "../../types";

export type RecoveryLevel = "none" | "low" | "medium" | "good" | "high";
export type BodySide = "front" | "back";
export type MuscleMapModel = "male";

export type MusclePathId =
  | "abs"
  | "adductors"
  | "ankles"
  | "biceps"
  | "calves"
  | "chest"
  | "deltoids"
  | "feet"
  | "forearm"
  | "gluteal"
  | "hair"
  | "hamstring"
  | "hands"
  | "head"
  | "hip-flexors"
  | "inner-quad"
  | "knees"
  | "lower-abs"
  | "lower-back"
  | "lower-chest"
  | "lower-trapezius"
  | "neck"
  | "obliques"
  | "outer-quad"
  | "quadriceps"
  | "rear-deltoid"
  | "rhomboids"
  | "rotator-cuff"
  | "serratus"
  | "tibialis"
  | "trapezius"
  | "triceps"
  | "upper-abs"
  | "upper-back"
  | "upper-chest"
  | "upper-trapezius"
  | "front-deltoid";

export type MusclePathData = {
  id: MusclePathId;
  common: string[];
  left: string[];
  right: string[];
};

export type RecoveryInput = RecoveryLevel | number | MuscleScore | undefined;

export type MuscleMapRecoveryScores = Partial<Record<MusclePathId | string, RecoveryInput>>;

export type MuscleMapSelection = {
  id: MusclePathId;
  label: string;
  group: MuscleGroup | "Neutral";
};
