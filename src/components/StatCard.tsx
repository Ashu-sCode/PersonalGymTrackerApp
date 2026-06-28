import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, tone = "default" }: { label: string; value: string | number; icon: LucideIcon; tone?: "default" | "hot" | "good" }) {
  const toneClass = tone === "hot" ? "text-ember-500" : tone === "good" ? "text-volt-500" : "text-zinc-200";
  return (
    <div className="group rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-volt-500/30">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6D7684]">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.045]">
          <Icon className={toneClass} size={19} />
        </span>
      </div>
      <p className={`text-2xl font-black ${tone === "default" ? "text-white" : toneClass}`}>{value}</p>
      <div className={`mt-3 h-1 w-10 rounded-full ${tone === "hot" ? "bg-ember-500/70" : "bg-volt-500/70"}`} />
    </div>
  );
}
