import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateMuscleScores } from "../algorithms/muscleScores";
import { db, ensureLocalUser, ensureUserSettings, seedDatabase } from "../db/db";
import { syncPendingItems } from "../services/syncService";
import type { BodyMeasurement, Exercise, ExerciseMuscleMap, Muscle, Reminder, SyncQueueItem, UserProfile, UserSettings, Workout, WorkoutSet, WorkoutTemplate } from "../types";

export function useAppData() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [mappings, setMappings] = useState<ExerciseMuscleMap[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [syncItems, setSyncItems] = useState<SyncQueueItem[]>([]);
  const [pendingSync, setPendingSync] = useState(0);

  const refresh = useCallback(async () => {
    const userRow = await ensureLocalUser();
    const [settingsRow, workoutRows, setRows, templateRows, exerciseRows, muscleRows, mappingRows, measurementRows, reminderRows, syncRows] = await Promise.all([
      ensureUserSettings(userRow.id),
      db.workouts.orderBy("date").reverse().toArray(),
      db.workoutSets.toArray(),
      db.workoutTemplates.orderBy("createdAt").reverse().toArray(),
      db.exercises.orderBy("name").toArray(),
      db.muscles.toArray(),
      db.exerciseMuscleMap.toArray(),
      db.bodyMeasurements.orderBy("date").reverse().toArray(),
      db.reminders.toArray(),
      db.syncQueue.toArray()
    ]);

    setUser(userRow);
    setSettings(settingsRow);
    setWorkouts(workoutRows);
    setSets(setRows);
    setWorkoutTemplates(templateRows);
    setExercises(exerciseRows);
    setMuscles(muscleRows);
    setMappings(mappingRows);
    setMeasurements(measurementRows);
    setReminders(reminderRows);
    setSyncItems(syncRows);
    setPendingSync(syncRows.length);
  }, []);

  useEffect(() => {
    seedDatabase()
      .then(refresh)
      .finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const onOnline = () => syncPendingItems().finally(refresh);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [refresh]);

  const scores = useMemo(() => calculateMuscleScores(workouts, sets, mappings, muscles), [workouts, sets, mappings, muscles]);

  return {
    loading,
    user,
    workouts,
    sets,
    workoutTemplates,
    exercises,
    muscles,
    mappings,
    measurements,
    reminders,
    settings,
    syncItems,
    syncIssues: syncItems.filter((item) => item.lastError),
    scores,
    pendingSync,
    refresh
  };
}

export type AppData = ReturnType<typeof useAppData>;
