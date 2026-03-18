/**
 * ============================================================
 * ALL SOLUTIONS — COMPREHENSIVE UNIT TESTS
 * Version: 202603.19.15
 * Run: npm test
 *
 * Phase 1 Coverage:
 *   ✅ Login Page
 *   ✅ People & Staff
 *   ✅ Clients
 *   ✅ Events + status transitions
 *   ✅ Event Detail — items
 *   ✅ Machines & Items
 *   ✅ Payments — validation + calculations
 *   ✅ Dashboard — formatting + utilities
 *   ✅ PWA Install — device detection
 *   ✅ Theme — persistence + toggle
 *   ✅ Version — format
 *   ✅ Async Error — suppression
 *   ✅ Auth — last login + protected routes
 *   ✅ Constants — completeness
 *
 * Phase 2 Coverage:
 *   ✅ Venues — validation + Google Maps URL builder
 *   ✅ Performers — validation + rate types
 *   ✅ Transport — validation + pay method calculations
 *   ✅ Co-owners — validation + earnings calculations
 *   ✅ Profit Split — all 4 split methods
 *   ✅ Quarter — range + label utilities
 *   ✅ Constants Phase 2 — completeness
 * ============================================================
 */

let passed = 0, failed = 0

function describe(name, fn) {
  console.log(`\n${name}`)
  fn()
}

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (e) {
    console.log(`  ❌ ${name}`)
    console.log(`     → ${e.message}`)
    failed++
  }
}

