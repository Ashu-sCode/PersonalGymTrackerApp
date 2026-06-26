create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id text primary key,
  name text not null,
  category text not null,
  is_custom boolean not null default false,
  user_id uuid references public.users(id) on delete cascade
);

create table if not exists public.muscles (
  id text primary key,
  name text not null,
  group_name text not null,
  view_type text not null check (view_type in ('simple', 'detailed'))
);

create table if not exists public.exercise_muscle_map (
  id text primary key,
  exercise_id text not null references public.exercises(id) on delete cascade,
  muscle_id text not null references public.muscles(id) on delete cascade,
  contribution_percentage numeric not null check (contribution_percentage >= 0 and contribution_percentage <= 100)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id text not null references public.exercises(id),
  sets integer not null check (sets > 0),
  reps integer not null check (reps > 0),
  weight numeric not null check (weight >= 0)
);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  body_weight numeric,
  chest numeric,
  waist numeric,
  arms numeric,
  thighs numeric,
  shoulders numeric,
  calves numeric
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  time time not null,
  repeat_type text not null check (repeat_type in ('daily', 'weekly', 'monthly')),
  enabled boolean not null default true
);

alter table public.users enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.body_measurements enable row level security;
alter table public.reminders enable row level security;

create policy "Users manage their profile" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage exercises" on public.exercises
  for all using (user_id is null or auth.uid() = user_id) with check (user_id is null or auth.uid() = user_id);

create policy "Users manage workouts" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage workout sets" on public.workout_sets
  for all using (
    exists (select 1 from public.workouts where workouts.id = workout_sets.workout_id and workouts.user_id = auth.uid())
  );

create policy "Users manage measurements" on public.body_measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage reminders" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
