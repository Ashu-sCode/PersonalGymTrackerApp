import Dexie, { type Table } from "dexie";
import type {
  BodyMeasurement,
  Exercise,
  ExerciseMuscleMap,
  Muscle,
  Reminder,
  SyncQueueItem,
  UserProfile,
  UserSettings,
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
  userSettings!: Table<UserSettings, string>;

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
    this.version(3).stores({
      syncQueue: "id, entity, entityId, createdAt, updatedAt",
      userSettings: "id, userId, updatedAt"
    });
  }
}

export const db = new PgtDatabase();

async function putMissing<T extends { id: string }>(table: Table<T, string>, rows: T[]) {
  const foundRows = await table.bulkGet(rows.map((row) => row.id));
  const existingIds = new Set<string>();
  foundRows.forEach((row) => {
    if (row) existingIds.add(row.id);
  });
  const missing = rows.filter((row) => !existingIds.has(row.id));
  if (missing.length) await table.bulkPut(missing);
}

export async function seedDatabase() {
  await putMissing(db.muscles, muscles);
  await putMissing(db.exercises, exercises);
  await putMissing(db.exerciseMuscleMap, exerciseMuscleMap);
}

export const localUserId = "local-user";
const localSettingsId = `${localUserId}-settings`;

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

export async function ensureUserSettings(userId = localUserId) {
  const id = userId === localUserId ? localSettingsId : `${userId}-settings`;
  const existing = await db.userSettings.get(id);
  if (existing) return existing;

  const settings: UserSettings = {
    id,
    userId,
    unitSystem: "kg",
    onboardingCompleted: false,
    updatedAt: new Date().toISOString()
  };
  await db.userSettings.put(settings);
  return settings;
}
