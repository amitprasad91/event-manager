import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Truck, Phone, Pencil, Trash2, CheckCircle, MapPin, RotateCcw, Users } from 'lucide-react'
import { VEHICLE_TYPES, TRANSPORT_PAY_METHODS, TRIP_STATUSES, DEFAULT_GODOWNS, fmtRs, formatTel, openGoogleMaps } from '../lib/constants'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

// Issue #11: Pay confirmation dialog
function PayConfirmDialog({ trip, onConfirm, onCancel }) {
  const [paidBy, setPaidBy] = useState('')
  const [profiles, setProfiles] = useState([])
  useEffect(() => {
    supabase.from('profiles').select('id, full_name').order('full_name').then(({ data }) => setProfiles(data || []))
  }, [])
  return (
    <div className="confirm-overlay">
      <div className="confirm-box" style={{ maxWidth: 360 }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>💳</div>
        <h3 style={{ marginBottom: 4 }}>Confirm Payment</h3>
        <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, textAlign: 'left' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 4 }}>Driver</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{trip.profiles?.full_name || '—'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 4 }}>Date</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{trip.trip_date ? format(new Date(trip.trip_date), 'dd MMM yyyy') : '—'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 4 }}>Amount to Pay</div>
          <div style={{ fontWeight: 800, color: 'var(--gold)', fontFamily: 'monospace', fontSize: '1.2rem' }}>{fmtRs(trip.amount)}</div>
        </div>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Paid By *</label>
          <select className="form-select" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
            <option value="">Select who is paying…</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!paidBy} onClick={() => onConfirm(paidBy)}>
            <CheckCircle size={13} /> Confirm Pay
          </button>
        </div>
      </div>
    </div>
  )
}

// Issue #13: Revert payment dialog
function RevertDialog({ trip, onConfirm, onCancel }) {
  const [reason, setReason] = useState('')
  const [revertedBy, setRevertedBy] = useState('')
  const [profiles, setProfiles] = useState([])
  useEffect(() => {
    supabase.from('profiles').select('id, full_name').order('full_name').then(({ data }) => setProfiles(data || []))
  }, [])
  return (
    <div className="confirm-overlay">
      <div className="confirm-box" style={{ maxWidth: 360 }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>↩️</div>
        <h3 style={{ marginBottom: 4 }}>Revert Payment</h3>
        <p style={{ marginBottom: 14 }}>This will mark the trip as unpaid again.</p>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Reason *</label>
          <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Why is this payment being reverted?" style={{ minHeight: 60 }} />
        </div>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Reverted By *</label>
          <select className="form-select" value={revertedBy} onChange={e => setRevertedBy(e.target.value)}>
            <option value="">Select person…</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" disabled={!reason.trim() || !revertedBy} onClick={() => onConfirm(reason, revertedBy)}>
            Revert Payment
          </button>
        </div>
      </div>
    </div>
  )
}

// Issue #12: Bulk pay dialog for same driver
function BulkPayDialog({ driver, trips, onConfirm, onCancel }) {
  const [paidBy, setPaidBy] = useState('')
  const [profiles, setProfiles] = useState([])
  const total = trips.reduce((s, t) => s + (t.amount || 0), 0)
  useEffect(() => {
    supabase.from('profiles').select('id, full_name').order('full_name').then(({ data }) => setProfiles(data || []))
  }, [])
  return (
    <div className="confirm-overlay">
      <div className="confirm-box" style={{ maxWidth: 380 }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>💰</div>
        <h3 style={{ marginBottom: 4 }}>Bulk Payment — {driver}</h3>
        <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, textAlign: 'left' }}>
          {trips.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-2)' }}>{t.trip_date ? format(new Date(t.trip_date), 'dd MMM') : '—'} · {t.pickup_location || 'Trip'}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--gold)' }}>{fmtRs(t.amount)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--gold)', fontSize: '1.1rem' }}>{fmtRs(total)}</span>
          </div>
        </div>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Paid By *</label>
          <select className="form-select" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
            <option value="">Select who is paying…</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!paidBy} onClick={() => onConfirm(paidBy)}>
            <CheckCircle size={13} /> Pay All {fmtRs(total)}
          </button>
        </div>
      </div>
    </div>
  )
}

