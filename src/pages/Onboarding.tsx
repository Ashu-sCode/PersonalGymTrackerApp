import { Database, Dumbbell, ShieldCheck, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AppData } from "../hooks/useAppData";
import { updateUserSettings } from "../services/workoutService";

export function Onboarding({ data }: { data: AppData }) {
  const navigate = useNavigate();

  async function finish() {
    if (data.settings) await updateUserSettings(data.settings.id, { onboardingCompleted: true });
    await data.refresh();
    navigate("/dashboard");
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-6 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">WELCOME TO PGT</p>
        <h1 className="mt-2 text-4xl font-black text-white">Local-first training, recovery, and muscle tracking.</h1>
        <p className="mt-3 text-sm text-[#A1A8B3]">Your workouts are stored on this device first. Sync is optional when Supabase is configured.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Card icon={Dumbbell} title="Log fast" text="Use preloaded plans or custom loadouts to start a workout in seconds." />
        <Card icon={Database} title="Offline ready" text="IndexedDB keeps workouts, measurements, reminders, and maps available locally." />
        <Card icon={ShieldCheck} title="Portable data" text="Export raw JSON backups anytime and import them back into this app." />
      </div>
      <button className="btn-primary w-full" onClick={finish}>Start tracking</button>
    </div>
  );
}

function Card({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
      <Icon className="text-volt-500" size={22} />
      <h2 className="mt-4 font-black text-white">{title}</h2>
      <p className="mt-2 text-sm text-[#8B95A7]">{text}</p>
    </div>
  );
}
