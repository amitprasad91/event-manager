/**
 * ============================================================
 * ALL SOLUTIONS — CENTRAL CONSTANTS
 * Single source of truth for all dropdown options,
 * status maps, badge colors, emoji maps, and thresholds.
 * Never hardcode these values in components.
 * ============================================================
 */

// ── Event ────────────────────────────────────────────────────
export const EVENT_TYPES = [
  { value: 'wedding',  label: 'Wedding',       emoji: '💍' },
  { value: 'birthday', label: 'Birthday Party', emoji: '🎂' },
  { value: 'office',   label: 'Office / Corporate', emoji: '🏢' },
  { value: 'other',    label: 'Other',          emoji: '🎪' },
]

export const EVENT_STATUSES = [
  { value: 'upcoming',  label: 'Upcoming',  badge: 'badge-blue'  },
  { value: 'ongoing',   label: 'Ongoing',   badge: 'badge-green' },
  { value: 'completed', label: 'Completed', badge: 'badge-gray'  },
  { value: 'cancelled', label: 'Cancelled', badge: 'badge-red'   },
]

// ── People ───────────────────────────────────────────────────
export const ROLES = [
  { value: 'admin',      label: 'Admin',      badge: 'badge-gold'   },
  { value: 'supervisor', label: 'Supervisor', badge: 'badge-orange' },
  { value: 'staff',      label: 'Staff',      badge: 'badge-blue'   },
  { value: 'driver',     label: 'Driver',     badge: 'badge-green'  },
]

export const PAY_TYPES = [
  { value: 'daily',          label: 'Daily' },
  { value: 'hourly',         label: 'Per Hour' },
  { value: 'per_km',         label: 'Per KM' },
  { value: 'fixed_per_event',label: 'Fixed Per Event' },
  { value: 'monthly',        label: 'Monthly' },
]

// ── Event Items ──────────────────────────────────────────────
export const ITEM_TYPES = [
  { value: 'machine',    label: 'Machine',    emoji: '📦' },
  { value: 'performer',  label: 'Performer',  emoji: '🎭' },
  { value: 'supervisor', label: 'Supervisor', emoji: '👷' },
  { value: 'helper',     label: 'Helper',     emoji: '👤' },
  { value: 'transport',  label: 'Transport',  emoji: '🚛' },
  { value: 'other',      label: 'Other',      emoji: '📋' },
]

export const ITEM_PAY_TYPES = [
  { value: 'fixed',   label: 'Fixed' },
  { value: 'daily',   label: 'Daily' },
  { value: 'hourly',  label: 'Per Hour' },
  { value: 'per_km',  label: 'Per KM' },
  { value: 'monthly', label: 'Monthly' },
]

// ── Machines ─────────────────────────────────────────────────
export const MACHINE_CATEGORIES = [
  { value: 'game',     label: 'Game' },
  { value: 'machine',  label: 'Machine' },
  { value: 'costume',  label: 'Costume' },
  { value: 'prop',     label: 'Prop' },
  { value: 'other',    label: 'Other' },
]

export const MACHINE_STATUSES = [
  { value: 'in_godown', label: '📦 In Godown', badge: 'badge-blue'   },
  { value: 'at_event',  label: '🎪 At Event',  badge: 'badge-orange' },
  { value: 'returned',  label: '✅ Returned',  badge: 'badge-green'  },
]

// Godowns loaded dynamically from DB — this is just the default fallback
export const DEFAULT_GODOWNS = ['Godown A', 'Godown B', 'Godown C']

// ── Performers ───────────────────────────────────────────────
export const PERFORMER_TYPES = [
  { value: 'actor',    label: 'Actor' },
  { value: 'dancer',   label: 'Dancer' },
  { value: 'musician', label: 'Musician' },
  { value: 'joker',    label: 'Joker' },
  { value: 'juggler',  label: 'Juggler' },
  { value: 'casino',   label: 'Casino Dealer' },
  { value: 'dj',       label: 'DJ' },
  { value: 'other',    label: 'Other' },
]

export const VENDOR_TYPES = [
  { value: 'payroll',        label: 'On Payroll' },
  { value: 'freelancer',     label: 'Freelancer' },
  { value: 'vendor_agency',  label: 'Vendor / Agency' },
]

// ── Transport ────────────────────────────────────────────────
export const VEHICLE_TYPES = [
  { value: 'Tata Ace',   label: 'Tata Ace (Mini Truck)' },
  { value: 'Tata 407',   label: 'Tata 407 (Medium Truck)' },
  { value: 'Auto',       label: 'Auto Rickshaw' },
  { value: 'Van',        label: 'Van' },
  { value: 'Other',      label: 'Other' },
]

export const TRANSPORT_PAY_METHODS = [
  { value: 'per_km', label: 'Per KM' },
  { value: 'fixed',  label: 'Fixed Amount' },
]

// ── Profit Split ─────────────────────────────────────────────
export const SPLIT_METHODS = [
  { value: 'equal',            label: 'Equal Split' },
  { value: 'fixed_percent',    label: 'Fixed Percentage' },
  { value: 'custom_percent',   label: 'Custom Percentage' },
  { value: 'investment_based', label: 'Investment Based' },
]

// ── Number formatting thresholds ────────────────────────────
export const LAKH = 100000
export const THOUSAND = 1000

