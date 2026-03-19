import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Users, Phone, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { ROLES, PAY_TYPES, getRoleBadge } from '../lib/constants'

// ROLES and PAY_TYPES imported from constants

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
        <h3>Are you sure?</h3>
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
  if (!form.full_name.trim()) errors.full_name = 'Name is required'
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone number'
  if (form.pay_rate && isNaN(parseFloat(form.pay_rate))) errors.pay_rate = 'Must be a number'
  return errors
}

export default function PeoplePage() {
  const [people, setPeople] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({ full_name: '', phone: '', role: 'staff', is_admin: false, pay_type: 'daily', pay_rate: '' })

  useEffect(() => { loadPeople() }, [])

  async function loadPeople() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    setPeople(data || [])
    setLoading(false)
  }

  function openEdit(p) {
    setEditing(p)
    setErrors({})
    setForm({ full_name: p.full_name, phone: p.phone || '', role: p.role, is_admin: p.is_admin, pay_type: p.pay_type || 'daily', pay_rate: p.pay_rate || '' })
    setShowModal(true)
  }

  function openNew() {
    setEditing(null)
    setErrors({})
    setForm({ full_name: '', phone: '', role: 'staff', is_admin: false, pay_type: 'daily', pay_rate: '' })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    const payload = { ...form, pay_rate: parseFloat(form.pay_rate) || 0 }
    if (editing) {
      const { error } = await supabase.from('profiles').update(payload).eq('id', editing.id)
      setSaving(false)
      if (error) { toast.error(error.message); return }
      toast.success('Profile updated!')
    } else {
      // Generate a new UUID for staff who don't need a login account
      const newId = crypto.randomUUID()
      const { error } = await supabase.from('profiles').insert({ ...payload, id: newId })
      setSaving(false)
      if (error) { toast.error(error.message); return }
      toast.success('Person added!')
    }
    setShowModal(false)
    loadPeople()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    setConfirmId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Person removed!')
    loadPeople()
  }

  const filtered = people.filter(p => {
    const q = search.toLowerCase()
    return !q || p.full_name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.role?.includes(q)
  })

  function roleBadge(r) { return getRoleBadge(r) }

  return (
    <div>
      {confirmId && (
        <ConfirmDialog
          message="This will remove the person from the system. This cannot be undone."
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">People & Staff</div>
          <div className="page-subtitle">{people.length} team members</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Person</button>
      </div>

      <div className="search-bar">
        <Search size={15} />
        <input placeholder="Search by name, phone or role…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}><Loader2 size={24} className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Users size={40} className="empty-state-icon" /><h3>No people found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Phone</th><th>Role</th><th>Admin</th>
                  <th>Pay Type</th><th>Rate (₹)</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                    <td>
                      {p.phone
                        ? <a href={`tel:${p.phone}`} style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}><Phone size={12} />{p.phone}</a>
                        : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td><span className={`badge ${roleBadge(p.role)}`}>{p.role}</span></td>
                    <td>{p.is_admin ? <ShieldCheck size={15} style={{ color: 'var(--gold)' }} /> : <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{p.pay_type?.replace(/_/g, ' ') || '—'}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{p.pay_rate > 0 ? `₹${p.pay_rate}` : '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)} title="Edit"><Pencil size={13} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmId(p.id)} title="Delete" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
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
              <span className="modal-title">{editing ? 'Edit Person' : 'Add Person'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" style={{ borderColor: errors.full_name ? 'var(--red)' : undefined }}
                  value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                {errors.full_name && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 3 }}>{errors.full_name}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" style={{ borderColor: errors.phone ? 'var(--red)' : undefined }}
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
                  {errors.phone && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 3 }}>{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pay Type</label>
                  <select className="form-select" value={form.pay_type} onChange={e => setForm({...form, pay_type: e.target.value})}>
                    {PAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rate (₹)</label>
                  <input type="number" className="form-input" style={{ borderColor: errors.pay_rate ? 'var(--red)' : undefined }}
                    value={form.pay_rate} onChange={e => setForm({...form, pay_rate: e.target.value})} placeholder="0" />
                  {errors.pay_rate && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 3 }}>{errors.pay_rate}</div>}
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_admin} onChange={e => setForm({...form, is_admin: e.target.checked})} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Give Admin Privilege</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : editing ? 'Save Changes' : 'Add Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