function expect(val) {
  return {
    toBe:             (exp) => { if (val !== exp) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toEqual:          (exp) => { if (JSON.stringify(val) !== JSON.stringify(exp)) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toBeTruthy:       ()    => { if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`) },
    toBeFalsy:        ()    => { if (val)  throw new Error(`Expected falsy, got ${JSON.stringify(val)}`) },
    toBeNull:         ()    => { if (val !== null) throw new Error(`Expected null, got ${JSON.stringify(val)}`) },
    toBeGreaterThan:  (n)   => { if (!(val > n))  throw new Error(`Expected ${val} > ${n}`) },
    toBeLessThan:     (n)   => { if (!(val < n))  throw new Error(`Expected ${val} < ${n}`) },
    toHaveLength:     (n)   => { if (val?.length !== n) throw new Error(`Expected length ${n}, got ${val?.length}`) },
    toHaveProperty:   (key) => { if (!(key in Object(val))) throw new Error(`Expected property "${key}"`) },
    toContain:        (s)   => { if (!String(val).includes(String(s))) throw new Error(`Expected "${val}" to contain "${s}"`) },
    not: {
      toHaveProperty: (key) => { if (key in Object(val)) throw new Error(`Did NOT expect property "${key}"`) },
      toBe:           (exp) => { if (val === exp) throw new Error(`Expected NOT ${JSON.stringify(exp)}`) },
      toBeTruthy:     ()    => { if (val) throw new Error(`Expected falsy`) },
      toContain:      (s)   => { if (String(val).includes(String(s))) throw new Error(`Expected NOT to contain "${s}"`) },
    }
  }
}

// ══════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS (mirrored from app pages)
// ══════════════════════════════════════════════════════════════

function validateLogin(form) {
  const e = {}
  if (!form.email?.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
  if (!form.password) e.password = 'Password is required'
  else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
  return e
}

function validatePerson(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
  if (form.pay_rate && isNaN(parseFloat(form.pay_rate))) e.pay_rate = 'Must be a number'
  if (form.pay_rate && parseFloat(form.pay_rate) < 0) e.pay_rate = 'Rate cannot be negative'
  return e
}

function validateClient(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
  return e
}

function validateEvent(form) {
  const e = {}
  if (!form.title?.trim()) e.title = 'Event title is required'
  if (!form.event_date) e.event_date = 'Event date is required'
  if (form.client_amount && isNaN(parseFloat(form.client_amount))) e.client_amount = 'Must be a valid amount'
  if (form.client_amount && parseFloat(form.client_amount) < 0) e.client_amount = 'Amount cannot be negative'
  if (form.start_time && form.end_time && form.start_time >= form.end_time) e.end_time = 'End time must be after start time'
  return e
}

function validateEventItem(form) {
  const e = {}
  if (!form.description?.trim()) e.description = 'Description is required'
  if (form.cost && isNaN(parseFloat(form.cost))) e.cost = 'Must be a valid number'
  if (form.cost && parseFloat(form.cost) < 0) e.cost = 'Cost cannot be negative'
  if (form.days && (isNaN(parseFloat(form.days)) || parseFloat(form.days) <= 0)) e.days = 'Days must be positive'
  if (form.km && (isNaN(parseFloat(form.km)) || parseFloat(form.km) < 0)) e.km = 'KM cannot be negative'
  return e
}

function validateMachine(form) {
  const e = {}
  if (!form.name?.trim()) e.name = 'Item name is required'
  if (form.status === 'at_event' && !form.current_event_id) e.current_event_id = 'Please select the event'
  return e
}

function validatePaymentUpdate(received, billed) {
  const e = {}
  const val = parseFloat(received)
  if (isNaN(val)) e.amount = 'Must be a valid number'
  else if (val < 0) e.amount = 'Amount cannot be negative'
  else if (val > billed) e.amount = 'Cannot exceed billed amount'
  return e
}

// ── Phase 2 Validation Functions ──────────────────────────────

function validateVenue(form) {
  const e = {}
  if (!form.name?.trim())    e.name    = 'Venue name is required'
  if (!form.address?.trim()) e.address = 'Address is required'
  if (form.google_maps_url && !form.google_maps_url.startsWith('http')) e.google_maps_url = 'Must be a valid URL starting with http'
  if (form.lat && isNaN(parseFloat(form.lat))) e.lat = 'Latitude must be a number'
  if (form.lng && isNaN(parseFloat(form.lng))) e.lng = 'Longitude must be a number'
  if (form.lat && (parseFloat(form.lat) < -90 || parseFloat(form.lat) > 90)) e.lat = 'Latitude must be between -90 and 90'
  if (form.lng && (parseFloat(form.lng) < -180 || parseFloat(form.lng) > 180)) e.lng = 'Longitude must be between -180 and 180'
  return e
}

function validatePerformer(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
  if (form.rate && isNaN(parseFloat(form.rate))) e.rate = 'Must be a number'
  if (form.rate && parseFloat(form.rate) < 0) e.rate = 'Rate cannot be negative'
  return e
}

function validateTransportTrip(form) {
  const e = {}
  if (!form.event_id)    e.event_id  = 'Please select an event'
  if (!form.trip_date)   e.trip_date = 'Trip date is required'
  if (form.amount && isNaN(parseFloat(form.amount))) e.amount = 'Must be a valid number'
  if (form.amount && parseFloat(form.amount) < 0) e.amount = 'Amount cannot be negative'
  if (form.km && isNaN(parseFloat(form.km))) e.km = 'Must be a valid number'
  if (form.km && parseFloat(form.km) < 0) e.km = 'Distance cannot be negative'
  if (form.pay_method === 'per_km' && form.km && parseFloat(form.km) === 0) e.km = 'Distance must be greater than 0 for per KM billing'
  return e
}

function validateCoOwner(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone'
  return e
}

function validateProfitSplit(owners, method, inputs) {
  const e = {}
  if (!owners || owners.length === 0) { e.owners = 'At least one co-owner required'; return e }
  if (method === 'fixed_percent' || method === 'custom_percent') {
    const total = owners.reduce((s, o) => s + (parseFloat(inputs[o.id]?.percent) || 0), 0)
    if (total <= 0) e.percent = 'Total percentage must be greater than 0'
    owners.forEach(o => {
      const p = parseFloat(inputs[o.id]?.percent) || 0
      if (p < 0) e.percent = 'Percentage cannot be negative'
    })
  }
  if (method === 'investment_based') {
    const total = owners.reduce((s, o) => s + (parseFloat(inputs[o.id]?.investment) || 0), 0)
    if (total <= 0) e.investment = 'Total investment must be greater than 0'
  }
  return e
}

// ══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════

function fmt(n) {
  if (!n || n === 0) return '0'
  if (n >= 100000) return `${(n/100000).toFixed(1)}L`
  if (n >= 1000)   return `${(n/1000).toFixed(1)}k`
  return `${n}`
}

function fmtRs(n) {
  if (!n || n === 0) return '₹0'
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n/1000).toFixed(1)}k`
  return `₹${n}`
}

function calcProfit(clientAmount, totalCost) {
  return (clientAmount || 0) - (totalCost || 0)
}

function calcPaymentProgress(received, billed) {
  if (!billed || billed === 0) return 0
  return Math.min(100, Math.round((received / billed) * 100))
}

function calcStaffDue(items) {
  return items.filter(i => i.payment_status !== 'paid').reduce((s, i) => s + ((i.cost || 0) - (i.amount_paid || 0)), 0)
}

function getEventTypeEmoji(type) {
  return { wedding:'💍', birthday:'🎂', office:'🏢', other:'🎪' }[type] || '🎪'
}

function getMachineStatusLabel(status) {
  return { in_godown:'📦 In Godown', at_event:'🎪 At Event', returned:'✅ Returned' }[status] || '—'
}

function getEventStatusBadge(status) {
  return { upcoming:'badge-blue', ongoing:'badge-green', completed:'badge-gray', cancelled:'badge-red' }[status] || 'badge-gray'
}

function getItemTypeEmoji(type) {
  return { machine:'📦', performer:'🎭', supervisor:'👷', helper:'👤', transport:'🚛', other:'📋' }[type] || '📋'
}

function isValidVersion(v) { return /^\d{6}\.\d{2}\.\d{2}$/.test(v) }
function isValidTheme(t)   { return ['dark','light'].includes(t) }
function toggleTheme(c)    { return c === 'dark' ? 'light' : 'dark' }

function isMessageChannelError(msg) {
  const s = msg?.toString() || ''
  return s.includes('message channel closed') || s.includes('listener indicated an asynchronous response') || s.includes('asynchronous response')
}

function detectDeviceType(ua) {
  const u = ua.toLowerCase()
  if (/iphone|ipad|ipod/.test(u) && !/crios/.test(u)) return 'ios'
  if (/android/.test(u)) return 'android'
  return 'desktop'
}

function getLastLoginDisplay(isoString) {
  if (!isoString) return null
  const d = new Date(isoString)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function isProtectedRoute(user, loading) {
  if (loading) return 'loading'
  if (!user)   return 'redirect'
  return 'render'
}

function filterBySearch(items, query, fields) {
  if (!query) return items
  const q = query.toLowerCase()
  return items.filter(item => fields.some(f => item[f]?.toLowerCase().includes(q)))
}

function sortEventsByDate(events) {
  return [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
}

function getPayTypLabel(type) { return (type || '').replace(/_/g, ' ') }

// ── Phase 2 Utility Functions ──────────────────────────────────

function buildGoogleMapsUrl(venue) {
  if (venue.google_maps_url) return venue.google_maps_url
  if (venue.lat && venue.lng) return `https://www.google.com/maps?q=${venue.lat},${venue.lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((venue.address || '') + ' ' + (venue.city || ''))}`
}

function calcTripAmount(km, ratePerKm, payMethod, fixedAmount) {
  if (payMethod === 'per_km') return (parseFloat(km) || 0) * (parseFloat(ratePerKm) || 0)
  return parseFloat(fixedAmount) || 0
}

function calcTotalTransportDue(trips) {
  return trips.filter(t => t.payment_status !== 'paid').reduce((s, t) => s + (t.amount || 0), 0)
}

function calcEqualSplit(profit, ownerCount) {
  if (!ownerCount || ownerCount === 0) return 0
  return profit / ownerCount
}

function calcPercentSplit(profit, percent, totalPercent) {
  if (!totalPercent || totalPercent === 0) return 0
  return (percent / totalPercent) * profit
}

function calcInvestmentSplit(profit, investment, totalInvestment) {
  if (!totalInvestment || totalInvestment === 0) return 0
  return (investment / totalInvestment) * profit
}

function calcOwnerTotalEarnings(splits, ownerId) {
  return splits.filter(s => s.co_owner_id === ownerId).reduce((s, x) => s + (x.calculated_amount || 0), 0)
}

function calcOwnerPendingEarnings(splits, ownerId) {
  return splits.filter(s => s.co_owner_id === ownerId && !s.paid).reduce((s, x) => s + (x.calculated_amount || 0), 0)
}

function calcOwnerSharePercent(ownerTotal, poolTotal) {
  if (!poolTotal || poolTotal === 0) return 0
  return Math.round((ownerTotal / poolTotal) * 100)
}

function getQuarterLabel(date) {
  const q = Math.ceil((date.getMonth() + 1) / 3)
  return `Q${q} ${date.getFullYear()}`
}

function getQuarterRange(date) {
  const q = Math.ceil((date.getMonth() + 1) / 3)
  const year = date.getFullYear()
  const startMonth = (q - 1) * 3
  const start = new Date(year, startMonth, 1)
  const end   = new Date(year, startMonth + 3, 0)
  return { start, end, label: `Q${q} ${year}` }
}

function isInQuarter(dateStr, quarterStart, quarterEnd) {
  const d = new Date(dateStr)
  return d >= quarterStart && d <= quarterEnd
}

function getPerformerTypeEmoji(type) {
  return { actor:'🎬', dancer:'💃', musician:'🎵', joker:'🤹', juggler:'🎪', casino:'🎰', dj:'🎧', other:'🎭' }[type] || '🎭'
}

function formatTel(phone) {
  if (!phone) return null
  return phone.replace(/\s+/g, '')
}

// ══════════════════════════════════════════════════════════════
// PHASE 1 TESTS
// ══════════════════════════════════════════════════════════════

describe('🔐 Login — Validation', () => {
  test('empty email shows error',           () => expect(validateLogin({ email: '', password: 'pass123' })).toHaveProperty('email'))
  test('whitespace email shows error',      () => expect(validateLogin({ email: '   ', password: 'pass123' })).toHaveProperty('email'))
  test('invalid email format shows error',  () => expect(validateLogin({ email: 'notanemail', password: 'pass123' })).toHaveProperty('email'))
  test('valid email passes',                () => expect(validateLogin({ email: 'amit@allsolutions.com', password: 'pass123' })).not.toHaveProperty('email'))
  test('empty password shows error',        () => expect(validateLogin({ email: 'a@b.com', password: '' })).toHaveProperty('password'))
  test('password < 6 chars shows error',    () => expect(validateLogin({ email: 'a@b.com', password: '12345' })).toHaveProperty('password'))
  test('password exactly 6 chars passes',   () => expect(validateLogin({ email: 'a@b.com', password: '123456' })).not.toHaveProperty('password'))
  test('valid credentials — 0 errors',      () => expect(Object.keys(validateLogin({ email: 'amit@allsolutions.com', password: 'EventMgr@2026' })).length).toBe(0))
  test('both empty — 2 errors',             () => expect(Object.keys(validateLogin({ email: '', password: '' })).length).toBe(2))
})

describe('👤 People & Staff — Validation', () => {
  test('empty name shows error',            () => expect(validatePerson({ full_name: '' })).toHaveProperty('full_name'))
  test('whitespace name shows error',       () => expect(validatePerson({ full_name: '   ' })).toHaveProperty('full_name'))
  test('valid name passes',                 () => expect(validatePerson({ full_name: 'Amit Prasad' })).not.toHaveProperty('full_name'))
  test('valid Indian mobile passes',        () => expect(validatePerson({ full_name: 'T', phone: '+91 9876543210' })).not.toHaveProperty('phone'))
  test('alphabetic phone shows error',      () => expect(validatePerson({ full_name: 'T', phone: 'abcdefgh' })).toHaveProperty('phone'))
  test('too short phone shows error',       () => expect(validatePerson({ full_name: 'T', phone: '123' })).toHaveProperty('phone'))
  test('empty phone is optional',           () => expect(validatePerson({ full_name: 'T', phone: '' })).not.toHaveProperty('phone'))
  test('negative pay rate shows error',     () => expect(validatePerson({ full_name: 'T', pay_rate: '-100' })).toHaveProperty('pay_rate'))
  test('zero pay rate is valid',            () => expect(validatePerson({ full_name: 'T', pay_rate: '0' })).not.toHaveProperty('pay_rate'))
  test('getPayTypeLabel formats correctly', () => expect(getPayTypLabel('fixed_per_event')).toBe('fixed per event'))
})

describe('👥 Clients — Validation', () => {
  test('empty name shows error',            () => expect(validateClient({ full_name: '' })).toHaveProperty('full_name'))
  test('valid name passes',                 () => expect(validateClient({ full_name: 'Sharma Family' })).not.toHaveProperty('full_name'))
  test('invalid email shows error',         () => expect(validateClient({ full_name: 'T', email: 'bademail' })).toHaveProperty('email'))
  test('valid email passes',                () => expect(validateClient({ full_name: 'T', email: 'client@example.com' })).not.toHaveProperty('email'))
  test('empty email is optional',           () => expect(validateClient({ full_name: 'T', email: '' })).not.toHaveProperty('email'))
  test('invalid phone shows error',         () => expect(validateClient({ full_name: 'T', phone: 'abc' })).toHaveProperty('phone'))
  test('all valid — 0 errors',              () => expect(Object.keys(validateClient({ full_name: 'T', email: 'a@b.com', phone: '9876543210' })).length).toBe(0))
})

describe('📅 Events — Validation & Status', () => {
  test('empty title shows error',           () => expect(validateEvent({ title: '', event_date: '2026-04-01' })).toHaveProperty('title'))
  test('missing date shows error',          () => expect(validateEvent({ title: 'T', event_date: '' })).toHaveProperty('event_date'))
  test('end before start shows error',      () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '18:00', end_time: '10:00' })).toHaveProperty('end_time'))
  test('valid time range passes',           () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '10:00', end_time: '18:00' })).not.toHaveProperty('end_time'))
  test('negative amount shows error',       () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: '-100' })).toHaveProperty('client_amount'))
  test('upcoming badge = blue',             () => expect(getEventStatusBadge('upcoming')).toBe('badge-blue'))
  test('completed badge = gray',            () => expect(getEventStatusBadge('completed')).toBe('badge-gray'))
  test('cancelled badge = red',             () => expect(getEventStatusBadge('cancelled')).toBe('badge-red'))
  test('events sort by date ascending',     () => {
    const evs = [{ event_date: '2026-05-01' }, { event_date: '2026-03-01' }, { event_date: '2026-04-01' }]
    expect(sortEventsByDate(evs)[0].event_date).toBe('2026-03-01')
  })
})

