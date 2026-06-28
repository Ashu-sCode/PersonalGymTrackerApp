import type { Exercise, ExerciseMuscleMap, Muscle, WorkoutTemplate } from "../types";

export const muscles: Muscle[] = [
  { id: "upper-chest", name: "Upper Chest", groupName: "Chest", viewType: "detailed" },
  { id: "middle-chest", name: "Middle Chest", groupName: "Chest", viewType: "detailed" },
  { id: "lower-chest", name: "Lower Chest", groupName: "Chest", viewType: "detailed" },
  { id: "lats", name: "Lats", groupName: "Back", viewType: "detailed" },
  { id: "traps", name: "Traps", groupName: "Back", viewType: "detailed" },
  { id: "rhomboids", name: "Rhomboids", groupName: "Back", viewType: "detailed" },
  { id: "lower-back", name: "Lower Back", groupName: "Back", viewType: "detailed" },
  { id: "shoulders", name: "Shoulders", groupName: "Shoulders", viewType: "simple" },
  { id: "biceps", name: "Biceps", groupName: "Arms", viewType: "detailed" },
  { id: "triceps", name: "Triceps", groupName: "Arms", viewType: "detailed" },
  { id: "forearms", name: "Forearms", groupName: "Arms", viewType: "detailed" },
  { id: "core", name: "Abs/Core", groupName: "Core", viewType: "simple" },
  { id: "quads", name: "Quads", groupName: "Legs", viewType: "detailed" },
  { id: "hamstrings", name: "Hamstrings", groupName: "Legs", viewType: "detailed" },
  { id: "glutes", name: "Glutes", groupName: "Legs", viewType: "detailed" },
  { id: "calves", name: "Calves", groupName: "Calves", viewType: "simple" }
];

export const exercises: Exercise[] = [
  { id: "bench-press", name: "Bench Press", category: "Push", isCustom: false },
  { id: "incline-bench-press", name: "Incline Bench Press", category: "Push", isCustom: false },
  { id: "incline-db-press", name: "Incline DB Press", category: "Push", isCustom: false },
  { id: "flat-db-press", name: "Flat DB Press", category: "Push", isCustom: false },
  { id: "standing-barbell-ohp", name: "Standing Barbell OHP", category: "Push", isCustom: false },
  { id: "weighted-dips", name: "Weighted Dips", category: "Push", isCustom: false },
  { id: "dumbbell-lateral-raise", name: "Dumbbell Lateral Raise", category: "Push", isCustom: false },
  { id: "push-ups", name: "Push Ups", category: "Push", isCustom: false },
  { id: "shoulder-press", name: "Shoulder Press", category: "Push", isCustom: false },
  { id: "lateral-raise", name: "Lateral Raise", category: "Push", isCustom: false },
  { id: "pull-ups", name: "Pull Ups", category: "Pull", isCustom: false },
  { id: "pull-up-lat-pulldown", name: "Pull-Up / Lat Pulldown", category: "Pull", isCustom: false },
  { id: "lat-pulldown", name: "Lat Pulldown", category: "Pull", isCustom: false },
  { id: "barbell-row", name: "Barbell Row", category: "Pull", isCustom: false },
  { id: "seated-cable-row", name: "Seated Cable Row", category: "Pull", isCustom: false },
  { id: "face-pull", name: "Face Pull", category: "Pull", isCustom: false },
  { id: "t-bar-row", name: "T-Bar Row", category: "Pull", isCustom: false },
  { id: "rear-delt-fly", name: "Rear Delt Fly", category: "Pull", isCustom: false },
  { id: "dumbbell-shrugs", name: "Dumbbell Shrugs", category: "Pull", isCustom: false },
  { id: "squat", name: "Squat", category: "Legs", isCustom: false },
  { id: "back-squat", name: "Back Squat", category: "Legs", isCustom: false },
  { id: "leg-press", name: "Leg Press", category: "Legs", isCustom: false },
  { id: "deadlift", name: "Deadlift", category: "Pull", isCustom: false },
  { id: "romanian-deadlift", name: "Romanian Deadlift", category: "Legs", isCustom: false },
  { id: "leg-curl", name: "Leg Curl", category: "Legs", isCustom: false },
  { id: "leg-extension", name: "Leg Extension", category: "Legs", isCustom: false },
  { id: "standing-calf-raise", name: "Standing Calf Raise", category: "Legs", isCustom: false },
  { id: "bicep-curl", name: "Bicep Curl", category: "Arms", isCustom: false },
  { id: "barbell-curl", name: "Barbell Curl", category: "Arms", isCustom: false },
  { id: "hammer-curl", name: "Hammer Curl", category: "Arms", isCustom: false },
  { id: "ez-bar-curl", name: "EZ Bar Curl", category: "Arms", isCustom: false },
  { id: "incline-db-curl", name: "Incline DB Curl", category: "Arms", isCustom: false },
  { id: "reverse-curl", name: "Reverse Curl", category: "Arms", isCustom: false },
  { id: "tricep-pushdown", name: "Tricep Pushdown", category: "Arms", isCustom: false },
  { id: "skull-crusher", name: "Skull Crusher", category: "Arms", isCustom: false },
  { id: "overhead-rope-extension", name: "Overhead Rope Extension", category: "Arms", isCustom: false },
  { id: "pec-fly", name: "Pec Fly", category: "Push", isCustom: false },
  { id: "plank", name: "Plank", category: "Core", isCustom: false },
  { id: "crunches", name: "Crunches", category: "Core", isCustom: false },
  { id: "rope-crunch", name: "Rope Crunch", category: "Core", isCustom: false },
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", category: "Core", isCustom: false },
  { id: "cable-crunch", name: "Cable Crunch", category: "Core", isCustom: false },
  { id: "ab-wheel-rollout", name: "Ab Wheel Rollout", category: "Core", isCustom: false },
  { id: "calf-raises", name: "Calf Raises", category: "Legs", isCustom: false },
  { id: "walk", name: "Walk", category: "Recovery", isCustom: false },
  { id: "stretching-mobility", name: "Stretching & Mobility", category: "Recovery", isCustom: false }
];

