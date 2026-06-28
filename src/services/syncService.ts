import { db } from "../db/db";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const tableName: Record<string, string> = {
  workouts: "workouts",
  workout_sets: "workout_sets",
  body_measurements: "body_measurements",
  reminders: "reminders",
  exercises: "exercises"
};

export async function syncPendingItems() {
  if (!navigator.onLine || !isSupabaseConfigured || !supabase) return { synced: 0, skipped: true };

  const queue = await db.syncQueue.orderBy("createdAt").toArray();
  let synced = 0;

  for (const item of queue) {
    const { error } =
      item.action === "delete"
        ? await supabase.from(tableName[item.entity]).delete().eq("id", item.entityId)
        : await supabase.from(tableName[item.entity]).upsert(item.payload as Record<string, unknown>);
    if (error) throw error;
    await db.syncQueue.delete(item.id);
    synced += 1;
  }

  return { synced, skipped: false };
}
