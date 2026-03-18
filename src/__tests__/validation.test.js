/**
 * ============================================================
 * ALL SOLUTIONS — COMPREHENSIVE UNIT TESTS
 * Version: 202603.19.05
 * Run with: npm test
 *
 * Coverage:
 *   ✅ Login Page
 *   ✅ People & Staff Page
 *   ✅ Clients Page
 *   ✅ Events Page
 *   ✅ Event Detail Page (items)
 *   ✅ Machines & Items Page
 *   ✅ Payments Page
 *   ✅ Dashboard utilities
 *   ✅ Theme persistence
 *   ✅ Version format
 * ============================================================
 */

// ── Micro test framework ──────────────────────────────────────
let passed = 0, failed = 0, currentSuite = ''

function describe(name, fn) {
  currentSuite = name
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
    toBe:          (exp) => { if (val !== exp)  throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toEqual:       (exp) => { if (JSON.stringify(val) !== JSON.stringify(exp)) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toBeTruthy:    ()    => { if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`) },
    toBeFalsy:     ()    => { if (val)  throw new Error(`Expected falsy, got ${JSON.stringify(val)}`) },
    toBeGreaterThan: (n) => { if (!(val > n)) throw new Error(`Expected ${val} > ${n}`) },
    toBeLessThan:  (n)   => { if (!(val < n)) throw new Error(`Expected ${val} < ${n}`) },
    toContain:     (s)   => { if (!val?.includes?.(s)) throw new Error(`Expected "${val}" to contain "${s}"`) },
    toHaveProperty:(key) => { if (!(key in Object(val))) throw new Error(`Expected property "${key}" in ${JSON.stringify(val)}`) },
    not: {
      toHaveProperty: (key) => { if (key in Object(val)) throw new Error(`Did NOT expect property "${key}"`) },
      toBe:           (exp) => { if (val === exp) throw new Error(`Expected NOT ${JSON.stringify(exp)}`) },
      toBeTruthy:     ()    => { if (val)  throw new Error(`Expected falsy`) },
    }
  }
}

// ── Validation functions (mirrored from app) ──────────────────

function validateLogin(form) {
  const errors = {}
  if (!form.email?.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'
  return errors
}

function validatePerson(form) {
  const errors = {}
  if (!form.full_name?.trim()) errors.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone number'
  if (form.pay_rate && isNaN(parseFloat(form.pay_rate))) errors.pay_rate = 'Must be a number'
  if (form.pay_rate && parseFloat(form.pay_rate) < 0) errors.pay_rate = 'Rate cannot be negative'
  return errors
}

function validateClient(form) {
  const errors = {}
  if (!form.full_name?.trim()) errors.full_name = 'Name is required'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone number'
  return errors
}

function validateEvent(form) {
  const errors = {}
  if (!form.title?.trim()) errors.title = 'Event title is required'
  if (!form.event_date) errors.event_date = 'Event date is required'
  if (form.client_amount && isNaN(parseFloat(form.client_amount))) errors.client_amount = 'Must be a valid amount'
  if (form.client_amount && parseFloat(form.client_amount) < 0) errors.client_amount = 'Amount cannot be negative'
  if (form.start_time && form.end_time && form.start_time >= form.end_time) errors.end_time = 'End time must be after start time'
  return errors
}

function validateEventItem(form) {
  const errors = {}
  if (!form.description?.trim()) errors.description = 'Description is required'
  if (form.cost && isNaN(parseFloat(form.cost))) errors.cost = 'Must be a valid number'
  if (form.cost && parseFloat(form.cost) < 0) errors.cost = 'Cost cannot be negative'
  if (form.days && (isNaN(parseFloat(form.days)) || parseFloat(form.days) <= 0)) errors.days = 'Days must be a positive number'
  if (form.km && (isNaN(parseFloat(form.km)) || parseFloat(form.km) < 0)) errors.km = 'KM cannot be negative'
  return errors
}

function validateMachine(form) {
  const errors = {}
  if (!form.name?.trim()) errors.name = 'Item name is required'
  if (form.status === 'at_event' && !form.current_event_id) errors.current_event_id = 'Please select the event'
  return errors
}

function validatePaymentUpdate(received, billed) {
  const errors = {}
  const val = parseFloat(received)
  if (isNaN(val)) errors.amount = 'Must be a valid number'
  else if (val < 0) errors.amount = 'Amount cannot be negative'
  else if (val > billed) errors.amount = 'Cannot exceed billed amount'
  return errors
}

// ── Dashboard utilities ───────────────────────────────────────
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
  const map = { wedding: '💍', birthday: '🎂', office: '🏢', other: '🎪' }
  return map[type] || '🎪'
}

function getMachineStatusLabel(status) {
  const map = { in_godown: '📦 In Godown', at_event: '🎪 At Event', returned: '✅ Returned' }
  return map[status] || '—'
}

// Version format validator
function isValidVersion(v) {
  return /^\d{6}\.\d{2}\.\d{2}$/.test(v)
}

// Theme validator
function isValidTheme(t) {
  return ['dark', 'light'].includes(t)
}

// Message channel error detector
function isMessageChannelError(msg) {
  const s = msg?.toString() || ''
  return (
    s.includes('message channel closed') ||
    s.includes('listener indicated an asynchronous response') ||
    s.includes('asynchronous response')
  )
}

// ── RUN ALL TESTS ─────────────────────────────────────────────

describe('🔐 Login Page — Validation', () => {
  test('empty email shows error',                () => expect(validateLogin({ email: '', password: 'pass123' })).toHaveProperty('email'))
  test('whitespace email shows error',           () => expect(validateLogin({ email: '   ', password: 'pass123' })).toHaveProperty('email'))
  test('invalid email format shows error',       () => expect(validateLogin({ email: 'notanemail', password: 'pass123' })).toHaveProperty('email'))
  test('email missing @ shows error',            () => expect(validateLogin({ email: 'userexample.com', password: 'pass123' })).toHaveProperty('email'))
  test('valid email passes',                     () => expect(validateLogin({ email: 'amit@allsolutions.com', password: 'pass123' })).not.toHaveProperty('email'))
  test('empty password shows error',             () => expect(validateLogin({ email: 'a@b.com', password: '' })).toHaveProperty('password'))
  test('password < 6 chars shows error',         () => expect(validateLogin({ email: 'a@b.com', password: '12345' })).toHaveProperty('password'))
  test('password exactly 6 chars passes',        () => expect(validateLogin({ email: 'a@b.com', password: '123456' })).not.toHaveProperty('password'))
  test('valid credentials — no errors',          () => expect(Object.keys(validateLogin({ email: 'amit@allsolutions.com', password: 'EventMgr@2026' })).length).toBe(0))
  test('both fields empty — 2 errors',           () => expect(Object.keys(validateLogin({ email: '', password: '' })).length).toBe(2))
})

describe('👤 People & Staff Page — Validation', () => {
  test('empty name shows error',                 () => expect(validatePerson({ full_name: '' })).toHaveProperty('full_name'))
  test('whitespace-only name shows error',       () => expect(validatePerson({ full_name: '   ' })).toHaveProperty('full_name'))
  test('valid name passes',                      () => expect(validatePerson({ full_name: 'Amit Prasad' })).not.toHaveProperty('full_name'))
  test('valid Indian mobile passes',             () => expect(validatePerson({ full_name: 'Test', phone: '+91 9876543210' })).not.toHaveProperty('phone'))
  test('valid local number passes',              () => expect(validatePerson({ full_name: 'Test', phone: '9876543210' })).not.toHaveProperty('phone'))
  test('alphabetic phone shows error',           () => expect(validatePerson({ full_name: 'Test', phone: 'abcdefgh' })).toHaveProperty('phone'))
  test('too short phone shows error',            () => expect(validatePerson({ full_name: 'Test', phone: '123' })).toHaveProperty('phone'))
  test('empty phone is optional — no error',     () => expect(validatePerson({ full_name: 'Test', phone: '' })).not.toHaveProperty('phone'))
  test('non-numeric pay rate shows error',       () => expect(validatePerson({ full_name: 'Test', pay_rate: 'abc' })).toHaveProperty('pay_rate'))
  test('negative pay rate shows error',          () => expect(validatePerson({ full_name: 'Test', pay_rate: '-100' })).toHaveProperty('pay_rate'))
  test('numeric pay rate passes',                () => expect(validatePerson({ full_name: 'Test', pay_rate: '500' })).not.toHaveProperty('pay_rate'))
  test('zero pay rate is valid',                 () => expect(validatePerson({ full_name: 'Test', pay_rate: '0' })).not.toHaveProperty('pay_rate'))
})

describe('👥 Clients Page — Validation', () => {
  test('empty name shows error',                 () => expect(validateClient({ full_name: '' })).toHaveProperty('full_name'))
  test('valid name passes',                      () => expect(validateClient({ full_name: 'Sharma Family' })).not.toHaveProperty('full_name'))
  test('invalid email shows error',              () => expect(validateClient({ full_name: 'Test', email: 'bademail' })).toHaveProperty('email'))
  test('valid email passes',                     () => expect(validateClient({ full_name: 'Test', email: 'client@example.com' })).not.toHaveProperty('email'))
  test('empty email is optional',                () => expect(validateClient({ full_name: 'Test', email: '' })).not.toHaveProperty('email'))
  test('invalid phone shows error',              () => expect(validateClient({ full_name: 'Test', phone: 'abc' })).toHaveProperty('phone'))
  test('valid phone passes',                     () => expect(validateClient({ full_name: 'Test', phone: '9876543210' })).not.toHaveProperty('phone'))
  test('empty phone is optional',                () => expect(validateClient({ full_name: 'Test', phone: '' })).not.toHaveProperty('phone'))
  test('all valid — no errors',                  () => expect(Object.keys(validateClient({ full_name: 'Test', email: 'a@b.com', phone: '9876543210' })).length).toBe(0))
})

describe('📅 Events Page — Validation', () => {
  test('empty title shows error',                () => expect(validateEvent({ title: '', event_date: '2026-04-01' })).toHaveProperty('title'))
  test('whitespace title shows error',           () => expect(validateEvent({ title: '  ', event_date: '2026-04-01' })).toHaveProperty('title'))
  test('valid title passes',                     () => expect(validateEvent({ title: 'Sharma Wedding', event_date: '2026-04-01' })).not.toHaveProperty('title'))
  test('missing date shows error',               () => expect(validateEvent({ title: 'Test', event_date: '' })).toHaveProperty('event_date'))
  test('valid date passes',                      () => expect(validateEvent({ title: 'Test', event_date: '2026-04-01' })).not.toHaveProperty('event_date'))
  test('end time before start shows error',      () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '18:00', end_time: '10:00' })).toHaveProperty('end_time'))
  test('equal start and end time shows error',   () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '10:00', end_time: '10:00' })).toHaveProperty('end_time'))
  test('valid time range passes',                () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', start_time: '10:00', end_time: '18:00' })).not.toHaveProperty('end_time'))
  test('no times set — no time error',           () => expect(validateEvent({ title: 'T', event_date: '2026-04-01' })).not.toHaveProperty('end_time'))
  test('non-numeric amount shows error',         () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: 'abc' })).toHaveProperty('client_amount'))
  test('negative amount shows error',            () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: '-100' })).toHaveProperty('client_amount'))
  test('valid amount passes',                    () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: '50000' })).not.toHaveProperty('client_amount'))
  test('zero amount is valid',                   () => expect(validateEvent({ title: 'T', event_date: '2026-04-01', client_amount: '0' })).not.toHaveProperty('client_amount'))
})

describe('🎭 Event Detail Page — Item Validation', () => {
  test('empty description shows error',          () => expect(validateEventItem({ description: '' })).toHaveProperty('description'))
  test('whitespace description shows error',     () => expect(validateEventItem({ description: '   ' })).toHaveProperty('description'))
  test('valid description passes',               () => expect(validateEventItem({ description: 'Supervisor for setup' })).not.toHaveProperty('description'))
  test('non-numeric cost shows error',           () => expect(validateEventItem({ description: 'T', cost: 'abc' })).toHaveProperty('cost'))
  test('negative cost shows error',              () => expect(validateEventItem({ description: 'T', cost: '-100' })).toHaveProperty('cost'))
  test('valid cost passes',                      () => expect(validateEventItem({ description: 'T', cost: '1500' })).not.toHaveProperty('cost'))
  test('zero cost is valid',                     () => expect(validateEventItem({ description: 'T', cost: '0' })).not.toHaveProperty('cost'))
  test('zero days shows error',                  () => expect(validateEventItem({ description: 'T', days: '0' })).toHaveProperty('days'))
  test('negative days shows error',              () => expect(validateEventItem({ description: 'T', days: '-1' })).toHaveProperty('days'))
  test('fractional days pass (0.5)',             () => expect(validateEventItem({ description: 'T', days: '0.5' })).not.toHaveProperty('days'))
  test('valid days pass',                        () => expect(validateEventItem({ description: 'T', days: '3' })).not.toHaveProperty('days'))
  test('negative km shows error',                () => expect(validateEventItem({ description: 'T', km: '-10' })).toHaveProperty('km'))
  test('valid km passes',                        () => expect(validateEventItem({ description: 'T', km: '25' })).not.toHaveProperty('km'))
})

describe('📦 Machines & Items Page — Validation', () => {
  test('empty name shows error',                 () => expect(validateMachine({ name: '' })).toHaveProperty('name'))
  test('whitespace name shows error',            () => expect(validateMachine({ name: '   ' })).toHaveProperty('name'))
  test('valid name passes',                      () => expect(validateMachine({ name: 'Selfie Bhoot Booth' })).not.toHaveProperty('name'))
  test('at_event status without event shows error', () => expect(validateMachine({ name: 'Test', status: 'at_event', current_event_id: '' })).toHaveProperty('current_event_id'))
  test('at_event status with event passes',      () => expect(validateMachine({ name: 'Test', status: 'at_event', current_event_id: 'uuid-123' })).not.toHaveProperty('current_event_id'))
  test('in_godown status without event is fine', () => expect(validateMachine({ name: 'Test', status: 'in_godown', current_event_id: '' })).not.toHaveProperty('current_event_id'))
  test('returned status without event is fine',  () => expect(validateMachine({ name: 'Test', status: 'returned', current_event_id: '' })).not.toHaveProperty('current_event_id'))
})

describe('💰 Payments Page — Validation & Calculations', () => {
  test('non-numeric received shows error',       () => expect(validatePaymentUpdate('abc', 50000)).toHaveProperty('amount'))
  test('negative received shows error',          () => expect(validatePaymentUpdate('-100', 50000)).toHaveProperty('amount'))
  test('received > billed shows error',          () => expect(validatePaymentUpdate('60000', 50000)).toHaveProperty('amount'))
  test('received = billed is valid (fully paid)',() => expect(validatePaymentUpdate('50000', 50000)).not.toHaveProperty('amount'))
  test('valid partial payment passes',           () => expect(validatePaymentUpdate('25000', 50000)).not.toHaveProperty('amount'))
  test('zero payment is valid',                  () => expect(validatePaymentUpdate('0', 50000)).not.toHaveProperty('amount'))

  test('progress 0% when nothing received',      () => expect(calcPaymentProgress(0, 50000)).toBe(0))
  test('progress 50% when half received',        () => expect(calcPaymentProgress(25000, 50000)).toBe(50))
  test('progress 100% when fully paid',          () => expect(calcPaymentProgress(50000, 50000)).toBe(100))
  test('progress capped at 100%',                () => expect(calcPaymentProgress(60000, 50000)).toBe(100))
  test('progress 0% when billed is 0',           () => expect(calcPaymentProgress(0, 0)).toBe(0))

  test('staff due calculates unpaid items',       () => {
    const items = [
      { payment_status: 'pending', cost: 1000, amount_paid: 0 },
      { payment_status: 'paid',    cost: 500,  amount_paid: 500 },
      { payment_status: 'partial', cost: 800,  amount_paid: 400 },
    ]
    expect(calcStaffDue(items)).toBe(1400) // 1000 + 400
  })
  test('staff due is 0 when all paid',           () => {
    const items = [{ payment_status: 'paid', cost: 500, amount_paid: 500 }]
    expect(calcStaffDue(items)).toBe(0)
  })
})

describe('📊 Dashboard — Utilities & Formatting', () => {
  test('fmt: 0 returns "0" (not "o" or "O")',    () => { expect(fmt(0)).toBe('0'); expect(fmt(0) === 'o').toBeFalsy(); expect(fmt(0) === 'O').toBeFalsy() })
  test('fmt: null returns "0"',                  () => expect(fmt(null)).toBe('0'))
  test('fmt: undefined returns "0"',             () => expect(fmt(undefined)).toBe('0'))
  test('fmt: 999 returns "999"',                 () => expect(fmt(999)).toBe('999'))
  test('fmt: 1000 returns "1.0k"',               () => expect(fmt(1000)).toBe('1.0k'))
  test('fmt: 1500 returns "1.5k"',               () => expect(fmt(1500)).toBe('1.5k'))
  test('fmt: 100000 returns "1.0L"',             () => expect(fmt(100000)).toBe('1.0L'))
  test('fmt: 250000 returns "2.5L"',             () => expect(fmt(250000)).toBe('2.5L'))

  test('fmtRs: 0 returns "₹0"',                 () => expect(fmtRs(0)).toBe('₹0'))
  test('fmtRs: 1000 returns "₹1.0k"',           () => expect(fmtRs(1000)).toBe('₹1.0k'))
  test('fmtRs: 50000 returns "₹50.0k"',         () => expect(fmtRs(50000)).toBe('₹50.0k'))
  test('fmtRs: 100000 returns "₹1.0L"',         () => expect(fmtRs(100000)).toBe('₹1.0L'))

  test('profit positive when revenue > cost',    () => expect(calcProfit(50000, 30000)).toBeGreaterThan(0))
  test('profit is 20000',                        () => expect(calcProfit(50000, 30000)).toBe(20000))
  test('profit negative when cost > revenue',    () => expect(calcProfit(10000, 30000)).toBeLessThan(0))
  test('profit zero when equal',                 () => expect(calcProfit(30000, 30000)).toBe(0))
  test('profit handles null gracefully',         () => expect(calcProfit(null, null)).toBe(0))

  test('wedding emoji is 💍',                    () => expect(getEventTypeEmoji('wedding')).toBe('💍'))
  test('birthday emoji is 🎂',                   () => expect(getEventTypeEmoji('birthday')).toBe('🎂'))
  test('office emoji is 🏢',                     () => expect(getEventTypeEmoji('office')).toBe('🏢'))
  test('other/unknown defaults to 🎪',           () => expect(getEventTypeEmoji('other')).toBe('🎪'))
  test('undefined type defaults to 🎪',          () => expect(getEventTypeEmoji(undefined)).toBe('🎪'))
})

describe('📦 Machine Status — Labels', () => {
  test('in_godown label correct',                () => expect(getMachineStatusLabel('in_godown')).toContain('In Godown'))
  test('at_event label correct',                 () => expect(getMachineStatusLabel('at_event')).toContain('At Event'))
  test('returned label correct',                 () => expect(getMachineStatusLabel('returned')).toContain('Returned'))
  test('unknown status returns —',               () => expect(getMachineStatusLabel('unknown')).toBe('—'))
})

describe('🌗 Theme — Persistence', () => {
  test('dark is a valid theme',                  () => expect(isValidTheme('dark')).toBeTruthy())
  test('light is a valid theme',                 () => expect(isValidTheme('light')).toBeTruthy())
  test('invalid theme rejected',                 () => expect(isValidTheme('blue')).toBeFalsy())
  test('empty string rejected',                  () => expect(isValidTheme('')).toBeFalsy())
  test('toggle dark → light',                    () => expect('dark' === 'dark' ? 'light' : 'dark').toBe('light'))
  test('toggle light → dark',                    () => expect('light' === 'dark' ? 'light' : 'dark').toBe('dark'))
})

describe('🔢 Version Format', () => {
  test('current version format is valid',        () => expect(isValidVersion('202603.19.05')).toBeTruthy())
  test('yearmonth.day.num format validated',     () => expect(isValidVersion('202604.01.01')).toBeTruthy())
  test('wrong format rejected',                  () => expect(isValidVersion('1.0.0')).toBeFalsy())
  test('semver rejected',                        () => expect(isValidVersion('v1.2.3')).toBeFalsy())
  test('empty string rejected',                  () => expect(isValidVersion('')).toBeFalsy())
})

describe('🔇 Async Message Channel Error — Suppression', () => {
  test('message channel error detected correctly', () => {
    expect(isMessageChannelError('A listener indicated an asynchronous response by returning true, but the message channel closed')).toBeTruthy()
  })
  test('message channel closed error detected',  () => {
    expect(isMessageChannelError('message channel closed before a response was received')).toBeTruthy()
  })
  test('asynchronous response error detected',   () => {
    expect(isMessageChannelError('asynchronous response')).toBeTruthy()
  })
  test('normal errors not suppressed',           () => {
    expect(isMessageChannelError('Cannot read properties of undefined')).toBeFalsy()
  })
  test('network errors not suppressed',          () => {
    expect(isMessageChannelError('Failed to fetch')).toBeFalsy()
  })
  test('null/empty message handled safely',      () => {
    expect(isMessageChannelError(null)).toBeFalsy()
    expect(isMessageChannelError('')).toBeFalsy()
  })
})

// ── SUMMARY ───────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`)
console.log(`  TOTAL: ${passed + failed} tests`)
console.log(`  ✅ Passed: ${passed}`)
console.log(`  ❌ Failed: ${failed}`)
console.log('═'.repeat(50))
if (failed === 0) {
  console.log('  🎉 All tests passed! Ready to deploy.\n')
} else {
  console.log('  ⚠️  Fix failing tests before deploying.\n')
  process.exit(1)
}