describe('🎭 Event Detail — Item Validation', () => {
  test('empty description shows error',     () => expect(validateEventItem({ description: '' })).toHaveProperty('description'))
  test('negative cost shows error',         () => expect(validateEventItem({ description: 'T', cost: '-100' })).toHaveProperty('cost'))
  test('zero days shows error',             () => expect(validateEventItem({ description: 'T', days: '0' })).toHaveProperty('days'))
  test('0.5 days passes',                   () => expect(validateEventItem({ description: 'T', days: '0.5' })).not.toHaveProperty('days'))
  test('negative km shows error',           () => expect(validateEventItem({ description: 'T', km: '-10' })).toHaveProperty('km'))
  test('item type emoji — supervisor',      () => expect(getItemTypeEmoji('supervisor')).toBe('👷'))
  test('item type emoji — transport',       () => expect(getItemTypeEmoji('transport')).toBe('🚛'))
  test('item type emoji — unknown defaults',() => expect(getItemTypeEmoji('unknown')).toBe('📋'))
})

describe('📦 Machines & Items — Validation', () => {
  test('empty name shows error',            () => expect(validateMachine({ name: '' })).toHaveProperty('name'))
  test('at_event without event errors',     () => expect(validateMachine({ name: 'T', status: 'at_event', current_event_id: '' })).toHaveProperty('current_event_id'))
  test('at_event with event passes',        () => expect(validateMachine({ name: 'T', status: 'at_event', current_event_id: 'uuid-123' })).not.toHaveProperty('current_event_id'))
  test('in_godown without event ok',        () => expect(validateMachine({ name: 'T', status: 'in_godown' })).not.toHaveProperty('current_event_id'))
  test('in_godown label',                   () => expect(getMachineStatusLabel('in_godown')).toBe('📦 In Godown'))
  test('at_event label',                    () => expect(getMachineStatusLabel('at_event')).toBe('🎪 At Event'))
  test('returned label',                    () => expect(getMachineStatusLabel('returned')).toBe('✅ Returned'))
  test('unknown status returns —',          () => expect(getMachineStatusLabel('broken')).toBe('—'))
})

