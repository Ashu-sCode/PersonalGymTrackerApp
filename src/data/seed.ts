import type { Exercise, ExerciseMuscleMap, Muscle } from "../types";

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
  { id: "push-ups", name: "Push Ups", category: "Push", isCustom: false },
  { id: "shoulder-press", name: "Shoulder Press", category: "Push", isCustom: false },
  { id: "lateral-raise", name: "Lateral Raise", category: "Push", isCustom: false },
  { id: "pull-ups", name: "Pull Ups", category: "Pull", isCustom: false },
  { id: "lat-pulldown", name: "Lat Pulldown", category: "Pull", isCustom: false },
  { id: "barbell-row", name: "Barbell Row", category: "Pull", isCustom: false },
  { id: "squat", name: "Squat", category: "Legs", isCustom: false },
  { id: "leg-press", name: "Leg Press", category: "Legs", isCustom: false },
  { id: "deadlift", name: "Deadlift", category: "Pull", isCustom: false },
  { id: "bicep-curl", name: "Bicep Curl", category: "Arms", isCustom: false },
  { id: "tricep-pushdown", name: "Tricep Pushdown", category: "Arms", isCustom: false },
  { id: "plank", name: "Plank", category: "Core", isCustom: false },
  { id: "crunches", name: "Crunches", category: "Core", isCustom: false },
  { id: "calf-raises", name: "Calf Raises", category: "Legs", isCustom: false }
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
  ...map("push-ups", [["middle-chest", 45], ["lower-chest", 20], ["triceps", 20], ["core", 15]]),
  ...map("shoulder-press", [["shoulders", 70], ["triceps", 20], ["traps", 10]]),
  ...map("lateral-raise", [["shoulders", 85], ["traps", 15]]),
  ...map("pull-ups", [["lats", 45], ["biceps", 25], ["rhomboids", 20], ["forearms", 10]]),
  ...map("lat-pulldown", [["lats", 55], ["biceps", 20], ["rhomboids", 15], ["forearms", 10]]),
  ...map("barbell-row", [["lats", 30], ["rhomboids", 30], ["traps", 15], ["biceps", 15], ["lower-back", 10]]),
  ...map("squat", [["quads", 45], ["glutes", 30], ["hamstrings", 15], ["core", 10]]),
  ...map("leg-press", [["quads", 55], ["glutes", 25], ["hamstrings", 15], ["calves", 5]]),
  ...map("deadlift", [["hamstrings", 25], ["glutes", 25], ["lower-back", 20], ["traps", 15], ["forearms", 10], ["core", 5]]),
  ...map("bicep-curl", [["biceps", 80], ["forearms", 20]]),
  ...map("tricep-pushdown", [["triceps", 90], ["forearms", 10]]),
  ...map("plank", [["core", 75], ["shoulders", 10], ["glutes", 10], ["lower-back", 5]]),
  ...map("crunches", [["core", 95], ["lower-back", 5]]),
  ...map("calf-raises", [["calves", 95], ["forearms", 5]])
];
