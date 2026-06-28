import { db, localUserId } from "../db/db";
import type { BodyMeasurement, Exercise, ExerciseMuscleMap, Reminder, SyncEntity, UserSettings, Workout, WorkoutDraftSet, WorkoutSet, WorkoutTemplate } from "../types";

const id = () => crypto.randomUUID();

async function queue(entity: SyncEntity, entityId: string, payload: unknown, action: "upsert" | "delete" = "upsert") {
  const now = new Date().toISOString();
  await db.syncQueue.put({
    id: id(),
    entity,
    entityId,
    action,
    payload,
    createdAt: now,
    attempts: 0,
    updatedAt: now
  });
}

export async function addWorkout(date: string, notes: string, draftSets: WorkoutDraftSet[], userId = localUserId) {
  const workout: Workout = { id: id(), userId, date, notes, createdAt: new Date().toISOString(), synced: false };
  const sets: WorkoutSet[] = draftSets.map((set) => ({ id: id(), workoutId: workout.id, ...set }));

  await db.transaction("rw", db.workouts, db.workoutSets, db.syncQueue, async () => {
    await db.workouts.put(workout);
    await db.workoutSets.bulkPut(sets);
    await queue("workouts", workout.id, workout);
    for (const set of sets) await queue("workout_sets", set.id, set);
  });

  return workout;
}

export async function updateWorkout(workoutId: string, date: string, notes: string, draftSets: WorkoutDraftSet[], userId = localUserId) {
  const existing = await db.workouts.get(workoutId);
  if (!existing || existing.userId !== userId) return null;

  const workout: Workout = { ...existing, date, notes, synced: false };
  const previousSets = await db.workoutSets.where("workoutId").equals(workoutId).toArray();
  const sets: WorkoutSet[] = draftSets.map((set) => ({ id: id(), workoutId, ...set }));

  await db.transaction("rw", db.workouts, db.workoutSets, db.syncQueue, async () => {
    await db.workouts.put(workout);
    await db.workoutSets.bulkDelete(previousSets.map((set) => set.id));
    if (sets.length > 0) await db.workoutSets.bulkPut(sets);
    await queue("workouts", workout.id, workout);
    for (const set of previousSets) await queue("workout_sets", set.id, { id: set.id }, "delete");
    for (const set of sets) await queue("workout_sets", set.id, set);
  });

  return workout;
}

export async function deleteWorkout(workoutId: string, userId = localUserId) {
  const workout = await db.workouts.get(workoutId);
  if (!workout || workout.userId !== userId) return false;
  const sets = await db.workoutSets.where("workoutId").equals(workoutId).toArray();

  await db.transaction("rw", db.workouts, db.workoutSets, db.syncQueue, async () => {
    await db.workoutSets.bulkDelete(sets.map((set) => set.id));
    await db.workouts.delete(workoutId);
    for (const set of sets) await queue("workout_sets", set.id, { id: set.id }, "delete");
    await queue("workouts", workoutId, { id: workoutId }, "delete");
  });

  return true;
}

export async function addCustomExercise(name: string, category: string, userId = localUserId) {
  const exercise: Exercise = { id: id(), name, category, isCustom: true, userId };
  await db.exercises.put(exercise);
  await queue("exercises", exercise.id, exercise);
  return exercise;
}

export async function updateExercise(exerciseId: string, patch: Pick<Exercise, "name" | "category">, userId = localUserId) {
  const existing = await db.exercises.get(exerciseId);
  if (!existing || !existing.isCustom || existing.userId !== userId) return null;
  const exercise: Exercise = { ...existing, name: patch.name, category: patch.category };
  await db.exercises.put(exercise);
  await queue("exercises", exercise.id, exercise);
  return exercise;
}

export async function deleteExercise(exerciseId: string, userId = localUserId) {
  const existing = await db.exercises.get(exerciseId);
  if (!existing || !existing.isCustom || existing.userId !== userId) return false;
  const mappings = await db.exerciseMuscleMap.where("exerciseId").equals(exerciseId).toArray();
  await db.transaction("rw", db.exercises, db.exerciseMuscleMap, db.syncQueue, async () => {
    await db.exerciseMuscleMap.bulkDelete(mappings.map((mapping) => mapping.id));
    await db.exercises.delete(exerciseId);
    for (const mapping of mappings) await queue("exercise_muscle_map", mapping.id, { id: mapping.id }, "delete");
    await queue("exercises", exerciseId, { id: exerciseId }, "delete");
  });
  return true;
}

export async function replaceExerciseMuscleMap(exerciseId: string, pairs: Array<{ muscleId: string; contributionPercentage: number }>) {
  const exercise = await db.exercises.get(exerciseId);
  if (!exercise) return [];
  const previous = await db.exerciseMuscleMap.where("exerciseId").equals(exerciseId).toArray();
  const cleanPairs = pairs
    .map((pair) => ({ muscleId: pair.muscleId, contributionPercentage: Math.max(0, Math.min(100, Number(pair.contributionPercentage) || 0)) }))
    .filter((pair) => pair.muscleId && pair.contributionPercentage > 0);
  const rows: ExerciseMuscleMap[] = cleanPairs.map((pair) => ({
    id: `${exerciseId}-${pair.muscleId}`,
    exerciseId,
    muscleId: pair.muscleId,
    contributionPercentage: pair.contributionPercentage
  }));

  await db.transaction("rw", db.exerciseMuscleMap, db.syncQueue, async () => {
    await db.exerciseMuscleMap.bulkDelete(previous.map((mapping) => mapping.id));
    if (rows.length) await db.exerciseMuscleMap.bulkPut(rows);
    for (const mapping of previous) await queue("exercise_muscle_map", mapping.id, { id: mapping.id }, "delete");
    for (const row of rows) await queue("exercise_muscle_map", row.id, row);
  });
  return rows;
}

