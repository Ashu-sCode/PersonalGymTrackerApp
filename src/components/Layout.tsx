import { Activity, Bell, CalendarDays, Dumbbell, FileDown, Home, Library, LogOut, Menu, Ruler, Settings, User, Waves } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/plan", label: "Plan", icon: CalendarDays },
  { to: "/add-workout", label: "Add", icon: Dumbbell },
  { to: "/history", label: "History", icon: Activity },
  { to: "/muscle-map", label: "Map", icon: Waves },
  { to: "/exercises", label: "Library", icon: Library },
  { to: "/measurements", label: "Measures", icon: Ruler },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/export", label: "Export", icon: FileDown },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Layout({ pendingSync, refresh }: { pendingSync: number; refresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070A] text-zinc-100">
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-white/[0.06] bg-[#080B10]/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] backdrop-blur transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-volt-500 text-iron-950 shadow-glow">
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
                `flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-bold transition duration-200 ${isActive ? "bg-volt-500 text-iron-950 shadow-[0_8px_24px_rgba(182,255,77,.16)]" : "text-[#A1A8B3] hover:bg-white/[0.06] hover:text-white"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-3 text-xs text-[#8B95A7] shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          <div className="mb-2 flex items-center gap-2 text-zinc-200">
            <User size={15} /> Offline ready
          </div>
          {pendingSync} pending sync item{pendingSync === 1 ? "" : "s"}
          <button onClick={refresh} className="mt-3 w-full rounded-[14px] bg-[#11161F] px-3 py-2 font-bold text-zinc-100 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]">
            Refresh data
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#05070A]/85 px-4 backdrop-blur lg:ml-72">
        <button className="rounded-[14px] border border-white/[0.06] bg-[#11161F] p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-volt-500">Train. Recover. Repeat.</p>
          <h1 className="text-base font-semibold sm:text-xl">Personal Gym Tracker</h1>
        </div>
        <NavLink to="/login" className="rounded-[14px] border border-white/[0.06] bg-[#11161F] p-2 text-zinc-300 transition hover:bg-white/[0.06] hover:text-white" aria-label="Account">
          <LogOut size={19} />
        </NavLink>
      </header>

      <main className="px-3 py-3 sm:px-4 sm:py-4 lg:ml-72 lg:px-8 lg:py-5">
        <Outlet />
      </main>
    </div>
  );
}
