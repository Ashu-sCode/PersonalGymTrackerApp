import { CalendarDays, Dumbbell, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { workoutTemplates as builtInWorkoutTemplates } from "../data/seed";
import type { AppData } from "../hooks/useAppData";

const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function PlanCalendar({ data }: { data: AppData }) {
  const todayName = dayOrder[new Date().getDay()];
  const templates = [...builtInWorkoutTemplates, ...data.workoutTemplates];
  const byDay = dayOrder.map((day) => ({ day, templates: templates.filter((template) => template.day.toLowerCase() === day.toLowerCase()) }));
  const todayTemplate = templates.find((template) => template.day.toLowerCase() === todayName.toLowerCase());

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <header className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[radial-gradient(circle_at_15%_0%,rgba(182,255,77,0.15),transparent_34%),linear-gradient(135deg,#151922,#0F131A_58%,#05070A)] p-5 shadow-[0_8px_30px_rgba(0,0,0,.35)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-volt-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-volt-500">PLAN CALENDAR</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Weekly Workout Plan</h1>
            <p className="mt-2 text-sm text-[#A1A8B3]">Review the week and jump straight into today's planned session.</p>
          </div>
          {todayTemplate ? (
            <Link to={`/add-workout?template=${todayTemplate.id}`} className="btn-primary inline-flex items-center justify-center gap-2">
              <Dumbbell size={18} /> Start today's workout
            </Link>
          ) : (
            <Link to="/add-workout" className="btn-secondary inline-flex items-center justify-center gap-2">
              <Plus size={18} /> Build workout
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {byDay.map(({ day, templates: dayTemplates }) => {
          const active = day === todayName;
          return (
            <section
              key={day}
              className={`rounded-[18px] border bg-[linear-gradient(180deg,#151922_0%,#0F131A_100%)] p-4 shadow-[0_8px_30px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 ${
                active ? "border-volt-500/30" : "border-white/[0.06] hover:border-white/[0.08]"
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6D7684]">{active ? "Today" : "Training day"}</p>
                  <h2 className="mt-1 text-xl font-black text-white">{day}</h2>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-volt-500/12 text-volt-500">
                  <CalendarDays size={18} />
                </span>
              </div>
              {dayTemplates.length ? (
                <div className="space-y-3">
                  {dayTemplates.map((template) => (
                    <div key={template.id} className="rounded-[16px] border border-white/[0.05] bg-[#11161F] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-white">{template.title}</p>
                          <p className="text-xs font-bold text-[#A1A8B3]">{template.focus} · {template.sets.length} exercises</p>
                        </div>
                        {template.isCustom ? <span className="rounded-full bg-volt-500/10 px-2 py-1 text-[10px] font-black text-volt-500">Custom</span> : null}
                      </div>
                      {template.notes ? <p className="mt-2 text-xs text-[#8B95A7]">{template.notes}</p> : null}
                      <Link to={`/add-workout?template=${template.id}`} className="mt-3 inline-flex items-center gap-2 text-sm font-black text-volt-500">
                        <Sparkles size={15} /> Start this plan
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[16px] border border-white/[0.05] bg-[#11161F] p-4 text-sm text-[#8B95A7]">Rest day. Add a custom loadout if you want training here.</div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
