import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Users, Phone, Pencil } from 'lucide-react'

const ROLES = ['admin', 'supervisor', 'staff', 'driver']
const PAY_TYPES = ['daily', 'hourly', 'per_km', 'fixed_per_event', 'monthly']

export default function PeoplePage() {
  const [people, setPeople] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
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
    setForm({ full_name: p.full_name, phone: p.phone || '', role: p.role, is_admin: p.is_admin, pay_type: p.pay_type || 'daily', pay_rate: p.pay_rate || '' })
    setShowModal(true)
  }

  function openNew() {
    setEditing(null)
    setForm({ full_name: '', phone: '', role: 'staff', is_admin: false, pay_type: 'daily', pay_rate: '' })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, pay_rate: parseFloat(form.pay_rate) || 0 }
    let error
    if (editing) {
      ;({ error } = await supabase.from('profiles').update(payload).eq('id', editing.id))
    } else {
      // Create auth user first via admin — for now just insert profile directly with a placeholder
      // In production: use Supabase admin SDK or invite flow
      toast('To add new staff, invite them via Supabase Auth or use the invite flow.', { icon: 'ℹ️' })
      setSaving(false)
      return
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Profile updated!')
    setShowModal(false)
    loadPeople()
  }

  const filtered = people.filter(p => {
    const q = search.toLowerCase()
    return !q || p.full_name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.role?.includes(q)
  })

  function roleBadge(r) {
    const map = { admin: 'badge-gold', supervisor: 'badge-orange', staff: 'badge-blue', driver: 'badge-green' }
    return map[r] || 'badge-gray'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">People & Staff</div>
          <div className="page-subtitle">{people.length} team members</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={15} /> Add Person</button>
      </div>

      <div className="search-bar">
        <Search />
        <input placeholder="Search by name, phone or role…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}><Loader2 className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Users className="empty-state-icon" /><h3>No people found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Admin</th><th>Pay Type</th><th>Rate (₹)</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                    <td>
                      {p.phone ? (
                        <a href={`tel:${p.phone}`} className="flex items-center gap-2" style={{ color: 'var(--blue)', fontSize: '0.875rem' }}>
                          <Phone size={12} /> {p.phone}
                        </a>
                      ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td><span className={`badge ${roleBadge(p.role)}`}>{p.role}</span></td>
                    <td>{p.is_admin ? <span className="badge badge-gold">Yes</span> : <span className="badge badge-gray">No</span>}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{p.pay_type?.replace('_', ' ') || '—'}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{p.pay_rate > 0 ? `₹${p.pay_rate}` : '—'}</td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)}><Pencil size={13} /></button>
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
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pay Type</label>
                  <select className="form-select" value={form.pay_type} onChange={e => setForm({...form, pay_type: e.target.value})}>
                    {PAY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rate (₹)</label>
                  <input type="number" className="form-input" value={form.pay_rate} onChange={e => setForm({...form, pay_rate: e.target.value})} placeholder="0" />
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
                  {saving ? <Loader2 size={14} /> : editing ? 'Save Changes' : 'Add Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