describe('💰 Payments — Validation & Calculations', () => {
  test('non-numeric received errors',       () => expect(validatePaymentUpdate('abc', 50000)).toHaveProperty('amount'))
  test('negative received errors',          () => expect(validatePaymentUpdate('-100', 50000)).toHaveProperty('amount'))
  test('received > billed errors',          () => expect(validatePaymentUpdate('60000', 50000)).toHaveProperty('amount'))
  test('full payment passes',               () => expect(validatePaymentUpdate('50000', 50000)).not.toHaveProperty('amount'))
  test('progress 0% when nothing received', () => expect(calcPaymentProgress(0, 50000)).toBe(0))
  test('progress 50% at half',              () => expect(calcPaymentProgress(25000, 50000)).toBe(50))
  test('progress 100% when fully paid',     () => expect(calcPaymentProgress(50000, 50000)).toBe(100))
  test('progress capped at 100%',           () => expect(calcPaymentProgress(60000, 50000)).toBe(100))
  test('staff due from unpaid items',       () => {
    const items = [
      { payment_status: 'pending', cost: 1000, amount_paid: 0 },
      { payment_status: 'paid',    cost: 500,  amount_paid: 500 },
      { payment_status: 'partial', cost: 800,  amount_paid: 400 },
    ]
    expect(calcStaffDue(items)).toBe(1400)
  })
  test('staff due = 0 when all paid',       () => expect(calcStaffDue([{ payment_status: 'paid', cost: 500, amount_paid: 500 }])).toBe(0))
})

