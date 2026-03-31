# Changelog — All Solutions Event Manager

All notable changes to this project are documented here.  
Format: `[version] YYYY-MM-DD — Summary`

---

## [0.3.1] 2026-03-31 — Sign Out Fix

### PR #7 · `fix(signout)` — Sign Out button clearly labelled and always visible
- **Root cause**: Sign Out was the entire user-pill (avatar + name + role) with only a tiny 14px `LogOut` icon at 25% opacity — users could not identify it as a clickable sign-out action
- Separated user info display (non-interactive `.user-pill`) from a dedicated `Sign Out` button (`.sidebar-action.logout`)
- New Sign Out button uses the existing `.sidebar-action.logout` style — red label, red hover state, clearly labelled with text
- Removed the now-unused `.user-signout-btn` CSS class
- Updated light-mode override for `.user-pill` display only
- `src/version.js`: `202603.31.01` → `202603.31.02`
- `package.json`: `0.3.0` → `0.3.1`

---

## [0.3.0] 2026-03-31 — Design System Overhaul

### PR #6 · `redesign(login)` — Login page complete redesign
- **Dark mode**: replaced near-identical black layers (`#0d0818` / `rgba(13,8,26)`) with clear visual depth — `#111827` page, deep blue-violet gradient panel, `#1e2a3a` card
- **Light mode**: warm cream page (`#f6f4ef`), pure white card with soft shadow
- Brand section: icon + Cinzel wordmark + subtitle in one clean horizontal row
- Form inputs: 48px min-height, focus rings with accent glow, icon color transitions on focus
- Submit button: gold gradient, hover lift animation, clear loading state
- Right panel redesigned — feature grid with lucide-react icons replacing scattered emoji decorations
- `focusedField` state drives per-field icon colour transitions
- Responsive: right panel hidden on mobile, padding adjusts for screens < 400px

### PR #5 · `fix(theme)` — Sidebar and login page theme awareness
- **Sidebar was always dark** regardless of theme toggle — fixed with full `[data-theme="light"]` CSS overrides
- Light sidebar: warm white bg (`var(--bg-2)`), warm nav text, accent-colored active item
- **LoginPage was ignoring theme entirely** — added `useTheme()` hook with `isDark` flag driving all inline colors
- Light login: cream bg, white card with gold border, dark readable text
- Mobile header in light mode: uses `var(--bg-2)` + border instead of hardcoded dark

### PR #4 · `fix(theme)` — Design system v3: fonts, colors, mobile
- **Light theme overhaul**: replaced cold lavender (`#f0f4ff`) with warm cream/parchment palette (`#f6f4ef`)
- **Dark theme refined**: deeper blue-blacks (`#080c17`) for more dramatic feel
- Removed duplicate `@import` from `src/index.css` — fonts already loaded in `index.html`
- Standardised brand font to `Cinzel` in `.brand-text-main`
- Added Syne weight 500 to `index.html` font link
- **Typography bump**: nav labels `0.60→0.65rem`, badges `0.65→0.68rem`, stat/table headers `0.68→0.70rem`, user role `0.65→0.70rem`
- Buttons: primary button lift on hover (`translateY(-1px)`), min-height `38px`, `btn-icon` min `36×36px`
- Consolidated 3 duplicate `@media (max-width: 768px)` blocks into one
- Added `@media (max-width: 400px)` breakpoint for very small phones
- Comprehensive `[data-theme="light"]` rules for forms, tables, cards, modals, buttons, empty states

### Version files
- `src/version.js`: `202603.20.04` → `202603.31.01`
- `package.json`: `0.2.0` → `0.3.0`

---

## [0.2.0] 2026-03-20 — Payments & Hotfixes

### Changes
- `PaymentsPage` fully rewritten — clean tab structure, modal moved outside ternary
- Various bug fixes and stability improvements

---

## [0.1.0] — Initial Release

### Features shipped
- Dashboard with stat cards (revenue, events, staff, payments)
- Events management (create, edit, delete, status tracking)
- People & Staff management with role assignments
- Clients management
- Performers management
- Venues management
- Machines & Items inventory
- Transport tracking
- Payments with tab structure (collected / outstanding)
- Co-Owners management
- Profit Split calculator
- User Guide
- Role-based access control (admin / supervisor / staff / driver)
- Dark/light theme toggle with localStorage persistence
- PWA support (installable on mobile & desktop)
- Supabase backend (PostgreSQL + Auth)
- Cloudflare Pages deployment
