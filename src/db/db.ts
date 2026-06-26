import Dexie, { type Table } from "dexie";
import type {
  BodyMeasurement,
  Exercise,
  ExerciseMuscleMap,
  Muscle,
  Reminder,
  SyncQueueItem,
  UserProfile,
  Workout,
  WorkoutSet
} from "../types";
import { exerciseMuscleMap, exercises, muscles } from "../data/seed";

class PgtDatabase extends Dexie {
  users!: Table<UserProfile, string>;
  exercises!: Table<Exercise, string>;
  muscles!: Table<Muscle, string>;
  exerciseMuscleMap!: Table<ExerciseMuscleMap, string>;
  workouts!: Table<Workout, string>;
  workoutSets!: Table<WorkoutSet, string>;
  bodyMeasurements!: Table<BodyMeasurement, string>;
  reminders!: Table<Reminder, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("pgt-offline-db");
    this.version(1).stores({
      users: "id, email",
      exercises: "id, name, category, userId",
      muscles: "id, name, groupName",
      exerciseMuscleMap: "id, exerciseId, muscleId",
      workouts: "id, userId, date, createdAt, synced",
      workoutSets: "id, workoutId, exerciseId",
      bodyMeasurements: "id, userId, date, synced",
      reminders: "id, userId, enabled, time",
      syncQueue: "id, entity, entityId, createdAt"
    });
  }
}

export const db = new PgtDatabase();

export async function seedDatabase() {
  if ((await db.muscles.count()) === 0) await db.muscles.bulkPut(muscles);
  if ((await db.exercises.count()) === 0) await db.exercises.bulkPut(exercises);
  if ((await db.exerciseMuscleMap.count()) === 0) await db.exerciseMuscleMap.bulkPut(exerciseMuscleMap);
}

export const localUserId = "local-user";

export async function ensureLocalUser() {
  const existing = await db.users.get(localUserId);
  if (existing) return existing;

  const user: UserProfile = {
    id: localUserId,
    name: "Local Athlete",
    email: "offline@pgt.local",
    createdAt: new Date().toISOString()
  };
  await db.users.put(user);
  return user;
}