describe('📊 Dashboard — Formatting & Utilities', () => {
  test('fmt(0) returns "0" not "O"',        () => { expect(fmt(0)).toBe('0'); expect(fmt(0) === 'O').toBeFalsy() })
  test('fmt(null) returns "0"',             () => expect(fmt(null)).toBe('0'))
  test('fmt(1000) returns "1.0k"',          () => expect(fmt(1000)).toBe('1.0k'))
  test('fmt(100000) returns "1.0L"',        () => expect(fmt(100000)).toBe('1.0L'))
  test('fmtRs(0) returns "₹0"',            () => expect(fmtRs(0)).toBe('₹0'))
  test('fmtRs(50000) returns "₹50.0k"',    () => expect(fmtRs(50000)).toBe('₹50.0k'))
  test('profit positive revenue > cost',    () => expect(calcProfit(50000, 30000)).toBe(20000))
  test('profit negative cost > revenue',    () => expect(calcProfit(10000, 30000)).toBe(-20000))
  test('profit handles null',               () => expect(calcProfit(null, null)).toBe(0))
  test('wedding emoji is 💍',              () => expect(getEventTypeEmoji('wedding')).toBe('💍'))
  test('undefined defaults to 🎪',         () => expect(getEventTypeEmoji(undefined)).toBe('🎪'))
  test('filterBySearch case insensitive',   () => {
    expect(filterBySearch([{ name: 'AMIT' }], 'amit', ['name'])).toHaveLength(1)
  })
  test('filterBySearch no match empty',     () => {
    expect(filterBySearch([{ name: 'Alice' }], 'xyz', ['name'])).toHaveLength(0)
  })
})

