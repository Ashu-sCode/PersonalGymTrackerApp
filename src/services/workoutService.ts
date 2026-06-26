import { db, localUserId } from "../db/db";
import type { BodyMeasurement, Exercise, Reminder, Workout, WorkoutDraftSet, WorkoutSet } from "../types";

const id = () => crypto.randomUUID();

async function queue(entity: "workouts" | "workout_sets" | "body_measurements" | "reminders" | "exercises", entityId: string, payload: unknown) {
  await db.syncQueue.put({
    id: id(),
    entity,
    entityId,
    action: "upsert",
    payload,
    createdAt: new Date().toISOString()
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

export async function addCustomExercise(name: string, category: string, userId = localUserId) {
  const exercise: Exercise = { id: id(), name, category, isCustom: true, userId };
  await db.exercises.put(exercise);
  await queue("exercises", exercise.id, exercise);
  return exercise;
}

export async function addMeasurement(measurement: Omit<BodyMeasurement, "id" | "userId" | "synced">, userId = localUserId) {
  const row: BodyMeasurement = { id: id(), userId, synced: false, ...measurement };
  await db.bodyMeasurements.put(row);
  await queue("body_measurements", row.id, row);
  return row;
}

export async function addReminder(reminder: Omit<Reminder, "id" | "userId">, userId = localUserId) {
  const row: Reminder = { id: id(), userId, ...reminder };
  await db.reminders.put(row);
  await queue("reminders", row.id, row);
  return row;
}
