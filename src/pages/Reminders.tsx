import { Bell, Plus } from "lucide-react";
import { useState } from "react";
import type { AppData } from "../hooks/useAppData";
import { addReminder } from "../services/workoutService";

export function Reminders({ data }: { data: AppData }) {
  const [title, setTitle] = useState("Workout reminder");
  const [time, setTime] = useState("18:00");
  const [repeatType, setRepeatType] = useState<"daily" | "weekly" | "monthly">("daily");

  async function requestNotifications() {
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
  }

  async function save() {
    await requestNotifications();
    await addReminder({ title, time, repeatType, enabled: true });
    await data.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-3xl font-black">Reminders</h1>
        <p className="mt-1 text-zinc-400">Workout, body weight, and measurement reminders are stored locally and queued for sync.</p>
      </div>
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_140px_160px_140px]">
          <select className="input" value={title} onChange={(e) => setTitle(e.target.value)}>
            <option>Workout reminder</option>
            <option>Body weight check reminder</option>
            <option>Measurement update reminder</option>
          </select>
          <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <select className="input" value={repeatType} onChange={(e) => setRepeatType(e.target.value as "daily" | "weekly" | "monthly")}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={save}>
            <Plus size={18} /> Add
          </button>
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        {data.reminders.map((reminder) => (
          <div key={reminder.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center justify-between">
              <Bell className="text-volt-500" />
              <span className="rounded-md bg-white/8 px-2 py-1 text-xs text-zinc-300">{reminder.repeatType}</span>
            </div>
            <h2 className="font-bold">{reminder.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{reminder.time} · {reminder.enabled ? "Enabled" : "Disabled"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