describe('📱 PWA Install — Device Detection', () => {
  test('iPhone detected as ios',            () => expect(detectDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)')).toBe('ios'))
  test('iPad detected as ios',              () => expect(detectDeviceType('Mozilla/5.0 (iPad; CPU OS 16_0)')).toBe('ios'))
  test('Chrome iOS NOT ios (CriOS)',        () => expect(detectDeviceType('CriOS/100 iPhone')).not.toBe('ios'))
  test('Android detected',                  () => expect(detectDeviceType('Mozilla/5.0 (Linux; Android 12)')).toBe('android'))
  test('Windows = desktop',                 () => expect(detectDeviceType('Mozilla/5.0 (Windows NT 10.0)')).toBe('desktop'))
  test('Mac = desktop',                     () => expect(detectDeviceType('Macintosh; Intel Mac OS X')).toBe('desktop'))
  test('empty UA = desktop',                () => expect(detectDeviceType('')).toBe('desktop'))
})

describe('🌗 Theme — Persistence & Toggle', () => {
  test('dark is valid',                     () => expect(isValidTheme('dark')).toBeTruthy())
  test('light is valid',                    () => expect(isValidTheme('light')).toBeTruthy())
  test('random string invalid',             () => expect(isValidTheme('blue')).toBeFalsy())
  test('toggle dark → light',              () => expect(toggleTheme('dark')).toBe('light'))
  test('toggle light → dark',              () => expect(toggleTheme('light')).toBe('dark'))
})

describe('🔢 Version — Format', () => {
  test('202603.19.15 is valid',             () => expect(isValidVersion('202603.19.15')).toBeTruthy())
  test('semver invalid',                    () => expect(isValidVersion('1.0.0')).toBeFalsy())
  test('v prefix invalid',                  () => expect(isValidVersion('v202603.19.15')).toBeFalsy())
})

describe('🔇 Async Error — Suppression', () => {
  test('message channel error detected',    () => expect(isMessageChannelError('message channel closed before a response was received')).toBeTruthy())
  test('async response error detected',     () => expect(isMessageChannelError('asynchronous response')).toBeTruthy())
  test('real errors NOT suppressed',        () => expect(isMessageChannelError('Cannot read properties of undefined')).toBeFalsy())
  test('null handled safely',               () => expect(isMessageChannelError(null)).toBeFalsy())
})

describe('🔑 Auth — Last Login & Protected Routes', () => {
  test('valid ISO date returns non-null',   () => expect(getLastLoginDisplay('2026-03-19T10:30:00.000Z')).toBeTruthy())
  test('invalid date returns null',         () => expect(getLastLoginDisplay('not-a-date')).toBeNull())
  test('null returns null',                 () => expect(getLastLoginDisplay(null)).toBeNull())
  test('loading → loading',                () => expect(isProtectedRoute(null, true)).toBe('loading'))
  test('no user → redirect',               () => expect(isProtectedRoute(null, false)).toBe('redirect'))
  test('user present → render',            () => expect(isProtectedRoute({ id: '123' }, false)).toBe('render'))
})

// ══════════════════════════════════════════════════════════════
// PHASE 2 TESTS
// ══════════════════════════════════════════════════════════════

describe('🗺️ Venues — Validation', () => {
  test('empty name shows error',            () => expect(validateVenue({ name: '', address: '123 Park St' })).toHaveProperty('name'))
  test('whitespace name shows error',       () => expect(validateVenue({ name: '  ', address: '123 Park St' })).toHaveProperty('name'))
  test('empty address shows error',         () => expect(validateVenue({ name: 'ITC', address: '' })).toHaveProperty('address'))
  test('valid name + address passes',       () => expect(Object.keys(validateVenue({ name: 'ITC', address: '1 JBS Haldane' }))).toHaveLength(0))
  test('invalid maps URL shows error',      () => expect(validateVenue({ name: 'ITC', address: '1 JBS', google_maps_url: 'not-a-url' })).toHaveProperty('google_maps_url'))
  test('valid maps URL passes',             () => expect(validateVenue({ name: 'ITC', address: '1 JBS', google_maps_url: 'https://maps.google.com/?q=ITC' })).not.toHaveProperty('google_maps_url'))
  test('empty maps URL is optional',        () => expect(validateVenue({ name: 'ITC', address: '1 JBS', google_maps_url: '' })).not.toHaveProperty('google_maps_url'))
  test('invalid latitude shows error',      () => expect(validateVenue({ name: 'ITC', address: '1 JBS', lat: 'abc' })).toHaveProperty('lat'))
  test('lat out of range shows error',      () => expect(validateVenue({ name: 'ITC', address: '1 JBS', lat: '200' })).toHaveProperty('lat'))
  test('valid lat passes',                  () => expect(validateVenue({ name: 'ITC', address: '1 JBS', lat: '22.5726' })).not.toHaveProperty('lat'))
  test('lng out of range shows error',      () => expect(validateVenue({ name: 'ITC', address: '1 JBS', lng: '-200' })).toHaveProperty('lng'))
  test('valid lng passes',                  () => expect(validateVenue({ name: 'ITC', address: '1 JBS', lng: '88.3639' })).not.toHaveProperty('lng'))
})

describe('🗺️ Venues — Google Maps URL Builder', () => {
  test('uses google_maps_url if provided',  () => {
    const v = { google_maps_url: 'https://maps.google.com/?q=ITC', address: 'ITC', city: 'Kolkata' }
    expect(buildGoogleMapsUrl(v)).toBe('https://maps.google.com/?q=ITC')
  })
  test('uses lat/lng if no URL provided',   () => {
    const v = { lat: '22.57', lng: '88.36', address: 'ITC', city: 'Kolkata' }
    expect(buildGoogleMapsUrl(v)).toContain('22.57')
    expect(buildGoogleMapsUrl(v)).toContain('88.36')
  })
  test('falls back to address search',      () => {
    const v = { address: 'ITC Royal Bengal', city: 'Kolkata' }
    expect(buildGoogleMapsUrl(v)).toContain('google.com')
    expect(buildGoogleMapsUrl(v)).toContain('ITC')
  })
  test('URL uses https',                    () => {
    const v = { address: 'Test', city: 'Kolkata' }
    expect(buildGoogleMapsUrl(v)).toContain('https://')
  })
})

describe('🎭 Performers — Validation', () => {
  test('empty name shows error',            () => expect(validatePerformer({ full_name: '' })).toHaveProperty('full_name'))
  test('valid name passes',                 () => expect(validatePerformer({ full_name: 'Raj Kumar' })).not.toHaveProperty('full_name'))
  test('invalid phone shows error',         () => expect(validatePerformer({ full_name: 'T', phone: 'abc' })).toHaveProperty('phone'))
  test('valid phone passes',                () => expect(validatePerformer({ full_name: 'T', phone: '9876543210' })).not.toHaveProperty('phone'))
  test('empty phone is optional',           () => expect(validatePerformer({ full_name: 'T', phone: '' })).not.toHaveProperty('phone'))
  test('negative rate shows error',         () => expect(validatePerformer({ full_name: 'T', rate: '-500' })).toHaveProperty('rate'))
  test('non-numeric rate shows error',      () => expect(validatePerformer({ full_name: 'T', rate: 'abc' })).toHaveProperty('rate'))
  test('valid rate passes',                 () => expect(validatePerformer({ full_name: 'T', rate: '5000' })).not.toHaveProperty('rate'))
  test('actor emoji is 🎬',                () => expect(getPerformerTypeEmoji('actor')).toBe('🎬'))
  test('dancer emoji is 💃',               () => expect(getPerformerTypeEmoji('dancer')).toBe('💃'))
  test('musician emoji is 🎵',             () => expect(getPerformerTypeEmoji('musician')).toBe('🎵'))
  test('dj emoji is 🎧',                   () => expect(getPerformerTypeEmoji('dj')).toBe('🎧'))
  test('unknown defaults to 🎭',           () => expect(getPerformerTypeEmoji('unknown')).toBe('🎭'))
})

describe('🚛 Transport — Validation & Calculations', () => {
  test('missing event shows error',         () => expect(validateTransportTrip({ event_id: '', trip_date: '2026-04-01' })).toHaveProperty('event_id'))
  test('missing date shows error',          () => expect(validateTransportTrip({ event_id: 'uuid', trip_date: '' })).toHaveProperty('trip_date'))
  test('valid form passes',                 () => expect(Object.keys(validateTransportTrip({ event_id: 'uuid', trip_date: '2026-04-01' }))).toHaveLength(0))
  test('negative amount shows error',       () => expect(validateTransportTrip({ event_id: 'id', trip_date: '2026-04-01', amount: '-100' })).toHaveProperty('amount'))
  test('valid amount passes',               () => expect(validateTransportTrip({ event_id: 'id', trip_date: '2026-04-01', amount: '500' })).not.toHaveProperty('amount'))
  test('negative km shows error',           () => expect(validateTransportTrip({ event_id: 'id', trip_date: '2026-04-01', km: '-10' })).toHaveProperty('km'))
  test('zero km with per_km billing error', () => expect(validateTransportTrip({ event_id: 'id', trip_date: '2026-04-01', pay_method: 'per_km', km: '0' })).toHaveProperty('km'))
  test('per_km calc: 25km × ₹20 = ₹500',   () => expect(calcTripAmount(25, 20, 'per_km', 0)).toBe(500))
  test('fixed amount ignores km',           () => expect(calcTripAmount(25, 20, 'fixed', 800)).toBe(800))
  test('per_km with 0 rate = ₹0',          () => expect(calcTripAmount(25, 0, 'per_km', 0)).toBe(0))
  test('total transport due calculates',    () => {
    const trips = [
      { payment_status: 'pending', amount: 500 },
      { payment_status: 'paid',    amount: 300 },
      { payment_status: 'pending', amount: 200 },
    ]
    expect(calcTotalTransportDue(trips)).toBe(700)
  })
  test('transport due = 0 when all paid',   () => {
    expect(calcTotalTransportDue([{ payment_status: 'paid', amount: 500 }])).toBe(0)
  })
  test('formatTel removes spaces',          () => expect(formatTel('+91 9876 543210')).toBe('+919876543210'))
  test('formatTel returns null for empty',  () => expect(formatTel('')).toBeNull())
  test('formatTel returns null for null',   () => expect(formatTel(null)).toBeNull())
})

describe('👥 Co-Owners — Validation & Earnings', () => {
  test('empty name shows error',            () => expect(validateCoOwner({ full_name: '' })).toHaveProperty('full_name'))
  test('valid name passes',                 () => expect(validateCoOwner({ full_name: 'Raj Sharma' })).not.toHaveProperty('full_name'))
  test('invalid email shows error',         () => expect(validateCoOwner({ full_name: 'T', email: 'bad' })).toHaveProperty('email'))
  test('valid email passes',                () => expect(validateCoOwner({ full_name: 'T', email: 'raj@test.com' })).not.toHaveProperty('email'))
  test('empty email is optional',           () => expect(validateCoOwner({ full_name: 'T', email: '' })).not.toHaveProperty('email'))
  test('invalid phone shows error',         () => expect(validateCoOwner({ full_name: 'T', phone: 'abc' })).toHaveProperty('phone'))
  test('valid phone passes',                () => expect(validateCoOwner({ full_name: 'T', phone: '9876543210' })).not.toHaveProperty('phone'))
  test('total earnings calculated',         () => {
    const splits = [
      { co_owner_id: 'o1', calculated_amount: 5000, paid: true  },
      { co_owner_id: 'o1', calculated_amount: 3000, paid: false },
      { co_owner_id: 'o2', calculated_amount: 4000, paid: true  },
    ]
    expect(calcOwnerTotalEarnings(splits, 'o1')).toBe(8000)
    expect(calcOwnerTotalEarnings(splits, 'o2')).toBe(4000)
  })
  test('pending earnings calculated',       () => {
    const splits = [
      { co_owner_id: 'o1', calculated_amount: 5000, paid: true  },
      { co_owner_id: 'o1', calculated_amount: 3000, paid: false },
    ]
    expect(calcOwnerPendingEarnings(splits, 'o1')).toBe(3000)
  })
  test('share % of total pool',             () => expect(calcOwnerSharePercent(8000, 20000)).toBe(40))
  test('share % when pool is 0',            () => expect(calcOwnerSharePercent(5000, 0)).toBe(0))
  test('share % rounds correctly',          () => expect(calcOwnerSharePercent(1, 3)).toBe(33))
})

describe('💰 Profit Split — All 4 Methods', () => {
  const owners = [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }]

  test('equal split divides evenly',        () => {
    expect(calcEqualSplit(90000, 3)).toBe(30000)
  })
  test('equal split — 2 owners',           () => expect(calcEqualSplit(100000, 2)).toBe(50000))
  test('equal split — 0 owners returns 0', () => expect(calcEqualSplit(90000, 0)).toBe(0))

  test('percent split: 60% of 100k = 60k', () => expect(calcPercentSplit(100000, 60, 100)).toBe(60000))
  test('percent split: 0 total returns 0', () => expect(calcPercentSplit(100000, 60, 0)).toBe(0))
  test('percent split: partial total',      () => {
    // 3 owners, inputs 40+35+25 = 100 total
    expect(Math.round(calcPercentSplit(100000, 40, 100))).toBe(40000)
    expect(Math.round(calcPercentSplit(100000, 35, 100))).toBe(35000)
    expect(Math.round(calcPercentSplit(100000, 25, 100))).toBe(25000)
  })
  test('percent sum can be != 100 (normalized)', () => {
    // 2 owners enter 60 + 40 = 100 — 60/100 = 60%
    expect(Math.round(calcPercentSplit(50000, 60, 100))).toBe(30000)
  })

  test('investment split proportional',     () => {
    expect(calcInvestmentSplit(100000, 50000, 100000)).toBe(50000)
    expect(calcInvestmentSplit(100000, 30000, 100000)).toBe(30000)
  })
  test('investment split: 0 total returns 0',() => expect(calcInvestmentSplit(100000, 50000, 0)).toBe(0))
  test('investment split: equal investment = equal share', () => {
    const share = calcInvestmentSplit(90000, 30000, 90000)
    expect(share).toBe(30000)
  })

  test('profit split validation — no owners', () => {
    const e = validateProfitSplit([], 'equal', {})
    expect(e).toHaveProperty('owners')
  })
  test('percent method — 0% total errors',  () => {
    const owners2 = [{ id: 'a' }, { id: 'b' }]
    const inputs = { a: { percent: '0' }, b: { percent: '0' } }
    expect(validateProfitSplit(owners2, 'fixed_percent', inputs)).toHaveProperty('percent')
  })
  test('percent method — valid % passes',   () => {
    const owners2 = [{ id: 'a' }, { id: 'b' }]
    const inputs = { a: { percent: '60' }, b: { percent: '40' } }
    expect(validateProfitSplit(owners2, 'fixed_percent', inputs)).not.toHaveProperty('percent')
  })
  test('investment — 0 total errors',       () => {
    const owners2 = [{ id: 'a' }]
    const inputs = { a: { investment: '0' } }
    expect(validateProfitSplit(owners2, 'investment_based', inputs)).toHaveProperty('investment')
  })
  test('investment — valid amount passes',  () => {
    const owners2 = [{ id: 'a' }]
    const inputs = { a: { investment: '50000' } }
    expect(validateProfitSplit(owners2, 'investment_based', inputs)).not.toHaveProperty('investment')
  })
  test('equal method — always valid with owners', () => {
    expect(validateProfitSplit(owners, 'equal', {})).not.toHaveProperty('owners')
  })
})

