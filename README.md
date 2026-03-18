# ⚡ All Solutions — Event Business Manager

> A full-stack Progressive Web App (PWA) to manage your event business in Kolkata — bookings, staff, machines, payments, and profit tracking — all in one place.

---

## 📋 Project Overview

**All Solutions** is a business management tool built for an event rental & management company in Kolkata. The app handles:

- 🎪 **Event Bookings** — Weddings, birthdays, corporate events, and more
- 👥 **Staff & Supervisors** — Track roles, pay types, shift assignments
- 📦 **Machines & Inventory** — Selfie booths, walky-talkies, costumes, casino tables — with godown/event status
- 🚛 **Transport** — Tata Ace trips, per-KM or fixed payments
- 🎭 **Performers** — Actors, dancers, musicians, jokers, jugglers (freelancers, payroll, vendors)
- 💰 **Payments** — Collect from clients, pay staff/vendors, track pending amounts
- 📊 **Quarterly Dashboard** — Revenue, costs, profit, team stats
- 🤝 **Co-owner Profit Split** — Equal, percentage, or investment-based splits per event

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite (PWA) |
| Styling | Custom CSS (dark/light theme) |
| Database | Supabase (PostgreSQL, free tier) |
| Auth | Supabase Auth |
| Hosting | Cloudflare Pages (free tier) |
| Fonts | Syne + DM Sans (Google Fonts) |

---

## 🌿 Branch Strategy

```
main   ← Production (live app, auto-deployed by Cloudflare)
dev    ← Development (all work happens here)
```

- Never commit directly to `main`
- Work on `dev` → test → merge to `main` to deploy

---

## 🚀 Setup & Configuration

### 1. Supabase Setup (Database)

1. Go to [supabase.com](https://supabase.com) → create a free project
2. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click **Run**
3. Go to **Settings → API** → copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 2. Create Your Admin User

In **Supabase → Authentication → Users** → **Add user → Create new user**:
- Email: `your@email.com`
- Password: choose a strong password
- ✅ Check **Auto Confirm User**

Then in **SQL Editor**, run:
```sql
UPDATE profiles
SET role = 'admin', is_admin = true, full_name = 'Your Name'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

### 3. Environment Variables

Create a `.env` file in the project root (never commit this):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally

```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### 5. Run Tests

```bash
npm test
```
Runs 120+ unit tests covering all pages and validation logic.

### 6. Build for Production

```bash
npm run build
```

---

## ☁️ Deploy to Cloudflare Pages

1. Push code to GitHub (`main` branch)
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**
3. Select your repo and set:
   - **Root directory:** *(leave blank)*
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add **Environment Variables**:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Save and Deploy** → your app is live!

---

## 📱 Install as Mobile App (PWA)

- **Android:** Chrome → tap the "Install App" button in the sidebar
- **iOS:** Safari → Share → Add to Home Screen
- **Desktop:** Chrome/Edge → click install icon in address bar

---

## 🔢 Version Format

```
202603.19.01
│      │  └── Deploy number (01, 02, 03...)
│      └───── Day of month
└──────────── Year + Month (YYYYMM)
```

---

## 📁 Project Structure

```
├── src/
│   ├── pages/          # All page components
│   ├── components/     # Reusable components (Layout, PWAInstall, etc.)
│   ├── context/        # Auth + Theme context
│   ├── lib/            # Supabase client
│   ├── __tests__/      # Unit tests
│   └── version.js      # App version
├── supabase/
│   └── schema.sql      # Full database schema — run this in Supabase SQL Editor
├── public/             # Static assets
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔐 Security Notes

- Never commit `.env` files to GitHub
- Rotate your Supabase anon key if it was ever shared publicly
- Row Level Security (RLS) is enabled on all tables — only authenticated users can access data

---

## 📞 Support

Built and maintained for **All Solutions, Kolkata**.
For issues or feature requests, contact your developer.
