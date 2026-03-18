import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { CreditCard, Loader2, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { format, isThisQuarter } from 'date-fns'

export default function PaymentsPage() {
  const [eventItems, setEventItems] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('collect') // 'collect' | 'pay'
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [itemsRes, evRes] = await Promise.all([
      supabase.from('event_items').select('*, events(title, event_date, client_amount, amount_received, clients(full_name, phone))').order('created_at', { ascending: false }),
      supabase.from('events').select('id, title, event_date, client_amount, amount_received, status, clients(full_name, phone)').order('event_date', { ascending: false })
    ])
    setEventItems(itemsRes.data || [])
    setEvents(evRes.data || [])
    setLoading(false)
  }

  async function markItemPaid(item) {
    setUpdatingId(item.id)
    const { error } = await supabase.from('event_items')
      .update({ amount_paid: item.cost, payment_status: 'paid' })
      .eq('id', item.id)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Marked as paid!')
    loadAll()
  }

  async function updateEventPayment(eventId, received) {
    const ev = events.find(e => e.id === eventId)
    if (!ev) return
    const val = parseFloat(received)
    setUpdatingId(eventId)
    const { error } = await supabase.from('events')
      .update({ amount_received: val, ...(val >= ev.client_amount ? {} : {}) })
      .eq('id', eventId)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Payment updated!')
    loadAll()
  }

  // Summary stats
  const qEvents = events.filter(e => isThisQuarter(new Date(e.event_date)))
  const totalRevenue = qEvents.reduce((s, e) => s + (e.client_amount || 0), 0)
  const totalCollected = qEvents.reduce((s, e) => s + (e.amount_received || 0), 0)
  const totalPending = totalRevenue - totalCollected
  const totalStaffDue = eventItems.filter(i => i.payment_status !== 'paid').reduce((s, i) => s + ((i.cost || 0) - (i.amount_paid || 0)), 0)

  const unpaidItems = eventItems.filter(i => i.payment_status !== 'paid')
  const paidItems = eventItems.filter(i => i.payment_status === 'paid')

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">This quarter's financial overview</div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid">
        <div className="stat-card gold">
          <div className="stat-label">Total Billed (Q)</div>
          <div className="stat-value">₹{(totalRevenue/1000).toFixed(1)}k</div>
          <div className="stat-sub">This quarter</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Collected</div>
          <div className="stat-value">₹{(totalCollected/1000).toFixed(1)}k</div>
          <div className="stat-sub">From clients</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Pending Collection</div>
          <div className="stat-value">₹{(totalPending/1000).toFixed(1)}k</div>
          <div className="stat-sub">From clients</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Staff Dues</div>
          <div className="stat-value">₹{(totalStaffDue/1000).toFixed(1)}k</div>
          <div className="stat-sub">To pay out</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-2)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: 'fit-content' }}>
        {[['collect', '💰 Collect from Clients'], ['pay', '💸 Pay Staff / Vendors']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-ghost'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}><Loader2 className="spin" /></div>
      ) : tab === 'collect' ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Event</th><th>Date</th><th>Client</th><th>Billed</th><th>Received</th><th>Pending</th><th>Action</th></tr></thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><CreditCard className="empty-state-icon" /><h3>No events yet</h3></div></td></tr>
                ) : events.map(ev => {
                  const pending = (ev.client_amount || 0) - (ev.amount_received || 0)
                  return (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: 600 }}>{ev.title}</td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{format(new Date(ev.event_date), 'dd MMM yyyy')}</td>
                      <td>
                        {ev.clients ? (
                          <a href={`tel:${ev.clients.phone}`} style={{ color: 'var(--blue)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            📞 {ev.clients.full_name}
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{(ev.client_amount || 0).toLocaleString()}</td>
                      <td>
                        <input
                          type="number"
                          defaultValue={ev.amount_received || 0}
                          onBlur={e => { if (parseFloat(e.target.value) !== ev.amount_received) updateEventPayment(ev.id, e.target.value) }}
                          style={{ width: 90, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--green)', fontWeight: 600, fontSize: '0.875rem' }}
                        />
                      </td>
                      <td>
                        <span style={{ color: pending > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600, fontSize: '0.875rem' }}>
                          {pending > 0 ? `₹${pending.toLocaleString()}` : '✅ Paid'}
                        </span>
                      </td>
                      <td>
                        {updatingId === ev.id && <Loader2 size={14} className="spin" />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Description</th><th>Event</th><th>Type</th><th>Cost</th><th>Paid</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {unpaidItems.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><CheckCircle className="empty-state-icon" /><h3>All payments done! 🎉</h3></div></td></tr>
                ) : unpaidItems.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.description}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{item.events?.title || '—'}</td>
                    <td><span className="badge badge-gray">{item.item_type}</span></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{(item.cost || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--green)' }}>₹{(item.amount_paid || 0).toLocaleString()}</td>
                    <td><span className={`badge ${item.payment_status === 'paid' ? 'badge-green' : item.payment_status === 'partial' ? 'badge-orange' : 'badge-red'}`}>{item.payment_status}</span></td>
                    <td>
                      {updatingId === item.id ? <Loader2 size={14} className="spin" /> : (
                        <button className="btn btn-sm btn-secondary" onClick={() => markItemPaid(item)}>
                          <CheckCircle size={12} /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
