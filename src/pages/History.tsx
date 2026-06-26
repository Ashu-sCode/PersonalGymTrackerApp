import { calculateVolume } from "../algorithms/muscleScores";
import type { AppData } from "../hooks/useAppData";

export function History({ data }: { data: AppData }) {
  const exerciseById = new Map(data.exercises.map((exercise) => [exercise.id, exercise.name]));

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">Workout History</h1>
      {data.workouts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8 text-zinc-400">No workouts yet.</div>
      ) : (
        data.workouts.map((workout) => {
          const sets = data.sets.filter((set) => set.workoutId === workout.id);
          return (
            <section key={workout.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">{new Date(workout.date).toLocaleDateString()}</h2>
                  {workout.notes && <p className="text-sm text-zinc-400">{workout.notes}</p>}
                </div>
                <span className="rounded-md bg-white/8 px-3 py-1 text-sm text-zinc-300">{sets.length} exercises</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-zinc-400">
                    <tr>
                      <th className="py-2">Exercise</th>
                      <th>Sets</th>
                      <th>Reps</th>
                      <th>Weight</th>
                      <th>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sets.map((set) => (
                      <tr key={set.id} className="border-t border-white/10">
                        <td className="py-3">{exerciseById.get(set.exerciseId) ?? set.exerciseId}</td>
                        <td>{set.sets}</td>
                        <td>{set.reps}</td>
                        <td>{set.weight}</td>
                        <td>{Math.round(calculateVolume(set))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
