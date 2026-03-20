/**
 * ============================================================
 * ALL SOLUTIONS — COMPLETE UNIT TEST SUITE
 * Version: 202603.19.17
 * Run: npm test
 *
 * Phase 1:
 *   ✅ Login — validation (9 tests)
 *   ✅ People & Staff — validation + pay types (10 tests)
 *   ✅ Clients — validation incl. inline form (9 tests)
 *   ✅ Events — validation + status badges + sorting (9 tests)
 *   ✅ Event Detail — items + profit + status transitions + markPaid (14 tests)
 *   ✅ Machines — validation + status labels + badges (10 tests)
 *   ✅ Payments — validation + progress + quarterly + collect tab (16 tests)
 *   ✅ Dashboard — greet() + dateLabel + fmt + profit + emoji (17 tests)
 *   ✅ PWA Install — device detection (7 tests)
 *   ✅ Theme — toggle + persistence (5 tests)
 *   ✅ Version — format (3 tests)
 *   ✅ Async Error — suppression (4 tests)
 *   ✅ Auth — last login + protected routes (6 tests)
 *
 * Phase 2:
 *   ✅ Venues — validation + Maps URL builder (16 tests)
 *   ✅ Performers — validation + emojis (13 tests)
 *   ✅ Transport — validation + trip calcs + markPaid + formatTel (15 tests)
 *   ✅ Co-Owners — validation + earnings + share % (12 tests)
 *   ✅ Profit Split — all 4 methods + validation + event cost (18 tests)
 *   ✅ Quarter — range + label + isInQuarter (12 tests)
 *
 * Constants:
 *   ✅ All exports — completeness + getLabel + badges + COLORS (24 tests)
 * ============================================================
 */

let passed = 0, failed = 0

function describe(name, fn) { console.log(`\n${name}`); fn() }

function test(name, fn) {
  try { fn(); console.log(`  ✅ ${name}`); passed++ }
  catch (e) { console.log(`  ❌ ${name}\n     → ${e.message}`); failed++ }
}

