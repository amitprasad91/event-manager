# ⚡ EventMgr — Event Business Manager

A full-stack web app (PWA) to manage your event business — bookings, staff, payments, machines, and profit splits.

## Tech Stack
- **Frontend:** React + Vite (PWA — works on mobile & desktop)
- **Backend/DB:** Supabase (free tier)
- **Hosting:** Vercel (free tier)

## Branch Strategy
- `main` → Production (deploy via Vercel)
- `dev` → All development work happens here

## Quick Start

### 1. Setup Supabase
1. Go to https://supabase.com and create a free project
2. Go to SQL Editor → paste the entire `supabase/schema.sql` file → Run
3. Copy your project URL and anon key from Settings → API

### 2. Setup Frontend
```bash
cd frontend
cp .env.example .env
# Fill in your Supabase URL and anon key in .env
npm install
npm run dev
```

### 3. Deploy to Vercel
1. Push to GitHub (`main` branch)
2. Connect repo on https://vercel.com
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Phases
- ✅ Phase 1: Auth, Events, People, Clients, Machines, Payments
- 🔜 Phase 2: Transport tracker, Venues, Performers
- 🔜 Phase 3: Co-owner profit split, Quarterly dashboard
- 🔜 Phase 4: Google Maps deep integration, Call shortcuts
