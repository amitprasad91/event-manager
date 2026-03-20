import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { canDo } from '../lib/permissions'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, CalendarDays, MapPin, Pencil, Trash2, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { EVENT_TYPES, EVENT_STATUSES, getEventStatusBadge, getEventTypeBadge, getEventTypeEmoji } from '../lib/constants'

function ConfirmDialog({ title, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
        <h3>Delete Event?</h3>
        <p>"{title}" will be permanently deleted including all items and payments.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents]     = useState([])
  const [clients, setClients]   = useState([])
  const [venues, setVenues]     = useState([])
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [myOnly, setMyOnly]               = useState(false)
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editing, setEditing]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)

  const emptyForm = {
    title: '', event_type: EVENT_TYPES[0].value, client_id: '',
    venue_id: '', event_date: '', start_time: '',
    end_time: '', client_amount: '', notes: '', status: EVENT_STATUSES[0].value
  }
  const [form, setForm] = useState(emptyForm)

  const { profile } = useAuth()
  const role = profile?.role || 'staff'

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [evRes, clRes, veRes] = await Promise.all([
      supabase.from('events').select('*, clients(full_name, phone), venues(name, google_maps_url), event_items(assigned_profile_id)').order('event_date', { ascending: false }),
      supabase.from('clients').select('id, full_name').order('full_name'),
      supabase.from('venues').select('id, name').order('name'),
    ])
    setEvents(evRes.data || [])
    setClients(clRes.data || [])
    setVenues(veRes.data || [])
    setLoading(false)
  }

  function openEdit(ev, e) {
    e?.stopPropagation()
    setEditing(ev)
    setForm({
      title: ev.title, event_type: ev.event_type, client_id: ev.client_id || '',
      venue_id: ev.venue_id || '', event_date: ev.event_date, start_time: ev.start_time || '',
      end_time: ev.end_time || '', client_amount: ev.client_amount || '', notes: ev.notes || '', status: ev.status
    })
    setShowModal(true)
    setSelectedEvent(null)
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, client_amount: parseFloat(form.client_amount) || 0 }
    if (!payload.client_id)  delete payload.client_id
    if (!payload.venue_id)   delete payload.venue_id
    if (!payload.start_time) delete payload.start_time
    if (!payload.end_time)   delete payload.end_time
    let error
    if (editing) {
      ;({ error } = await supabase.from('events').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('events').insert(payload))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Event updated!' : 'Event created!')
    setShowModal(false)
    setForm(emptyForm)
    setEditing(null)
    loadAll()
  }

  async function handleDelete(id) {
    if (!canDo(role, 'delete')) { toast.error('You do not have permission to delete.'); return }
    const { error } = await supabase.from('events').delete().eq('id', id)
    setConfirmId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Event deleted!')
    setSelectedEvent(null)
    loadAll()
  }

  // ── Calendar helpers ─────────────────────────────────────
  function getEventsForDay(date) {
    return events.filter(ev => isSameDay(parseISO(ev.event_date), date))
  }

  function renderCalendar() {
    const monthStart  = startOfMonth(currentMonth)
    const monthEnd    = endOfMonth(currentMonth)
    const calStart    = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd      = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = []
    let day = calStart
    while (day <= calEnd) { days.push(day); day = addDays(day, 1) }

    const statusColor = { upcoming: 'var(--blue)', ongoing: 'var(--green)', completed: 'var(--text-3)', cancelled: 'var(--red)' }

    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Calendar header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={16} /></button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem' }}>{format(currentMonth, 'MMMM yyyy')}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={16} /></button>
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '8px 4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', fontFamily: 'Syne', letterSpacing: '0.06em' }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((d, i) => {
            const dayEvents = getEventsForDay(d)
            const isToday   = isSameDay(d, new Date())
            const isThisMonth = isSameMonth(d, currentMonth)
            return (
              <div key={i} style={{
                minHeight: 80, padding: '6px 4px',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                background: isToday ? 'rgba(108,99,255,0.06)' : 'transparent',
                opacity: isThisMonth ? 1 : 0.35,
              }}>
                <div style={{
                  fontSize: '0.78rem', fontWeight: isToday ? 800 : 500,
                  color: isToday ? 'var(--accent-light)' : 'var(--text-2)',
                  marginBottom: 4, textAlign: 'right', paddingRight: 4,
                }}>{format(d, 'd')}</div>

                {dayEvents.slice(0, 3).map(ev => (
                  <div key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      background: `${statusColor[ev.status]}22`,
                      border: `1px solid ${statusColor[ev.status]}44`,
                      color: statusColor[ev.status],
                      borderRadius: 4, padding: '2px 5px',
                      marginBottom: 2, cursor: 'pointer',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      transition: 'opacity 0.15s',
                    }}
                    title={ev.title}
                  >
                    {getEventTypeEmoji(ev.event_type)} {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', paddingLeft: 4 }}>+{dayEvents.length - 3} more</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const filtered = events.filter(e => {
    const q      = search.toLowerCase()
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.clients?.full_name?.toLowerCase().includes(q)
    const matchS = !filterStatus || e.status === filterStatus
    const matchM = !myOnly || (e.event_items || []).some(i => i.assigned_profile_id === profile?.id)
    return matchQ && matchS && matchM
  })

  return (
    <div>
      {confirmId && (
        <ConfirmDialog
          title={confirmTitle}
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Event detail popup from calendar */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">{getEventTypeEmoji(selectedEvent.event_type)} {selectedEvent.title}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedEvent(null)}><X size={16} /></button>
            </div>
            <div style={{ padding: '0 0 16px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className={`badge ${getEventStatusBadge(selectedEvent.status)}`}>{selectedEvent.status}</span>
                <span className={`badge ${getEventTypeBadge(selectedEvent.event_type)}`}>{selectedEvent.event_type}</span>
              </div>
              {[
                ['📅 Date', format(parseISO(selectedEvent.event_date), 'dd MMM yyyy')],
                ['⏰ Time', selectedEvent.start_time ? `${selectedEvent.start_time}${selectedEvent.end_time ? ' – ' + selectedEvent.end_time : ''}` : '—'],
                ['👤 Client', selectedEvent.clients?.full_name || '—'],
                ['📍 Venue', selectedEvent.venues?.name || '—'],
                ['💰 Amount', selectedEvent.client_amount > 0 ? `₹${selectedEvent.client_amount.toLocaleString('en-IN')}` : '—'],
                ['📝 Notes', selectedEvent.notes || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-3)', minWidth: 90 }}>{label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setSelectedEvent(null); openEdit(selectedEvent) }}><Pencil size={13} /> Edit</button>
              <button className="btn btn-secondary" style={{ color: 'var(--red)' }} onClick={() => { setSelectedEvent(null); setConfirmId(selectedEvent.id); setConfirmTitle(selectedEvent.title) }}><Trash2 size={13} /> Delete</button>
              <button className="btn btn-primary" onClick={() => { setSelectedEvent(null); navigate(`/events/${selectedEvent.id}`) }}>View Details</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Events</div>
          <div className="page-subtitle">{events.length} total bookings</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Fix #6: View toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <button onClick={() => setViewMode('list')} style={{
              padding: '7px 12px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
              background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text-2)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}><List size={13} /> List</button>
            <button onClick={() => setViewMode('calendar')} style={{
              padding: '7px 12px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
              background: viewMode === 'calendar' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'calendar' ? '#fff' : 'var(--text-2)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}><CalendarDays size={13} /> Calendar</button>
          </div>
          {canDo(role, 'add') && <button className="btn btn-primary" onClick={openNew}><Plus size={15} /> New Event</button>}
        </div>
      </div>

      {/* Filters — only in list view */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <Search size={15} />
            <input placeholder="Search events or clients…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
          </div>
          <select className="form-select" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {(profile?.role === 'staff' || profile?.role === 'driver') && (
            <button
              onClick={() => setMyOnly(v => !v)}
              className="btn btn-sm"
              style={{
                background: myOnly ? 'var(--accent)' : 'var(--bg-2)',
                color: myOnly ? '#fff' : 'var(--text-2)',
                border: `1px solid ${myOnly ? 'var(--accent)' : 'var(--border)'}`,
                whiteSpace: 'nowrap',
              }}>
              👤 My Events
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" style={{ color: 'var(--text-3)' }} /></div>
      ) : viewMode === 'calendar' ? (
        renderCalendar()
      ) : filtered.length === 0 ? (
        <div className="empty-state"><CalendarDays size={40} className="empty-state-icon" /><h3>No events found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Event</th><th>Date</th><th>Client</th><th>Venue</th><th>Type</th><th>Status</th>{canDo(profile?.role,'pay') && <th>Amount</th>}<th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(ev => (
                  <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${ev.id}`)}>
                    <td style={{ fontWeight: 600 }}>{ev.title}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{format(new Date(ev.event_date), 'dd MMM yyyy')}</td>
                    <td style={{ color: 'var(--text-2)' }}>{ev.clients?.full_name || '—'}</td>
                    <td>
                      {ev.venues ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} style={{ color: 'var(--text-3)' }} />
                          <span style={{ fontSize: '0.85rem' }}>{ev.venues.name}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className={`badge ${getEventTypeBadge(ev.event_type)}`}>{ev.event_type}</span></td>
                    <td><span className={`badge ${getEventStatusBadge(ev.status)}`}>{ev.status}</span></td>
                    {canDo(profile?.role,'pay') && (
                      <td>
                        {ev.client_amount > 0 && (
                          <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            ₹{ev.client_amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                    )}
                    {/* Fix #5: Edit + Delete actions */}
                    <td>
                      <div className="row-actions" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={e => openEdit(ev, e)}><Pencil size={13} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Delete" style={{ color: 'var(--red)' }}
                          onClick={e => { e.stopPropagation(); setConfirmId(ev.id); setConfirmTitle(ev.title) }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Event' : 'New Event'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setShowModal(false); setEditing(null) }}><X size={16} /></button>
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
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditing(null) }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : editing ? 'Save Changes' : <><Plus size={14} /> Create Event</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