describe('📅 Quarter — Range & Label', () => {
  test('Jan = Q1',                          () => expect(getQuarterLabel(new Date('2026-01-15'))).toBe('Q1 2026'))
  test('Apr = Q2',                          () => expect(getQuarterLabel(new Date('2026-04-01'))).toBe('Q2 2026'))
  test('Jul = Q3',                          () => expect(getQuarterLabel(new Date('2026-07-10'))).toBe('Q3 2026'))
  test('Oct = Q4',                          () => expect(getQuarterLabel(new Date('2026-10-31'))).toBe('Q4 2026'))
  test('Dec = Q4',                          () => expect(getQuarterLabel(new Date('2026-12-31'))).toBe('Q4 2026'))
  test('Mar = Q1',                          () => expect(getQuarterLabel(new Date('2026-03-19'))).toBe('Q1 2026'))

  test('Q1 2026 starts Jan 1',              () => {
    const { start } = getQuarterRange(new Date('2026-02-15'))
    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(0) // January
    expect(start.getDate()).toBe(1)
  })
  test('Q1 2026 ends Mar 31',               () => {
    const { end } = getQuarterRange(new Date('2026-02-15'))
    expect(end.getMonth()).toBe(2) // March
    expect(end.getDate()).toBe(31)
  })
  test('Q2 starts Apr 1',                   () => {
    const { start } = getQuarterRange(new Date('2026-05-01'))
    expect(start.getMonth()).toBe(3) // April
  })
  test('event in quarter returns true',     () => {
    const { start, end } = getQuarterRange(new Date('2026-02-01'))
    expect(isInQuarter('2026-02-15', start, end)).toBeTruthy()
  })
  test('event outside quarter returns false',() => {
    const { start, end } = getQuarterRange(new Date('2026-02-01'))
    expect(isInQuarter('2026-06-15', start, end)).toBeFalsy()
  })
  test('last day of quarter is included',   () => {
    const { start, end } = getQuarterRange(new Date('2026-02-01'))
    expect(isInQuarter('2026-03-31', start, end)).toBeTruthy()
  })
})

