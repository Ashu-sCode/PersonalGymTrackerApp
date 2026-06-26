# Personal Gym Tracker - PGT

Premium offline-first workout tracker with a muscle heatmap, recovery scoring, body measurements, reminders, PDF export, and optional Supabase sync.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Dexie.js / IndexedDB for local-first storage
- Supabase Auth + PostgreSQL wiring
- Recharts charts
- jsPDF report export
- Vite PWA plugin

## Run locally

```bash
npm install
npm run dev
```

The app works without Supabase. To enable cloud auth and sync, create `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then run `supabase/schema.sql` in the Supabase SQL editor.

## Main Features

- Register/login when Supabase is configured
- Continue immediately in local offline mode
- Add workouts with multiple exercises
- Create custom exercises
- Calculate muscle scores from `sets * reps * weight * contribution`
- Recovery states: Fatigued, Recovering, Almost Ready, Ready
- SVG simple and detailed muscle heatmap
- Dashboard metrics, volume summaries, recovery suggestions
- Body measurement tracking
- Reminder data and browser notification permission request
- PDF backup report
- Pending sync queue for cloud sync

## Project Structure

```text
src/
  algorithms/     muscle scoring and heatmap helpers
  components/     reusable UI
  data/           seed exercises and muscle mappings
  db/             Dexie database setup
  hooks/          app data loader
  lib/            Supabase client
  pages/          routed screens
  services/       persistence, sync, PDF export
  styles/         Tailwind entry
  types/          shared TypeScript models
supabase/
  schema.sql
```

## Deployment

Build with:

```bash
npm run build
```

Deploy the generated `dist/` folder to Vercel, Netlify, or any static host. Configure the Supabase environment variables in the host dashboard when using cloud sync.
