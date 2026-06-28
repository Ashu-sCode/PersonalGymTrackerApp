import { db } from "../db/db";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { SyncEntity } from "../types";

const tableName: Record<SyncEntity, string> = {
  workouts: "workouts",
  workout_sets: "workout_sets",
  body_measurements: "body_measurements",
  reminders: "reminders",
  exercises: "exercises",
  exercise_muscle_map: "exercise_muscle_map",
  workout_templates: "workout_templates",
  user_settings: "user_settings"
};

export async function syncPendingItems() {
  if (!navigator.onLine || !isSupabaseConfigured || !supabase) return { synced: 0, failed: 0, skipped: true };

  const queue = await db.syncQueue.orderBy("createdAt").toArray();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const table = tableName[item.entity];
      const { error } =
        item.action === "delete"
          ? await supabase.from(table).delete().eq("id", item.entityId)
          : await supabase.from(table).upsert(item.payload as Record<string, unknown>);
      if (error) throw error;
      await db.syncQueue.delete(item.id);
      synced += 1;
    } catch (error) {
      failed += 1;
      await db.syncQueue.update(item.id, {
        attempts: (item.attempts ?? 0) + 1,
        lastError: error instanceof Error ? error.message : "Unknown sync error",
        updatedAt: new Date().toISOString()
      });
    }
  }

  return { synced, failed, skipped: false };
}
