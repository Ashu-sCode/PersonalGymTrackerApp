import { Cloud, Database, User } from "lucide-react";
import type { AppData } from "../hooks/useAppData";
import { isSupabaseConfigured } from "../lib/supabase";
import { syncPendingItems } from "../services/syncService";

export function Settings({ data }: { data: AppData }) {
  async function sync() {
    await syncPendingItems();
    await data.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-3xl font-black">Settings</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <User className="mb-4 text-volt-500" />
          <h2 className="font-bold">{data.user?.name}</h2>
          <p className="text-sm text-zinc-400">{data.user?.email}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <Database className="mb-4 text-volt-500" />
          <h2 className="font-bold">IndexedDB</h2>
          <p className="text-sm text-zinc-400">{data.pendingSync} queued sync item{data.pendingSync === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <Cloud className="mb-4 text-volt-500" />
          <h2 className="font-bold">Supabase</h2>
          <p className="text-sm text-zinc-400">{isSupabaseConfigured ? "Configured" : "Not configured"}</p>
        </div>
      </div>
      <button className="btn-primary" onClick={sync}>Sync now</button>
    </div>
  );
}
