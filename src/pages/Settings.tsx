import { CheckCircle2, Cloud, Database, RotateCcw, Scale, User, type LucideIcon } from "lucide-react";
import type { AppData } from "../hooks/useAppData";
import { isSupabaseConfigured } from "../lib/supabase";
import { syncPendingItems } from "../services/syncService";
import { updateUserSettings } from "../services/workoutService";

export function Settings({ data }: { data: AppData }) {
  async function sync() {
    await syncPendingItems();
    await data.refresh();
  }

  async function updateUnits(unitSystem: "kg" | "lb") {
    if (!data.settings) return;
    await updateUserSettings(data.settings.id, { unitSystem });
    await data.refresh();
  }

  async function resetOnboarding() {
    if (!data.settings) return;
    await updateUserSettings(data.settings.id, { onboardingCompleted: false });
    await data.refresh();
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">CONTROL CENTER</p>
        <h1 className="mt-2 text-3xl font-black text-white">Settings</h1>
        <p className="mt-2 text-sm text-[#A1A8B3]">Manage local-first behavior, units, sync health, and account defaults.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SettingCard icon={User} label="Profile" value={data.user?.name ?? "Local Athlete"} detail={data.user?.email ?? "offline@pgt.local"} />
        <SettingCard icon={Database} label="IndexedDB" value={`${data.pendingSync} queued`} detail={`${data.syncIssues.length} sync issue${data.syncIssues.length === 1 ? "" : "s"}`} />
        <SettingCard icon={Cloud} label="Supabase" value={isSupabaseConfigured ? "Configured" : "Local only"} detail={navigator.onLine ? "Online" : "Offline"} />
      </div>

      <section className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-volt-500/12 text-volt-500">
            <Scale size={18} />
          </span>
          <div>
            <h2 className="font-black text-white">Units</h2>
            <p className="text-sm text-[#8B95A7]">Used for workout weight, dashboard volume, and measurements.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["kg", "lb"] as const).map((unit) => (
            <button
              key={unit}
              className={`rounded-[16px] border p-4 text-left font-black transition duration-200 hover:-translate-y-0.5 ${
                data.settings?.unitSystem === unit ? "border-volt-500/35 bg-volt-500/10 text-volt-500" : "border-white/[0.05] bg-[#11161F] text-white hover:border-white/[0.08]"
              }`}
              onClick={() => updateUnits(unit)}
            >
              {unit.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {data.syncIssues.length ? (
        <section className="rounded-[18px] border border-ember-500/15 bg-[linear-gradient(180deg,rgba(255,91,74,0.08),rgba(15,19,26,1))] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <h2 className="font-black text-[#FF6B6B]">Sync issues</h2>
          <div className="mt-3 space-y-2">
            {data.syncIssues.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-[14px] bg-[#11161F] p-3 text-sm">
                <p className="font-black text-white">{item.entity} · {item.action}</p>
                <p className="mt-1 text-[#8B95A7]">{item.lastError}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={sync}>
          <Cloud size={18} /> Sync now
        </button>
        <button className="btn-secondary inline-flex items-center justify-center gap-2" onClick={resetOnboarding}>
          <RotateCcw size={18} /> Replay onboarding
        </button>
      </div>
    </div>
  );
}

function SettingCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Icon className="text-volt-500" size={20} />
        <CheckCircle2 className="text-[#6D7684]" size={17} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6D7684]">{label}</p>
      <h2 className="mt-1 text-xl font-black text-white">{value}</h2>
      <p className="mt-1 text-sm text-[#8B95A7]">{detail}</p>
    </div>
  );
}
