import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, MapPin, Pencil, Trash2, Navigation, ExternalLink } from 'lucide-react'
import { openGoogleMaps } from '../lib/constants'

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
        <h3>Delete Venue?</h3>
        <p>{message}</p>
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
  if (!form.name?.trim())    errors.name    = 'Venue name is required'
  if (!form.address?.trim()) errors.address = 'Address is required'
  return errors
}

export default function VenuesPage() {
  const [venues, setVenues]     = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editing, setEditing]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [errors, setErrors]     = useState({})
  const emptyForm = { name: '', address: '', city: 'Kolkata', google_maps_url: '', lat: '', lng: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadVenues() }, [])

  async function loadVenues() {
    setLoading(true)
    const { data } = await supabase.from('venues').select('*').order('name')
    setVenues(data || [])
    setLoading(false)
  }

  function openEdit(v) {
    setEditing(v)
    setErrors({})
    setForm({ name: v.name, address: v.address, city: v.city || 'Kolkata', google_maps_url: v.google_maps_url || '', lat: v.lat || '', lng: v.lng || '' })
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
    const payload = { ...form, lat: form.lat ? parseFloat(form.lat) : null, lng: form.lng ? parseFloat(form.lng) : null }
    let error
    if (editing) {
      ;({ error } = await supabase.from('venues').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('venues').insert(payload))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Venue updated!' : 'Venue added!')
    setShowModal(false)
    loadVenues()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('venues').delete().eq('id', id)
    setConfirmId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Venue deleted!')
    loadVenues()
  }

  function buildMapsUrl(v) {
    if (v.google_maps_url) return v.google_maps_url
    if (v.lat && v.lng) return `https://www.google.com/maps?q=${v.lat},${v.lng}`
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address + ' ' + v.city)}`
  }

  const filtered = venues.filter(v => {
    const q = search.toLowerCase()
    return !q || v.name?.toLowerCase().includes(q) || v.address?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q)
  })

  return (
    <div>
      {confirmId && (
        <ConfirmDialog
          message="This venue will be permanently removed. Events using this venue will keep their data."
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Venues</div>
          <div className="page-subtitle">{venues.length} venues · Tap 📍 to navigate</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Venue</button>
      </div>

      <div className="search-bar">
        <Search size={15} />
        <input placeholder="Search by name, address or city…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" style={{ color: 'var(--text-3)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><MapPin size={40} className="empty-state-icon" /><h3>No venues found</h3><p>Add event venues for quick navigation</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(v => (
            <div key={v.id} style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '18px 18px 14px',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'var(--accent-dim)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <MapPin size={16} style={{ color: 'var(--accent-light)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>
                    {v.city || 'Kolkata'}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 12 }}>
                {v.address}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => openGoogleMaps(buildMapsUrl(v))}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(16,212,160,0.1)', border: '1px solid rgba(16,212,160,0.25)',
                    color: 'var(--green)', flex: 1, justifyContent: 'center',
                  }}
                >
                  <Navigation size={12} /> Navigate
                </button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(v)} title="Edit">
                  <Pencil size={13} />
                </button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmId(v.id)} title="Delete" style={{ color: 'var(--red)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Venue' : 'Add Venue'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Venue Name *</label>
                <input className="form-input" style={{ borderColor: errors.name ? 'var(--red)' : undefined }}
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. ITC Royal Bengal, JW Marriott" />
                {errors.name && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <textarea className="form-textarea" style={{ borderColor: errors.address ? 'var(--red)' : undefined, minHeight: 60 }}
                  value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Street, area, pin code…" />
                {errors.address && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.address}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Google Maps URL</label>
                  <input className="form-input" value={form.google_maps_url}
                    onChange={e => setForm({...form, google_maps_url: e.target.value})}
                    placeholder="https://maps.google.com/…" />
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 12 }}>
                💡 Tip: Open the venue in Google Maps → Share → Copy link — paste it above for one-tap navigation
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : editing ? 'Save Changes' : 'Add Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
