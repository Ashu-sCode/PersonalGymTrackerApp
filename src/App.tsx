import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAppData } from "./hooks/useAppData";
import { useReminderNotifications } from "./hooks/useReminderNotifications";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";

const AddWorkout = lazy(() => import("./pages/AddWorkout").then((module) => ({ default: module.AddWorkout })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const ExerciseLibrary = lazy(() => import("./pages/ExerciseLibrary").then((module) => ({ default: module.ExerciseLibrary })));
const ExportReport = lazy(() => import("./pages/ExportReport").then((module) => ({ default: module.ExportReport })));
const History = lazy(() => import("./pages/History").then((module) => ({ default: module.History })));
const Measurements = lazy(() => import("./pages/Measurements").then((module) => ({ default: module.Measurements })));
const MuscleMapPage = lazy(() => import("./pages/MuscleMapPage").then((module) => ({ default: module.MuscleMapPage })));
const Onboarding = lazy(() => import("./pages/Onboarding").then((module) => ({ default: module.Onboarding })));
const PlanCalendar = lazy(() => import("./pages/PlanCalendar").then((module) => ({ default: module.PlanCalendar })));
const Reminders = lazy(() => import("./pages/Reminders").then((module) => ({ default: module.Reminders })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));

const fallback = <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922,#0F131A)] p-6 text-[#A1A8B3] shadow-[0_8px_30px_rgba(0,0,0,.35)]">Loading...</div>;

export function App() {
  const appData = useAppData();
  useReminderNotifications(appData.reminders);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (appData.loading) {
    return <div className="grid min-h-screen place-items-center bg-[#05070A] text-zinc-100">Loading PGT...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login user={appData.user} />} />
      <Route element={<Layout pendingSync={appData.pendingSync} refresh={appData.refresh} />}>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={fallback}>
              <Dashboard data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/plan"
          element={
            <Suspense fallback={fallback}>
              <PlanCalendar data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/add-workout"
          element={
            <Suspense fallback={fallback}>
              <AddWorkout data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/history"
          element={
            <Suspense fallback={fallback}>
              <History data={appData} />
            </Suspense>
          }
        />
        <Route path="/muscle-map" element={<Suspense fallback={fallback}>
              <MuscleMapPage data={appData} />
            </Suspense>}
        />
        <Route
          path="/exercises"
          element={
            <Suspense fallback={fallback}>
              <ExerciseLibrary data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/measurements"
          element={
            <Suspense fallback={fallback}>
              <Measurements data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/reminders"
          element={
            <Suspense fallback={fallback}>
              <Reminders data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/export"
          element={
            <Suspense fallback={fallback}>
              <ExportReport data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={fallback}>
              <Settings data={appData} />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={fallback}>
              <Onboarding data={appData} />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
