import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BodyMeasurement, Exercise, MuscleScore, Workout, WorkoutSet } from "../types";
import { calculateVolume } from "../algorithms/muscleScores";

export function exportPdfReport({
  userName,
  workouts,
  sets,
  exercises,
  measurements,
  scores
}: {
  userName: string;
  workouts: Workout[];
  sets: WorkoutSet[];
  exercises: Exercise[];
  measurements: BodyMeasurement[];
  scores: MuscleScore[];
}) {
  const doc = new jsPDF();
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise.name]));
  const totalVolume = sets.reduce((sum, set) => sum + calculateVolume(set), 0);

  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(182, 255, 77);
  doc.setFontSize(18);
  doc.text("Personal Gym Tracker - PGT", 14, 18);
  doc.setTextColor(244, 244, 245);
  doc.setFontSize(10);
  doc.text(`${userName} | ${new Date().toLocaleDateString()} | Total volume ${Math.round(totalVolume)} kg`, 14, 26);

  autoTable(doc, {
    startY: 40,
    head: [["Date", "Exercise", "Sets", "Reps", "Weight", "Volume"]],
    body: sets.map((set) => {
      const workout = workouts.find((item) => item.id === set.workoutId);
      return [
        workout?.date ?? "",
        exerciseById.get(set.exerciseId) ?? set.exerciseId,
        set.sets,
        set.reps,
        set.weight,
        Math.round(calculateVolume(set))
      ];
    }),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [24, 29, 36] }
  });

  autoTable(doc, {
    startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
      ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
      : 100,
    head: [["Muscle", "Score", "Recovery"]],
    body: scores.map((score) => [score.muscleName, Math.round(score.finalScore), score.recoveryStatus]),
    headStyles: { fillColor: [24, 29, 36] }
  });

  doc.addPage();
  doc.setTextColor(9, 9, 11);
  doc.setFontSize(14);
  doc.text("Body Measurement Progress", 14, 16);
  autoTable(doc, {
    startY: 24,
    head: [["Date", "Weight", "Chest", "Waist", "Arms", "Thighs", "Shoulders", "Calves"]],
    body: measurements.map((m) => [m.date, m.bodyWeight ?? "", m.chest ?? "", m.waist ?? "", m.arms ?? "", m.thighs ?? "", m.shoulders ?? "", m.calves ?? ""]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [24, 29, 36] }
  });

  doc.save(`pgt-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
