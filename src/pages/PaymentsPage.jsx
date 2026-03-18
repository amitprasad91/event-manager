import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { format, isThisQuarter } from 'date-fns'

const numStyle = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum" 1, "zero" 1' }

export default function PaymentsPage() {
  const [eventItems, setEventItems] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('collect')
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
    const { error } = await supabase.from('event_items').update({ amount_paid: item.cost, payment_status: 'paid' }).eq('id', item.id)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Marked as paid!')
    loadAll()
  }

  async function updateEventPayment(eventId, received) {
    const val = parseFloat(received)
    if (isNaN(val)) return
    setUpdatingId(eventId)
    const { error } = await supabase.from('events').update({ amount_received: val }).eq('id', eventId)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Payment updated!')
    loadAll()
  }

  const qEvents = events.filter(e => { try { return isThisQuarter(new Date(e.event_date)) } catch { return true } })
  const totalRevenue = qEvents.reduce((s, e) => s + (e.client_amount || 0), 0)
  const totalCollected = qEvents.reduce((s, e) => s + (e.amount_received || 0), 0)
  const totalPending = totalRevenue - totalCollected
  const totalStaffDue = eventItems.filter(i => i.payment_status !== 'paid').reduce((s, i) => s + ((i.cost || 0) - (i.amount_paid || 0)), 0)
  const unpaidItems = eventItems.filter(i => i.payment_status !== 'paid')

  function fmtMoney(val) {
    if (val === 0) return '₹0'
    if (val < 1000) return `₹${val}`
    return `₹${(val / 1000).toFixed(1)}k`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">This quarter's financial overview</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Total Billed (Q)', val: fmtMoney(totalRevenue), cls: 'gold', sub: 'This quarter' },
          { label: 'Collected', val: fmtMoney(totalCollected), cls: 'green', sub: 'From clients' },
          { label: 'Pending Collection', val: fmtMoney(totalPending), cls: 'red', sub: 'From clients' },
          { label: 'Staff Dues', val: fmtMoney(totalStaffDue), cls: 'blue', sub: 'To pay out' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-label">{s.label}</div>
            <div style={{ ...numStyle, fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: `var(--${s.cls})` }}>
              {s.val}
            </div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-2)', padding: 4, borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[['collect', '💰 Collect from Clients'], ['pay', '💸 Pay Staff / Vendors']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-ghost'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table — only this scrolls horizontally */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            {tab === 'collect' ? (
              <table>
                <thead>
                  <tr><th>Event</th><th>Date</th><th>Client</th><th>Billed</th><th>Received (₹)</th><th>Pending</th></tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan={6}><div className="empty-state"><CreditCard size={32} className="empty-state-icon" /><h3>No events yet</h3></div></td></tr>
                  ) : events.map(ev => {
                    const pending = (ev.client_amount || 0) - (ev.amount_received || 0)
                    return (
                      <tr key={ev.id}>
                        <td style={{ fontWeight: 600 }}>{ev.title}</td>
                        <td style={{ color: 'var(--text-2)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          {format(new Date(ev.event_date), 'dd MMM yyyy')}
                        </td>
                        <td>
                          {ev.clients
                            ? <a href={`tel:${ev.clients.phone}`} style={{ color: 'var(--blue)', fontSize: '0.85rem' }}>📞 {ev.clients.full_name}</a>
                            : '—'}
                        </td>
                        <td style={{ ...numStyle, color: 'var(--gold)', fontWeight: 700 }}>₹{(ev.client_amount || 0).toLocaleString()}</td>
                        <td>
                          <input type="number"
                            defaultValue={ev.amount_received || 0}
                            onBlur={e => { if (parseFloat(e.target.value) !== ev.amount_received) updateEventPayment(ev.id, e.target.value) }}
                            style={{ width: 90, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--green)', fontWeight: 600, fontSize: '0.875rem', ...numStyle }}
                          />
                        </td>
                        <td style={{ ...numStyle, color: pending > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                          {pending > 0 ? `₹${pending.toLocaleString()}` : '✅ Paid'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr><th>Description</th><th>Event</th><th>Type</th><th>Cost</th><th>Paid</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {unpaidItems.length === 0 ? (
                    <tr><td colSpan={7}><div className="empty-state"><CheckCircle size={32} className="empty-state-icon" /><h3>All payments done! 🎉</h3></div></td></tr>
                  ) : unpaidItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{item.events?.title || '—'}</td>
                      <td><span className="badge badge-gray">{item.item_type}</span></td>
                      <td style={{ ...numStyle, color: 'var(--gold)', fontWeight: 700 }}>₹{(item.cost || 0).toLocaleString()}</td>
                      <td style={{ ...numStyle, color: 'var(--green)' }}>₹{(item.amount_paid || 0).toLocaleString()}</td>
                      <td><span className={`badge ${item.payment_status === 'paid' ? 'badge-green' : item.payment_status === 'partial' ? 'badge-orange' : 'badge-red'}`}>{item.payment_status}</span></td>
                      <td>
                        {updatingId === item.id
                          ? <Loader2 size={14} className="spin" />
                          : <button className="btn btn-sm btn-secondary" onClick={() => markItemPaid(item)}><CheckCircle size={12} /> Mark Paid</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
