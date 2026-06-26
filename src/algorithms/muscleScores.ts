import type { ExerciseMuscleMap, Muscle, MuscleScore, Workout, WorkoutSet } from "../types";

const dayMs = 24 * 60 * 60 * 1000;

export function getRecoveryStatus(lastTrainedAt?: string): MuscleScore["recoveryStatus"] {
  if (!lastTrainedAt) return "Ready";
  const hours = (Date.now() - new Date(lastTrainedAt).getTime()) / (60 * 60 * 1000);
  if (hours < 24) return "Fatigued";
  if (hours < 48) return "Recovering";
  if (hours < 72) return "Almost Ready";
  return "Ready";
}

function recoveryPenalty(status: MuscleScore["recoveryStatus"]) {
  return { Fatigued: 350, Recovering: 180, "Almost Ready": 70, Ready: 0 }[status];
}

export function calculateVolume(set: Pick<WorkoutSet, "sets" | "reps" | "weight">) {
  return Number(set.sets || 0) * Number(set.reps || 0) * Number(set.weight || 0);
}

export function calculateMuscleScores(
  workouts: Workout[],
  sets: WorkoutSet[],
  mappings: ExerciseMuscleMap[],
  muscles: Muscle[],
  windowDays = 7
): MuscleScore[] {
  const since = Date.now() - windowDays * dayMs;
  const workoutsById = new Map(workouts.map((workout) => [workout.id, workout]));
  const mapByExercise = mappings.reduce<Record<string, ExerciseMuscleMap[]>>((acc, mapping) => {
    acc[mapping.exerciseId] = [...(acc[mapping.exerciseId] ?? []), mapping];
    return acc;
  }, {});

  return muscles.map((muscle) => {
    const trainedDates = new Set<string>();
    let volumeScore = 0;
    let lastTrainedAt: string | undefined;

    for (const set of sets) {
      const workout = workoutsById.get(set.workoutId);
      if (!workout || new Date(workout.date).getTime() < since) continue;

      const contribution = mapByExercise[set.exerciseId]?.find((item) => item.muscleId === muscle.id);
      if (!contribution) continue;

      volumeScore += calculateVolume(set) * (contribution.contributionPercentage / 100);
      trainedDates.add(workout.date);
      if (!lastTrainedAt || new Date(workout.date) > new Date(lastTrainedAt)) lastTrainedAt = workout.date;
    }

    const recoveryStatus = getRecoveryStatus(lastTrainedAt);
    const frequencyScore = trainedDates.size * 80;
    const penalty = recoveryPenalty(recoveryStatus);

    return {
      muscleId: muscle.id,
      muscleName: muscle.name,
      groupName: muscle.groupName,
      volumeScore,
      frequencyScore,
      recoveryStatus,
      recoveryPenalty: penalty,
      finalScore: Math.max(0, volumeScore + frequencyScore - penalty),
      lastTrainedAt
    };
  });
}

export function heatColor(score?: MuscleScore) {
  if (!score || score.finalScore <= 0) return "#3f3f46";
  if (score.recoveryStatus === "Fatigued" && score.finalScore > 700) return "#ef4444";
  if (score.finalScore < 450) return "#bef264";
  if (score.finalScore < 1400) return "#84cc16";
  return "#3f6212";
}
