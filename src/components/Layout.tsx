import { Activity, Bell, Dumbbell, FileDown, Home, LogOut, Menu, Ruler, Settings, User, Waves } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/add-workout", label: "Add", icon: Dumbbell },
  { to: "/history", label: "History", icon: Activity },
  { to: "/muscle-map", label: "Map", icon: Waves },
  { to: "/measurements", label: "Measures", icon: Ruler },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/export", label: "Export", icon: FileDown },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Layout({ pendingSync, refresh }: { pendingSync: number; refresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-iron-950 text-zinc-100">
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-white/10 bg-iron-900/95 p-4 backdrop-blur transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-volt-500 text-iron-950 shadow-glow">
            <Dumbbell size={24} />
          </div>
          <div>
            <p className="text-lg font-black">PGT</p>
            <p className="text-xs text-zinc-400">Personal Gym Tracker</p>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-volt-500 text-iron-950" : "text-zinc-300 hover:bg-white/8 hover:text-white"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400">
          <div className="mb-2 flex items-center gap-2 text-zinc-200">
            <User size={15} /> Offline ready
          </div>
          {pendingSync} pending sync item{pendingSync === 1 ? "" : "s"}
          <button onClick={refresh} className="mt-3 w-full rounded-md bg-white/10 px-3 py-2 text-zinc-100 transition hover:bg-white/15">
            Refresh data
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-iron-950/85 px-4 backdrop-blur lg:ml-72">
        <button className="rounded-lg border border-white/10 p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-volt-500">Train. Recover. Repeat.</p>
          <h1 className="text-base font-semibold sm:text-xl">Personal Gym Tracker</h1>
        </div>
        <NavLink to="/login" className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:text-white" aria-label="Account">
          <LogOut size={19} />
        </NavLink>
      </header>

      <main className="px-4 py-5 lg:ml-72 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