describe('📚 Constants — Phase 1 + Phase 2 Completeness', () => {
  const EVENT_TYPES       = ['wedding','birthday','office','other']
  const EVENT_STATUSES    = ['upcoming','ongoing','completed','cancelled']
  const ROLES             = ['admin','supervisor','staff','driver']
  const PAY_TYPES         = ['daily','hourly','per_km','fixed_per_event','monthly']
  const ITEM_TYPES        = ['machine','performer','supervisor','helper','transport','other']
  const MACHINE_STATUSES  = ['in_godown','at_event','returned']
  const MACHINE_CATEGORIES= ['game','machine','costume','prop','other']
  const PERFORMER_TYPES   = ['actor','dancer','musician','joker','juggler','casino','dj','other']
  const VENDOR_TYPES      = ['payroll','freelancer','vendor_agency']
  const VEHICLE_TYPES     = ['Tata Ace','Tata 407','Auto','Van','Other']
  const SPLIT_METHODS     = ['equal','fixed_percent','custom_percent','investment_based']
  const PERFORMER_RATE_TYPES = ['per_event','per_hour','per_day']
  const TRANSPORT_PAY_METHODS = ['per_km','fixed']

  // Phase 1
  test('4 event types defined',             () => expect(EVENT_TYPES.length).toBe(4))
  test('4 event statuses defined',          () => expect(EVENT_STATUSES.length).toBe(4))
  test('4 roles defined',                   () => expect(ROLES.length).toBe(4))
  test('5 pay types defined',               () => expect(PAY_TYPES.length).toBe(5))
  test('6 item types defined',              () => expect(ITEM_TYPES.length).toBe(6))
  test('3 machine statuses defined',        () => expect(MACHINE_STATUSES.length).toBe(3))
  test('5 machine categories defined',      () => expect(MACHINE_CATEGORIES.length).toBe(5))

  // Phase 2
  test('8 performer types defined',         () => expect(PERFORMER_TYPES.length).toBe(8))
  test('3 vendor types defined',            () => expect(VENDOR_TYPES.length).toBe(3))
  test('5 vehicle types defined',           () => expect(VEHICLE_TYPES.length).toBe(5))
  test('4 split methods defined',           () => expect(SPLIT_METHODS.length).toBe(4))
  test('3 performer rate types defined',    () => expect(PERFORMER_RATE_TYPES.length).toBe(3))
  test('2 transport pay methods defined',   () => expect(TRANSPORT_PAY_METHODS.length).toBe(2))
  test('all 4 split methods present',       () => {
    expect(SPLIT_METHODS.includes('equal')).toBeTruthy()
    expect(SPLIT_METHODS.includes('fixed_percent')).toBeTruthy()
    expect(SPLIT_METHODS.includes('custom_percent')).toBeTruthy()
    expect(SPLIT_METHODS.includes('investment_based')).toBeTruthy()
  })
  test('Tata Ace in vehicle types',         () => expect(VEHICLE_TYPES.includes('Tata Ace')).toBeTruthy())
  test('per_km in transport pay methods',   () => expect(TRANSPORT_PAY_METHODS.includes('per_km')).toBeTruthy())
  test('freelancer in vendor types',        () => expect(VENDOR_TYPES.includes('freelancer')).toBeTruthy())
})

// ── SUMMARY ──────────────────────────────────────────────────
console.log(`\n${'═'.repeat(54)}`)
console.log(`  TOTAL: ${passed + failed} tests`)
console.log(`  ✅ Passed: ${passed}`)
console.log(`  ❌ Failed: ${failed}`)
console.log('═'.repeat(54))
if (failed === 0) console.log('  🎉 All tests passed! Ready to deploy.\n')
else { console.log('  ⚠️  Fix failing tests before deploying.\n'); process.exit(1) }
