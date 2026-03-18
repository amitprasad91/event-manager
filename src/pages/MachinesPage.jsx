import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Package, Pencil } from 'lucide-react'

const CATEGORIES = ['game', 'machine', 'costume', 'prop', 'other']
const STATUSES = ['in_godown', 'at_event', 'returned']
const GODOWNS = ['Godown A', 'Godown B', 'Godown C']

const STATUS_LABELS = { in_godown: '📦 In Godown', at_event: '🎪 At Event', returned: '✅ Returned' }
const STATUS_BADGES = { in_godown: 'badge-blue', at_event: 'badge-orange', returned: 'badge-green' }

export default function MachinesPage() {
  const [machines, setMachines] = useState([])
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'machine', godown: 'Godown A', status: 'in_godown', current_event_id: '', notes: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [mRes, eRes] = await Promise.all([
      supabase.from('machines').select('*, events(title)').order('name'),
      supabase.from('events').select('id, title').in('status', ['upcoming', 'ongoing']).order('event_date')
    ])
    setMachines(mRes.data || [])
    setEvents(eRes.data || [])
    setLoading(false)
  }

  function openEdit(m) {
    setEditing(m)
    setForm({ name: m.name, category: m.category, godown: m.godown || 'Godown A', status: m.status, current_event_id: m.current_event_id || '', notes: m.notes || '' })
    setShowModal(true)
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', category: 'machine', godown: 'Godown A', status: 'in_godown', current_event_id: '', notes: '' })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.current_event_id) delete payload.current_event_id
    let error
    if (editing) {
      ;({ error } = await supabase.from('machines').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('machines').insert(payload))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Machine updated!' : 'Machine added!')
    setShowModal(false)
    loadAll()
  }

  const filtered = machines.filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q || m.name?.toLowerCase().includes(q) || m.category?.includes(q) || m.godown?.toLowerCase().includes(q)
    const matchS = !filterStatus || m.status === filterStatus
    return matchQ && matchS
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Machines & Items</div>
          <div className="page-subtitle">{machines.length} items tracked</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={15} /> Add Item</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <Search />
          <input placeholder="Search machines…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}><Loader2 className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Package className="empty-state-icon" /><h3>No machines found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item Name</th><th>Category</th><th>Status</th><th>Location</th><th>Notes</th><th></th></tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td><span className="badge badge-gray">{m.category}</span></td>
                    <td><span className={`badge ${STATUS_BADGES[m.status]}`}>{STATUS_LABELS[m.status]}</span></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                      {m.status === 'at_event' && m.events
                        ? <span style={{ color: 'var(--orange)' }}>🎪 {m.events.title}</span>
                        : m.godown || '—'}
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.85rem', maxWidth: 160 }} className="truncate">{m.notes || '—'}</td>
                    <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(m)}><Pencil size={13} /></button></td>
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
              <span className="modal-title">{editing ? 'Edit Item' : 'Add Item'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Selfie Bhoot Booth" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Godown</label>
                  <select className="form-select" value={form.godown} onChange={e => setForm({...form, godown: e.target.value})}>
                    {GODOWNS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                {form.status === 'at_event' && (
                  <div className="form-group">
                    <label className="form-label">Current Event</label>
                    <select className="form-select" value={form.current_event_id} onChange={e => setForm({...form, current_event_id: e.target.value})}>
                      <option value="">Select event…</option>
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ minHeight: 60 }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} /> : editing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
