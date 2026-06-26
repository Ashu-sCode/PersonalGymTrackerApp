export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Legs"
  | "Calves";

export type MuscleName =
  | "Upper Chest"
  | "Middle Chest"
  | "Lower Chest"
  | "Lats"
  | "Traps"
  | "Rhomboids"
  | "Lower Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Abs/Core"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
  userId?: string | null;
}

export interface Muscle {
  id: string;
  name: MuscleName;
  groupName: MuscleGroup;
  viewType: "simple" | "detailed";
}

export interface ExerciseMuscleMap {
  id: string;
  exerciseId: string;
  muscleId: string;
  contributionPercentage: number;
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  notes?: string;
  createdAt: string;
  synced?: boolean;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutDraftSet {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  bodyWeight?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
  shoulders?: number;
  calves?: number;
  synced?: boolean;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  time: string;
  repeatType: "daily" | "weekly" | "monthly";
  enabled: boolean;
}

export interface SyncQueueItem {
  id: string;
  entity: "workouts" | "workout_sets" | "body_measurements" | "reminders" | "exercises";
  entityId: string;
  action: "upsert" | "delete";
  payload: unknown;
  createdAt: string;
}

export interface MuscleScore {
  muscleId: string;
  muscleName: MuscleName;
  groupName: MuscleGroup;
  volumeScore: number;
  frequencyScore: number;
  recoveryStatus: "Fatigued" | "Recovering" | "Almost Ready" | "Ready";
  recoveryPenalty: number;
  finalScore: number;
  lastTrainedAt?: string;
}
