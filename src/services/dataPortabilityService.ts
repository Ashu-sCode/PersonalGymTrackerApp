import { db } from "../db/db";

const tables = [
  "users",
  "userSettings",
  "exercises",
  "muscles",
  "exerciseMuscleMap",
  "workouts",
  "workoutSets",
  "workoutTemplates",
  "bodyMeasurements",
  "reminders",
  "syncQueue"
] as const;

type TableName = (typeof tables)[number];
type RawBackup = Partial<Record<TableName, unknown[]>> & {
  exportedAt?: string;
  app?: string;
};

export async function exportRawData() {
  const payload: RawBackup = {
    app: "PGT",
    exportedAt: new Date().toISOString()
  };

  for (const table of tables) {
    payload[table] = await db.table(table).toArray();
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pgt-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importRawData(file: File) {
  const text = await file.text();
  const parsed = JSON.parse(text) as RawBackup;
  const importedTables = tables.filter((table) => Array.isArray(parsed[table]));

  await db.transaction("rw", importedTables.map((table) => db.table(table)), async () => {
    for (const table of importedTables) {
      const rows = parsed[table] ?? [];
      if (rows.length) await db.table(table).bulkPut(rows);
    }
  });

  return importedTables.length;
}
