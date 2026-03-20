import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, UserCircle, Phone, Mail, Pencil } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', address: '' })

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('full_name')
    setClients(data || [])
    setLoading(false)
  }

  function openEdit(c) {
    setEditing(c)
    setForm({ full_name: c.full_name, phone: c.phone || '', email: c.email || '', address: c.address || '' })
    setShowModal(true)
  }

  function openNew() {
    setEditing(null)
    setForm({ full_name: '', phone: '', email: '', address: '' })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    let error
    if (editing) {
      ;({ error } = await supabase.from('clients').update(form).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('clients').insert(form))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Client updated!' : 'Client added!')
    setShowModal(false)
    loadClients()
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return !q || c.full_name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">{clients.length} clients</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={15} /> Add Client</button>
      </div>

      <div className="search-bar">
        <Search />
        <input placeholder="Search by name, phone or email…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}><Loader2 className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><UserCircle className="empty-state-icon" /><h3>No clients yet</h3><p>Add your first client</p></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th></th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.full_name}</td>
                    <td>
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-2" style={{ color: 'var(--blue)', fontSize: '0.875rem' }}>
                          <Phone size={12} /> {c.phone}
                        </a>
                      ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td>
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-2" style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
                          <Mail size={12} /> {c.email}
                        </a>
                      ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem', maxWidth: 200 }} className="truncate">{c.address || '—'}</td>
                    <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)}><Pencil size={13} /></button></td>
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
              <span className="modal-title">{editing ? 'Edit Client' : 'Add Client'}</span>
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
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address…" style={{ minHeight: 60 }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} /> : editing ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