// ── Design tokens (mirror CSS vars for inline styles) ────────
export const COLORS = {
  gold:   { hex: '#f0b429', glow: 'rgba(240,180,41,0.15)', dim: 'rgba(240,180,41,0.08)', border: 'rgba(240,180,41,0.2)' },
  green:  { hex: '#10d4a0', glow: 'rgba(16,212,160,0.12)',  dim: 'rgba(16,212,160,0.08)',  border: 'rgba(16,212,160,0.2)' },
  red:    { hex: '#ff5c7a', glow: 'rgba(255,92,122,0.12)',  dim: 'rgba(255,92,122,0.08)',  border: 'rgba(255,92,122,0.2)' },
  blue:   { hex: '#6c63ff', glow: 'rgba(108,99,255,0.12)',  dim: 'rgba(108,99,255,0.08)',  border: 'rgba(108,99,255,0.2)' },
  orange: { hex: '#ff8c42', glow: 'rgba(255,140,66,0.12)',  dim: 'rgba(255,140,66,0.08)',  border: 'rgba(255,140,66,0.2)' },
  teal:   { hex: '#00e5cc', glow: 'rgba(0,229,204,0.12)',   dim: 'rgba(0,229,204,0.08)',   border: 'rgba(0,229,204,0.2)' },
  white:  { hex: '#ffffff' },
  bg:     { hex: '#080b12' },
  error:  { hex: '#ff5c7a' },
}

// ── Helper functions ─────────────────────────────────────────

/** Get label for a value from any options array */
export function getLabel(options, value) {
  return options.find(o => o.value === value)?.label || value
}

/** Get badge class for event status */
export function getEventStatusBadge(status) {
  return EVENT_STATUSES.find(s => s.value === status)?.badge || 'badge-gray'
}

/** Get badge class for event type */
export function getEventTypeBadge(type) {
  const map = { wedding: 'badge-gold', birthday: 'badge-orange', office: 'badge-blue', other: 'badge-gray' }
  return map[type] || 'badge-gray'
}

/** Get emoji for event type */
export function getEventTypeEmoji(type) {
  return EVENT_TYPES.find(t => t.value === type)?.emoji || '🎪'
}

/** Get badge class for role */
export function getRoleBadge(role) {
  return ROLES.find(r => r.value === role)?.badge || 'badge-gray'
}

/** Get emoji for item type */
export function getItemTypeEmoji(type) {
  return ITEM_TYPES.find(t => t.value === type)?.emoji || '📋'
}

/** Get machine status info */
export function getMachineStatus(status) {
  return MACHINE_STATUSES.find(s => s.value === status) || { label: '—', badge: 'badge-gray' }
}

/** Format number — rupee formatting */
export function fmt(n) {
  if (!n || n === 0) return '0'
  if (n >= LAKH)    return `${(n / LAKH).toFixed(1)}L`
  if (n >= THOUSAND) return `${(n / THOUSAND).toFixed(1)}k`
  return `${n}`
}

export function fmtRs(n) {
  if (!n || n === 0) return '₹0'
  if (n >= LAKH)    return `₹${(n / LAKH).toFixed(1)}L`
  if (n >= THOUSAND) return `₹${(n / THOUSAND).toFixed(1)}k`
  return `₹${n}`
}

/** Payment progress percentage */
export function calcProgress(received, billed) {
  if (!billed || billed === 0) return 0
  return Math.min(100, Math.round((received / billed) * 100))
}

/** Staff dues total */
export function calcStaffDue(items) {
  return items
    .filter(i => i.payment_status !== 'paid')
    .reduce((s, i) => s + ((i.cost || 0) - (i.amount_paid || 0)), 0)
}

/** Profit calculation */
export function calcProfit(clientAmount, totalCost) {
  return (clientAmount || 0) - (totalCost || 0)
}

// ── Phase 2 Additions ────────────────────────────────────────

export const PERFORMER_RATE_TYPES = [
  { value: 'per_event', label: 'Per Event' },
  { value: 'per_hour',  label: 'Per Hour' },
  { value: 'per_day',   label: 'Per Day' },
]

export const PAYMENT_STATUSES = [
  { value: 'pending',  label: 'Pending',  badge: 'badge-red'    },
  { value: 'partial',  label: 'Partial',  badge: 'badge-orange' },
  { value: 'paid',     label: 'Paid',     badge: 'badge-green'  },
]

export const TRIP_STATUSES = [
  { value: 'pending', label: 'Pending', badge: 'badge-red'   },
  { value: 'paid',    label: 'Paid',    badge: 'badge-green' },
]

/** Open Google Maps navigation for an address or URL */
export function openGoogleMaps(addressOrUrl) {
  if (!addressOrUrl) return
  if (addressOrUrl.startsWith('http')) {
    window.open(addressOrUrl, '_blank')
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOrUrl)}`, '_blank')
  }
}

/** Format phone for tel: link */
export function formatTel(phone) {
  if (!phone) return null
  return phone.replace(/\s+/g, '')
}

/** Quarter label */
export function getQuarterLabel(date = new Date()) {
  const q = Math.ceil((date.getMonth() + 1) / 3)
  return `Q${q} ${date.getFullYear()}`
}

/** Get quarter date range */
export function getQuarterRange(date = new Date()) {
  const q = Math.ceil((date.getMonth() + 1) / 3)
  const year = date.getFullYear()
  const startMonth = (q - 1) * 3
  const start = new Date(year, startMonth, 1)
  const end   = new Date(year, startMonth + 3, 0)
  return { start, end, label: `Q${q} ${year}` }
}
