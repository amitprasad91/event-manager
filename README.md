# ⚡ All Solutions — Event Business Manager

> A full-stack Progressive Web App (PWA) to manage your event business in Kolkata — bookings, staff, machines, payments, venues, transport, performers, and profit tracking — all in one place.

---

## 📋 Project Overview

**All Solutions** is a complete business management tool for an event rental & management company in Kolkata.

### Phase 1 Features
- 🎪 **Event Bookings** — Weddings, birthdays, corporate events
- 👥 **Staff & Supervisors** — Roles, pay types, shift assignments, tap-to-call
- 📦 **Machines & Inventory** — Selfie booths, walky-talkies, costumes — godown/event status
- 💰 **Payments** — Collect from clients (progress bar), pay staff/vendors
- 👤 **Clients Directory** — Tap-to-call, tap-to-email
- 📊 **Dashboard** — Stats, upcoming events, last login

### Phase 2 Features
- 🗺️ **Venues** — Add venues with one-tap Google Maps navigation
- 🎭 **Performers & Artists** — Actors, dancers, musicians, jokers, DJs — freelancer/payroll/agency
- 🚛 **Transport** — Tata Ace trips, per-KM or fixed amount, driver assignment, mark paid
- 👥 **Co-owners** — Business partner directory with earnings tracking
- 💰 **Profit Split** — Per-event split: Equal / Fixed % / Custom % / Investment-based
- 📊 **Quarterly Earnings** — Revenue, costs, net profit, per-person breakdown

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite (PWA — installable on mobile & desktop) |
| Styling | Custom CSS — Dark/Light theme, Cinzel + Cormorant Garamond + DM Sans |
| Database | Supabase (PostgreSQL, free tier) |
| Auth | Supabase Auth (email + password) |
| Hosting | Cloudflare Pages (free tier) |

---

## 🗄️ Database Schema (10 Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | Staff, supervisors, drivers — linked to Supabase Auth |
| `clients` | Client directory |
| `venues` | Venues with Google Maps URLs |
| `events` | Bookings — type, date, client, venue, amounts |
| `event_items` | Per-event items — supervisor, machine, performer, transport |
| `machines` | Godown inventory — In Godown / At Event / Returned |
| `performers` | Actors, dancers, musicians etc. |
| `transport_trips` | Truck trips with KM/fixed payment |
| `co_owners` | Business co-owners directory |
| `profit_splits` | Per-event profit split records |

---

## 🌿 Branch Strategy

```
main   ← Production (live app, auto-deployed by Cloudflare on every push)
dev    ← Development (all work happens here first)
```

**Rule:** Never push directly to `main`. Work on `dev` → test → merge to `main`.

---

## 🚀 Setup & Configuration

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a free project
2. Go to **SQL Editor** → paste the entire `supabase/schema.sql` → click **Run**
3. Go to **Settings → API** → copy your **Project URL** and **Anon Key**

### 2. Create Admin User

In **Supabase → Authentication → Users → Add user → Create new user**:
- Email: `your@email.com`
- Password: strong password
- ✅ **Auto Confirm User**

Then in **SQL Editor**:
```sql
UPDATE profiles
SET role = 'admin', is_admin = true, full_name = 'Your Name'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

### 3. Environment Variables

Create `.env` in project root (never commit this file):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

### 5. Run Tests (163 unit tests)

```bash
npm test
```

### 6. Build for Production

```bash
npm run build
```

---

## ☁️ Deploy to Cloudflare Pages

1. Push code to GitHub (`main` branch)
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**
3. Select your `event-manager` repo and set:
   - **Root directory:** *(leave blank)*
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add **Environment Variables**:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Save and Deploy**

---

## 📱 Install as Mobile App (PWA)

- **Android:** Open in Chrome → tap **"Install App"** in the sidebar
- **iOS Safari:** Tap Share → **"Add to Home Screen"**
- **Desktop Chrome/Edge:** Click install icon in address bar

---

## 🔢 Version Format

```
202603.19.13
│      │  └── Deploy number (01, 02, 03...)
│      └───── Day of month
└──────────── Year + Month (YYYYMM)
```

Version is shown in 3 places, all reading from `src/version.js`:
- Login page (bottom of card)
- Dashboard (LIVE badge, top right)
- Sidebar footer (click to see build notes + last login)

---

## 📁 Project Structure

```
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── EventsPage.jsx          ← Phase 1
│   │   ├── EventDetailPage.jsx     ← Phase 1
│   │   ├── PeoplePage.jsx          ← Phase 1
│   │   ├── ClientsPage.jsx         ← Phase 1
│   │   ├── MachinesPage.jsx        ← Phase 1
│   │   ├── PaymentsPage.jsx        ← Phase 1
│   │   ├── VenuesPage.jsx          ← Phase 2
│   │   ├── PerformersPage.jsx      ← Phase 2
│   │   ├── TransportPage.jsx       ← Phase 2
│   │   ├── CoOwnersPage.jsx        ← Phase 2
│   │   └── ProfitSplitPage.jsx     ← Phase 2
│   ├── components/
│   │   ├── layout/Layout.jsx       ← Sidebar with 4 nav sections
│   │   ├── PWAInstall.jsx          ← Smart install button
│   │   └── VersionBadge.jsx        ← Version + last login
│   ├── context/
│   │   ├── AuthContext.jsx         ← Auth + last login tracking
│   │   └── ThemeContext.jsx        ← Dark/Light theme
│   ├── lib/
│   │   ├── supabase.js             ← Supabase client
│   │   └── constants.js            ← ALL dropdown options, colors, helpers
│   ├── __tests__/
│   │   └── validation.test.js      ← 163 unit tests
│   └── version.js                  ← SINGLE SOURCE OF TRUTH for version
├── supabase/
│   └── schema.sql                  ← Run this in Supabase SQL Editor
├── public/
│   ├── manifest.json               ← PWA manifest
│   └── favicon.svg
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔐 Security Notes

- Never commit `.env` to GitHub (it's in `.gitignore`)
- Rotate your Supabase anon key if ever shared publicly
- Row Level Security (RLS) enabled on all 10 tables
- Only authenticated users can access any data

---

## 🧪 Unit Tests (163 tests)

Tests cover all pages and utilities:
- Login, People, Clients, Events, Event Detail, Machines, Payments
- Dashboard formatting (fmt/fmtRs), profit calc, event type emojis
- PWA device detection (iOS/Android/Desktop)
- Theme toggle persistence
- Version format validation
- Async error suppression
- Auth last login + protected routes
- Constants completeness

---

## 📞 Support

Built for **All Solutions, Kolkata** — Event Management & Rentals.


