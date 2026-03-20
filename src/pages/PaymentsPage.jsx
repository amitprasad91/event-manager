import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle, Phone, Wallet, User, CreditCard, Calendar, X } from 'lucide-react'
import { logAudit } from '../lib/audit'
import { COLORS, fmtRs, calcProgress, calcStaffDue, getItemTypeEmoji } from '../lib/constants'
import { format, isThisQuarter } from 'date-fns'

// fmtRs imported from constants

// Summary stat card for payments
function PayStat({ label, value, icon, color, sub }) {
  const palette = {
    gold:  { text: COLORS.gold.hex,  bg: COLORS.gold.dim,  border: COLORS.gold.border  },
    green: { text: COLORS.green.hex, bg: COLORS.green.dim, border: COLORS.green.border },
    red:   { text: COLORS.red.hex,   bg: COLORS.red.dim,   border: COLORS.red.border   },
    blue:  { text: COLORS.blue.hex,  bg: COLORS.blue.dim,  border: COLORS.blue.border  },
  }
  const c = palette[color]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: c.bg, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', fontFamily: 'Syne', fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{
          fontSize: '1.4rem', fontWeight: 800, color: c.text,
          fontFamily: '"DM Mono","Courier New",monospace',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{value}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const [eventItems, setEventItems] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('collect')
  const [updatingId, setUpdatingId] = useState(null)
  const [transportDues, setTransportDues] = useState([])
  const [profiles, setProfiles] = useState([])
  const [showPayModal, setShowPayModal] = useState(false)
  const [payEvent, setPayEvent] = useState(null)
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', collected_by: '', handed_to: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [itemsRes, evRes, profRes, tripRes] = await Promise.all([
      supabase.from('event_items')
        .select('*,events(title,event_date,client_amount,amount_received,clients(full_name,phone))')
        .order('created_at', { ascending: false }),
      supabase.from('events')
        .select('id,title,event_date,client_amount,amount_received,status,collection_method,collected_by_profile_id,collected_at,handed_to_profile_id,handed_at,clients(full_name,phone)')
        .order('event_date', { ascending: false }),
      supabase.from('profiles').select('id,full_name').order('full_name'),
      supabase.from('transport_trips').select('id,amount,amount_paid,payment_status').eq('payment_status','pending'),
    ])
    setEventItems(itemsRes.data || [])
    setEvents(evRes.data || [])
    setProfiles(profRes.data || [])
    setTransportDues(tripRes.data || [])
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
    const val = parseFloat(received)
    if (isNaN(val)) return
    setUpdatingId(eventId)
    const { error } = await supabase.from('events').update({ amount_received: val }).eq('id', eventId)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Payment updated!')
    loadAll()
  }

  // Issue #14: Record who collected, method, and handover
  async function recordCollection(eventId) {
    const val = parseFloat(payForm.amount)
    if (isNaN(val)) { toast.error('Enter a valid amount'); return }
    setUpdatingId(eventId)
    const { error } = await supabase.from('events').update({
      amount_received:         val,
      collection_method:       payForm.method,
      collected_by_profile_id: payForm.collected_by || null,
      collected_at:            new Date().toISOString(),
      handed_to_profile_id:    payForm.handed_to || null,
      handed_at:               payForm.handed_to ? new Date().toISOString() : null,
    }).eq('id', eventId)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    await logAudit({ action: 'payment_collected', entityType: 'event', entityId: eventId, amount: val, notes: payForm.method, doneBy: payForm.collected_by || null })
    toast.success('Payment recorded!')
    setShowPayModal(false)
    setPayEvent(null)
    loadAll()
  }

  const qEvents = events.filter(e => isThisQuarter(new Date(e.event_date)))
  const totalRevenue   = qEvents.reduce((s,e) => s + (e.client_amount   || 0), 0)
  const totalCollected = qEvents.reduce((s,e) => s + (e.amount_received  || 0), 0)
  const totalPending   = totalRevenue - totalCollected
  const totalStaffDue     = eventItems.filter(i => i.payment_status !== 'paid').reduce((s,i) => s + ((i.cost||0)-(i.amount_paid||0)), 0)
  const totalTransportDue = transportDues.reduce((s,t) => s + ((t.amount||0)-(t.amount_paid||0)), 0)
  const totalOutstanding  = totalStaffDue + totalTransportDue

  const unpaidItems = eventItems.filter(i => i.payment_status !== 'paid')

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">This quarter's financial overview</div>
        </div>
      </div>

      {/* Summary stats — 2x2 grid with colored cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 24 }}>
        <PayStat label="Total Billed"       icon="💼" value={fmtRs(totalRevenue)}   color="gold"  sub="This quarter" />
        <PayStat label="Collected"          icon="✅" value={fmtRs(totalCollected)} color="green" sub="From clients" />
        <PayStat label="Pending Collection" icon="⏳" value={fmtRs(totalPending)}   color="red"   sub="Outstanding" />
        <PayStat label="Staff Dues"         icon="👷" value={fmtRs(totalStaffDue)}   color="blue"  sub="Event items" />
        <PayStat label="Transport Dues"      icon="🚛" value={fmtRs(totalTransportDue)} color="red"   sub="Driver payments" />
      </div>

      {/* Tab switcher — pill style */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        background: 'var(--bg-2)', padding: 5,
        borderRadius: 12, border: '1px solid var(--border)',
        width: 'fit-content',
      }}>
        {[
          ['collect', '💰', 'Collect from Clients'],
          ['pay',     '💸', 'Pay Staff / Vendors'],
        ].map(([key, emoji, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, border: 'none',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '0.83rem',
              cursor: 'pointer', transition: 'all 0.15s',
              background: tab === key ? 'var(--accent)' : 'transparent',
              color: tab === key ? '#fff' : 'var(--text-2)',
              boxShadow: tab === key ? '0 4px 12px var(--accent-glow)' : 'none',
            }}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" style={{ color: 'var(--text-3)' }} /></div>
      ) : tab === 'collect' ? (
        /* ── COLLECT FROM CLIENTS ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.length === 0 ? (
            <div className="empty-state"><Wallet size={40} className="empty-state-icon" /><h3>No events yet</h3></div>
          ) : events.map(ev => {
            const billed   = ev.client_amount    || 0
            const received = ev.amount_received  || 0
            const pending  = billed - received
            const pct      = calcProgress(received, billed)

            return (
              <div key={ev.id} style={{
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '16px 18px',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                        📅 {format(new Date(ev.event_date), 'dd MMM yyyy')}
                      </span>
                      {ev.clients && (
                        <a href={`tel:${ev.clients.phone}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: 'var(--blue)' }}>
                          <Phone size={10} /> {ev.clients.full_name}
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: '1.1rem', fontWeight: 800, color: COLORS.gold.hex,
                      fontFamily: '"DM Mono","Courier New",monospace',
                    }}>
                      {fmtRs(billed)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Total billed</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    height: 5, background: 'var(--bg-4)',
                    borderRadius: 100, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: pct === 100
                        ? 'linear-gradient(90deg, #10d4a0, #00e5cc)'
                        : 'linear-gradient(90deg, #f0b429, #ff8c42)',
                      borderRadius: 100,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--green)' }}>
                      {fmtRs(received)} collected
                    </span>
                    <span style={{ fontSize: '0.65rem', color: pending > 0 ? 'var(--red)' : 'var(--green)' }}>
                      {pending > 0 ? `${fmtRs(pending)} pending` : '✓ Fully paid'}
                    </span>
                  </div>
                </div>

                {/* Issue #14: Payment collection details */}
                {ev.collected_at && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 8, background: 'var(--bg-3)', borderRadius: 8, padding: '6px 10px' }}>
                    <span style={{ marginRight: 8 }}>
                      {ev.collection_method === 'cash' ? '💵' : ev.collection_method === 'online' ? '📱' : '🏦'} {ev.collection_method}
                    </span>
                    {ev.collected_at && <span style={{ marginRight: 8 }}>· {format(new Date(ev.collected_at), 'dd MMM, hh:mm a')}</span>}
                    {ev.handed_at && <span>· Handed over {format(new Date(ev.handed_at), 'dd MMM')}</span>}
                  </div>
                )}
                {/* Issue #14: Days pending after event completion */}
                {ev.status === 'completed' && pending > 0 && (() => {
                  const days = Math.floor((new Date() - new Date(ev.event_date)) / (1000*60*60*24))
                  return days > 0 ? (
                    <div style={{ fontSize: '0.72rem', color: days > 7 ? 'var(--red)' : 'var(--orange)', marginBottom: 8, fontWeight: 600 }}>
                      ⚠️ Payment pending for {days} day{days > 1 ? 's' : ''} after event completion
                    </div>
                  ) : null
                })()}
                {billed > 0 && pending > 0 && (
                  <button className="btn btn-sm" style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.25)', color: 'var(--gold)' }}
                    onClick={() => { setPayEvent(ev); setPayForm({ amount: pending.toString(), method: 'cash', collected_by: '', handed_to: '' }); setShowPayModal(true) }}>
                    <CreditCard size={12} /> Record Payment
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── PAY STAFF / VENDORS ── */
        <div>
          {unpaidItems.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={40} className="empty-state-icon" style={{ color: 'var(--green)' }} />
              <h3>All payments done! 🎉</h3>
              <p>No pending staff or vendor payments</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unpaidItems.map(item => {
                const due = (item.cost||0) - (item.amount_paid||0)
                return (
                  <div key={item.id} style={{
                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    {/* Type icon */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {getItemTypeEmoji(item.item_type)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>
                        {item.events?.title || '—'} · <span className={`badge badge-gray`} style={{ fontSize: '0.62rem' }}>{item.item_type}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '1rem', fontWeight: 800, color: 'var(--red)',
                        fontFamily: '"DM Mono","Courier New",monospace',
                      }}>
                        {fmtRs(due)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>due</div>
                    </div>

                    <button
                      className="btn btn-sm"
                      onClick={() => markItemPaid(item)}
                      disabled={updatingId === item.id}
                      style={{
                        flexShrink: 0,
                        background: 'rgba(16,212,160,0.12)',
                        border: '1px solid rgba(16,212,160,0.25)',
                        color: 'var(--green)',
                      }}>
                      {updatingId === item.id
                        ? <Loader2 size={12} className="spin" />
                        : <><CheckCircle size={12} /> Pay</>}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      {/* Issue #14: Payment collection modal */}
      {showPayModal && payEvent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPayModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Record Payment — {payEvent.title}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowPayModal(false)}><X size={16} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Received (₹) *</label>
              <input type="number" className="form-input" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value})}>
                  <option value="cash">💵 Cash</option>
                  <option value="online">📱 Online / UPI</option>
                  <option value="cheque">🏦 Cheque</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Collected By</label>
                <select className="form-select" value={payForm.collected_by} onChange={e => setPayForm({...payForm, collected_by: e.target.value})}>
                  <option value="">Select person…</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Handed Over To</label>
              <select className="form-select" value={payForm.handed_to} onChange={e => setPayForm({...payForm, handed_to: e.target.value})}>
                <option value="">Select person (optional)…</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={updatingId === payEvent.id} onClick={() => recordCollection(payEvent.id)}>
                {updatingId === payEvent.id ? <Loader2 size={14} className="spin" /> : <><CheckCircle size={13} /> Save Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}