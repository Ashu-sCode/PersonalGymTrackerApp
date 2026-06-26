import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateMuscleScores } from "../algorithms/muscleScores";
import { db, ensureLocalUser, seedDatabase } from "../db/db";
import { syncPendingItems } from "../services/syncService";
import type { BodyMeasurement, Exercise, ExerciseMuscleMap, Muscle, Reminder, UserProfile, Workout, WorkoutSet } from "../types";

export function useAppData() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [mappings, setMappings] = useState<ExerciseMuscleMap[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pendingSync, setPendingSync] = useState(0);

  const refresh = useCallback(async () => {
    const [userRow, workoutRows, setRows, exerciseRows, muscleRows, mappingRows, measurementRows, reminderRows, syncRows] = await Promise.all([
      ensureLocalUser(),
      db.workouts.orderBy("date").reverse().toArray(),
      db.workoutSets.toArray(),
      db.exercises.orderBy("name").toArray(),
      db.muscles.toArray(),
      db.exerciseMuscleMap.toArray(),
      db.bodyMeasurements.orderBy("date").reverse().toArray(),
      db.reminders.toArray(),
      db.syncQueue.toArray()
    ]);

    setUser(userRow);
    setWorkouts(workoutRows);
    setSets(setRows);
    setExercises(exerciseRows);
    setMuscles(muscleRows);
    setMappings(mappingRows);
    setMeasurements(measurementRows);
    setReminders(reminderRows);
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
    exercises,
    muscles,
    mappings,
    measurements,
    reminders,
    scores,
    pendingSync,
    refresh
  };
}

export type AppData = ReturnType<typeof useAppData>;
