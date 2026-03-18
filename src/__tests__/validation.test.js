/**
 * Unit Tests — EventMgr Validation Logic
 * Run with: npm test
 * These test all form validation functions across the app
 */

// ── Helpers ──────────────────────────────────────────────────
function validatePerson(form) {
  const errors = {}
  if (!form.full_name?.trim()) errors.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone number'
  if (form.pay_rate && isNaN(parseFloat(form.pay_rate))) errors.pay_rate = 'Must be a number'
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
  if (form.start_time && form.end_time && form.start_time >= form.end_time) errors.end_time = 'End time must be after start time'
  return errors
}

function validateMachine(form) {
  const errors = {}
  if (!form.name?.trim()) errors.name = 'Item name is required'
  return errors
}

function validateLogin(form) {
  const errors = {}
  if (!form.email?.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'
  return errors
}

function validateEventItem(form) {
  const errors = {}
  if (!form.description?.trim()) errors.description = 'Description is required'
  if (form.cost && isNaN(parseFloat(form.cost))) errors.cost = 'Must be a valid number'
  if (form.days && (isNaN(parseFloat(form.days)) || parseFloat(form.days) <= 0)) errors.days = 'Days must be a positive number'
  return errors
}

// ── TESTS ─────────────────────────────────────────────────────

let passed = 0
let failed = 0

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
    toBe: (expected) => {
      if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`)
    },
    toEqual: (expected) => {
      const a = JSON.stringify(val), b = JSON.stringify(expected)
      if (a !== b) throw new Error(`Expected ${b}, got ${a}`)
    },
    toBeTruthy: () => { if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`) },
    toBeFalsy: () => { if (val) throw new Error(`Expected falsy, got ${JSON.stringify(val)}`) },
    toHaveProperty: (key) => { if (!(key in val)) throw new Error(`Expected property "${key}" in ${JSON.stringify(val)}`) },
    not: {
      toHaveProperty: (key) => { if (key in val) throw new Error(`Did not expect property "${key}" in ${JSON.stringify(val)}`) },
      toBe: (expected) => { if (val === expected) throw new Error(`Expected NOT ${JSON.stringify(expected)}`) }
    }
  }
}

// ── LOGIN TESTS ──
console.log('\n🔐 Login Validation')
test('empty email shows error', () => {
  const e = validateLogin({ email: '', password: 'pass123' })
  expect(e).toHaveProperty('email')
})
test('invalid email format shows error', () => {
  const e = validateLogin({ email: 'notanemail', password: 'pass123' })
  expect(e).toHaveProperty('email')
})
test('valid email passes', () => {
  const e = validateLogin({ email: 'amit@eventmgr.com', password: 'pass123' })
  expect(e).not.toHaveProperty('email')
})
test('empty password shows error', () => {
  const e = validateLogin({ email: 'a@b.com', password: '' })
  expect(e).toHaveProperty('password')
})
test('password less than 6 chars shows error', () => {
  const e = validateLogin({ email: 'a@b.com', password: '12345' })
  expect(e).toHaveProperty('password')
})
test('valid credentials pass all checks', () => {
  const e = validateLogin({ email: 'amit@eventmgr.com', password: 'EventMgr@2026' })
  expect(Object.keys(e).length).toBe(0)
})

// ── PERSON TESTS ──
console.log('\n👤 People & Staff Validation')
test('empty name shows error', () => {
  const e = validatePerson({ full_name: '', phone: '' })
  expect(e).toHaveProperty('full_name')
})
test('valid name passes', () => {
  const e = validatePerson({ full_name: 'Amit Prasad', phone: '' })
  expect(e).not.toHaveProperty('full_name')
})
test('valid Indian phone passes', () => {
  const e = validatePerson({ full_name: 'Test', phone: '+91 9876543210' })
  expect(e).not.toHaveProperty('phone')
})
test('invalid phone shows error', () => {
  const e = validatePerson({ full_name: 'Test', phone: 'abc' })
  expect(e).toHaveProperty('phone')
})
test('non-numeric pay rate shows error', () => {
  const e = validatePerson({ full_name: 'Test', phone: '', pay_rate: 'abc' })
  expect(e).toHaveProperty('pay_rate')
})
test('numeric pay rate passes', () => {
  const e = validatePerson({ full_name: 'Test', phone: '', pay_rate: '500' })
  expect(e).not.toHaveProperty('pay_rate')
})

