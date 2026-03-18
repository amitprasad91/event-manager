import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Mic2, Phone, Pencil, Trash2 } from 'lucide-react'
import { PERFORMER_TYPES, VENDOR_TYPES, PERFORMER_RATE_TYPES, formatTel } from '../lib/constants'

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
        <h3>Delete Performer?</h3>
        <p>This performer will be permanently removed from your directory.</p>
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
  if (!form.full_name?.trim()) errors.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone number'
  if (form.rate && isNaN(parseFloat(form.rate))) errors.rate = 'Must be a number'
  return errors
}

const TYPE_EMOJIS = { actor:'🎬', dancer:'💃', musician:'🎵', joker:'🤹', juggler:'🎪', casino:'🎰', dj:'🎧', other:'🎭' }

export default function PerformersPage() {
  const [performers, setPerformers] = useState([])
  const [search, setSearch]         = useState('')
  const [filterType, setFilterType] = useState('')
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editing, setEditing]       = useState(null)
  const [confirmId, setConfirmId]   = useState(null)
  const [errors, setErrors]         = useState({})
  const emptyForm = { full_name: '', phone: '', type: PERFORMER_TYPES[0].value, vendor_type: 'freelancer', rate: '', rate_type: 'per_event' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadPerformers() }, [])

  async function loadPerformers() {
    setLoading(true)
    const { data } = await supabase.from('performers').select('*').order('full_name')
    setPerformers(data || [])
    setLoading(false)
  }

  function openEdit(p) {
    setEditing(p)
    setErrors({})
    setForm({ full_name: p.full_name, phone: p.phone || '', type: p.type, vendor_type: p.vendor_type || 'freelancer', rate: p.rate || '', rate_type: p.rate_type || 'per_event' })
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
    const payload = { ...form, rate: parseFloat(form.rate) || 0 }
    let error
    if (editing) {
      ;({ error } = await supabase.from('performers').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('performers').insert(payload))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Performer updated!' : 'Performer added!')
    setShowModal(false)
    loadPerformers()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('performers').delete().eq('id', id)
    setConfirmId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Performer removed!')
    loadPerformers()
  }

  const filtered = performers.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.full_name?.toLowerCase().includes(q) || p.phone?.includes(q)
    const matchT = !filterType || p.type === filterType
    return matchQ && matchT
  })

  const vendorBadge = { payroll: 'badge-gold', freelancer: 'badge-blue', vendor_agency: 'badge-orange' }

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}

      <div className="page-header">
        <div>
          <div className="page-title">Performers & Artists</div>
          <div className="page-subtitle">{performers.length} in directory</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Performer</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
          <Search size={15} />
          <input placeholder="Search performers…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="form-select" style={{ width: 150 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {PERFORMER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" style={{ color: 'var(--text-3)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Mic2 size={40} className="empty-state-icon" /><h3>No performers found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Category</th><th>Phone</th><th>Rate</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>{TYPE_EMOJIS[p.type] || '🎭'}</span>
                        <span style={{ fontWeight: 600 }}>{p.full_name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{p.type}</span></td>
                    <td><span className={`badge ${vendorBadge[p.vendor_type] || 'badge-gray'}`}>{p.vendor_type?.replace('_', ' ')}</span></td>
                    <td>
                      {p.phone ? (
                        <a href={`tel:${formatTel(p.phone)}`} style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                          <Phone size={12} /> {p.phone}
                        </a>
                      ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600, fontFamily: 'monospace' }}>
                      {p.rate > 0 ? `₹${p.rate.toLocaleString('en-IN')} / ${p.rate_type?.replace('_', ' ')}` : '—'}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)}><Pencil size={13} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmId(p.id)} style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Performer' : 'Add Performer'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" style={{ borderColor: errors.full_name ? 'var(--red)' : undefined }}
                  value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                {errors.full_name && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.full_name}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {PERFORMER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.vendor_type} onChange={e => setForm({...form, vendor_type: e.target.value})}>
                    {VENDOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" style={{ borderColor: errors.phone ? 'var(--red)' : undefined }}
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
                {errors.phone && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.phone}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rate (₹)</label>
                  <input type="number" className="form-input" style={{ borderColor: errors.rate ? 'var(--red)' : undefined }}
                    value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} placeholder="0" />
                  {errors.rate && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.rate}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Rate Type</label>
                  <select className="form-select" value={form.rate_type} onChange={e => setForm({...form, rate_type: e.target.value})}>
                    {PERFORMER_RATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : editing ? 'Save Changes' : 'Add Performer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
