import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Truck, Phone, Pencil, Trash2, CheckCircle, MapPin } from 'lucide-react'
import { VEHICLE_TYPES, TRANSPORT_PAY_METHODS, TRIP_STATUSES, fmtRs, formatTel, openGoogleMaps } from '../lib/constants'
import { format } from 'date-fns'

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
        <h3>Delete Trip?</h3>
        <p>This transport trip will be permanently removed.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  )
}

function validate(form) {
  const errors = {}
  if (!form.event_id)             errors.event_id = 'Please select an event'
  if (!form.trip_date)            errors.trip_date = 'Trip date is required'
  if (form.amount && isNaN(parseFloat(form.amount))) errors.amount = 'Must be a valid number'
  if (form.km && isNaN(parseFloat(form.km)))         errors.km = 'Must be a valid number'
  return errors
}

export default function TransportPage() {
  const [trips, setTrips]         = useState([])
  const [events, setEvents]       = useState([])
  const [drivers, setDrivers]     = useState([])
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editing, setEditing]     = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [errors, setErrors]       = useState({})
  const emptyForm = {
    event_id: '', driver_profile_id: '', vehicle_type: VEHICLE_TYPES[0].value,
    pickup_location: '', drop_location: '', km: '', amount: '',
    pay_method: 'per_km', trip_date: '', notes: '', payment_status: 'pending'
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [tripsRes, evRes, driversRes] = await Promise.all([
      supabase.from('transport_trips')
        .select('*, events(title, event_date, venues(name, google_maps_url)), profiles(full_name, phone)')
        .order('trip_date', { ascending: false }),
      supabase.from('events').select('id, title, event_date').in('status', ['upcoming','ongoing','completed']).order('event_date', { ascending: false }),
      supabase.from('profiles').select('id, full_name, phone').in('role', ['driver','staff','supervisor']).order('full_name'),
    ])
    setTrips(tripsRes.data || [])
    setEvents(evRes.data || [])
    setDrivers(driversRes.data || [])
    setLoading(false)
  }

  function openEdit(t) {
    setEditing(t)
    setErrors({})
    setForm({
      event_id: t.event_id || '', driver_profile_id: t.driver_profile_id || '',
      vehicle_type: t.vehicle_type || VEHICLE_TYPES[0].value,
      pickup_location: t.pickup_location || '', drop_location: t.drop_location || '',
      km: t.km || '', amount: t.amount || '', pay_method: t.pay_method || 'per_km',
      trip_date: t.trip_date || '', notes: t.notes || '', payment_status: t.payment_status || 'pending'
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

  async function markPaid(id) {
    setUpdatingId(id)
    const { error } = await supabase.from('transport_trips').update({ payment_status: 'paid', amount_paid: trips.find(t => t.id === id)?.amount }).eq('id', id)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Marked as paid!')
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
    const matchS = !filterStatus || t.payment_status === filterStatus
    return matchQ && matchS
  })

  const totalDue = trips.filter(t => t.payment_status !== 'paid').reduce((s, t) => s + (t.amount || 0), 0)

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}

      <div className="page-header">
        <div>
          <div className="page-title">Transport</div>
          <div className="page-subtitle">{trips.length} trips · {fmtRs(totalDue)} pending payment</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Trip</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
          <Search size={15} />
          <input placeholder="Search by event, driver or location…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {TRIP_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" style={{ color: 'var(--text-3)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Truck size={40} className="empty-state-icon" /><h3>No trips found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Truck icon */}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,140,66,0.12)', border: '1px solid rgba(255,140,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={16} style={{ color: 'var(--orange)' }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.events?.title || '—'}</span>
                    <span className="badge badge-gray">{t.vehicle_type}</span>
                    <span className={`badge ${TRIP_STATUSES.find(s => s.value === t.payment_status)?.badge || 'badge-gray'}`}>
                      {t.payment_status}
                    </span>
                  </div>

                  {/* Route */}
                  {(t.pickup_location || t.drop_location) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} />
                      {t.pickup_location || '?'} → {t.drop_location || '?'}
                      {t.events?.venues?.google_maps_url && (
                        <button onClick={() => openGoogleMaps(t.events.venues.google_maps_url)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', padding: 0, marginLeft: 4, fontSize: '0.72rem' }}>
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
                </div>

                {/* Amount + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {fmtRs(t.amount)}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {t.payment_status !== 'paid' && (
                      <button onClick={() => markPaid(t.id)} disabled={updatingId === t.id}
                        className="btn btn-sm" style={{ background: 'rgba(16,212,160,0.1)', border: '1px solid rgba(16,212,160,0.25)', color: 'var(--green)' }}>
                        {updatingId === t.id ? <Loader2 size={12} className="spin" /> : <><CheckCircle size={11} /> Pay</>}
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
                  <label className="form-label">Event *</label>
                  <select className="form-select" style={{ borderColor: errors.event_id ? 'var(--red)' : undefined }}
                    value={form.event_id} onChange={e => setForm({...form, event_id: e.target.value})}>
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
                <div className="form-group">
                  <label className="form-label">Driver</label>
                  <select className="form-select" value={form.driver_profile_id} onChange={e => setForm({...form, driver_profile_id: e.target.value})}>
                    <option value="">Select driver…</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle</label>
                  <select className="form-select" value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}>
                    {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pickup Location</label>
                  <input className="form-input" value={form.pickup_location} onChange={e => setForm({...form, pickup_location: e.target.value})} placeholder="Godown A, Park Street…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Drop Location</label>
                  <input className="form-input" value={form.drop_location} onChange={e => setForm({...form, drop_location: e.target.value})} placeholder="ITC Royal Bengal…" />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Pay Method</label>
                  <select className="form-select" value={form.pay_method} onChange={e => setForm({...form, pay_method: e.target.value})}>
                    {TRANSPORT_PAY_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                {form.pay_method === 'per_km' && (
                  <div className="form-group">
                    <label className="form-label">Distance (km)</label>
                    <input type="number" className="form-input" value={form.km} onChange={e => setForm({...form, km: e.target.value})} placeholder="0" />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" style={{ borderColor: errors.amount ? 'var(--red)' : undefined }}
                    value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" />
                </div>
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
