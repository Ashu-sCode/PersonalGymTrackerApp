import { Bell, Edit3, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppData } from "../hooks/useAppData";
import { addReminder, deleteReminder, updateReminder } from "../services/workoutService";
import type { Reminder } from "../types";

type RepeatType = Reminder["repeatType"];

export function Reminders({ data }: { data: AppData }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("Workout reminder");
  const [time, setTime] = useState("18:00");
  const [repeatType, setRepeatType] = useState<RepeatType>("daily");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!editingId) return;
    const reminder = data.reminders.find((item) => item.id === editingId);
    if (!reminder) return;
    setTitle(reminder.title);
    setTime(reminder.time);
    setRepeatType(reminder.repeatType);
    setEnabled(reminder.enabled);
  }, [data.reminders, editingId]);

  async function requestNotifications() {
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
  }

  async function save() {
    await requestNotifications();
    const payload = { title, time, repeatType, enabled };
    if (editingId) await updateReminder(editingId, payload);
    else await addReminder(payload);
    setEditingId(null);
    await data.refresh();
  }

  async function remove(id: string) {
    await deleteReminder(id);
    await data.refresh();
  }

  async function toggle(reminder: Reminder) {
    await updateReminder(reminder.id, { title: reminder.title, time: reminder.time, repeatType: reminder.repeatType, enabled: !reminder.enabled });
    await data.refresh();
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">REMINDERS</p>
        <h1 className="mt-2 text-3xl font-black text-white">Training Nudges</h1>
        <p className="mt-2 text-sm text-[#A1A8B3]">Browser notifications run while PGT is open. Your reminder data stays local and syncs when configured.</p>
      </header>

      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <div className="grid gap-3 md:grid-cols-[1fr_140px_160px_120px]">
          <select className="input" value={title} onChange={(event) => setTitle(event.target.value)}>
            <option>Workout reminder</option>
            <option>Body weight check reminder</option>
            <option>Measurement update reminder</option>
          </select>
          <input className="input" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          <select className="input" value={repeatType} onChange={(event) => setRepeatType(event.target.value as RepeatType)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={save}>
            {editingId ? <Save size={18} /> : <Plus size={18} />} {editingId ? "Save" : "Add"}
          </button>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#A1A8B3]">
          <input className="h-4 w-4 accent-[#A8FF3D]" type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Enabled
        </label>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {data.reminders.map((reminder) => (
          <article key={reminder.id} className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-volt-500/12 text-volt-500">
                <Bell size={19} />
              </span>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-black ${reminder.enabled ? "bg-volt-500/12 text-volt-500" : "bg-white/[0.06] text-[#8B95A7]"}`}
                onClick={() => toggle(reminder)}
              >
                {reminder.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <h2 className="font-black text-white">{reminder.title}</h2>
            <p className="mt-1 text-sm text-[#8B95A7]">{reminder.time} · {reminder.repeatType}</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-secondary flex-1 px-3 py-2 text-sm" onClick={() => setEditingId(reminder.id)}>
                <Edit3 className="mr-2 inline" size={16} /> Edit
              </button>
              <button className="rounded-[14px] border border-ember-500/15 bg-ember-500/10 px-3 py-2 text-sm font-black text-[#FF6B6B] transition hover:-translate-y-0.5 hover:bg-ember-500/15" onClick={() => remove(reminder.id)}>
                <Trash2 className="mr-2 inline" size={16} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