const map = (exerciseId: string, pairs: Array<[string, number]>): ExerciseMuscleMap[] =>
  pairs.map(([muscleId, contributionPercentage]) => ({
    id: `${exerciseId}-${muscleId}`,
    exerciseId,
    muscleId,
    contributionPercentage
  }));

export const exerciseMuscleMap: ExerciseMuscleMap[] = [
  ...map("bench-press", [["middle-chest", 45], ["lower-chest", 25], ["triceps", 20], ["shoulders", 10]]),
  ...map("incline-bench-press", [["upper-chest", 55], ["middle-chest", 20], ["triceps", 15], ["shoulders", 10]]),
  ...map("incline-db-press", [["upper-chest", 55], ["middle-chest", 20], ["triceps", 15], ["shoulders", 10]]),
  ...map("flat-db-press", [["middle-chest", 50], ["lower-chest", 20], ["triceps", 20], ["shoulders", 10]]),
  ...map("standing-barbell-ohp", [["shoulders", 70], ["triceps", 20], ["traps", 10]]),
  ...map("weighted-dips", [["lower-chest", 40], ["triceps", 35], ["middle-chest", 15], ["shoulders", 10]]),
  ...map("dumbbell-lateral-raise", [["shoulders", 88], ["traps", 12]]),
  ...map("push-ups", [["middle-chest", 45], ["lower-chest", 20], ["triceps", 20], ["core", 15]]),
  ...map("shoulder-press", [["shoulders", 70], ["triceps", 20], ["traps", 10]]),
  ...map("lateral-raise", [["shoulders", 85], ["traps", 15]]),
  ...map("pull-ups", [["lats", 45], ["biceps", 25], ["rhomboids", 20], ["forearms", 10]]),
  ...map("pull-up-lat-pulldown", [["lats", 50], ["biceps", 20], ["rhomboids", 20], ["forearms", 10]]),
  ...map("lat-pulldown", [["lats", 55], ["biceps", 20], ["rhomboids", 15], ["forearms", 10]]),
  ...map("barbell-row", [["lats", 30], ["rhomboids", 30], ["traps", 15], ["biceps", 15], ["lower-back", 10]]),
  ...map("seated-cable-row", [["lats", 30], ["rhomboids", 35], ["biceps", 20], ["traps", 10], ["forearms", 5]]),
  ...map("face-pull", [["shoulders", 35], ["traps", 25], ["rhomboids", 25], ["forearms", 15]]),
  ...map("t-bar-row", [["lats", 30], ["rhomboids", 30], ["traps", 20], ["biceps", 10], ["lower-back", 10]]),
  ...map("rear-delt-fly", [["shoulders", 70], ["rhomboids", 20], ["traps", 10]]),
  ...map("dumbbell-shrugs", [["traps", 85], ["forearms", 15]]),
  ...map("squat", [["quads", 45], ["glutes", 30], ["hamstrings", 15], ["core", 10]]),
  ...map("back-squat", [["quads", 45], ["glutes", 30], ["hamstrings", 15], ["core", 10]]),
  ...map("leg-press", [["quads", 55], ["glutes", 25], ["hamstrings", 15], ["calves", 5]]),
  ...map("deadlift", [["hamstrings", 25], ["glutes", 25], ["lower-back", 20], ["traps", 15], ["forearms", 10], ["core", 5]]),
  ...map("romanian-deadlift", [["hamstrings", 45], ["glutes", 30], ["lower-back", 15], ["forearms", 10]]),
  ...map("leg-curl", [["hamstrings", 90], ["calves", 10]]),
  ...map("leg-extension", [["quads", 95], ["core", 5]]),
  ...map("standing-calf-raise", [["calves", 95], ["forearms", 5]]),
  ...map("bicep-curl", [["biceps", 80], ["forearms", 20]]),
  ...map("barbell-curl", [["biceps", 80], ["forearms", 20]]),
  ...map("hammer-curl", [["biceps", 55], ["forearms", 45]]),
  ...map("ez-bar-curl", [["biceps", 82], ["forearms", 18]]),
  ...map("incline-db-curl", [["biceps", 85], ["forearms", 15]]),
  ...map("reverse-curl", [["forearms", 65], ["biceps", 35]]),
  ...map("tricep-pushdown", [["triceps", 90], ["forearms", 10]]),
  ...map("skull-crusher", [["triceps", 90], ["forearms", 10]]),
  ...map("overhead-rope-extension", [["triceps", 90], ["forearms", 10]]),
  ...map("pec-fly", [["middle-chest", 55], ["upper-chest", 25], ["lower-chest", 15], ["shoulders", 5]]),
  ...map("plank", [["core", 75], ["shoulders", 10], ["glutes", 10], ["lower-back", 5]]),
  ...map("crunches", [["core", 95], ["lower-back", 5]]),
  ...map("rope-crunch", [["core", 95], ["lower-back", 5]]),
  ...map("hanging-leg-raise", [["core", 85], ["forearms", 10], ["lats", 5]]),
  ...map("cable-crunch", [["core", 95], ["lower-back", 5]]),
  ...map("ab-wheel-rollout", [["core", 75], ["shoulders", 15], ["lats", 5], ["lower-back", 5]]),
  ...map("calf-raises", [["calves", 95], ["forearms", 5]])
];

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "monday-push-strength",
    day: "Monday",
    title: "Push",
    focus: "Strength",
    sets: [
      { exerciseId: "incline-db-press", sets: 4, reps: 8, weight: 0 },
      { exerciseId: "flat-db-press", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "standing-barbell-ohp", sets: 3, reps: 6, weight: 0 },
      { exerciseId: "weighted-dips", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "dumbbell-lateral-raise", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "tricep-pushdown", sets: 3, reps: 12, weight: 0 }
    ]
  },
  {
    id: "tuesday-pull-strength",
    day: "Tuesday",
    title: "Pull",
    focus: "Strength",
    sets: [
      { exerciseId: "pull-up-lat-pulldown", sets: 4, reps: 8, weight: 0 },
      { exerciseId: "deadlift", sets: 3, reps: 5, weight: 0 },
      { exerciseId: "barbell-row", sets: 3, reps: 8, weight: 0 },
      { exerciseId: "seated-cable-row", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "face-pull", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "barbell-curl", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "hammer-curl", sets: 2, reps: 12, weight: 0 }
    ]
  },
  {
    id: "wednesday-legs-strength-size",
    day: "Wednesday",
    title: "Legs",
    focus: "Strength + Size",
    sets: [
      { exerciseId: "back-squat", sets: 4, reps: 6, weight: 0 },
      { exerciseId: "leg-press", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "romanian-deadlift", sets: 2, reps: 10, weight: 0 },
      { exerciseId: "leg-curl", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "leg-extension", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "standing-calf-raise", sets: 4, reps: 15, weight: 0 }
    ]
  },
  {
    id: "thursday-chest-arms-abs",
    day: "Thursday",
    title: "Chest + Arms + Abs",
    focus: "Hypertrophy",
    sets: [
      { exerciseId: "flat-db-press", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "incline-db-press", sets: 2, reps: 12, weight: 0 },
      { exerciseId: "pec-fly", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "ez-bar-curl", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "incline-db-curl", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "skull-crusher", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "overhead-rope-extension", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "rope-crunch", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "plank", sets: 3, reps: 60, weight: 0 }
    ]
  },
  {
    id: "friday-back-shoulders-forearms-calves",
    day: "Friday",
    title: "Back + Shoulders + Forearms",
    focus: "Volume",
    notes: "Deadlift is intended at 60-70% of Tuesday's weight.",
    sets: [
      { exerciseId: "deadlift", sets: 3, reps: 8, weight: 0 },
      { exerciseId: "t-bar-row", sets: 3, reps: 10, weight: 0 },
      { exerciseId: "lat-pulldown", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "seated-cable-row", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "dumbbell-lateral-raise", sets: 4, reps: 15, weight: 0 },
      { exerciseId: "rear-delt-fly", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "dumbbell-shrugs", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "reverse-curl", sets: 3, reps: 15, weight: 0 }
    ]
  },
  {
    id: "saturday-active-recovery-core",
    day: "Saturday",
    title: "Active Recovery + Core",
    focus: "Recovery",
    sets: [
      { exerciseId: "hanging-leg-raise", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "cable-crunch", sets: 3, reps: 15, weight: 0 },
      { exerciseId: "ab-wheel-rollout", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "walk", sets: 1, reps: 30, weight: 0 },
      { exerciseId: "stretching-mobility", sets: 1, reps: 15, weight: 0 }
    ]
  }
];
