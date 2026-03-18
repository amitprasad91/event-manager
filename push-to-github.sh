#!/bin/bash
# ============================================================
# EventMgr — One-Command GitHub Push Script
# Run this from INSIDE your cloned repo folder:
#   bash push-to-github.sh
# ============================================================

set -e

echo ""
echo "⚡ EventMgr — Pushing Phase 1 to GitHub..."
echo ""

# 1. Make sure we're on dev branch
git checkout dev 2>/dev/null || git checkout -b dev

# 2. Copy all project files into the repo root
# (Run this script from inside your cloned repo folder)

# 3. Stage everything
git add -A

# 4. Commit
git commit -m "feat: phase 1 — events, people, clients, machines, payments, auth

- Supabase schema: profiles, clients, venues, machines, events,
  event_items, transport_trips, co_owners, profit_splits
- React + Vite PWA setup with vite-plugin-pwa
- Auth: login/logout with Supabase Auth + profile context
- Pages: Dashboard, Events, EventDetail, People, Clients,
  Machines, Payments
- Design system: dark industrial gold theme (Syne + DM Sans)
- Tap-to-call on all phone numbers
- Machine status tracking: In Godown / At Event / Returned
- Payment tracker: collect from clients + pay staff
- Mobile responsive sidebar + PWA installable"

# 5. Push to dev
git push origin dev

echo ""
echo "✅ Successfully pushed to dev branch!"
echo ""
echo "Next steps:"
echo "  1. Go to https://supabase.com/dashboard/project/bdrxhprzpsobvgpbeked"
echo "  2. SQL Editor → paste supabase/schema.sql → Run"
echo "  3. cd frontend && npm install && npm run dev"
echo "  4. Open http://localhost:5173"
echo ""
