import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Users2, Phone, Mail, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { fmtRs, SPLIT_METHODS, formatTel } from '../lib/constants'

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
        <h3>Remove Co-owner?</h3>
        <p>Their profit split records will be kept but they will be removed from the directory.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Remove</button>
        </div>
      </div>
    </div>
  )
}

function validate(form) {
  const errors = {}
  if (!form.full_name?.trim()) errors.full_name = 'Name is required'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone'
  return errors
}

export default function CoOwnersPage() {
  const [owners, setOwners]         = useState([])
  const [splits, setSplits]         = useState([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editing, setEditing]       = useState(null)
  const [confirmId, setConfirmId]   = useState(null)
  const [errors, setErrors]         = useState({})
  const emptyForm = { full_name: '', phone: '', email: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [ownRes, splRes] = await Promise.all([
      supabase.from('co_owners').select('*').order('full_name'),
      supabase.from('profit_splits').select('co_owner_id, calculated_amount, paid'),
    ])
    setOwners(ownRes.data || [])
    setSplits(splRes.data || [])
    setLoading(false)
  }

  function getTotalEarnings(ownerId) {
    return splits.filter(s => s.co_owner_id === ownerId).reduce((sum, s) => sum + (s.calculated_amount || 0), 0)
  }

  function getPendingEarnings(ownerId) {
    return splits.filter(s => s.co_owner_id === ownerId && !s.paid).reduce((sum, s) => sum + (s.calculated_amount || 0), 0)
  }

  function openEdit(o) {
    setEditing(o)
    setErrors({})
    setForm({ full_name: o.full_name, phone: o.phone || '', email: o.email || '' })
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
    let error
    if (editing) {
      ;({ error } = await supabase.from('co_owners').update(form).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('co_owners').insert(form))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Co-owner updated!' : 'Co-owner added!')
    setShowModal(false)
    loadAll()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('co_owners').delete().eq('id', id)
    setConfirmId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Co-owner removed!')
    loadAll()
  }

  const filtered = owners.filter(o => {
    const q = search.toLowerCase()
    return !q || o.full_name?.toLowerCase().includes(q) || o.phone?.includes(q)
  })

  const totalPool = splits.reduce((s, x) => s + (x.calculated_amount || 0), 0)

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}

      <div className="page-header">
        <div>
          <div className="page-title">Co-Owners</div>
          <div className="page-subtitle">{owners.length} partners · Total pool {fmtRs(totalPool)}</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Co-owner</button>
      </div>

      <div className="search-bar">
        <Search size={15} />
        <input placeholder="Search co-owners…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" style={{ color: 'var(--text-3)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Users2 size={40} className="empty-state-icon" /><h3>No co-owners yet</h3><p>Add your business partners to split profits</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(o => {
            const total   = getTotalEarnings(o.id)
            const pending = getPendingEarnings(o.id)
            const share   = totalPool > 0 ? Math.round((total / totalPool) * 100) : 0
            const initials = o.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
            return (
              <div key={o.id} style={{
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '18px',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--accent), var(--blue))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: '#fff',
                    boxShadow: '0 4px 12px var(--accent-glow)',
                  }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{o.full_name}</div>
                    {o.phone && (
                      <a href={`tel:${formatTel(o.phone)}`} style={{ color: 'var(--blue)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <Phone size={10} /> {o.phone}
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(o)}><Pencil size={13} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmId(o.id)} style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
                  </div>
                </div>

                {/* Earnings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Syne', fontWeight: 700 }}>Total Earned</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--green)', fontSize: '1rem' }}>{fmtRs(total)}</div>
                  </div>
                  <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Syne', fontWeight: 700 }}>Pending</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: pending > 0 ? 'var(--red)' : 'var(--text-3)', fontSize: '1rem' }}>{fmtRs(pending)}</div>
                  </div>
                </div>

                {/* Share bar */}
                {share > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: 4 }}>
                      <span>Share of total pool</span>
                      <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{share}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-4)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${share}%`, background: 'linear-gradient(90deg, var(--accent), var(--blue))', borderRadius: 100 }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Co-owner' : 'Add Co-owner'}</span>
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
                  <label className="form-label">Phone</label>
                  <input className="form-input" style={{ borderColor: errors.phone ? 'var(--red)' : undefined }}
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
                  {errors.phone && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" style={{ borderColor: errors.email ? 'var(--red)' : undefined }}
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  {errors.email && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.email}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : editing ? 'Save Changes' : 'Add Co-owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
