import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, tone = "default" }: { label: string; value: string | number; icon: LucideIcon; tone?: "default" | "hot" | "good" }) {
  const toneClass = tone === "hot" ? "text-ember-500" : tone === "good" ? "text-volt-500" : "text-zinc-200";
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-4 flex items-center justify-between text-zinc-400">
        <span className="text-sm">{label}</span>
        <Icon className={toneClass} size={19} />
      </div>
      <p className={`text-2xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}