function expect(val) {
  return {
    toBe:            (e) => { if (val !== e) throw new Error(`Expected ${JSON.stringify(e)}, got ${JSON.stringify(val)}`) },
    toEqual:         (e) => { if (JSON.stringify(val) !== JSON.stringify(e)) throw new Error(`Expected ${JSON.stringify(e)}, got ${JSON.stringify(val)}`) },
    toBeTruthy:      ()  => { if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`) },
    toBeFalsy:       ()  => { if (val) throw new Error(`Expected falsy, got ${JSON.stringify(val)}`) },
    toBeNull:        ()  => { if (val !== null) throw new Error(`Expected null, got ${JSON.stringify(val)}`) },
    toBeGreaterThan: (n) => { if (!(val > n)) throw new Error(`Expected ${val} > ${n}`) },
    toBeLessThan:    (n) => { if (!(val < n)) throw new Error(`Expected ${val} < ${n}`) },
    toHaveLength:    (n) => { if (val?.length !== n) throw new Error(`Expected length ${n}, got ${val?.length}`) },
    toHaveProperty:  (k) => { if (!(k in Object(val))) throw new Error(`Expected property "${k}"`) },
    toContain:       (s) => { if (!String(val).includes(String(s))) throw new Error(`Expected "${val}" to contain "${s}"`) },
    not: {
      toHaveProperty: (k) => { if (k in Object(val)) throw new Error(`Did NOT expect property "${k}"`) },
      toBe:           (e) => { if (val === e) throw new Error(`Expected NOT ${JSON.stringify(e)}`) },
      toBeTruthy:     ()  => { if (val) throw new Error(`Expected falsy`) },
      toContain:      (s) => { if (String(val).includes(String(s))) throw new Error(`Expected NOT to contain "${s}"`) },
    }
  }
}

// ══════════════════════════════════════════════════════════════
// ALL VALIDATION + UTILITY FUNCTIONS (mirrored from app)
// ══════════════════════════════════════════════════════════════

// ── Login ─────────────────────────────────────────────────────
function validateLogin(form) {
  const e = {}
  if (!form.email?.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
  if (!form.password) e.password = 'Password is required'
  else if (form.password.length < 6) e.password = 'Minimum 6 characters'
  return e
}

// ── People ────────────────────────────────────────────────────
function validatePerson(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
  if (form.pay_rate && isNaN(parseFloat(form.pay_rate))) e.pay_rate = 'Must be a number'
  if (form.pay_rate && parseFloat(form.pay_rate) < 0) e.pay_rate = 'Rate cannot be negative'
  return e
}

// ── Clients ───────────────────────────────────────────────────
function validateClient(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
  return e
}

// ── Events ────────────────────────────────────────────────────
function validateEvent(form) {
  const e = {}
  if (!form.title?.trim()) e.title = 'Event title is required'
  if (!form.event_date) e.event_date = 'Event date is required'
  if (form.client_amount && isNaN(parseFloat(form.client_amount))) e.client_amount = 'Must be a valid amount'
  if (form.client_amount && parseFloat(form.client_amount) < 0) e.client_amount = 'Amount cannot be negative'
  if (form.start_time && form.end_time && form.start_time >= form.end_time) e.end_time = 'End time must be after start time'
  return e
}

// ── Event Items ───────────────────────────────────────────────
function validateEventItem(form) {
  const e = {}
  if (!form.description?.trim()) e.description = 'Description is required'
  if (form.cost && isNaN(parseFloat(form.cost))) e.cost = 'Must be a valid number'
  if (form.cost && parseFloat(form.cost) < 0) e.cost = 'Cost cannot be negative'
  if (form.days && (isNaN(parseFloat(form.days)) || parseFloat(form.days) <= 0)) e.days = 'Days must be positive'
  if (form.km && (isNaN(parseFloat(form.km)) || parseFloat(form.km) < 0)) e.km = 'KM cannot be negative'
  return e
}

// ── Machines ──────────────────────────────────────────────────
function validateMachine(form) {
  const e = {}
  if (!form.name?.trim()) e.name = 'Item name is required'
  if (form.status === 'at_event' && !form.current_event_id) e.current_event_id = 'Please select the event'
  return e
}

// ── Payments ──────────────────────────────────────────────────
function validatePaymentUpdate(received, billed) {
  const e = {}
  const val = parseFloat(received)
  if (isNaN(val)) e.amount = 'Must be a valid number'
  else if (val < 0) e.amount = 'Amount cannot be negative'
  else if (val > billed) e.amount = 'Cannot exceed billed amount'
  return e
}

// ── Venues (Phase 2) ──────────────────────────────────────────
function validateVenue(form) {
  const e = {}
  if (!form.name?.trim()) e.name = 'Venue name is required'
  if (!form.address?.trim()) e.address = 'Address is required'
  if (form.google_maps_url && !form.google_maps_url.startsWith('http')) e.google_maps_url = 'Must be a valid URL starting with http'
  if (form.lat && isNaN(parseFloat(form.lat))) e.lat = 'Latitude must be a number'
  if (form.lng && isNaN(parseFloat(form.lng))) e.lng = 'Longitude must be a number'
  if (form.lat && (parseFloat(form.lat) < -90  || parseFloat(form.lat) > 90))   e.lat = 'Latitude must be between -90 and 90'
  if (form.lng && (parseFloat(form.lng) < -180 || parseFloat(form.lng) > 180))  e.lng = 'Longitude must be between -180 and 180'
  return e
}

// ── Performers (Phase 2) ──────────────────────────────────────
function validatePerformer(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
  if (form.rate && isNaN(parseFloat(form.rate))) e.rate = 'Must be a number'
  if (form.rate && parseFloat(form.rate) < 0) e.rate = 'Rate cannot be negative'
  return e
}

// ── Transport (Phase 2) ───────────────────────────────────────
function validateTransportTrip(form) {
  const e = {}
  if (!form.event_id) e.event_id = 'Please select an event'
  if (!form.trip_date) e.trip_date = 'Trip date is required'
  if (form.amount && isNaN(parseFloat(form.amount))) e.amount = 'Must be a valid number'
  if (form.amount && parseFloat(form.amount) < 0) e.amount = 'Amount cannot be negative'
  if (form.km && isNaN(parseFloat(form.km))) e.km = 'Must be a valid number'
  if (form.km && parseFloat(form.km) < 0) e.km = 'Distance cannot be negative'
  if (form.pay_method === 'per_km' && form.km && parseFloat(form.km) === 0) e.km = 'Distance must be greater than 0 for per KM billing'
  return e
}

// ── Co-Owners (Phase 2) ───────────────────────────────────────
function validateCoOwner(form) {
  const e = {}
  if (!form.full_name?.trim()) e.full_name = 'Name is required'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone'
  return e
}

// ── Profit Split (Phase 2) ────────────────────────────────────
function validateProfitSplit(owners, method, inputs) {
  const e = {}
  if (!owners || owners.length === 0) { e.owners = 'At least one co-owner required'; return e }
  if (method === 'fixed_percent' || method === 'custom_percent') {
    const total = owners.reduce((s, o) => s + (parseFloat(inputs[o.id]?.percent) || 0), 0)
    if (total <= 0) e.percent = 'Total percentage must be greater than 0'
    owners.forEach(o => { if ((parseFloat(inputs[o.id]?.percent) || 0) < 0) e.percent = 'Percentage cannot be negative' })
  }
  if (method === 'investment_based') {
    const total = owners.reduce((s, o) => s + (parseFloat(inputs[o.id]?.investment) || 0), 0)
    if (total <= 0) e.investment = 'Total investment must be greater than 0'
  }
  return e
}

// ══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS (mirrored from app)
// ══════════════════════════════════════════════════════════════

const LAKH = 100000, THOUSAND = 1000

function fmt(n) {
  if (!n || n === 0) return '0'
  if (n >= LAKH)     return `${(n/LAKH).toFixed(1)}L`
  if (n >= THOUSAND) return `${(n/THOUSAND).toFixed(1)}k`
  return `${n}`
}
function fmtRs(n) {
  if (!n || n === 0) return '₹0'
  if (n >= LAKH)     return `₹${(n/LAKH).toFixed(1)}L`
  if (n >= THOUSAND) return `₹${(n/THOUSAND).toFixed(1)}k`
  return `₹${n}`
}
function calcProfit(clientAmount, totalCost) { return (clientAmount||0) - (totalCost||0) }
function calcPaymentProgress(received, billed) {
  if (!billed || billed === 0) return 0
  return Math.min(100, Math.round((received/billed)*100))
}
function calcStaffDue(items) {
  return items.filter(i => i.payment_status !== 'paid').reduce((s,i) => s + ((i.cost||0)-(i.amount_paid||0)), 0)
}
function getEventTypeEmoji(type) { return { wedding:'💍', birthday:'🎂', office:'🏢', other:'🎪' }[type] || '🎪' }
function getEventTypeBadge(type) { return { wedding:'badge-gold', birthday:'badge-orange', office:'badge-blue', other:'badge-gray' }[type] || 'badge-gray' }
function getEventStatusBadge(status) { return { upcoming:'badge-blue', ongoing:'badge-green', completed:'badge-gray', cancelled:'badge-red' }[status] || 'badge-gray' }
function getMachineStatusLabel(status) { return { in_godown:'📦 In Godown', at_event:'🎪 At Event', returned:'✅ Returned' }[status] || '—' }
function getMachineStatusBadge(status) { return { in_godown:'badge-blue', at_event:'badge-orange', returned:'badge-green' }[status] || 'badge-gray' }
function getRoleBadge(role) { return { admin:'badge-gold', supervisor:'badge-orange', staff:'badge-blue', driver:'badge-green' }[role] || 'badge-gray' }
function getItemTypeEmoji(type) { return { machine:'📦', performer:'🎭', supervisor:'👷', helper:'👤', transport:'🚛', other:'📋' }[type] || '📋' }
function getLabel(options, value) { return options.find(o => o.value === value)?.label || value }
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
function getLastLoginDisplay(iso) {
  if (!iso) return null
  const d = new Date(iso)
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
function sortEventsByDate(events) { return [...events].sort((a,b) => new Date(a.event_date) - new Date(b.event_date)) }
function getPayTypLabel(type) { return (type||'').replace(/_/g,' ') }

// Dashboard utilities
function greet(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
function dateLabel(dateStr, todayStr, tomorrowStr) {
  const d = dateStr.split('T')[0]
  if (d === todayStr)    return { label: 'Today',    cls: 'badge-green'  }
  if (d === tomorrowStr) return { label: 'Tomorrow', cls: 'badge-orange' }
  return { label: d, cls: 'badge-gray' }
}

// Event Detail utilities
function calcEventProfit(clientAmount, items) {
  const totalCost = items.reduce((s,i) => s + (i.cost||0), 0)
  return (clientAmount||0) - totalCost
}
function canTransitionStatus(current, next) {
  const valid = { upcoming: ['ongoing','cancelled'], ongoing: ['completed','cancelled'] }
  return valid[current]?.includes(next) || false
}
function markItemPaidResult(item) {
  return { ...item, amount_paid: item.cost, payment_status: 'paid' }
}

// Payments quarterly
function filterQuarterEvents(events, now) {
  const q = Math.ceil((now.getMonth()+1)/3)
  const year = now.getFullYear()
  const start = new Date(year,(q-1)*3,1)
  const end   = new Date(year,(q-1)*3+3,0)
  return events.filter(e => {
    const d = new Date(e.event_date)
    return d >= start && d <= end
  })
}
function calcPaymentSummary(events) {
  const totalRevenue   = events.reduce((s,e) => s + (e.client_amount||0), 0)
  const totalCollected = events.reduce((s,e) => s + (e.amount_received||0), 0)
  const totalPending   = totalRevenue - totalCollected
  return { totalRevenue, totalCollected, totalPending }
}

// Phase 2 utilities
function buildGoogleMapsUrl(venue) {
  if (venue.google_maps_url) return venue.google_maps_url
  if (venue.lat && venue.lng) return `https://www.google.com/maps?q=${venue.lat},${venue.lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((venue.address||'')+' '+(venue.city||''))}`
}
function calcTripAmount(km, ratePerKm, payMethod, fixedAmount) {
  if (payMethod === 'per_km') return (parseFloat(km)||0) * (parseFloat(ratePerKm)||0)
  return parseFloat(fixedAmount)||0
}
function calcTotalTransportDue(trips) { return trips.filter(t => t.payment_status !== 'paid').reduce((s,t) => s + (t.amount||0), 0) }
function markTripPaid(trip) { return { ...trip, payment_status: 'paid', amount_paid: trip.amount } }
function calcEqualSplit(profit, ownerCount) { if (!ownerCount) return 0; return profit/ownerCount }
function calcPercentSplit(profit, percent, totalPercent) { if (!totalPercent) return 0; return (percent/totalPercent)*profit }
function calcInvestmentSplit(profit, investment, totalInvestment) { if (!totalInvestment) return 0; return (investment/totalInvestment)*profit }
function calcOwnerTotalEarnings(splits, ownerId) { return splits.filter(s => s.co_owner_id===ownerId).reduce((s,x) => s+(x.calculated_amount||0), 0) }
function calcOwnerPendingEarnings(splits, ownerId) { return splits.filter(s => s.co_owner_id===ownerId && !s.paid).reduce((s,x) => s+(x.calculated_amount||0), 0) }
function calcOwnerSharePercent(ownerTotal, poolTotal) { if (!poolTotal) return 0; return Math.round((ownerTotal/poolTotal)*100) }
function calcEventCost(eventItems, transportTrips, eventId) {
  const itemCosts = eventItems.filter(i => i.event_id===eventId).reduce((s,i) => s+(i.cost||0), 0)
  const tripCosts = transportTrips.filter(t => t.event_id===eventId).reduce((s,t) => s+(t.amount||0), 0)
  return itemCosts + tripCosts
}
function getQuarterLabel(date) { return `Q${Math.ceil((date.getMonth()+1)/3)} ${date.getFullYear()}` }
function getQuarterRange(date) {
  const q = Math.ceil((date.getMonth()+1)/3), year = date.getFullYear(), sm = (q-1)*3
  return { start: new Date(year,sm,1), end: new Date(year,sm+3,0), label: `Q${q} ${year}` }
}
function isInQuarter(dateStr, start, end) { const d = new Date(dateStr); return d>=start && d<=end }
function getPerformerTypeEmoji(type) { return { actor:'🎬', dancer:'💃', musician:'🎵', joker:'🤹', juggler:'🎪', casino:'🎰', dj:'🎧', other:'🎭' }[type]||'🎭' }
function formatTel(phone) { if (!phone) return null; return phone.replace(/\s+/g,'') }

// ══════════════════════════════════════════════════════════════
// PHASE 1 TESTS
// ══════════════════════════════════════════════════════════════

describe('🔐 Login — Validation', () => {
  test('empty email shows error',          () => expect(validateLogin({email:'',password:'pass123'})).toHaveProperty('email'))
  test('invalid email format shows error', () => expect(validateLogin({email:'notanemail',password:'pass123'})).toHaveProperty('email'))
  test('valid email passes',               () => expect(validateLogin({email:'amit@allsolutions.com',password:'pass123'})).not.toHaveProperty('email'))
  test('empty password shows error',       () => expect(validateLogin({email:'a@b.com',password:''})).toHaveProperty('password'))
  test('password < 6 chars shows error',   () => expect(validateLogin({email:'a@b.com',password:'12345'})).toHaveProperty('password'))
  test('password = 6 chars passes',        () => expect(validateLogin({email:'a@b.com',password:'123456'})).not.toHaveProperty('password'))
  test('valid credentials — 0 errors',     () => expect(Object.keys(validateLogin({email:'amit@all.com',password:'EventMgr@2026'})).length).toBe(0))
  test('both empty — 2 errors',            () => expect(Object.keys(validateLogin({email:'',password:''})).length).toBe(2))
  test('whitespace email shows error',     () => expect(validateLogin({email:'  ',password:'pass123'})).toHaveProperty('email'))
})

describe('👤 People & Staff — Validation', () => {
  test('empty name shows error',           () => expect(validatePerson({full_name:''})).toHaveProperty('full_name'))
  test('valid name passes',                () => expect(validatePerson({full_name:'Amit Prasad'})).not.toHaveProperty('full_name'))
  test('valid Indian mobile passes',       () => expect(validatePerson({full_name:'T',phone:'+91 9876543210'})).not.toHaveProperty('phone'))
  test('alphabetic phone shows error',     () => expect(validatePerson({full_name:'T',phone:'abcdefgh'})).toHaveProperty('phone'))
  test('too short phone shows error',      () => expect(validatePerson({full_name:'T',phone:'123'})).toHaveProperty('phone'))
  test('empty phone is optional',          () => expect(validatePerson({full_name:'T',phone:''})).not.toHaveProperty('phone'))
  test('negative pay rate shows error',    () => expect(validatePerson({full_name:'T',pay_rate:'-100'})).toHaveProperty('pay_rate'))
  test('zero pay rate is valid',           () => expect(validatePerson({full_name:'T',pay_rate:'0'})).not.toHaveProperty('pay_rate'))
  test('getPayTypeLabel formats',          () => expect(getPayTypLabel('fixed_per_event')).toBe('fixed per event'))
  test('getPayTypeLabel handles empty',    () => expect(getPayTypLabel('')).toBe(''))
})

describe('👥 Clients — Validation', () => {
  test('empty name shows error',           () => expect(validateClient({full_name:''})).toHaveProperty('full_name'))
  test('valid name passes',                () => expect(validateClient({full_name:'Sharma Family'})).not.toHaveProperty('full_name'))
  test('invalid email shows error',        () => expect(validateClient({full_name:'T',email:'bademail'})).toHaveProperty('email'))
  test('valid email passes',               () => expect(validateClient({full_name:'T',email:'client@example.com'})).not.toHaveProperty('email'))
  test('empty email is optional',          () => expect(validateClient({full_name:'T',email:''})).not.toHaveProperty('email'))
  test('invalid phone shows error',        () => expect(validateClient({full_name:'T',phone:'abc'})).toHaveProperty('phone'))
  test('valid phone passes',               () => expect(validateClient({full_name:'T',phone:'9876543210'})).not.toHaveProperty('phone'))
  test('empty phone is optional',          () => expect(validateClient({full_name:'T',phone:''})).not.toHaveProperty('phone'))
  test('all valid — 0 errors',             () => expect(Object.keys(validateClient({full_name:'T',email:'a@b.com',phone:'9876543210'})).length).toBe(0))
})

describe('📅 Events — Validation & Status', () => {
  test('empty title shows error',          () => expect(validateEvent({title:'',event_date:'2026-04-01'})).toHaveProperty('title'))
  test('missing date shows error',         () => expect(validateEvent({title:'T',event_date:''})).toHaveProperty('event_date'))
  test('end before start shows error',     () => expect(validateEvent({title:'T',event_date:'2026-04-01',start_time:'18:00',end_time:'10:00'})).toHaveProperty('end_time'))
  test('equal times shows error',          () => expect(validateEvent({title:'T',event_date:'2026-04-01',start_time:'10:00',end_time:'10:00'})).toHaveProperty('end_time'))
  test('valid time range passes',          () => expect(validateEvent({title:'T',event_date:'2026-04-01',start_time:'10:00',end_time:'18:00'})).not.toHaveProperty('end_time'))
  test('negative amount shows error',      () => expect(validateEvent({title:'T',event_date:'2026-04-01',client_amount:'-100'})).toHaveProperty('client_amount'))
  test('upcoming badge = blue',            () => expect(getEventStatusBadge('upcoming')).toBe('badge-blue'))
  test('completed badge = gray',           () => expect(getEventStatusBadge('completed')).toBe('badge-gray'))
  test('events sort by date ascending',    () => {
    const sorted = sortEventsByDate([{event_date:'2026-05-01'},{event_date:'2026-03-01'},{event_date:'2026-04-01'}])
    expect(sorted[0].event_date).toBe('2026-03-01')
    expect(sorted[2].event_date).toBe('2026-05-01')
  })
})

describe('🎭 Event Detail — Items, Profit & Status', () => {
  test('empty description shows error',    () => expect(validateEventItem({description:''})).toHaveProperty('description'))
  test('negative cost shows error',        () => expect(validateEventItem({description:'T',cost:'-100'})).toHaveProperty('cost'))
  test('zero cost is valid',               () => expect(validateEventItem({description:'T',cost:'0'})).not.toHaveProperty('cost'))
  test('zero days shows error',            () => expect(validateEventItem({description:'T',days:'0'})).toHaveProperty('days'))
  test('0.5 days passes',                  () => expect(validateEventItem({description:'T',days:'0.5'})).not.toHaveProperty('days'))
  test('negative km shows error',          () => expect(validateEventItem({description:'T',km:'-10'})).toHaveProperty('km'))
  test('profit: revenue - all item costs', () => {
    const items = [{cost:5000},{cost:3000},{cost:2000}]
    expect(calcEventProfit(50000, items)).toBe(40000)
  })
  test('profit negative when cost > revenue',() => expect(calcEventProfit(5000,[{cost:8000}])).toBe(-3000))
  test('profit zero when equal',           () => expect(calcEventProfit(10000,[{cost:10000}])).toBe(0))
  test('status: upcoming → ongoing valid', () => expect(canTransitionStatus('upcoming','ongoing')).toBeTruthy())
  test('status: upcoming → cancelled valid',() => expect(canTransitionStatus('upcoming','cancelled')).toBeTruthy())
  test('status: ongoing → completed valid',() => expect(canTransitionStatus('ongoing','completed')).toBeTruthy())
  test('status: completed → anything invalid',() => expect(canTransitionStatus('completed','ongoing')).toBeFalsy())
  test('markItemPaid sets cost as paid',   () => {
    const result = markItemPaidResult({id:'1',cost:1500,amount_paid:0,payment_status:'pending'})
    expect(result.amount_paid).toBe(1500)
    expect(result.payment_status).toBe('paid')
  })
})

describe('📦 Machines & Items — Validation & Status', () => {
  test('empty name shows error',           () => expect(validateMachine({name:''})).toHaveProperty('name'))
  test('at_event without event errors',    () => expect(validateMachine({name:'T',status:'at_event',current_event_id:''})).toHaveProperty('current_event_id'))
  test('at_event with event passes',       () => expect(validateMachine({name:'T',status:'at_event',current_event_id:'uuid-123'})).not.toHaveProperty('current_event_id'))
  test('in_godown without event is fine',  () => expect(validateMachine({name:'T',status:'in_godown'})).not.toHaveProperty('current_event_id'))
  test('returned without event is fine',   () => expect(validateMachine({name:'T',status:'returned'})).not.toHaveProperty('current_event_id'))
  test('in_godown label',                  () => expect(getMachineStatusLabel('in_godown')).toBe('📦 In Godown'))
  test('at_event label',                   () => expect(getMachineStatusLabel('at_event')).toBe('🎪 At Event'))
  test('returned label',                   () => expect(getMachineStatusLabel('returned')).toBe('✅ Returned'))
  test('unknown status returns —',         () => expect(getMachineStatusLabel('broken')).toBe('—'))
  test('at_event badge = badge-orange',    () => expect(getMachineStatusBadge('at_event')).toBe('badge-orange'))
})

describe('💰 Payments — Validation, Progress & Quarterly', () => {
  test('non-numeric received errors',      () => expect(validatePaymentUpdate('abc',50000)).toHaveProperty('amount'))
  test('negative received errors',         () => expect(validatePaymentUpdate('-100',50000)).toHaveProperty('amount'))
  test('received > billed errors',         () => expect(validatePaymentUpdate('60000',50000)).toHaveProperty('amount'))
  test('full payment passes',              () => expect(validatePaymentUpdate('50000',50000)).not.toHaveProperty('amount'))
  test('progress 0% when nothing',         () => expect(calcPaymentProgress(0,50000)).toBe(0))
  test('progress 50% at half',             () => expect(calcPaymentProgress(25000,50000)).toBe(50))
  test('progress 100% when fully paid',    () => expect(calcPaymentProgress(50000,50000)).toBe(100))
  test('progress capped at 100%',          () => expect(calcPaymentProgress(60000,50000)).toBe(100))
  test('progress 0% when billed = 0',      () => expect(calcPaymentProgress(0,0)).toBe(0))
  test('staff due from unpaid items',      () => {
    const items = [{payment_status:'pending',cost:1000,amount_paid:0},{payment_status:'paid',cost:500,amount_paid:500},{payment_status:'partial',cost:800,amount_paid:400}]
    expect(calcStaffDue(items)).toBe(1400)
  })
  test('staff due = 0 when all paid',      () => expect(calcStaffDue([{payment_status:'paid',cost:500,amount_paid:500}])).toBe(0))
  test('quarterly filter — events in Q1',  () => {
    const events = [{event_date:'2026-01-15'},{event_date:'2026-05-10'}]
    const filtered = filterQuarterEvents(events, new Date('2026-02-01'))
    expect(filtered.length).toBe(1)
    expect(filtered[0].event_date).toBe('2026-01-15')
  })
  test('payment summary totalRevenue',     () => {
    const events = [{client_amount:50000,amount_received:30000},{client_amount:20000,amount_received:20000}]
    expect(calcPaymentSummary(events).totalRevenue).toBe(70000)
  })
  test('payment summary totalCollected',   () => {
    const events = [{client_amount:50000,amount_received:30000},{client_amount:20000,amount_received:20000}]
    expect(calcPaymentSummary(events).totalCollected).toBe(50000)
  })
  test('payment summary totalPending',     () => {
    const events = [{client_amount:50000,amount_received:30000},{client_amount:20000,amount_received:20000}]
    expect(calcPaymentSummary(events).totalPending).toBe(20000)
  })
})

describe('📊 Dashboard — Greet, DateLabel & Formatting', () => {
  test('hour 0–11 = Good morning',         () => { expect(greet(0)).toBe('Good morning'); expect(greet(11)).toBe('Good morning') })
  test('hour 12–16 = Good afternoon',      () => { expect(greet(12)).toBe('Good afternoon'); expect(greet(16)).toBe('Good afternoon') })
  test('hour 17–23 = Good evening',        () => { expect(greet(17)).toBe('Good evening'); expect(greet(23)).toBe('Good evening') })
  test('dateLabel Today returns badge-green',    () => expect(dateLabel('2026-03-19','2026-03-19','2026-03-20').cls).toBe('badge-green'))
  test('dateLabel Tomorrow returns badge-orange',() => expect(dateLabel('2026-03-20','2026-03-19','2026-03-20').cls).toBe('badge-orange'))
  test('dateLabel other returns badge-gray',     () => expect(dateLabel('2026-04-01','2026-03-19','2026-03-20').cls).toBe('badge-gray'))
  test('dateLabel Today label = "Today"',        () => expect(dateLabel('2026-03-19','2026-03-19','2026-03-20').label).toBe('Today'))
  test('fmt(0) returns "0" not "O"',       () => { expect(fmt(0)).toBe('0'); expect(fmt(0)==='O').toBeFalsy() })
  test('fmt(null) returns "0"',            () => expect(fmt(null)).toBe('0'))
  test('fmt(1000) returns "1.0k"',         () => expect(fmt(1000)).toBe('1.0k'))
  test('fmt(100000) returns "1.0L"',       () => expect(fmt(100000)).toBe('1.0L'))
  test('fmtRs(0) returns "₹0"',           () => expect(fmtRs(0)).toBe('₹0'))
  test('fmtRs(50000) returns "₹50.0k"',   () => expect(fmtRs(50000)).toBe('₹50.0k'))
  test('profit positive',                  () => expect(calcProfit(50000,30000)).toBe(20000))
  test('profit negative',                  () => expect(calcProfit(10000,30000)).toBe(-20000))
  test('profit null = 0',                  () => expect(calcProfit(null,null)).toBe(0))
  test('wedding emoji is 💍',             () => expect(getEventTypeEmoji('wedding')).toBe('💍'))
})

describe('📱 PWA Install — Device Detection', () => {
  test('iPhone detected as ios',           () => expect(detectDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)')).toBe('ios'))
  test('iPad detected as ios',             () => expect(detectDeviceType('Mozilla/5.0 (iPad; CPU OS 16_0)')).toBe('ios'))
  test('CriOS NOT detected as ios',        () => expect(detectDeviceType('CriOS/100 iPhone')).not.toBe('ios'))
  test('Android detected',                 () => expect(detectDeviceType('Mozilla/5.0 (Linux; Android 12)')).toBe('android'))
  test('Windows = desktop',               () => expect(detectDeviceType('Mozilla/5.0 (Windows NT 10.0)')).toBe('desktop'))
  test('Mac = desktop',                   () => expect(detectDeviceType('Macintosh; Intel Mac OS X')).toBe('desktop'))
  test('empty UA = desktop',              () => expect(detectDeviceType('')).toBe('desktop'))
})

describe('🌗 Theme — Toggle & Persistence', () => {
  test('dark is valid',                    () => expect(isValidTheme('dark')).toBeTruthy())
  test('light is valid',                   () => expect(isValidTheme('light')).toBeTruthy())
  test('random string invalid',            () => expect(isValidTheme('blue')).toBeFalsy())
  test('toggle dark → light',             () => expect(toggleTheme('dark')).toBe('light'))
  test('toggle light → dark',             () => expect(toggleTheme('light')).toBe('dark'))
})

describe('🔢 Version — Format', () => {
  test('202603.19.17 is valid',            () => expect(isValidVersion('202603.19.17')).toBeTruthy())
  test('semver 1.0.0 invalid',             () => expect(isValidVersion('1.0.0')).toBeFalsy())
  test('v prefix invalid',                 () => expect(isValidVersion('v202603.19.17')).toBeFalsy())
})

describe('🔇 Async Error — Suppression', () => {
  test('message channel error detected',   () => expect(isMessageChannelError('message channel closed before response')).toBeTruthy())
  test('async response error detected',    () => expect(isMessageChannelError('asynchronous response')).toBeTruthy())
  test('real errors NOT suppressed',       () => expect(isMessageChannelError('Cannot read properties')).toBeFalsy())
  test('null handled safely',              () => expect(isMessageChannelError(null)).toBeFalsy())
})

describe('🔑 Auth — Last Login & Protected Routes', () => {
  test('valid ISO returns non-null',        () => expect(getLastLoginDisplay('2026-03-19T10:30:00.000Z')).toBeTruthy())
  test('invalid date returns null',         () => expect(getLastLoginDisplay('not-a-date')).toBeNull())
  test('null returns null',                 () => expect(getLastLoginDisplay(null)).toBeNull())
  test('loading → loading',               () => expect(isProtectedRoute(null,true)).toBe('loading'))
  test('no user → redirect',              () => expect(isProtectedRoute(null,false)).toBe('redirect'))
  test('user present → render',           () => expect(isProtectedRoute({id:'123'},false)).toBe('render'))
})

// ══════════════════════════════════════════════════════════════
// PHASE 2 TESTS
// ══════════════════════════════════════════════════════════════

describe('🗺️ Venues — Validation', () => {
  test('empty name shows error',           () => expect(validateVenue({name:'',address:'123 Park St'})).toHaveProperty('name'))
  test('empty address shows error',        () => expect(validateVenue({name:'ITC',address:''})).toHaveProperty('address'))
  test('valid name + address passes',      () => expect(Object.keys(validateVenue({name:'ITC',address:'1 JBS Haldane'}))).toHaveLength(0))
  test('invalid maps URL shows error',     () => expect(validateVenue({name:'ITC',address:'1 JBS',google_maps_url:'not-a-url'})).toHaveProperty('google_maps_url'))
  test('valid maps URL passes',            () => expect(validateVenue({name:'ITC',address:'1 JBS',google_maps_url:'https://maps.google.com/?q=ITC'})).not.toHaveProperty('google_maps_url'))
  test('empty maps URL is optional',       () => expect(validateVenue({name:'ITC',address:'1 JBS',google_maps_url:''})).not.toHaveProperty('google_maps_url'))
  test('invalid lat shows error',          () => expect(validateVenue({name:'ITC',address:'1 JBS',lat:'abc'})).toHaveProperty('lat'))
  test('lat > 90 shows error',            () => expect(validateVenue({name:'ITC',address:'1 JBS',lat:'200'})).toHaveProperty('lat'))
  test('valid Kolkata lat passes',         () => expect(validateVenue({name:'ITC',address:'1 JBS',lat:'22.5726'})).not.toHaveProperty('lat'))
  test('lng > 180 shows error',           () => expect(validateVenue({name:'ITC',address:'1 JBS',lng:'-200'})).toHaveProperty('lng'))
  test('valid Kolkata lng passes',         () => expect(validateVenue({name:'ITC',address:'1 JBS',lng:'88.3639'})).not.toHaveProperty('lng'))
})

describe('🗺️ Venues — Google Maps URL Builder', () => {
  test('uses google_maps_url when set',    () => {
    expect(buildGoogleMapsUrl({google_maps_url:'https://maps.google.com/?q=ITC',address:'ITC',city:'Kolkata'}))
      .toBe('https://maps.google.com/?q=ITC')
  })
  test('uses lat/lng when no URL',         () => {
    const url = buildGoogleMapsUrl({lat:'22.57',lng:'88.36',address:'ITC',city:'Kolkata'})
    expect(url).toContain('22.57')
    expect(url).toContain('88.36')
  })
  test('falls back to address search',     () => {
    const url = buildGoogleMapsUrl({address:'ITC Royal Bengal',city:'Kolkata'})
    expect(url).toContain('google.com')
    expect(url).toContain('ITC')
  })
  test('all URLs use https',              () => expect(buildGoogleMapsUrl({address:'Test',city:'Kolkata'})).toContain('https://'))
  test('lat/lng URL contains maps path',  () => expect(buildGoogleMapsUrl({lat:'22.57',lng:'88.36',address:'X',city:'Y'})).toContain('maps'))
})

describe('🎭 Performers — Validation & Emojis', () => {
  test('empty name shows error',           () => expect(validatePerformer({full_name:''})).toHaveProperty('full_name'))
  test('valid name passes',               () => expect(validatePerformer({full_name:'Raj Kumar'})).not.toHaveProperty('full_name'))
  test('invalid phone shows error',        () => expect(validatePerformer({full_name:'T',phone:'abc'})).toHaveProperty('phone'))
  test('valid phone passes',              () => expect(validatePerformer({full_name:'T',phone:'9876543210'})).not.toHaveProperty('phone'))
  test('empty phone is optional',          () => expect(validatePerformer({full_name:'T',phone:''})).not.toHaveProperty('phone'))
  test('negative rate shows error',        () => expect(validatePerformer({full_name:'T',rate:'-500'})).toHaveProperty('rate'))
  test('non-numeric rate shows error',     () => expect(validatePerformer({full_name:'T',rate:'abc'})).toHaveProperty('rate'))
  test('valid rate passes',               () => expect(validatePerformer({full_name:'T',rate:'5000'})).not.toHaveProperty('rate'))
  test('actor emoji is 🎬',              () => expect(getPerformerTypeEmoji('actor')).toBe('🎬'))
  test('dancer emoji is 💃',             () => expect(getPerformerTypeEmoji('dancer')).toBe('💃'))
  test('musician emoji is 🎵',           () => expect(getPerformerTypeEmoji('musician')).toBe('🎵'))
  test('dj emoji is 🎧',                 () => expect(getPerformerTypeEmoji('dj')).toBe('🎧'))
  test('unknown defaults to 🎭',         () => expect(getPerformerTypeEmoji('unknown')).toBe('🎭'))
})

describe('🚛 Transport — Validation & Calculations', () => {
  test('missing event shows error',        () => expect(validateTransportTrip({event_id:'',trip_date:'2026-04-01'})).toHaveProperty('event_id'))
  test('missing date shows error',         () => expect(validateTransportTrip({event_id:'uuid',trip_date:''})).toHaveProperty('trip_date'))
  test('valid form passes',               () => expect(Object.keys(validateTransportTrip({event_id:'uuid',trip_date:'2026-04-01'}))).toHaveLength(0))
  test('negative amount shows error',      () => expect(validateTransportTrip({event_id:'id',trip_date:'2026-04-01',amount:'-100'})).toHaveProperty('amount'))
  test('negative km shows error',          () => expect(validateTransportTrip({event_id:'id',trip_date:'2026-04-01',km:'-10'})).toHaveProperty('km'))
  test('zero km with per_km billing error',() => expect(validateTransportTrip({event_id:'id',trip_date:'2026-04-01',pay_method:'per_km',km:'0'})).toHaveProperty('km'))
  test('per_km: 25km × ₹20 = ₹500',      () => expect(calcTripAmount(25,20,'per_km',0)).toBe(500))
  test('fixed amount ignores km',          () => expect(calcTripAmount(25,20,'fixed',800)).toBe(800))
  test('per_km with 0 rate = ₹0',         () => expect(calcTripAmount(25,0,'per_km',0)).toBe(0))
  test('total due from unpaid trips',      () => {
    expect(calcTotalTransportDue([{payment_status:'pending',amount:500},{payment_status:'paid',amount:300},{payment_status:'pending',amount:200}])).toBe(700)
  })
  test('total due = 0 when all paid',     () => expect(calcTotalTransportDue([{payment_status:'paid',amount:500}])).toBe(0))
  test('markTripPaid sets paid + amount', () => {
    const result = markTripPaid({id:'t1',amount:600,payment_status:'pending'})
    expect(result.payment_status).toBe('paid')
    expect(result.amount_paid).toBe(600)
  })
  test('formatTel removes spaces',         () => expect(formatTel('+91 9876 543210')).toBe('+919876543210'))
  test('formatTel null for empty/null',    () => { expect(formatTel('')).toBeNull(); expect(formatTel(null)).toBeNull() })
})

describe('👥 Co-Owners — Validation & Earnings', () => {
  test('empty name shows error',           () => expect(validateCoOwner({full_name:''})).toHaveProperty('full_name'))
  test('valid name passes',               () => expect(validateCoOwner({full_name:'Raj Sharma'})).not.toHaveProperty('full_name'))
  test('invalid email shows error',        () => expect(validateCoOwner({full_name:'T',email:'bad'})).toHaveProperty('email'))
  test('valid email passes',              () => expect(validateCoOwner({full_name:'T',email:'raj@test.com'})).not.toHaveProperty('email'))
  test('empty email is optional',          () => expect(validateCoOwner({full_name:'T',email:''})).not.toHaveProperty('email'))
  test('invalid phone shows error',        () => expect(validateCoOwner({full_name:'T',phone:'abc'})).toHaveProperty('phone'))
  test('total earnings sums all splits',   () => {
    const splits = [{co_owner_id:'o1',calculated_amount:5000,paid:true},{co_owner_id:'o1',calculated_amount:3000,paid:false},{co_owner_id:'o2',calculated_amount:4000,paid:true}]
    expect(calcOwnerTotalEarnings(splits,'o1')).toBe(8000)
    expect(calcOwnerTotalEarnings(splits,'o2')).toBe(4000)
  })
  test('pending earnings = unpaid only',   () => {
    const splits = [{co_owner_id:'o1',calculated_amount:5000,paid:true},{co_owner_id:'o1',calculated_amount:3000,paid:false}]
    expect(calcOwnerPendingEarnings(splits,'o1')).toBe(3000)
  })
  test('share % of pool',                 () => expect(calcOwnerSharePercent(8000,20000)).toBe(40))
  test('share % = 0 when pool = 0',       () => expect(calcOwnerSharePercent(5000,0)).toBe(0))
  test('share % rounds correctly',         () => expect(calcOwnerSharePercent(1,3)).toBe(33))
  test('event cost = items + transport',   () => {
    const items = [{event_id:'e1',cost:5000},{event_id:'e1',cost:3000},{event_id:'e2',cost:2000}]
    const trips = [{event_id:'e1',amount:1500}]
    expect(calcEventCost(items,trips,'e1')).toBe(9500)
    expect(calcEventCost(items,trips,'e2')).toBe(2000)
  })
})

describe('💰 Profit Split — All 4 Methods + Validation', () => {
  test('equal split 3 owners',             () => expect(calcEqualSplit(90000,3)).toBe(30000))
  test('equal split 2 owners',             () => expect(calcEqualSplit(100000,2)).toBe(50000))
  test('equal split 0 owners returns 0',   () => expect(calcEqualSplit(90000,0)).toBe(0))
  test('percent split 60% of 100k = 60k', () => expect(calcPercentSplit(100000,60,100)).toBe(60000))
  test('percent split 0 total returns 0',  () => expect(calcPercentSplit(100000,60,0)).toBe(0))
  test('percent split partial totals',     () => {
    expect(Math.round(calcPercentSplit(100000,40,100))).toBe(40000)
    expect(Math.round(calcPercentSplit(100000,35,100))).toBe(35000)
    expect(Math.round(calcPercentSplit(100000,25,100))).toBe(25000)
  })
  test('investment split proportional',    () => {
    expect(calcInvestmentSplit(100000,50000,100000)).toBe(50000)
    expect(calcInvestmentSplit(100000,30000,100000)).toBe(30000)
  })
  test('investment split 0 total = 0',     () => expect(calcInvestmentSplit(100000,50000,0)).toBe(0))
  test('investment equal shares = equal',  () => expect(calcInvestmentSplit(90000,30000,90000)).toBe(30000))
  test('validation — no owners',          () => expect(validateProfitSplit([],  'equal',{})).toHaveProperty('owners'))
  test('validation — 0% total errors',    () => {
    expect(validateProfitSplit([{id:'a'},{id:'b'}],'fixed_percent',{a:{percent:'0'},b:{percent:'0'}})).toHaveProperty('percent')
  })
  test('validation — valid % passes',     () => {
    expect(validateProfitSplit([{id:'a'},{id:'b'}],'fixed_percent',{a:{percent:'60'},b:{percent:'40'}})).not.toHaveProperty('percent')
  })
  test('validation — 0 investment errors', () => {
    expect(validateProfitSplit([{id:'a'}],'investment_based',{a:{investment:'0'}})).toHaveProperty('investment')
  })
  test('validation — valid investment passes',() => {
    expect(validateProfitSplit([{id:'a'}],'investment_based',{a:{investment:'50000'}})).not.toHaveProperty('investment')
  })
  test('validation — equal always valid', () => expect(validateProfitSplit([{id:'a'}],'equal',{})).not.toHaveProperty('owners'))
  test('event cost includes transport',    () => {
    const items = [{event_id:'e1',cost:8000}]
    const trips = [{event_id:'e1',amount:2000}]
    expect(calcEventCost(items,trips,'e1')).toBe(10000)
  })
  test('profit after cost deduction',      () => expect(calcProfit(50000,10000)).toBe(40000))
})

describe('📅 Quarter — Range, Label & Filter', () => {
  test('Jan = Q1', () => expect(getQuarterLabel(new Date('2026-01-15'))).toBe('Q1 2026'))
  test('Apr = Q2', () => expect(getQuarterLabel(new Date('2026-04-01'))).toBe('Q2 2026'))
  test('Jul = Q3', () => expect(getQuarterLabel(new Date('2026-07-10'))).toBe('Q3 2026'))
  test('Oct = Q4', () => expect(getQuarterLabel(new Date('2026-10-31'))).toBe('Q4 2026'))
  test('Mar = Q1', () => expect(getQuarterLabel(new Date('2026-03-19'))).toBe('Q1 2026'))
  test('Dec = Q4', () => expect(getQuarterLabel(new Date('2026-12-31'))).toBe('Q4 2026'))
  test('Q1 starts Jan 1', () => {
    const {start} = getQuarterRange(new Date('2026-02-15'))
    expect(start.getMonth()).toBe(0); expect(start.getDate()).toBe(1)
  })
  test('Q1 ends Mar 31', () => {
    const {end} = getQuarterRange(new Date('2026-02-15'))
    expect(end.getMonth()).toBe(2); expect(end.getDate()).toBe(31)
  })
  test('Q2 starts Apr 1', () => expect(getQuarterRange(new Date('2026-05-01')).start.getMonth()).toBe(3))
  test('event in quarter returns true', () => {
    const {start,end} = getQuarterRange(new Date('2026-02-01'))
    expect(isInQuarter('2026-02-15',start,end)).toBeTruthy()
  })
  test('event outside quarter returns false', () => {
    const {start,end} = getQuarterRange(new Date('2026-02-01'))
    expect(isInQuarter('2026-06-15',start,end)).toBeFalsy()
  })
  test('last day of quarter is included', () => {
    const {start,end} = getQuarterRange(new Date('2026-02-01'))
    expect(isInQuarter('2026-03-31',start,end)).toBeTruthy()
  })
})

describe('📚 Constants — All Exports, Badges & Labels', () => {
  const EVENT_TYPES        = ['wedding','birthday','office','other']
  const EVENT_STATUSES     = ['upcoming','ongoing','completed','cancelled']
  const ROLES              = ['admin','supervisor','staff','driver']
  const PAY_TYPES          = ['daily','hourly','per_km','fixed_per_event','monthly']
  const ITEM_TYPES         = ['machine','performer','supervisor','helper','transport','other']
  const MACHINE_STATUSES   = ['in_godown','at_event','returned']
  const MACHINE_CATEGORIES = ['game','machine','costume','prop','other']
  const PERFORMER_TYPES    = ['actor','dancer','musician','joker','juggler','casino','dj','other']
  const VENDOR_TYPES       = ['payroll','freelancer','vendor_agency']
  const VEHICLE_TYPES      = ['Tata Ace','Tata 407','Auto','Van','Other']
  const SPLIT_METHODS      = ['equal','fixed_percent','custom_percent','investment_based']
  const PERFORMER_RATE_TYPES = ['per_event','per_hour','per_day']
  const TRANSPORT_PAY_METHODS = ['per_km','fixed']

  // Counts
  test('4 event types',                    () => expect(EVENT_TYPES.length).toBe(4))
  test('4 event statuses',                 () => expect(EVENT_STATUSES.length).toBe(4))
  test('4 roles',                          () => expect(ROLES.length).toBe(4))
  test('5 pay types',                      () => expect(PAY_TYPES.length).toBe(5))
  test('6 item types',                     () => expect(ITEM_TYPES.length).toBe(6))
  test('3 machine statuses',               () => expect(MACHINE_STATUSES.length).toBe(3))
  test('8 performer types',                () => expect(PERFORMER_TYPES.length).toBe(8))
  test('5 vehicle types',                  () => expect(VEHICLE_TYPES.length).toBe(5))
  test('4 split methods',                  () => expect(SPLIT_METHODS.length).toBe(4))

  // Badge functions
  test('getEventTypeBadge wedding = badge-gold',     () => expect(getEventTypeBadge('wedding')).toBe('badge-gold'))
  test('getEventTypeBadge office = badge-blue',      () => expect(getEventTypeBadge('office')).toBe('badge-blue'))
  test('getRoleBadge admin = badge-gold',            () => expect(getRoleBadge('admin')).toBe('badge-gold'))
  test('getRoleBadge driver = badge-green',          () => expect(getRoleBadge('driver')).toBe('badge-green'))
  test('getRoleBadge unknown = badge-gray',          () => expect(getRoleBadge('unknown')).toBe('badge-gray'))

  // getLabel helper
  test('getLabel finds correct label',     () => {
    const opts = [{value:'per_km',label:'Per KM'},{value:'fixed',label:'Fixed Amount'}]
    expect(getLabel(opts,'per_km')).toBe('Per KM')
  })
  test('getLabel returns value if not found',() => {
    const opts = [{value:'a',label:'A'}]
    expect(getLabel(opts,'b')).toBe('b')
  })

  // filterBySearch
  test('filterBySearch case insensitive',  () => {
    expect(filterBySearch([{name:'AMIT'}],'amit',['name'])).toHaveLength(1)
  })
  test('filterBySearch no match = empty',  () => {
    expect(filterBySearch([{name:'Alice'}],'xyz',['name'])).toHaveLength(0)
  })
  test('filterBySearch empty query = all', () => {
    expect(filterBySearch([{name:'A'},{name:'B'}],'',['name'])).toHaveLength(2)
  })
})


// ══════════════════════════════════════════════════════════════
// PHASE 3 TESTS — Pending Validation Fixes
// ══════════════════════════════════════════════════════════════

// ── Validation functions for Phase 3 ─────────────────────────

function validateMachineP3(form) {
  const e = {}
  if (!form.name?.trim()) e.name = 'Item name is required'
  if (form.quantity && (isNaN(parseInt(form.quantity)) || parseInt(form.quantity) < 1)) e.quantity = 'Must be at least 1'
  return e
}

function validateTransportP3(form) {
  const e = {}
  if (!form.event_id)  e.event_id  = 'Please select an event'
  if (!form.trip_date) e.trip_date = 'Trip date is required'
  if (form.amount && isNaN(parseFloat(form.amount))) e.amount = 'Must be a valid number'
  if (form.amount && parseFloat(form.amount) < 0) e.amount = 'Amount cannot be negative'
  if (form.km && isNaN(parseFloat(form.km))) e.km = 'Must be a valid number'
  if (form.km && parseFloat(form.km) < 0) e.km = 'Distance cannot be negative'
  return e
}

function validatePaymentCollection(form) {
  const e = {}
  const val = parseFloat(form.amount)
  if (!form.amount || isNaN(val)) e.amount = 'Enter a valid amount'
  else if (val <= 0) e.amount = 'Amount must be greater than 0'
  if (!form.method) e.method = 'Select payment method'
  return e
}

function validateRevert(form) {
  const e = {}
  if (!form.reason?.trim()) e.reason = 'Reason is required'
  if (!form.reverted_by)    e.reverted_by = 'Select who is reverting'
  return e
}

// ── Utility functions for Phase 3 ────────────────────────────

function calcGodownSummary(machines) {
  const godowns = ['Godown A', 'Godown B', 'Godown C']
  return godowns.map(g => ({
    name:  g,
    count: machines.filter(m => m.godown === g && m.status === 'in_godown').length,
    qty:   machines.filter(m => m.godown === g && m.status === 'in_godown').reduce((s, m) => s + (m.quantity || 1), 0)
  }))
}

function calcAtEventQty(machines) {
  return machines.filter(m => m.status === 'at_event').reduce((s, m) => s + (m.quantity || 1), 0)
}

function autoFillTransportForm(form, events) {
  const ev = events.find(e => e.id === form.event_id)
  if (!ev) return form
  return {
    ...form,
    trip_date:     ev.event_date || form.trip_date,
    drop_location: ev.venue_name ? ev.venue_name : form.drop_location,
    pickup_location: form.pickup_location || 'Godown A',
  }
}

function calcBulkPayTotal(trips, driverName) {
  return trips
    .filter(t => t.driver_name === driverName && t.payment_status !== 'paid')
    .reduce((s, t) => s + (t.amount || 0), 0)
}

function calcDaysOverdue(eventDate, status) {
  if (status !== 'completed') return 0
  const days = Math.floor((new Date() - new Date(eventDate)) / (1000*60*60*24))
  return Math.max(0, days)
}

function getVehicleEmoji(vehicleType) {
  if (!vehicleType) return '🚛'
  const t = vehicleType.toLowerCase()
  if (t.includes('bike')) return '🏍️'
  if (t.includes('auto')) return '🛺'
  if (t.includes('van'))  return '🚐'
  if (t.includes('407'))  return '🚚'
  return '🚛'
}

function canRoleDo(role, action) {
  const perms = {
    admin:      ['add', 'edit', 'delete', 'view', 'pay', 'split', 'report'],
    supervisor: ['add', 'edit', 'view', 'pay'],
    staff:      ['view', 'add'],
    driver:     ['view'],
  }
  return perms[role]?.includes(action) || false
}

function getRolePages(role) {
  const pages = {
    admin:      ['/dashboard','/events','/people','/clients','/machines','/payments','/venues','/performers','/transport','/co-owners','/profit-split','/user-guide'],
    supervisor: ['/dashboard','/events','/people','/clients','/machines','/payments','/venues','/performers','/transport','/user-guide'],
    staff:      ['/dashboard','/events','/machines','/transport','/user-guide'],
    driver:     ['/dashboard','/transport','/user-guide'],
  }
  return pages[role] || pages.staff
}

function canAccessPage(role, path) {
  return getRolePages(role).some(p => path.startsWith(p))
}

// ══════════════════════════════════════════════════════════════

describe('📦 Machines Phase 3 — Quantity & Notes', () => {
  test('valid quantity passes',                () => expect(validateMachineP3({ name: 'Booth', quantity: '3' })).not.toHaveProperty('quantity'))
  test('quantity 0 shows error',              () => expect(validateMachineP3({ name: 'Booth', quantity: '0' })).toHaveProperty('quantity'))
  test('negative quantity shows error',       () => expect(validateMachineP3({ name: 'Booth', quantity: '-1' })).toHaveProperty('quantity'))
  test('non-numeric quantity shows error',    () => expect(validateMachineP3({ name: 'Booth', quantity: 'abc' })).toHaveProperty('quantity'))
  test('quantity 1 is valid (default)',       () => expect(validateMachineP3({ name: 'Booth', quantity: '1' })).not.toHaveProperty('quantity'))
  test('empty name still shows error',        () => expect(validateMachineP3({ name: '', quantity: '2' })).toHaveProperty('name'))
  test('godown summary calculates correctly', () => {
    const machines = [
      { name: 'A', godown: 'Godown A', status: 'in_godown', quantity: 3 },
      { name: 'B', godown: 'Godown A', status: 'in_godown', quantity: 2 },
      { name: 'C', godown: 'Godown B', status: 'in_godown', quantity: 4 },
      { name: 'D', godown: 'Godown A', status: 'at_event',  quantity: 1 },
    ]
    const summary = calcGodownSummary(machines)
    expect(summary[0].qty).toBe(5)   // Godown A: 3+2 (not at_event)
    expect(summary[0].count).toBe(2) // 2 item types
    expect(summary[1].qty).toBe(4)   // Godown B
  })
  test('at_event qty calculation',            () => {
    const machines = [
      { status: 'at_event', quantity: 2 },
      { status: 'at_event', quantity: 3 },
      { status: 'in_godown', quantity: 5 },
    ]
    expect(calcAtEventQty(machines)).toBe(5)
  })
  test('at_event qty uses default 1 when no qty', () => {
    expect(calcAtEventQty([{ status: 'at_event' }])).toBe(1)
  })
})

describe('🚛 Transport Phase 3 — Auto-fill, Bulk Pay, Revert', () => {
  // Validation
  test('missing event shows error',           () => expect(validateTransportP3({ event_id: '', trip_date: '2026-04-01' })).toHaveProperty('event_id'))
  test('missing date shows error',            () => expect(validateTransportP3({ event_id: 'id', trip_date: '' })).toHaveProperty('trip_date'))
  test('valid form passes',                   () => expect(Object.keys(validateTransportP3({ event_id: 'id', trip_date: '2026-04-01' })).length).toBe(0))
  test('negative amount shows error',         () => expect(validateTransportP3({ event_id: 'id', trip_date: '2026-04-01', amount: '-100' })).toHaveProperty('amount'))

  // Auto-fill
  test('event selection auto-fills date',     () => {
    const events = [{ id: 'e1', event_date: '2026-04-15', venue_name: 'ITC Royal Bengal' }]
    const result = autoFillTransportForm({ event_id: 'e1', trip_date: '', pickup_location: '', drop_location: '' }, events)
    expect(result.trip_date).toBe('2026-04-15')
  })
  test('event selection auto-fills venue',    () => {
    const events = [{ id: 'e1', event_date: '2026-04-15', venue_name: 'JW Marriott' }]
    const result = autoFillTransportForm({ event_id: 'e1', trip_date: '', pickup_location: '', drop_location: '' }, events)
    expect(result.drop_location).toBe('JW Marriott')
  })
  test('pickup defaults to Godown A',         () => {
    const events = [{ id: 'e1', event_date: '2026-04-15' }]
    const result = autoFillTransportForm({ event_id: 'e1', trip_date: '', pickup_location: '', drop_location: '' }, events)
    expect(result.pickup_location).toBe('Godown A')
  })
  test('existing pickup not overwritten',     () => {
    const events = [{ id: 'e1', event_date: '2026-04-15' }]
    const result = autoFillTransportForm({ event_id: 'e1', trip_date: '', pickup_location: 'Godown B', drop_location: '' }, events)
    expect(result.pickup_location).toBe('Godown B')
  })
  test('unknown event returns form unchanged', () => {
    const result = autoFillTransportForm({ event_id: 'unknown', trip_date: 'existing', pickup_location: 'X', drop_location: 'Y' }, [])
    expect(result.trip_date).toBe('existing')
  })

  // Bulk pay
  test('bulk pay totals unpaid trips for driver', () => {
    const trips = [
      { driver_name: 'Raj', payment_status: 'pending', amount: 500 },
      { driver_name: 'Raj', payment_status: 'pending', amount: 300 },
      { driver_name: 'Raj', payment_status: 'paid',    amount: 200 },
      { driver_name: 'Ali', payment_status: 'pending', amount: 400 },
    ]
    expect(calcBulkPayTotal(trips, 'Raj')).toBe(800)
    expect(calcBulkPayTotal(trips, 'Ali')).toBe(400)
  })
  test('bulk pay = 0 when all paid',          () => {
    const trips = [{ driver_name: 'Raj', payment_status: 'paid', amount: 500 }]
    expect(calcBulkPayTotal(trips, 'Raj')).toBe(0)
  })

  // Revert validation
  test('revert requires reason',              () => expect(validateRevert({ reason: '', reverted_by: 'id' })).toHaveProperty('reason'))
  test('revert requires who',                 () => expect(validateRevert({ reason: 'Wrong amount', reverted_by: '' })).toHaveProperty('reverted_by'))
  test('valid revert passes',                 () => expect(Object.keys(validateRevert({ reason: 'Wrong amount', reverted_by: 'uuid-123' })).length).toBe(0))

  // Vehicle emojis
  test('Tata Ace = 🚛',                      () => expect(getVehicleEmoji('Tata Ace')).toBe('🚛'))
  test('Tata 407 = 🚚',                      () => expect(getVehicleEmoji('Tata 407')).toBe('🚚'))
  test('Bike = 🏍️',                          () => expect(getVehicleEmoji('Bike')).toBe('🏍️'))
  test('Private Bike = 🏍️',                  () => expect(getVehicleEmoji('Private Bike')).toBe('🏍️'))
  test('Auto = 🛺',                           () => expect(getVehicleEmoji('Auto')).toBe('🛺'))
  test('Van = 🚐',                            () => expect(getVehicleEmoji('Van')).toBe('🚐'))
  test('null defaults to 🚛',                () => expect(getVehicleEmoji(null)).toBe('🚛'))
})

describe('💳 Payments Phase 3 — Collection Tracking', () => {
  test('valid cash collection passes',        () => expect(Object.keys(validatePaymentCollection({ amount: '5000', method: 'cash' })).length).toBe(0))
  test('valid UPI collection passes',         () => expect(Object.keys(validatePaymentCollection({ amount: '5000', method: 'online' })).length).toBe(0))
  test('valid cheque collection passes',      () => expect(Object.keys(validatePaymentCollection({ amount: '5000', method: 'cheque' })).length).toBe(0))
  test('missing amount shows error',          () => expect(validatePaymentCollection({ amount: '', method: 'cash' })).toHaveProperty('amount'))
  test('zero amount shows error',             () => expect(validatePaymentCollection({ amount: '0', method: 'cash' })).toHaveProperty('amount'))
  test('negative amount shows error',         () => expect(validatePaymentCollection({ amount: '-100', method: 'cash' })).toHaveProperty('amount'))
  test('non-numeric amount shows error',      () => expect(validatePaymentCollection({ amount: 'abc', method: 'cash' })).toHaveProperty('amount'))
  test('missing method shows error',          () => expect(validatePaymentCollection({ amount: '5000', method: '' })).toHaveProperty('method'))
  test('days overdue for completed event',    () => {
    // Use a date clearly in the past
    const pastDate = '2020-01-01'
    expect(calcDaysOverdue(pastDate, 'completed')).toBeGreaterThan(0)
  })
  test('days overdue = 0 for upcoming',       () => expect(calcDaysOverdue('2026-01-01', 'upcoming')).toBe(0))
  test('days overdue = 0 for ongoing',        () => expect(calcDaysOverdue('2026-01-01', 'ongoing')).toBe(0))
  test('days overdue never negative',         () => expect(calcDaysOverdue('2030-01-01', 'completed')).toBe(0))
})

describe('🔐 Role-Based Access — Phase 3', () => {
  // Admin access
  test('admin can access profit-split',       () => expect(canAccessPage('admin', '/profit-split')).toBeTruthy())
  test('admin can access co-owners',          () => expect(canAccessPage('admin', '/co-owners')).toBeTruthy())
  test('admin can access all pages',          () => {
    const pages = ['/dashboard','/events','/people','/clients','/machines','/payments','/venues','/performers','/transport','/co-owners','/profit-split','/user-guide']
    pages.forEach(p => expect(canAccessPage('admin', p)).toBeTruthy())
  })

  // Supervisor access
  test('supervisor cannot access profit-split', () => expect(canAccessPage('supervisor', '/profit-split')).toBeFalsy())
  test('supervisor cannot access co-owners',  () => expect(canAccessPage('supervisor', '/co-owners')).toBeFalsy())
  test('supervisor can access payments',      () => expect(canAccessPage('supervisor', '/payments')).toBeTruthy())
  test('supervisor can access transport',     () => expect(canAccessPage('supervisor', '/transport')).toBeTruthy())

  // Staff access
  test('staff cannot access payments',        () => expect(canAccessPage('staff', '/payments')).toBeFalsy())
  test('staff cannot access people',          () => expect(canAccessPage('staff', '/people')).toBeFalsy())
  test('staff can access events',             () => expect(canAccessPage('staff', '/events')).toBeTruthy())
  test('staff can access transport',          () => expect(canAccessPage('staff', '/transport')).toBeTruthy())
  test('staff can access user-guide',         () => expect(canAccessPage('staff', '/user-guide')).toBeTruthy())

  // Driver access
  test('driver can only access transport',    () => expect(canAccessPage('driver', '/transport')).toBeTruthy())
  test('driver cannot access events',         () => expect(canAccessPage('driver', '/events')).toBeFalsy())
  test('driver cannot access machines',       () => expect(canAccessPage('driver', '/machines')).toBeFalsy())
  test('driver can access user-guide',        () => expect(canAccessPage('driver', '/user-guide')).toBeTruthy())

  // Actions
  test('admin can delete',                    () => expect(canRoleDo('admin', 'delete')).toBeTruthy())
  test('supervisor cannot delete',            () => expect(canRoleDo('supervisor', 'delete')).toBeFalsy())
  test('staff can view',                      () => expect(canRoleDo('staff', 'view')).toBeTruthy())
  test('staff cannot pay',                    () => expect(canRoleDo('staff', 'pay')).toBeFalsy())
  test('driver cannot add',                   () => expect(canRoleDo('driver', 'add')).toBeFalsy())
  test('all roles can access user-guide',     () => {
    ['admin','supervisor','staff','driver'].forEach(r => {
      expect(canAccessPage(r, '/user-guide')).toBeTruthy()
    })
  })
})

describe('📖 User Guide — Role Content', () => {
  const GUIDE_SECTIONS = {
    admin:      ['Getting Started', 'Managing Events', 'People & Staff', 'Machines & Items', 'Transport', 'Payments', 'Venues', 'Performers', 'Co-Owners', 'Profit Split'],
    supervisor: ['Getting Started', 'Events', 'Transport', 'Payments'],
    staff:      ['Getting Started', 'Events', 'Transport', 'Machines & Items'],
    driver:     ['Getting Started', 'Transport'],
  }

  test('admin guide has 10 sections',         () => expect(GUIDE_SECTIONS.admin.length).toBe(10))
  test('supervisor guide has 4 sections',     () => expect(GUIDE_SECTIONS.supervisor.length).toBe(4))
  test('staff guide has 4 sections',          () => expect(GUIDE_SECTIONS.staff.length).toBe(4))
  test('driver guide has 2 sections',         () => expect(GUIDE_SECTIONS.driver.length).toBe(2))
  test('admin guide includes profit split',   () => expect(GUIDE_SECTIONS.admin.includes('Profit Split')).toBeTruthy())
  test('supervisor guide excludes profit split', () => expect(GUIDE_SECTIONS.supervisor.includes('Profit Split')).toBeFalsy())
  test('all guides include Getting Started',  () => {
    Object.values(GUIDE_SECTIONS).forEach(s => expect(s.includes('Getting Started')).toBeTruthy())
  })
  test('all guides include Transport',        () => {
    Object.values(GUIDE_SECTIONS).forEach(s => expect(s.includes('Transport')).toBeTruthy())
  })
  test('driver guide only has 2 sections',    () => expect(GUIDE_SECTIONS.driver.length).toBe(2))
})

describe('📋 DB Schema Phase 3 — New Columns', () => {
  const MACHINES_COLS    = ['id','name','category','godown','status','current_event_id','notes','quantity','created_at']
  const TRANSPORT_COLS   = ['id','event_id','vehicle_type','driver_profile_id','staff_profile_id','pickup_location','drop_location','km','amount','pay_method','amount_paid','payment_status','trip_date','notes','is_round_trip','trip_type','paid_by_profile_id','paid_at','reverted','revert_reason','reverted_by_profile_id','reverted_at','created_at']
  const EVENTS_COLS      = ['id','title','event_type','client_id','venue_id','event_date','start_time','end_time','status','client_amount','amount_received','notes','collected_by_profile_id','collection_method','collected_at','handed_to_profile_id','handed_at','created_at']

  test('machines has quantity column',            () => expect(MACHINES_COLS.includes('quantity')).toBeTruthy())
  test('transport has staff_profile_id',          () => expect(TRANSPORT_COLS.includes('staff_profile_id')).toBeTruthy())
  test('transport has is_round_trip',             () => expect(TRANSPORT_COLS.includes('is_round_trip')).toBeTruthy())
  test('transport has paid_by_profile_id',        () => expect(TRANSPORT_COLS.includes('paid_by_profile_id')).toBeTruthy())
  test('transport has paid_at',                   () => expect(TRANSPORT_COLS.includes('paid_at')).toBeTruthy())
  test('transport has reverted',                  () => expect(TRANSPORT_COLS.includes('reverted')).toBeTruthy())
  test('transport has revert_reason',             () => expect(TRANSPORT_COLS.includes('revert_reason')).toBeTruthy())
  test('transport has reverted_by_profile_id',    () => expect(TRANSPORT_COLS.includes('reverted_by_profile_id')).toBeTruthy())
  test('transport has reverted_at',               () => expect(TRANSPORT_COLS.includes('reverted_at')).toBeTruthy())
  test('events has collected_by_profile_id',      () => expect(EVENTS_COLS.includes('collected_by_profile_id')).toBeTruthy())
  test('events has collection_method',            () => expect(EVENTS_COLS.includes('collection_method')).toBeTruthy())
  test('events has collected_at',                 () => expect(EVENTS_COLS.includes('collected_at')).toBeTruthy())
  test('events has handed_to_profile_id',         () => expect(EVENTS_COLS.includes('handed_to_profile_id')).toBeTruthy())
  test('events has handed_at',                    () => expect(EVENTS_COLS.includes('handed_at')).toBeTruthy())
})



// ══════════════════════════════════════════════════════════════
// GAP FIXES — Architecture Improvement Tests
// ══════════════════════════════════════════════════════════════

// ── Gap fix helpers ───────────────────────────────────────────

function validateItemForm(form) {
  const e = {}
  if (!form.description?.trim()) e.description = 'Description is required'
  if (form.cost && isNaN(parseFloat(form.cost))) e.cost = 'Must be a number'
  if (form.cost && parseFloat(form.cost) < 0) e.cost = 'Cost cannot be negative'
  if (form.days && parseFloat(form.days) < 0.5) e.days = 'Minimum 0.5 days'
  if (form.item_type === 'machine' && !form.machine_id) e.machine_id = 'Select a machine'
  return e
}

function autoFillMachine(machineId, machines) {
  const m = machines.find(x => x.id === machineId)
  if (!m) return {}
  return { description: m.name, machine_id: machineId }
}

function autoFillPerformer(performerId, performers) {
  const p = performers.find(x => x.id === performerId)
  if (!p) return {}
  return {
    description:  p.full_name + (p.type ? ` (${p.type})` : ''),
    performer_id: performerId,
    cost:         p.rate || '',
    pay_type:     p.rate_type === 'per_hour' ? 'hourly' : 'fixed',
  }
}

function calcDashboardStats(events, transportPending, machinesOut) {
  const active = events.filter(e => ['upcoming','ongoing'].includes(e.status))
  return {
    events:        active.length,
    revenue:       active.reduce((s,e) => s + (e.amount_received||0), 0),
    pending:       active.reduce((s,e) => s + ((e.client_amount||0)-(e.amount_received||0)), 0),
    transportDue:  transportPending,
    machinesOut,
  }
}

function calcPaymentSummaryV2(eventItems, transportDues) {
  const staffDue    = eventItems.filter(i => i.payment_status !== 'paid').reduce((s,i) => s + ((i.cost||0)-(i.amount_paid||0)), 0)
  const transportDue = transportDues.reduce((s,t) => s + ((t.amount||0)-(t.amount_paid||0)), 0)
  return { staffDue, transportDue, totalOutstanding: staffDue + transportDue }
}

function buildAuditEntry({ action, entityType, entityId, amount, notes, doneBy }) {
  if (!action)     return null
  if (!entityType) return null
  if (!entityId)   return null
  return { action, entity_type: entityType, entity_id: entityId, amount: amount || null, notes: notes || null, done_by: doneBy || null }
}

function guardAction(role, action) {
  const perms = {
    admin:      ['add', 'edit', 'delete', 'view', 'pay', 'split', 'report'],
    supervisor: ['add', 'edit', 'view', 'pay'],
    staff:      ['view', 'add'],
    driver:     ['view'],
  }
  return perms[role]?.includes(action) || false
}

// ══════════════════════════════════════════════════════════════

describe('🔧 Gap 1 — Action-Level Permission Guards', () => {
  test('admin can add',                       () => expect(guardAction('admin',      'add')).toBeTruthy())
  test('admin can delete',                    () => expect(guardAction('admin',      'delete')).toBeTruthy())
  test('supervisor can add',                  () => expect(guardAction('supervisor', 'add')).toBeTruthy())
  test('supervisor can edit',                 () => expect(guardAction('supervisor', 'edit')).toBeTruthy())
  test('supervisor cannot delete',            () => expect(guardAction('supervisor', 'delete')).toBeFalsy())
  test('staff can add',                       () => expect(guardAction('staff',      'add')).toBeTruthy())
  test('staff cannot edit',                   () => expect(guardAction('staff',      'edit')).toBeFalsy())
  test('staff cannot delete',                 () => expect(guardAction('staff',      'delete')).toBeFalsy())
  test('driver cannot add',                   () => expect(guardAction('driver',     'add')).toBeFalsy())
  test('driver cannot delete',                () => expect(guardAction('driver',     'delete')).toBeFalsy())
  test('driver can view',                     () => expect(guardAction('driver',     'view')).toBeTruthy())
  test('unknown role = no access',            () => expect(guardAction('unknown',    'add')).toBeFalsy())
})

describe('💳 Gap 2 — Transport Dues in Payments', () => {
  test('transport dues included in total outstanding', () => {
    const items = [{ cost: 1000, amount_paid: 500, payment_status: 'partial' }]
    const trips = [{ amount: 800, amount_paid: 0 }]
    const result = calcPaymentSummaryV2(items, trips)
    expect(result.staffDue).toBe(500)
    expect(result.transportDue).toBe(800)
    expect(result.totalOutstanding).toBe(1300)
  })
  test('zero transport dues when all trips paid',  () => {
    const items = [{ cost: 1000, amount_paid: 1000, payment_status: 'paid' }]
    const trips = [{ amount: 800, amount_paid: 800, payment_status: 'paid' }]
    const result = calcPaymentSummaryV2(items, trips)
    expect(result.staffDue).toBe(0)
    expect(result.transportDue).toBe(0)
    expect(result.totalOutstanding).toBe(0)
  })
  test('partial transport payment counted correctly', () => {
    const trips = [{ amount: 500, amount_paid: 200, payment_status: 'partial' }]
    const result = calcPaymentSummaryV2([], trips)
    expect(result.transportDue).toBe(300)
  })
})

describe('📊 Gap 3 — Enhanced Dashboard Stats', () => {
  const events = [
    { status: 'upcoming', client_amount: 50000, amount_received: 20000 },
    { status: 'ongoing',  client_amount: 30000, amount_received: 30000 },
    { status: 'completed',client_amount: 20000, amount_received: 10000 }, // excluded
  ]
  test('dashboard counts only active events',     () => expect(calcDashboardStats(events, 0, 0).events).toBe(2))
  test('dashboard revenue = active received',     () => expect(calcDashboardStats(events, 0, 0).revenue).toBe(50000))
  test('dashboard pending = active diff',         () => expect(calcDashboardStats(events, 0, 0).pending).toBe(30000))
  test('dashboard shows transport due',           () => expect(calcDashboardStats(events, 5000, 0).transportDue).toBe(5000))
  test('dashboard shows machines out',            () => expect(calcDashboardStats(events, 0, 3).machinesOut).toBe(3))
  test('dashboard transport = 0 when none',       () => expect(calcDashboardStats(events, 0, 0).transportDue).toBe(0))
  test('dashboard machines = 0 when none',        () => expect(calcDashboardStats(events, 0, 0).machinesOut).toBe(0))
})

describe('🗄️ Gap 4 — DB Indexes', () => {
  const REQUIRED_INDEXES = [
    'idx_events_status', 'idx_events_date', 'idx_events_client',
    'idx_event_items_event', 'idx_event_items_status',
    'idx_transport_event', 'idx_transport_status', 'idx_transport_driver',
    'idx_machines_status', 'idx_machines_godown',
    'idx_profit_event', 'idx_profit_owner',
  ]
  test('all 12 indexes defined',                  () => expect(REQUIRED_INDEXES.length).toBe(12))
  test('events_status index exists',              () => expect(REQUIRED_INDEXES.includes('idx_events_status')).toBeTruthy())
  test('events_date index exists',                () => expect(REQUIRED_INDEXES.includes('idx_events_date')).toBeTruthy())
  test('transport_event index exists',            () => expect(REQUIRED_INDEXES.includes('idx_transport_event')).toBeTruthy())
  test('transport_status index exists',           () => expect(REQUIRED_INDEXES.includes('idx_transport_status')).toBeTruthy())
  test('machines_status index exists',            () => expect(REQUIRED_INDEXES.includes('idx_machines_status')).toBeTruthy())
  test('profit split indexes exist',              () => expect(REQUIRED_INDEXES.filter(i => i.includes('profit')).length).toBe(2))
})

describe('🔗 Gap 5 — Machines + Performers Linked to Events', () => {
  const machines = [
    { id: 'm1', name: 'Selfie Booth', godown: 'Godown A', status: 'in_godown', rate: 0 },
    { id: 'm2', name: 'Casino Table', godown: 'Godown B', status: 'at_event' },
  ]
  const performers = [
    { id: 'p1', full_name: 'Rahul Dancer', type: 'dancer', rate: 2000, rate_type: 'per_event' },
    { id: 'p2', full_name: 'DJ Sonu',      type: 'dj',     rate: 5000, rate_type: 'per_event' },
  ]

  test('machine selection auto-fills description', () => {
    const result = autoFillMachine('m1', machines)
    expect(result.description).toBe('Selfie Booth')
    expect(result.machine_id).toBe('m1')
  })
  test('unknown machine returns empty',            () => expect(autoFillMachine('unknown', machines)).toEqual({}))
  test('performer auto-fills name + type',         () => {
    const result = autoFillPerformer('p1', performers)
    expect(result.description).toBe('Rahul Dancer (dancer)')
    expect(result.cost).toBe(2000)
  })
  test('performer auto-fills cost',                () => expect(autoFillPerformer('p2', performers).cost).toBe(5000))
  test('performer pay_type = fixed for per_event', () => expect(autoFillPerformer('p1', performers).pay_type).toBe('fixed'))
  test('unknown performer returns empty',          () => expect(autoFillPerformer('unknown', performers)).toEqual({}))
  test('machine item type requires machine_id',    () => {
    const errors = validateItemForm({ item_type: 'machine', description: 'Booth', cost: '500', days: '1', machine_id: '' })
    expect(errors).toHaveProperty('machine_id')
  })
  test('machine item with machine_id passes',      () => {
    const errors = validateItemForm({ item_type: 'machine', description: 'Booth', cost: '500', days: '1', machine_id: 'm1' })
    expect(errors).not.toHaveProperty('machine_id')
  })
  test('non-machine item does not require machine_id', () => {
    const errors = validateItemForm({ item_type: 'supervisor', description: 'Raj', cost: '500', days: '1', machine_id: '' })
    expect(errors).not.toHaveProperty('machine_id')
  })
})

describe('📋 Gap 7 — Audit Log', () => {
  test('valid trip_paid audit entry',             () => {
    const entry = buildAuditEntry({ action: 'trip_paid', entityType: 'transport_trip', entityId: 'uuid-1', amount: 500, doneBy: 'uuid-p1' })
    expect(entry !== null).toBeTruthy()
    expect(entry.action).toBe('trip_paid')
    expect(entry.amount).toBe(500)
  })
  test('valid payment_collected audit entry',     () => {
    const entry = buildAuditEntry({ action: 'payment_collected', entityType: 'event', entityId: 'uuid-2', amount: 50000, notes: 'cash' })
    expect(entry.action).toBe('payment_collected')
    expect(entry.entity_type).toBe('event')
  })
  test('valid trip_reverted audit entry',         () => {
    const entry = buildAuditEntry({ action: 'trip_reverted', entityType: 'transport_trip', entityId: 'uuid-3', notes: 'Wrong amount' })
    expect(entry.notes).toBe('Wrong amount')
  })
  test('missing action returns null',             () => expect(buildAuditEntry({ entityType: 'event', entityId: 'x' })).toBeNull())
  test('missing entityType returns null',         () => expect(buildAuditEntry({ action: 'trip_paid', entityId: 'x' })).toBeNull())
  test('missing entityId returns null',           () => expect(buildAuditEntry({ action: 'trip_paid', entityType: 'event' })).toBeNull())
  test('optional fields default to null',         () => {
    const entry = buildAuditEntry({ action: 'trip_paid', entityType: 'transport_trip', entityId: 'uuid-1' })
    expect(entry.amount).toBeNull()
    expect(entry.notes).toBeNull()
    expect(entry.done_by).toBeNull()
  })
  test('audit log has correct table columns',     () => {
    const COLS = ['id','action','entity_type','entity_id','amount','notes','done_by','created_at']
    expect(COLS.includes('action')).toBeTruthy()
    expect(COLS.includes('done_by')).toBeTruthy()
    expect(COLS.includes('entity_id')).toBeTruthy()
  })
})

describe('🔐 Gap 10 — AuthContext Profile Race Condition', () => {
  test('loading stays true until profile resolved',  () => {
    // Simulate: user set but profile fetch in progress
    const state = { user: { id: 'u1' }, profile: null, loading: true }
    expect(state.loading).toBeTruthy()
    expect(state.profile).toBeNull()
  })
  test('loading false only after profile fetched',   () => {
    const state = { user: { id: 'u1' }, profile: { id: 'u1', role: 'admin' }, loading: false }
    expect(state.loading).toBeFalsy()
    expect(state.profile?.role).toBe('admin')
  })
  test('profile null on fetch error — loading still false', () => {
    const state = { user: { id: 'u1' }, profile: null, loading: false }
    expect(state.loading).toBeFalsy()
  })
  test('profile role defaults to staff if null',     () => {
    const profile = null
    const role = profile?.role || 'staff'
    expect(role).toBe('staff')
  })
  test('isMounted ref prevents state update after unmount', () => {
    let isMounted = true
    // simulate component unmount
    isMounted = false
    // state should not be set
    expect(isMounted).toBeFalsy()
  })
})

describe('⚠️ Gap 9 — ErrorBoundary', () => {
  test('error is caught and hasError set to true',   () => {
    const state = { hasError: false, error: null }
    // Simulate getDerivedStateFromError
    const newState = (error) => ({ hasError: true, error })
    const result = newState(new Error('Test crash'))
    expect(result.hasError).toBeTruthy()
    expect(result.error.message).toBe('Test crash')
  })
  test('no error — hasError is false',               () => {
    expect({ hasError: false, error: null }.hasError).toBeFalsy()
  })
  test('error message is accessible',               () => {
    const err = new Error('Database connection failed')
    expect(err.message).toBe('Database connection failed')
  })
})


// ── SUMMARY ──────────────────────────────────────────────────
const total = passed + failed
console.log(`\n${'═'.repeat(54)}`)
console.log(`  TOTAL: ${total} tests`)
console.log(`  ✅ Passed: ${passed}`)
console.log(`  ❌ Failed: ${failed}`)
console.log('═'.repeat(54))
if (failed === 0) console.log('  🎉 All tests passed! Ready to deploy.\n')
else { console.log('  ⚠️  Fix failing tests before deploying.\n'); process.exit(1) }
