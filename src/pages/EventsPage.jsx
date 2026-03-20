import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, CalendarDays, MapPin, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

const EVENT_TYPES = ['wedding', 'birthday', 'office', 'other']
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled']

export default function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [clients, setClients] = useState([])
  const [venues, setVenues] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', event_type: 'wedding', client_id: '',
    venue_id: '', event_date: '', start_time: '',
    end_time: '', client_amount: '', notes: '', status: 'upcoming'
  })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [evRes, clRes, veRes] = await Promise.all([
      supabase.from('events').select('*, clients(full_name), venues(name, google_maps_url)').order('event_date', { ascending: false }),
      supabase.from('clients').select('id, full_name').order('full_name'),
      supabase.from('venues').select('id, name').order('name'),
    ])
    setEvents(evRes.data || [])
    setClients(clRes.data || [])
    setVenues(veRes.data || [])
    setLoading(false)
  }

  const filtered = events.filter(e => {
    const q = search.toLowerCase()
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.clients?.full_name?.toLowerCase().includes(q)
    const matchS = !filterStatus || e.status === filterStatus
    return matchQ && matchS
  })

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, client_amount: parseFloat(form.client_amount) || 0 }
    if (!payload.client_id) delete payload.client_id
    if (!payload.venue_id) delete payload.venue_id
    if (!payload.start_time) delete payload.start_time
    if (!payload.end_time) delete payload.end_time
    const { error } = await supabase.from('events').insert(payload)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Event created!')
    setShowModal(false)
    setForm({ title: '', event_type: 'wedding', client_id: '', venue_id: '', event_date: '', start_time: '', end_time: '', client_amount: '', notes: '', status: 'upcoming' })
    loadAll()
  }

  function statusBadge(s) {
    const map = { upcoming: 'badge-blue', ongoing: 'badge-green', completed: 'badge-gray', cancelled: 'badge-red' }
    return map[s] || 'badge-gray'
  }
  function typeBadge(t) {
    const map = { wedding: 'badge-gold', birthday: 'badge-orange', office: 'badge-blue', other: 'badge-gray' }
    return map[t] || 'badge-gray'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Events</div>
          <div className="page-subtitle">{events.length} total bookings</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Event
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <Search />
          <input placeholder="Search events or clients…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}><Loader2 className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <CalendarDays className="empty-state-icon" />
          <h3>No events found</h3>
          <p>Create your first event booking</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Venue</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ev => (
                  <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${ev.id}`)}>
                    <td style={{ fontWeight: 600 }}>{ev.title}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
                      {format(new Date(ev.event_date), 'dd MMM yyyy')}
                    </td>
                    <td style={{ color: 'var(--text-2)' }}>{ev.clients?.full_name || '—'}</td>
                    <td>
                      {ev.venues ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} style={{ color: 'var(--text-3)' }} />
                          <span style={{ fontSize: '0.85rem' }}>{ev.venues.name}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className={`badge ${typeBadge(ev.event_type)}`}>{ev.event_type}</span></td>
                    <td><span className={`badge ${statusBadge(ev.status)}`}>{ev.status}</span></td>
                    <td>
                      {ev.client_amount > 0 && (
                        <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.875rem' }}>
                          ₹{ev.client_amount.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {ev.venues?.google_maps_url && (
                        <a href={ev.venues.google_maps_url} target="_blank" rel="noopener noreferrer"
                          className="btn btn-ghost btn-icon btn-sm" title="Open in Maps">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">New Event</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Sharma Wedding" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select className="form-select" value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Client</label>
                  <select className="form-select" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
                    <option value="">Select client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <select className="form-select" value={form.venue_id} onChange={e => setForm({...form, venue_id: e.target.value})}>
                    <option value="">Select venue…</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Client Amount (₹)</label>
                <input type="number" className="form-input" value={form.client_amount} onChange={e => setForm({...form, client_amount: e.target.value})} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any special instructions…" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : <><Plus size={14}/> Create Event</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