export async function addWorkoutTemplate(template: Omit<WorkoutTemplate, "id" | "userId" | "isCustom" | "createdAt">, userId = localUserId) {
  const row: WorkoutTemplate = {
    id: id(),
    userId,
    isCustom: true,
    createdAt: new Date().toISOString(),
    ...template,
    sets: template.sets.map((set) => ({ ...set }))
  };
  await db.workoutTemplates.put(row);
  await queue("workout_templates", row.id, row);
  return row;
}

export async function updateWorkoutTemplate(templateId: string, patch: Omit<WorkoutTemplate, "id" | "userId" | "isCustom" | "createdAt">, userId = localUserId) {
  const existing = await db.workoutTemplates.get(templateId);
  if (!existing || existing.userId !== userId || !existing.isCustom) return null;
  const row: WorkoutTemplate = {
    ...existing,
    ...patch,
    sets: patch.sets.map((set) => ({ ...set }))
  };
  await db.workoutTemplates.put(row);
  await queue("workout_templates", row.id, row);
  return row;
}

export async function deleteWorkoutTemplate(templateId: string, userId = localUserId) {
  const template = await db.workoutTemplates.get(templateId);
  if (!template || template.userId !== userId || !template.isCustom) return false;
  await db.workoutTemplates.delete(templateId);
  await queue("workout_templates", templateId, { id: templateId }, "delete");
  return true;
}

export async function addMeasurement(measurement: Omit<BodyMeasurement, "id" | "userId" | "synced">, userId = localUserId) {
  const row: BodyMeasurement = { id: id(), userId, synced: false, ...measurement };
  await db.bodyMeasurements.put(row);
  await queue("body_measurements", row.id, row);
  return row;
}

export async function updateMeasurement(measurementId: string, measurement: Omit<BodyMeasurement, "id" | "userId" | "synced">, userId = localUserId) {
  const existing = await db.bodyMeasurements.get(measurementId);
  if (!existing || existing.userId !== userId) return null;
  const row: BodyMeasurement = { ...existing, ...measurement, synced: false };
  await db.bodyMeasurements.put(row);
  await queue("body_measurements", row.id, row);
  return row;
}

export async function deleteMeasurement(measurementId: string, userId = localUserId) {
  const existing = await db.bodyMeasurements.get(measurementId);
  if (!existing || existing.userId !== userId) return false;
  await db.bodyMeasurements.delete(measurementId);
  await queue("body_measurements", measurementId, { id: measurementId }, "delete");
  return true;
}

export async function addReminder(reminder: Omit<Reminder, "id" | "userId">, userId = localUserId) {
  const row: Reminder = { id: id(), userId, ...reminder };
  await db.reminders.put(row);
  await queue("reminders", row.id, row);
  return row;
}

export async function updateReminder(reminderId: string, reminder: Omit<Reminder, "id" | "userId">, userId = localUserId) {
  const existing = await db.reminders.get(reminderId);
  if (!existing || existing.userId !== userId) return null;
  const row: Reminder = { ...existing, ...reminder };
  await db.reminders.put(row);
  await queue("reminders", row.id, row);
  return row;
}

export async function deleteReminder(reminderId: string, userId = localUserId) {
  const existing = await db.reminders.get(reminderId);
  if (!existing || existing.userId !== userId) return false;
  await db.reminders.delete(reminderId);
  await queue("reminders", reminderId, { id: reminderId }, "delete");
  return true;
}

export async function updateUserSettings(settingsId: string, patch: Partial<Pick<UserSettings, "unitSystem" | "onboardingCompleted">>) {
  const existing = await db.userSettings.get(settingsId);
  if (!existing) return null;
  const row: UserSettings = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  await db.userSettings.put(row);
  await queue("user_settings", row.id, row);
  return row;
}

export async function clearWorkoutRange(range: "day" | "week", baseDate = new Date()) {
  const toDate = baseDate.toISOString().slice(0, 10);
  const from = new Date(baseDate);
  if (range === "week") from.setDate(from.getDate() - 6);
  const fromDate = range === "day" ? toDate : from.toISOString().slice(0, 10);
  const workouts = await db.workouts.where("date").between(fromDate, toDate, true, true).toArray();
  const workoutIds = workouts.map((workout) => workout.id);
  if (workoutIds.length === 0) return { workouts: 0, sets: 0 };

  const sets = await db.workoutSets.where("workoutId").anyOf(workoutIds).toArray();

  await db.transaction("rw", db.workouts, db.workoutSets, db.syncQueue, async () => {
    await db.workoutSets.bulkDelete(sets.map((set) => set.id));
    await db.workouts.bulkDelete(workoutIds);
    for (const set of sets) await queue("workout_sets", set.id, { id: set.id }, "delete");
    for (const workout of workouts) await queue("workouts", workout.id, { id: workout.id }, "delete");
  });

  return { workouts: workouts.length, sets: sets.length };
}
