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
  WorkoutTemplate,
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
  workoutTemplates!: Table<WorkoutTemplate, string>;
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
    this.version(2).stores({
      workoutTemplates: "id, userId, createdAt"
    });
  }
}

export const db = new PgtDatabase();

export async function seedDatabase() {
  await db.muscles.bulkPut(muscles);
  await db.exercises.bulkPut(exercises);
  await db.exerciseMuscleMap.bulkPut(exerciseMuscleMap);
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
