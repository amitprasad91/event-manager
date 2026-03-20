import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { canDo } from '../lib/permissions'
import toast from 'react-hot-toast'
import { Plus, Search, X, Loader2, Package, Pencil, Trash2, Info } from 'lucide-react'
import { MACHINE_CATEGORIES, MACHINE_STATUSES, DEFAULT_GODOWNS, getMachineStatus } from '../lib/constants'

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
        <h3>Delete Item?</h3>
        <p>This machine/item will be permanently removed.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  )
}

// Issue #7: Notes tooltip popup
function NotesPopup({ notes, onClose }) {
  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📝</div>
        <h3 style={{ marginBottom: 10 }}>Notes</h3>
        <p style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-2)' }}>{notes}</p>
        <div className="confirm-actions">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Item name is required'
  if (form.quantity && (isNaN(parseInt(form.quantity)) || parseInt(form.quantity) < 1)) errors.quantity = 'Must be at least 1'
  return errors
}

export default function MachinesPage() {
  const [machines, setMachines]   = useState([])
  const [events, setEvents]       = useState([])
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editing, setEditing]     = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [notesPopup, setNotesPopup] = useState(null)
  const [errors, setErrors]       = useState({})
  const emptyForm = { name: '', category: 'machine', godown: DEFAULT_GODOWNS[0], status: 'in_godown', current_event_id: '', notes: '', quantity: '1' }
  const [form, setForm] = useState(emptyForm)

  const { profile } = useAuth()
  const role = profile?.role || 'staff'

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
    setErrors({})
    setForm({ name: m.name, category: m.category, godown: m.godown || DEFAULT_GODOWNS[0], status: m.status, current_event_id: m.current_event_id || '', notes: m.notes || '', quantity: m.quantity || '1' })
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
    const payload = { ...form, quantity: parseInt(form.quantity) || 1 }
    if (!payload.current_event_id) delete payload.current_event_id
    let error
    if (editing) {
      ;({ error } = await supabase.from('machines').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('machines').insert(payload))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Item updated!' : 'Item added!')
    setShowModal(false)
    loadAll()
  }

  async function handleDelete(id) {
    if (!canDo(role, 'delete')) { toast.error('You do not have permission to delete.'); return }
    const { error } = await supabase.from('machines').delete().eq('id', id)
    setConfirmId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Item deleted!')
    loadAll()
  }

  const filtered = machines.filter(m => {
    const q = search.toLowerCase()
    return (!q || m.name?.toLowerCase().includes(q) || m.godown?.toLowerCase().includes(q))
      && (!filterStatus || m.status === filterStatus)
  })

  // Summary by godown
  const godownSummary = DEFAULT_GODOWNS.map(g => ({
    name: g,
    count: machines.filter(m => m.godown === g && m.status === 'in_godown').length,
    qty: machines.filter(m => m.godown === g && m.status === 'in_godown').reduce((s, m) => s + (m.quantity || 1), 0)
  }))

  return (
    <div>
      {confirmId && <ConfirmDialog onConfirm={() => handleDelete(confirmId)} onCancel={() => setConfirmId(null)} />}
      {notesPopup && <NotesPopup notes={notesPopup} onClose={() => setNotesPopup(null)} />}

      <div className="page-header">
        <div>
          <div className="page-title">Machines & Items</div>
          <div className="page-subtitle">{machines.length} items tracked</div>
        </div>
        {canDo(role, 'add') && <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Item</button>
      </div>

      {/* Issue #8: Godown summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        {godownSummary.map(g => (
          <div key={g.name} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>📦 {g.name}</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent-light)', lineHeight: 1 }}>{g.qty}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4 }}>{g.count} item types</div>
          </div>
        ))}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>🎪 At Events</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.4rem', color: 'var(--orange)', lineHeight: 1 }}>
            {machines.filter(m => m.status === 'at_event').reduce((s, m) => s + (m.quantity || 1), 0)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4 }}>{machines.filter(m => m.status === 'at_event').length} item types</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
          <Search size={15} />
          <input placeholder="Search machines…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="form-select" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {MACHINE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Package size={40} className="empty-state-icon" /><h3>No machines found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Item Name</th><th>Qty</th><th>Category</th><th>Status</th><th>Location / Event</th><th>Notes</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    {/* Issue #8: Show quantity */}
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-light)' }}>{m.quantity || 1}</td>
                    <td><span className="badge badge-gray">{m.category}</span></td>
                    <td><span className={`badge ${getMachineStatus(m.status).badge}`}>{getMachineStatus(m.status).label}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {m.status === 'at_event' && m.events
                        ? <span style={{ color: 'var(--orange)' }}>🎪 {m.events.title}</span>
                        : <span style={{ color: 'var(--text-2)' }}>{m.godown || '—'}</span>}
                    </td>
                    {/* Issue #7: Notes as clickable button instead of truncated text */}
                    <td>
                      {m.notes
                        ? <button onClick={() => setNotesPopup(m.notes)}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem', color: 'var(--accent-light)', padding: '3px 8px' }}>
                            <Info size={12} /> View
                          </button>
                        : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(m)} title="Edit"><Pencil size={13} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmId(m.id)} title="Delete" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
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
              <span className="modal-title">{editing ? 'Edit Item' : 'Add Item'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Item Name *</label>
                  <input className="form-input" style={{ borderColor: errors.name ? 'var(--red)' : undefined }}
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Selfie Bhoot Booth" />
                  {errors.name && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 3 }}>{errors.name}</div>}
                </div>
                {/* Issue #8: Quantity field */}
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" min="1"
                    style={{ borderColor: errors.quantity ? 'var(--red)' : undefined }}
                    value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="1" />
                  {errors.quantity && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 3 }}>{errors.quantity}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {MACHINE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Godown</label>
                  <select className="form-select" value={form.godown} onChange={e => setForm({...form, godown: e.target.value})}>
                    {DEFAULT_GODOWNS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {MACHINE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                {/* Issue #8: Event selector always visible, not just at_event */}
                <div className="form-group">
                  <label className="form-label">Current Event {form.status !== 'at_event' ? '(optional)' : '*'}</label>
                  <select className="form-select" value={form.current_event_id} onChange={e => setForm({...form, current_event_id: e.target.value})}>
                    <option value="">None</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Condition, special instructions, accessories included…"
                  style={{ minHeight: 80 }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : editing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
