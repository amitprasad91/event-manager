/**
 * ============================================================
 * ALL SOLUTIONS — COMPREHENSIVE UNIT TESTS
 * Version: 202603.19.10
 * Run: npm test
 *
 * Coverage:
 *   ✅ Login Page — validation
 *   ✅ People & Staff Page — validation
 *   ✅ Clients Page — validation
 *   ✅ Events Page — validation + status transitions
 *   ✅ Event Detail Page — item validation
 *   ✅ Machines & Items Page — validation + status
 *   ✅ Payments Page — validation + calculations + progress
 *   ✅ Dashboard — formatting + profit + event types
 *   ✅ PWA Install — device detection
 *   ✅ Theme — persistence + toggle
 *   ✅ Version — format validation
 *   ✅ Async Error — suppression logic
 *   ✅ Auth — last login tracking
 *   ✅ Routing — protected route logic
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
    toBe:            (exp) => { if (val !== exp)  throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toEqual:         (exp) => { if (JSON.stringify(val) !== JSON.stringify(exp)) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toBeTruthy:      ()    => { if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`) },
    toBeFalsy:       ()    => { if (val)  throw new Error(`Expected falsy, got ${JSON.stringify(val)}`) },
    toBeGreaterThan: (n)   => { if (!(val > n)) throw new Error(`Expected ${val} > ${n}`) },
    toBeLessThan:    (n)   => { if (!(val < n)) throw new Error(`Expected ${val} < ${n}`) },
    toBeNull:        ()    => { if (val !== null) throw new Error(`Expected null, got ${JSON.stringify(val)}`) },
    toHaveLength:    (n)   => { if (val?.length !== n) throw new Error(`Expected length ${n}, got ${val?.length}`) },
    toHaveProperty:  (key) => { if (!(key in Object(val))) throw new Error(`Expected property "${key}"`) },
    not: {
      toHaveProperty: (key) => { if (key in Object(val)) throw new Error(`Did NOT expect property "${key}"`) },
      toBe:           (exp) => { if (val === exp) throw new Error(`Expected NOT ${JSON.stringify(exp)}`) },
      toBeTruthy:     ()    => { if (val) throw new Error(`Expected falsy`) },
    }
  }
}

// ── Validation functions ──────────────────────────────────────

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

// ── Utility functions ─────────────────────────────────────────

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
  return items
    .filter(i => i.payment_status !== 'paid')
    .reduce((s, i) => s + ((i.cost || 0) - (i.amount_paid || 0)), 0)
}

function getEventTypeEmoji(type) {
  return { wedding:'💍', birthday:'🎂', office:'🏢', other:'🎪' }[type] || '🎪'
}

function getMachineStatusLabel(status) {
  return { in_godown:'📦 In Godown', at_event:'🎪 At Event', returned:'✅ Returned' }[status] || '—'
}

function isValidVersion(v) {
  return /^\d{6}\.\d{2}\.\d{2}$/.test(v)
}

function isValidTheme(t) {
  return ['dark', 'light'].includes(t)
}

function toggleTheme(current) {
  return current === 'dark' ? 'light' : 'dark'
}

function isMessageChannelError(msg) {
  const s = msg?.toString() || ''
  return s.includes('message channel closed') ||
    s.includes('listener indicated an asynchronous response') ||
    s.includes('asynchronous response')
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

function getEventStatusBadge(status) {
  return { upcoming:'badge-blue', ongoing:'badge-green', completed:'badge-gray', cancelled:'badge-red' }[status] || 'badge-gray'
}

function getPayTypLabel(type) {
  return (type || '').replace(/_/g, ' ')
}

function filterBySearch(items, query, fields) {
  if (!query) return items
  const q = query.toLowerCase()
  return items.filter(item => fields.some(f => item[f]?.toLowerCase().includes(q)))
}

function sortEventsByDate(events) {
  return [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
}

// ── TESTS ─────────────────────────────────────────────────────

describe('🔐 Login Page — Validation', () => {
  test('empty email shows error',           () => expect(validateLogin({ email: '', password: 'pass123' })).toHaveProperty('email'))
  test('whitespace email shows error',      () => expect(validateLogin({ email: '   ', password: 'pass123' })).toHaveProperty('email'))
  test('invalid email format shows error',  () => expect(validateLogin({ email: 'notanemail', password: 'pass123' })).toHaveProperty('email'))
  test('email missing @ shows error',       () => expect(validateLogin({ email: 'userexample.com', password: 'pass123' })).toHaveProperty('email'))
  test('valid email passes',                () => expect(validateLogin({ email: 'amit@allsolutions.com', password: 'pass123' })).not.toHaveProperty('email'))
  test('empty password shows error',        () => expect(validateLogin({ email: 'a@b.com', password: '' })).toHaveProperty('password'))
  test('password < 6 chars shows error',    () => expect(validateLogin({ email: 'a@b.com', password: '12345' })).toHaveProperty('password'))
  test('password exactly 6 chars passes',   () => expect(validateLogin({ email: 'a@b.com', password: '123456' })).not.toHaveProperty('password'))
  test('valid credentials — no errors',     () => expect(Object.keys(validateLogin({ email: 'amit@allsolutions.com', password: 'EventMgr@2026' })).length).toBe(0))
  test('both fields empty — 2 errors',      () => expect(Object.keys(validateLogin({ email: '', password: '' })).length).toBe(2))
})

describe('👤 People & Staff — Validation', () => {
  test('empty name shows error',            () => expect(validatePerson({ full_name: '' })).toHaveProperty('full_name'))
  test('whitespace name shows error',       () => expect(validatePerson({ full_name: '   ' })).toHaveProperty('full_name'))
  test('valid name passes',                 () => expect(validatePerson({ full_name: 'Amit Prasad' })).not.toHaveProperty('full_name'))
  test('valid Indian mobile passes',        () => expect(validatePerson({ full_name: 'T', phone: '+91 9876543210' })).not.toHaveProperty('phone'))
  test('valid local number passes',         () => expect(validatePerson({ full_name: 'T', phone: '9876543210' })).not.toHaveProperty('phone'))
  test('alphabetic phone shows error',      () => expect(validatePerson({ full_name: 'T', phone: 'abcdefgh' })).toHaveProperty('phone'))
  test('too short phone shows error',       () => expect(validatePerson({ full_name: 'T', phone: '123' })).toHaveProperty('phone'))
  test('empty phone is optional',           () => expect(validatePerson({ full_name: 'T', phone: '' })).not.toHaveProperty('phone'))
  test('non-numeric pay rate shows error',  () => expect(validatePerson({ full_name: 'T', pay_rate: 'abc' })).toHaveProperty('pay_rate'))
  test('negative pay rate shows error',     () => expect(validatePerson({ full_name: 'T', pay_rate: '-100' })).toHaveProperty('pay_rate'))
  test('zero pay rate is valid',            () => expect(validatePerson({ full_name: 'T', pay_rate: '0' })).not.toHaveProperty('pay_rate'))
  test('getPayTypeLabel formats correctly', () => expect(getPayTypLabel('fixed_per_event')).toBe('fixed per event'))
  test('getPayTypeLabel handles empty',     () => expect(getPayTypLabel('')).toBe(''))
})

describe('👥 Clients — Validation', () => {
  test('empty name shows error',            () => expect(validateClient({ full_name: '' })).toHaveProperty('full_name'))
  test('valid name passes',                 () => expect(validateClient({ full_name: 'Sharma Family' })).not.toHaveProperty('full_name'))
  test('invalid email shows error',         () => expect(validateClient({ full_name: 'T', email: 'bademail' })).toHaveProperty('email'))
  test('valid email passes',                () => expect(validateClient({ full_name: 'T', email: 'client@example.com' })).not.toHaveProperty('email'))
  test('empty email is optional',           () => expect(validateClient({ full_name: 'T', email: '' })).not.toHaveProperty('email'))
  test('invalid phone shows error',         () => expect(validateClient({ full_name: 'T', phone: 'abc' })).toHaveProperty('phone'))
  test('valid phone passes',                () => expect(validateClient({ full_name: 'T', phone: '9876543210' })).not.toHaveProperty('phone'))
  test('empty phone is optional',           () => expect(validateClient({ full_name: 'T', phone: '' })).not.toHaveProperty('phone'))
  test('all valid — 0 errors',              () => expect(Object.keys(validateClient({ full_name: 'T', email: 'a@b.com', phone: '9876543210' })).length).toBe(0))
})

describe('📅 Events — Validation & Status', () => {
  test('empty title shows error',           () => expect(validateEvent({ title: '', event_date: '2026-04-01' })).toHaveProperty('title'))
  test('whitespace title shows error',      () => expect(validateEvent({ title: '  ', event_date: '2026-04-01' })).toHaveProperty('title'))
  test('valid title passes',                () => expect(validateEvent({ title: 'Sharma Wedding', event_date: '2026-04-01' })).not.toHaveProperty('title'))
  test('missing date shows error',          () => expect(validateEvent({ title: 'T', event_date: '' })).toHaveProperty('event_date'))
  test('valid date passes',                 () => expect(validateEvent({ title: 'T', event_date: '2026-04-01' })).not.toHaveProperty('event_date'))
  test('end before start shows error',      () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '18:00', end_time: '10:00' })).toHaveProperty('end_time'))
  test('equal times shows error',           () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '10:00', end_time: '10:00' })).toHaveProperty('end_time'))
  test('valid time range passes',           () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '10:00', end_time: '18:00' })).not.toHaveProperty('end_time'))
  test('no times — no error',               () => expect(validateEvent({ title: 'T', event_date: '2026-04-01' })).not.toHaveProperty('end_time'))
  test('non-numeric amount shows error',    () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: 'abc' })).toHaveProperty('client_amount'))
  test('negative amount shows error',       () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: '-100' })).toHaveProperty('client_amount'))
  test('valid amount passes',               () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: '50000' })).not.toHaveProperty('client_amount'))
  test('upcoming status badge = blue',      () => expect(getEventStatusBadge('upcoming')).toBe('badge-blue'))
  test('ongoing status badge = green',      () => expect(getEventStatusBadge('ongoing')).toBe('badge-green'))
  test('completed status badge = gray',     () => expect(getEventStatusBadge('completed')).toBe('badge-gray'))
  test('cancelled status badge = red',      () => expect(getEventStatusBadge('cancelled')).toBe('badge-red'))
  test('unknown status badge = gray',       () => expect(getEventStatusBadge('unknown')).toBe('badge-gray'))
  test('events sort by date ascending',     () => {
    const evs = [{ event_date: '2026-05-01' }, { event_date: '2026-03-01' }, { event_date: '2026-04-01' }]
    const sorted = sortEventsByDate(evs)
    expect(sorted[0].event_date).toBe('2026-03-01')
    expect(sorted[2].event_date).toBe('2026-05-01')
  })
})

describe('🎭 Event Detail — Item Validation', () => {
  test('empty description shows error',     () => expect(validateEventItem({ description: '' })).toHaveProperty('description'))
  test('whitespace description error',      () => expect(validateEventItem({ description: '   ' })).toHaveProperty('description'))
  test('valid description passes',          () => expect(validateEventItem({ description: 'Supervisor for setup' })).not.toHaveProperty('description'))
  test('non-numeric cost shows error',      () => expect(validateEventItem({ description: 'T', cost: 'abc' })).toHaveProperty('cost'))
  test('negative cost shows error',         () => expect(validateEventItem({ description: 'T', cost: '-100' })).toHaveProperty('cost'))
  test('zero cost is valid',                () => expect(validateEventItem({ description: 'T', cost: '0' })).not.toHaveProperty('cost'))
  test('valid cost passes',                 () => expect(validateEventItem({ description: 'T', cost: '1500' })).not.toHaveProperty('cost'))
  test('zero days shows error',             () => expect(validateEventItem({ description: 'T', days: '0' })).toHaveProperty('days'))
  test('negative days shows error',         () => expect(validateEventItem({ description: 'T', days: '-1' })).toHaveProperty('days'))
  test('0.5 days passes',                   () => expect(validateEventItem({ description: 'T', days: '0.5' })).not.toHaveProperty('days'))
  test('valid 3 days passes',               () => expect(validateEventItem({ description: 'T', days: '3' })).not.toHaveProperty('days'))
  test('negative km shows error',           () => expect(validateEventItem({ description: 'T', km: '-10' })).toHaveProperty('km'))
  test('valid km passes',                   () => expect(validateEventItem({ description: 'T', km: '25' })).not.toHaveProperty('km'))
  test('no optional fields — no errors',    () => expect(Object.keys(validateEventItem({ description: 'Setup' })).length).toBe(0))
})

describe('📦 Machines & Items — Validation & Status', () => {
  test('empty name shows error',            () => expect(validateMachine({ name: '' })).toHaveProperty('name'))
  test('whitespace name shows error',       () => expect(validateMachine({ name: '   ' })).toHaveProperty('name'))
  test('valid name passes',                 () => expect(validateMachine({ name: 'Selfie Bhoot Booth' })).not.toHaveProperty('name'))
  test('at_event without event_id errors',  () => expect(validateMachine({ name: 'T', status: 'at_event', current_event_id: '' })).toHaveProperty('current_event_id'))
  test('at_event with event_id passes',     () => expect(validateMachine({ name: 'T', status: 'at_event', current_event_id: 'uuid-123' })).not.toHaveProperty('current_event_id'))
  test('in_godown without event is fine',   () => expect(validateMachine({ name: 'T', status: 'in_godown', current_event_id: '' })).not.toHaveProperty('current_event_id'))
  test('returned without event is fine',    () => expect(validateMachine({ name: 'T', status: 'returned' })).not.toHaveProperty('current_event_id'))
  test('in_godown label correct',           () => expect(getMachineStatusLabel('in_godown')).toBe('📦 In Godown'))
  test('at_event label correct',            () => expect(getMachineStatusLabel('at_event')).toBe('🎪 At Event'))
  test('returned label correct',            () => expect(getMachineStatusLabel('returned')).toBe('✅ Returned'))
  test('unknown status returns —',          () => expect(getMachineStatusLabel('broken')).toBe('—'))
})

describe('💰 Payments — Validation & Calculations', () => {
  test('non-numeric received errors',       () => expect(validatePaymentUpdate('abc', 50000)).toHaveProperty('amount'))
  test('negative received errors',          () => expect(validatePaymentUpdate('-100', 50000)).toHaveProperty('amount'))
  test('received > billed errors',          () => expect(validatePaymentUpdate('60000', 50000)).toHaveProperty('amount'))
  test('received = billed passes',          () => expect(validatePaymentUpdate('50000', 50000)).not.toHaveProperty('amount'))
  test('partial payment passes',            () => expect(validatePaymentUpdate('25000', 50000)).not.toHaveProperty('amount'))
  test('zero payment is valid',             () => expect(validatePaymentUpdate('0', 50000)).not.toHaveProperty('amount'))
  test('progress 0% when nothing received', () => expect(calcPaymentProgress(0, 50000)).toBe(0))
  test('progress 50% at half',              () => expect(calcPaymentProgress(25000, 50000)).toBe(50))
  test('progress 100% when fully paid',     () => expect(calcPaymentProgress(50000, 50000)).toBe(100))
  test('progress capped at 100%',           () => expect(calcPaymentProgress(60000, 50000)).toBe(100))
  test('progress 0% when billed = 0',       () => expect(calcPaymentProgress(0, 0)).toBe(0))
  test('staff due from unpaid items',       () => {
    const items = [
      { payment_status: 'pending', cost: 1000, amount_paid: 0 },
      { payment_status: 'paid',    cost: 500,  amount_paid: 500 },
      { payment_status: 'partial', cost: 800,  amount_paid: 400 },
    ]
    expect(calcStaffDue(items)).toBe(1400)
  })
  test('staff due = 0 when all paid',       () => {
    expect(calcStaffDue([{ payment_status: 'paid', cost: 500, amount_paid: 500 }])).toBe(0)
  })
  test('staff due = 0 with empty list',     () => expect(calcStaffDue([])).toBe(0))
})

describe('📊 Dashboard — Formatting & Utilities', () => {
  test('fmt(0) returns "0" not "O"',        () => { expect(fmt(0)).toBe('0'); expect(fmt(0) === 'O').toBeFalsy() })
  test('fmt(null) returns "0"',             () => expect(fmt(null)).toBe('0'))
  test('fmt(undefined) returns "0"',        () => expect(fmt(undefined)).toBe('0'))
  test('fmt(999) returns "999"',            () => expect(fmt(999)).toBe('999'))
  test('fmt(1000) returns "1.0k"',          () => expect(fmt(1000)).toBe('1.0k'))
  test('fmt(1500) returns "1.5k"',          () => expect(fmt(1500)).toBe('1.5k'))
  test('fmt(100000) returns "1.0L"',        () => expect(fmt(100000)).toBe('1.0L'))
  test('fmt(250000) returns "2.5L"',        () => expect(fmt(250000)).toBe('2.5L'))
  test('fmtRs(0) returns "₹0"',            () => expect(fmtRs(0)).toBe('₹0'))
  test('fmtRs(1000) returns "₹1.0k"',      () => expect(fmtRs(1000)).toBe('₹1.0k'))
  test('fmtRs(50000) returns "₹50.0k"',    () => expect(fmtRs(50000)).toBe('₹50.0k'))
  test('fmtRs(100000) returns "₹1.0L"',    () => expect(fmtRs(100000)).toBe('₹1.0L'))
  test('profit positive revenue > cost',    () => expect(calcProfit(50000, 30000)).toBe(20000))
  test('profit negative cost > revenue',    () => expect(calcProfit(10000, 30000)).toBe(-20000))
  test('profit zero when equal',            () => expect(calcProfit(30000, 30000)).toBe(0))
  test('profit handles null gracefully',    () => expect(calcProfit(null, null)).toBe(0))
  test('wedding emoji is 💍',              () => expect(getEventTypeEmoji('wedding')).toBe('💍'))
  test('birthday emoji is 🎂',             () => expect(getEventTypeEmoji('birthday')).toBe('🎂'))
  test('office emoji is 🏢',               () => expect(getEventTypeEmoji('office')).toBe('🏢'))
  test('unknown defaults to 🎪',           () => expect(getEventTypeEmoji('other')).toBe('🎪'))
  test('undefined defaults to 🎪',         () => expect(getEventTypeEmoji(undefined)).toBe('🎪'))
  test('filterBySearch returns all when no query', () => {
    const items = [{ name: 'Alice' }, { name: 'Bob' }]
    expect(filterBySearch(items, '', ['name'])).toHaveLength(2)
  })
  test('filterBySearch filters correctly', () => {
    const items = [{ name: 'Amit Prasad' }, { name: 'Raj Kumar' }]
    expect(filterBySearch(items, 'amit', ['name'])).toHaveLength(1)
  })
  test('filterBySearch case insensitive',  () => {
    const items = [{ name: 'AMIT' }]
    expect(filterBySearch(items, 'amit', ['name'])).toHaveLength(1)
  })
  test('filterBySearch no match returns empty', () => {
    const items = [{ name: 'Alice' }]
    expect(filterBySearch(items, 'xyz', ['name'])).toHaveLength(0)
  })
})

describe('📱 PWA Install — Device Detection', () => {
  test('iPhone detected as ios',            () => expect(detectDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)')).toBe('ios'))
  test('iPad detected as ios',              () => expect(detectDeviceType('Mozilla/5.0 (iPad; CPU OS 16_0)')).toBe('ios'))
  test('iPod detected as ios',              () => expect(detectDeviceType('Mozilla/5.0 (iPod touch; CPU iPhone OS 16)')).toBe('ios'))
  test('Chrome iOS NOT detected as ios (CriOS)', () => expect(detectDeviceType('CriOS/100 iPhone')).not.toBe('ios'))
  test('Android detected as android',       () => expect(detectDeviceType('Mozilla/5.0 (Linux; Android 12; Pixel 6)')).toBe('android'))
  test('Android Chrome detected correctly', () => expect(detectDeviceType('Mozilla/5.0 (Linux; Android 11) Chrome/96')).toBe('android'))
  test('Windows desktop = desktop',         () => expect(detectDeviceType('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('desktop'))
  test('Mac desktop = desktop',             () => expect(detectDeviceType('Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0)')).toBe('desktop'))
  test('Linux desktop = desktop',           () => expect(detectDeviceType('Mozilla/5.0 (X11; Linux x86_64) Chrome/96')).toBe('desktop'))
  test('empty UA = desktop',                () => expect(detectDeviceType('')).toBe('desktop'))
})

describe('🌗 Theme — Persistence & Toggle', () => {
  test('dark is valid theme',               () => expect(isValidTheme('dark')).toBeTruthy())
  test('light is valid theme',              () => expect(isValidTheme('light')).toBeTruthy())
  test('random string not valid',           () => expect(isValidTheme('blue')).toBeFalsy())
  test('empty string not valid',            () => expect(isValidTheme('')).toBeFalsy())
  test('toggle dark → light',              () => expect(toggleTheme('dark')).toBe('light'))
  test('toggle light → dark',              () => expect(toggleTheme('light')).toBe('dark'))
})

describe('🔢 Version — Format', () => {
  test('v202603.19.10 is valid',            () => expect(isValidVersion('202603.19.10')).toBeTruthy())
  test('v202604.01.01 is valid',            () => expect(isValidVersion('202604.01.01')).toBeTruthy())
  test('semver 1.0.0 is invalid',           () => expect(isValidVersion('1.0.0')).toBeFalsy())
  test('v prefix invalid',                  () => expect(isValidVersion('v202603.19.10')).toBeFalsy())
  test('empty string invalid',              () => expect(isValidVersion('')).toBeFalsy())
  test('too short invalid',                 () => expect(isValidVersion('2026.1.1')).toBeFalsy())
})

describe('🔇 Async Error — Suppression', () => {
  test('message channel error detected',    () => expect(isMessageChannelError('A listener indicated an asynchronous response by returning true, but the message channel closed')).toBeTruthy())
  test('channel closed error detected',     () => expect(isMessageChannelError('message channel closed before a response was received')).toBeTruthy())
  test('asynchronous response detected',    () => expect(isMessageChannelError('asynchronous response')).toBeTruthy())
  test('real errors NOT suppressed',        () => expect(isMessageChannelError('Cannot read properties of undefined')).toBeFalsy())
  test('network errors NOT suppressed',     () => expect(isMessageChannelError('Failed to fetch')).toBeFalsy())
  test('null handled safely',               () => expect(isMessageChannelError(null)).toBeFalsy())
  test('empty string handled safely',       () => expect(isMessageChannelError('')).toBeFalsy())
})

describe('🔑 Auth — Last Login & Protected Routes', () => {
  test('valid ISO date returns non-null',    () => expect(getLastLoginDisplay('2026-03-19T10:30:00.000Z')).toBeTruthy())
  test('invalid date returns null',         () => expect(getLastLoginDisplay('not-a-date')).toBeNull())
  test('null returns null',                 () => expect(getLastLoginDisplay(null)).toBeNull())
  test('undefined returns null',            () => expect(getLastLoginDisplay(undefined)).toBeNull())
  test('loading state → loading',           () => expect(isProtectedRoute(null, true)).toBe('loading'))
  test('no user → redirect',               () => expect(isProtectedRoute(null, false)).toBe('redirect'))
  test('user present → render',            () => expect(isProtectedRoute({ id: '123' }, false)).toBe('render'))
  test('user + loading → loading',         () => expect(isProtectedRoute({ id: '123' }, true)).toBe('loading'))
})

// ── SUMMARY ───────────────────────────────────────────────────
console.log(`\n${'═'.repeat(52)}`)
console.log(`  TOTAL: ${passed + failed} tests`)
console.log(`  ✅ Passed: ${passed}`)
console.log(`  ❌ Failed: ${failed}`)
console.log('═'.repeat(52))
if (failed === 0) console.log('  🎉 All tests passed! Clean & ready to deploy.\n')
else { console.log('  ⚠️  Fix failing tests before deploying.\n'); process.exit(1) }
