import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, X, Loader2, MapPin, Phone, Trash2, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

const ITEM_TYPES = ['machine', 'performer', 'supervisor', 'helper', 'transport', 'other']
const PAY_TYPES = ['fixed', 'daily', 'hourly', 'per_km', 'monthly']

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [items, setItems] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showItemModal, setShowItemModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [itemForm, setItemForm] = useState({ item_type: 'supervisor', description: '', assigned_profile_id: '', cost: '', pay_type: 'fixed', days: '1', hours: '', notes: '' })

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    setLoading(true)
    const [evRes, itemsRes, profilesRes] = await Promise.all([
      supabase.from('events').select('*, clients(full_name, phone), venues(name, address, google_maps_url)').eq('id', id).single(),
      supabase.from('event_items').select('*, profiles(full_name, phone)').eq('event_id', id).order('created_at'),
      supabase.from('profiles').select('id, full_name, role, pay_rate, pay_type').order('full_name'),
    ])
    setEvent(evRes.data)
    setItems(itemsRes.data || [])
    setProfiles(profilesRes.data || [])
    setLoading(false)
  }

  function autoFillRate(profileId) {
    const p = profiles.find(x => x.id === profileId)
    if (p && p.pay_rate) setItemForm(f => ({ ...f, assigned_profile_id: profileId, cost: p.pay_rate, pay_type: p.pay_type?.replace('_per_event', '') || 'fixed' }))
    else setItemForm(f => ({ ...f, assigned_profile_id: profileId }))
  }

  async function handleAddItem(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      event_id: id,
      item_type: itemForm.item_type,
      description: itemForm.description,
      cost: parseFloat(itemForm.cost) || 0,
      pay_type: itemForm.pay_type,
      days: parseFloat(itemForm.days) || 1,
      hours: parseFloat(itemForm.hours) || null,
      notes: itemForm.notes,
      payment_status: 'pending',
    }
    if (itemForm.assigned_profile_id) payload.assigned_profile_id = itemForm.assigned_profile_id
    const { error } = await supabase.from('event_items').insert(payload)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Item added!')
    setShowItemModal(false)
    setItemForm({ item_type: 'supervisor', description: '', assigned_profile_id: '', cost: '', pay_type: 'fixed', days: '1', hours: '', notes: '' })
    loadAll()
  }

  async function deleteItem(itemId) {
    if (!confirm('Remove this item?')) return
    const { error } = await supabase.from('event_items').delete().eq('id', itemId)
    if (error) { toast.error(error.message); return }
    toast.success('Removed!')
    loadAll()
  }

  async function markItemPaid(item) {
    const { error } = await supabase.from('event_items').update({ amount_paid: item.cost, payment_status: 'paid' }).eq('id', item.id)
    if (error) { toast.error(error.message); return }
    toast.success('Marked paid!')
    loadAll()
  }

  async function updateStatus(newStatus) {
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(`Status: ${newStatus}`)
    loadAll()
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}><Loader2 className="spin" /></div>
  if (!event) return <div className="empty-state"><h3>Event not found</h3></div>

  const totalCost = items.reduce((s, i) => s + (i.cost || 0), 0)
  const totalPaid = items.reduce((s, i) => s + (i.amount_paid || 0), 0)
  const profit = (event.client_amount || 0) - totalCost

  const STATUS_COLORS = { upcoming: 'badge-blue', ongoing: 'badge-green', completed: 'badge-gray', cancelled: 'badge-red' }

  return (
    <div>
      {/* Back + Header */}
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')} style={{ marginBottom: 12 }}>
          <ArrowLeft size={14} /> Back to Events
        </button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div className="page-title">{event.title}</div>
              <span className={`badge ${STATUS_COLORS[event.status]}`}>{event.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap', color: 'var(--text-3)', fontSize: '0.875rem' }}>
              <span>📅 {format(new Date(event.event_date), 'dd MMM yyyy')}</span>
              {event.start_time && <span>🕐 {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}</span>}
              <span className={`event-${event.event_type}`}>🎭 {event.event_type}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {event.status === 'upcoming' && <button className="btn btn-secondary btn-sm" onClick={() => updateStatus('ongoing')}>▶ Start Event</button>}
            {event.status === 'ongoing' && <button className="btn btn-secondary btn-sm" onClick={() => updateStatus('completed')}>✅ Complete</button>}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {/* Client */}
        {event.clients && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8, fontFamily: 'Syne' }}>CLIENT</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{event.clients.full_name}</div>
            {event.clients.phone && (
              <a href={`tel:${event.clients.phone}`} className="btn btn-secondary btn-sm" style={{ marginTop: 6 }}>
                <Phone size={12} /> {event.clients.phone}
              </a>
            )}
          </div>
        )}
        {/* Venue */}
        {event.venues && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8, fontFamily: 'Syne' }}>VENUE</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{event.venues.name}</div>
            <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: 8 }}>{event.venues.address}</div>
            {event.venues.google_maps_url && (
              <a href={event.venues.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                <MapPin size={12} /> Open in Maps
              </a>
            )}
          </div>
        )}
        {/* Financials */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8, fontFamily: 'Syne' }}>FINANCIALS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-2)' }}>Billed</span>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{(event.client_amount || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-2)' }}>Received</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>₹{(event.amount_received || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-2)' }}>Total Costs</span>
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>₹{totalCost.toLocaleString()}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 700 }}>Net Profit</span>
              <span style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>₹{profit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Items */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: '16px 20px' }}>
          <span className="card-title">Event Items & Staff</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowItemModal(true)}><Plus size={13} /> Add Item</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Description</th><th>Type</th><th>Assigned To</th><th>Pay Type</th><th>Cost</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state" style={{ padding: 30 }}><h3>No items yet</h3><p>Add supervisors, staff, machines, performers…</p></div></td></tr>
              ) : items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.description}</td>
                  <td><span className="badge badge-gray">{item.item_type}</span></td>
                  <td>
                    {item.profiles ? (
                      <a href={`tel:${item.profiles.phone}`} style={{ color: 'var(--blue)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={11} /> {item.profiles.full_name}
                      </a>
                    ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{item.pay_type || '—'}{item.days > 1 ? ` × ${item.days}d` : ''}</td>
                  <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{(item.cost || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${item.payment_status === 'paid' ? 'badge-green' : item.payment_status === 'partial' ? 'badge-orange' : 'badge-red'}`}>
                      {item.payment_status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {item.payment_status !== 'paid' && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => markItemPaid(item)} title="Mark Paid"><CheckCircle size={13} /></button>
                      )}
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteItem(item.id)} title="Remove"><Trash2 size={13} style={{ color: 'var(--red)' }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowItemModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Item to Event</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowItemModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Item Type</label>
                  <select className="form-select" value={itemForm.item_type} onChange={e => setItemForm({...itemForm, item_type: e.target.value})}>
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To (Staff)</label>
                  <select className="form-select" value={itemForm.assigned_profile_id} onChange={e => autoFillRate(e.target.value)}>
                    <option value="">— No staff —</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <input className="form-input" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})}
                  placeholder="e.g. Supervisor for setup, Selfie Booth, Dancer…" required />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Pay Type</label>
                  <select className="form-select" value={itemForm.pay_type} onChange={e => setItemForm({...itemForm, pay_type: e.target.value})}>
                    {PAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cost (₹)</label>
                  <input type="number" className="form-input" value={itemForm.cost} onChange={e => setItemForm({...itemForm, cost: e.target.value})} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Days</label>
                  <input type="number" className="form-input" value={itemForm.days} onChange={e => setItemForm({...itemForm, days: e.target.value})} placeholder="1" step="0.5" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" value={itemForm.notes} onChange={e => setItemForm({...itemForm, notes: e.target.value})} placeholder="Any extra details…" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowItemModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} /> : <><Plus size={14} /> Add Item</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