function validate(form) {
  const errors = {}
  if (!form.event_id)  errors.event_id  = 'Please select an event'
  if (!form.trip_date) errors.trip_date = 'Trip date is required'
  if (form.amount && isNaN(parseFloat(form.amount))) errors.amount = 'Must be a valid number'
  if (form.km && isNaN(parseFloat(form.km))) errors.km = 'Must be a valid number'
  return errors
}

// Issue #10: Extended vehicle types including commercial/bike
const EXTENDED_VEHICLE_TYPES = [
  { value: 'Tata Ace',     label: '🚛 Tata Ace (Mini Truck)' },
  { value: 'Tata 407',    label: '🚚 Tata 407 (Medium Truck)' },
  { value: 'Auto',        label: '🛺 Auto Rickshaw' },
  { value: 'Van',         label: '🚐 Van' },
  { value: 'Bike',        label: '🏍️ Bike' },
  { value: 'Private Bike',label: '🏍️ Private Bike' },
  { value: 'Other',       label: '🚗 Other' },
]

export default function TransportPage() {
  const { profile } = useAuth()
  const [trips, setTrips]           = useState([])
  const [events, setEvents]         = useState([])
  const [drivers, setDrivers]       = useState([])
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDriver, setFilterDriver] = useState('')
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editing, setEditing]       = useState(null)
  const [confirmId, setConfirmId]   = useState(null)
  const [payTrip, setPayTrip]       = useState(null)
  const [revertTrip, setRevertTrip] = useState(null)
  const [bulkDriver, setBulkDriver] = useState(null)
  const [errors, setErrors]         = useState({})

  const emptyForm = {
    event_id: '', driver_profile_id: '', staff_profile_id: '',
    vehicle_type: EXTENDED_VEHICLE_TYPES[0].value,
    pickup_location: '', drop_location: '', km: '', amount: '',
    pay_method: 'per_km', trip_date: '', notes: '',
    payment_status: 'pending', is_round_trip: false,
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [tripsRes, evRes, driversRes] = await Promise.all([
      supabase.from('transport_trips')
        .select('*, events(title, event_date, venues(name, address, google_maps_url)), profiles!transport_trips_driver_profile_id_fkey(full_name, phone)')
        .order('trip_date', { ascending: false }),
      supabase.from('events').select('id, title, event_date, venues(name, address)').in('status', ['upcoming','ongoing','completed']).order('event_date', { ascending: false }),
      supabase.from('profiles').select('id, full_name, phone').in('role', ['driver','staff','supervisor','admin']).order('full_name'),
    ])
    setTrips(tripsRes.data || [])
    setEvents(evRes.data || [])
    setDrivers(driversRes.data || [])
    setLoading(false)
  }

  // Issue #9: When event is selected, auto-fill date and drop location
  function handleEventChange(eventId) {
    const ev = events.find(e => e.id === eventId)
    setForm(f => ({
      ...f,
      event_id:      eventId,
      trip_date:     ev?.event_date || f.trip_date,
      pickup_location: f.pickup_location || DEFAULT_GODOWNS[0],
      drop_location: ev?.venues?.name ? ev.venues.name + (ev.venues.address ? ', ' + ev.venues.address : '') : f.drop_location,
    }))
  }

  function openEdit(t) {
    setEditing(t)
    setErrors({})
    setForm({
      event_id: t.event_id || '', driver_profile_id: t.driver_profile_id || '',
      staff_profile_id: t.staff_profile_id || '',
      vehicle_type: t.vehicle_type || EXTENDED_VEHICLE_TYPES[0].value,
      pickup_location: t.pickup_location || '', drop_location: t.drop_location || '',
      km: t.km || '', amount: t.amount || '', pay_method: t.pay_method || 'per_km',
      trip_date: t.trip_date || '', notes: t.notes || '',
      payment_status: t.payment_status || 'pending',
      is_round_trip: t.is_round_trip || false,
    })
    setShowModal(true)
  }

  function openNew() {
    setEditing(null)
    setErrors({})
    setForm(emptyForm)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    const payload = {
      ...form,
      km:     form.km     ? parseFloat(form.km)     : null,
      amount: form.amount ? parseFloat(form.amount) : 0,
    }
    if (!payload.driver_profile_id) delete payload.driver_profile_id
    if (!payload.staff_profile_id)  delete payload.staff_profile_id
    let error
    if (editing) {
      ;({ error } = await supabase.from('transport_trips').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('transport_trips').insert(payload))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Trip updated!' : 'Trip added!')
    setShowModal(false)
    loadAll()
  }

  // Issue #11: Mark paid with confirmation
  async function confirmPay(tripId, paidByProfileId) {
    const trip = trips.find(t => t.id === tripId)
    const { error } = await supabase.from('transport_trips').update({
      payment_status:    'paid',
      amount_paid:       trip.amount,
      paid_by_profile_id: paidByProfileId,
      paid_at:           new Date().toISOString(),
    }).eq('id', tripId)
    setPayTrip(null)
    if (error) { toast.error(error.message); return }
    toast.success('Payment confirmed!')
    loadAll()
  }

  // Issue #13: Revert payment
  async function confirmRevert(tripId, reason, revertedByProfileId) {
    const { error } = await supabase.from('transport_trips').update({
      payment_status:           'pending',
      amount_paid:              0,
      paid_by_profile_id:       null,
      paid_at:                  null,
      reverted:                 true,
      revert_reason:            reason,
      reverted_by_profile_id:   revertedByProfileId,
      reverted_at:              new Date().toISOString(),
    }).eq('id', tripId)
    setRevertTrip(null)
    if (error) { toast.error(error.message); return }
    toast.success('Payment reverted!')
    loadAll()
  }

  // Issue #12: Bulk pay for same driver
  async function confirmBulkPay(driverName, paidByProfileId) {
    const unpaidTrips = trips.filter(t =>
      t.profiles?.full_name === driverName && t.payment_status !== 'paid'
    )
    const now = new Date().toISOString()
    const { error } = await supabase.from('transport_trips')
      .update({ payment_status: 'paid', paid_by_profile_id: paidByProfileId, paid_at: now })
      .in('id', unpaidTrips.map(t => t.id))
    setBulkDriver(null)
    if (error) { toast.error(error.message); return }
    toast.success(`Paid ${unpaidTrips.length} trips for ${driverName}!`)
    loadAll()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('transport_trips').delete().eq('id', id)
    setConfirmId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Trip deleted!')
    loadAll()
  }

  const filtered = trips.filter(t => {
    const q = search.toLowerCase()
    const matchQ = !q || t.events?.title?.toLowerCase().includes(q) || t.profiles?.full_name?.toLowerCase().includes(q) || t.pickup_location?.toLowerCase().includes(q)
    const matchS  = !filterStatus || t.payment_status === filterStatus
    const matchD  = !filterDriver || t.profiles?.full_name === filterDriver
    return matchQ && matchS && matchD
  })

  // Unique drivers for bulk pay
  const uniqueDrivers = [...new Set(trips.filter(t => t.profiles?.full_name).map(t => t.profiles.full_name))]
  const totalDue = trips.filter(t => t.payment_status !== 'paid').reduce((s, t) => s + (t.amount || 0), 0)

  return (
    <div>
      {confirmId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
            <h3>Delete Trip?</h3>
            <p>This transport trip will be permanently removed.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmId)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      {payTrip && <PayConfirmDialog trip={payTrip} onConfirm={(paidBy) => confirmPay(payTrip.id, paidBy)} onCancel={() => setPayTrip(null)} />}
      {revertTrip && <RevertDialog trip={revertTrip} onConfirm={(reason, by) => confirmRevert(revertTrip.id, reason, by)} onCancel={() => setRevertTrip(null)} />}
      {bulkDriver && (
        <BulkPayDialog
          driver={bulkDriver}
          trips={trips.filter(t => t.profiles?.full_name === bulkDriver && t.payment_status !== 'paid')}
          onConfirm={(paidBy) => confirmBulkPay(bulkDriver, paidBy)}
          onCancel={() => setBulkDriver(null)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Transport</div>
          <div className="page-subtitle">{trips.length} trips · {fmtRs(totalDue)} pending</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Issue #12: Bulk pay button */}
          {uniqueDrivers.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select className="form-select" style={{ width: 160 }}
                value="" onChange={e => e.target.value && setBulkDriver(e.target.value)}>
                <option value="">💰 Bulk Pay Driver</option>
                {uniqueDrivers.map(d => {
                  const due = trips.filter(t => t.profiles?.full_name === d && t.payment_status !== 'paid').reduce((s, t) => s + (t.amount || 0), 0)
                  return due > 0 ? <option key={d} value={d}>{d} ({fmtRs(due)})</option> : null
                })}
              </select>
            </div>
          )}
          <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Trip</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
          <Search size={15} />
          <input placeholder="Search by event, driver or location…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="form-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {TRIP_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="form-select" style={{ width: 150 }} value={filterDriver} onChange={e => setFilterDriver(e.target.value)}>
          <option value="">All Drivers</option>
          {uniqueDrivers.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Truck size={40} className="empty-state-icon" /><h3>No trips found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ background: 'var(--bg-2)', border: `1px solid ${t.reverted ? 'var(--red)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,140,66,0.12)', border: '1px solid rgba(255,140,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                  {t.vehicle_type?.includes('Bike') ? '🏍️' : '🚛'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.events?.title || '—'}</span>
                    <span className="badge badge-gray">{t.vehicle_type}</span>
                    {t.is_round_trip && <span className="badge badge-blue">↩ Round Trip</span>}
                    <span className={`badge ${TRIP_STATUSES.find(s => s.value === t.payment_status)?.badge || 'badge-gray'}`}>
                      {t.reverted ? '↩ Reverted' : t.payment_status}
                    </span>
                  </div>
                  {(t.pickup_location || t.drop_location) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} />
                      {t.pickup_location || '?'} → {t.drop_location || '?'}
                      {t.events?.venues?.google_maps_url && (
                        <button onClick={() => openGoogleMaps(t.events.venues.google_maps_url)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '0.7rem', padding: '0 4px' }}>
                          Navigate
                        </button>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    {t.trip_date && <span>📅 {format(new Date(t.trip_date), 'dd MMM yyyy')}</span>}
                    {t.km && <span>🛣️ {t.km} km</span>}
                    {t.profiles && (
                      <a href={`tel:${formatTel(t.profiles.phone)}`} style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Phone size={10} /> {t.profiles.full_name}
                      </a>
                    )}
                  </div>
                  {/* Issue #13: Show revert info */}
                  {t.reverted && t.revert_reason && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--red)', marginTop: 4, background: 'rgba(255,92,122,0.08)', borderRadius: 6, padding: '4px 8px' }}>
                      ↩ Reverted: {t.revert_reason}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'monospace', fontSize: '0.9rem' }}>{fmtRs(t.amount)}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {t.payment_status !== 'paid' && !t.reverted && (
                      <button onClick={() => setPayTrip(t)}
                        className="btn btn-sm" style={{ background: 'rgba(16,212,160,0.1)', border: '1px solid rgba(16,212,160,0.25)', color: 'var(--green)' }}>
                        <CheckCircle size={11} /> Pay
                      </button>
                    )}
                    {/* Issue #13: Revert button for paid trips */}
                    {t.payment_status === 'paid' && !t.reverted && (
                      <button onClick={() => setRevertTrip(t)}
                        className="btn btn-sm btn-ghost" title="Revert payment">
                        <RotateCcw size={11} />
                      </button>
                    )}
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)}><Pencil size={13} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmId(t.id)} style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Trip' : 'Add Transport Trip'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="form-row">
                <div className="form-group">
                  {/* Issue #9: Event selection auto-fills date + locations */}
                  <label className="form-label">Event *</label>
                  <select className="form-select" style={{ borderColor: errors.event_id ? 'var(--red)' : undefined }}
                    value={form.event_id} onChange={e => handleEventChange(e.target.value)}>
                    <option value="">Select event…</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                  {errors.event_id && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.event_id}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Trip Date *</label>
                  <input type="date" className="form-input" style={{ borderColor: errors.trip_date ? 'var(--red)' : undefined }}
                    value={form.trip_date} onChange={e => setForm({...form, trip_date: e.target.value})} />
                  {errors.trip_date && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.trip_date}</div>}
                </div>
              </div>
              <div className="form-row">
                {/* Issue #9: Driver separate from Staff */}
                <div className="form-group">
                  <label className="form-label">Driver</label>
                  <select className="form-select" value={form.driver_profile_id} onChange={e => setForm({...form, driver_profile_id: e.target.value})}>
                    <option value="">Select driver…</option>
                    {drivers.filter(d => d.id !== form.staff_profile_id).map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Staff (Event Handler)</label>
                  <select className="form-select" value={form.staff_profile_id} onChange={e => setForm({...form, staff_profile_id: e.target.value})}>
                    <option value="">Select staff…</option>
                    {drivers.filter(d => d.id !== form.driver_profile_id).map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
              </div>
              {/* Issue #10: Extended vehicle types */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Vehicle Type</label>
                  <select className="form-select" value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}>
                    {EXTENDED_VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={form.is_round_trip} onChange={e => setForm({...form, is_round_trip: e.target.checked})} />
                    Round Trip
                  </label>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>Tick if going and coming back</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pickup Location</label>
                  <select className="form-select" value={form.pickup_location}
                    onChange={e => setForm({...form, pickup_location: e.target.value})}>
                    <option value="">Select or type…</option>
                    {DEFAULT_GODOWNS.map(g => <option key={g} value={g}>{g}</option>)}
                    {form.pickup_location && !DEFAULT_GODOWNS.includes(form.pickup_location) && (
                      <option value={form.pickup_location}>{form.pickup_location}</option>
                    )}
                  </select>
                  <input className="form-input" style={{ marginTop: 6 }} placeholder="Or type custom location…"
                    value={form.pickup_location} onChange={e => setForm({...form, pickup_location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Drop Location</label>
                  <input className="form-input" value={form.drop_location}
                    onChange={e => setForm({...form, drop_location: e.target.value})}
                    placeholder="Auto-filled from event venue" />
                </div>
              </div>
              {/* Issue #10: Pay method — per km or fixed */}
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Pay Method</label>
                  <select className="form-select" value={form.pay_method} onChange={e => setForm({...form, pay_method: e.target.value})}>
                    <option value="per_km">Per KM</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                {form.pay_method === 'per_km' && (
                  <div className="form-group">
                    <label className="form-label">Distance (km)</label>
                    <input type="number" className="form-input" value={form.km}
                      onChange={e => setForm({...form, km: e.target.value})} placeholder="0" />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input"
                    style={{ borderColor: errors.amount ? 'var(--red)' : undefined }}
                    value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Any special instructions…" style={{ minHeight: 50 }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : editing ? 'Save Changes' : 'Add Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