// ── CLIENT TESTS ──
console.log('\n👥 Client Validation')
test('empty client name shows error', () => {
  const e = validateClient({ full_name: '' })
  expect(e).toHaveProperty('full_name')
})
test('invalid email shows error', () => {
  const e = validateClient({ full_name: 'Test', email: 'bademail' })
  expect(e).toHaveProperty('email')
})
test('valid email passes', () => {
  const e = validateClient({ full_name: 'Test', email: 'client@example.com' })
  expect(e).not.toHaveProperty('email')
})
test('empty email is optional — no error', () => {
  const e = validateClient({ full_name: 'Test', email: '' })
  expect(e).not.toHaveProperty('email')
})

// ── EVENT TESTS ──
console.log('\n📅 Event Validation')
test('empty title shows error', () => {
  const e = validateEvent({ title: '', event_date: '2026-04-01' })
  expect(e).toHaveProperty('title')
})
test('missing date shows error', () => {
  const e = validateEvent({ title: 'Wedding', event_date: '' })
  expect(e).toHaveProperty('event_date')
})
test('end time before start time shows error', () => {
  const e = validateEvent({ title: 'Test', event_date: '2026-04-01', start_time: '18:00', end_time: '10:00' })
  expect(e).toHaveProperty('end_time')
})
test('valid end time after start time passes', () => {
  const e = validateEvent({ title: 'Test', event_date: '2026-04-01', start_time: '10:00', end_time: '18:00' })
  expect(e).not.toHaveProperty('end_time')
})
test('non-numeric amount shows error', () => {
  const e = validateEvent({ title: 'Test', event_date: '2026-04-01', client_amount: 'abc' })
  expect(e).toHaveProperty('client_amount')
})
test('valid amount passes', () => {
  const e = validateEvent({ title: 'Test', event_date: '2026-04-01', client_amount: '50000' })
  expect(e).not.toHaveProperty('client_amount')
})

// ── MACHINE TESTS ──
console.log('\n📦 Machine & Items Validation')
test('empty machine name shows error', () => {
  const e = validateMachine({ name: '' })
  expect(e).toHaveProperty('name')
})
test('whitespace-only name shows error', () => {
  const e = validateMachine({ name: '   ' })
  expect(e).toHaveProperty('name')
})
test('valid name passes', () => {
  const e = validateMachine({ name: 'Selfie Bhoot Booth' })
  expect(e).not.toHaveProperty('name')
})

// ── EVENT ITEM TESTS ──
console.log('\n🎭 Event Item Validation')
test('empty description shows error', () => {
  const e = validateEventItem({ description: '' })
  expect(e).toHaveProperty('description')
})
test('valid description passes', () => {
  const e = validateEventItem({ description: 'Supervisor for setup' })
  expect(e).not.toHaveProperty('description')
})
test('zero or negative days shows error', () => {
  const e = validateEventItem({ description: 'Test', days: '0' })
  expect(e).toHaveProperty('days')
})
test('valid days passes', () => {
  const e = validateEventItem({ description: 'Test', days: '2' })
  expect(e).not.toHaveProperty('days')
})

// ── SUMMARY ──
console.log(`\n${'─'.repeat(40)}`)
console.log(`Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`)
if (failed === 0) console.log('🎉 All tests passed!\n')
else { console.log('⚠️  Some tests failed. Please review.\n'); process.exit(1) }
