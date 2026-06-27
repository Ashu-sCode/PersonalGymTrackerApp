import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAppData } from "./hooks/useAppData";
import { AddWorkout } from "./pages/AddWorkout";
import { Dashboard } from "./pages/Dashboard";
import { ExportReport } from "./pages/ExportReport";
import { History } from "./pages/History";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Measurements } from "./pages/Measurements";
import { Reminders } from "./pages/Reminders";
import { Settings } from "./pages/Settings";

const MuscleMapPage = lazy(() => import("./pages/MuscleMapPage").then((module) => ({ default: module.MuscleMapPage })));

export function App() {
  const appData = useAppData();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (appData.loading) {
    return <div className="grid min-h-screen place-items-center bg-iron-950 text-zinc-100">Loading PGT...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login user={appData.user} />} />
      <Route element={<Layout pendingSync={appData.pendingSync} refresh={appData.refresh} />}>
        <Route path="/dashboard" element={<Dashboard data={appData} />} />
        <Route path="/add-workout" element={<AddWorkout data={appData} />} />
        <Route path="/history" element={<History data={appData} />} />
        <Route
          path="/muscle-map"
          element={
            <Suspense fallback={<div className="rounded-lg border border-white/10 bg-white/[0.035] p-6 text-zinc-300">Loading muscle map...</div>}>
              <MuscleMapPage data={appData} />
            </Suspense>
          }
        />
        <Route path="/measurements" element={<Measurements data={appData} />} />
        <Route path="/reminders" element={<Reminders data={appData} />} />
        <Route path="/export" element={<ExportReport data={appData} />} />
        <Route path="/settings" element={<Settings data={appData} />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
