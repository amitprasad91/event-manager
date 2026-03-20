import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle, Phone, Wallet } from 'lucide-react'
import { format, isThisQuarter } from 'date-fns'

function fmtRs(n) {
  if (!n || n === 0) return '₹0'
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n/1000).toFixed(1)}k`
  return `₹${n}`
}

// Summary stat card for payments
function PayStat({ label, value, icon, color, sub }) {
  const palette = {
    gold:  { text: '#f0b429', bg: 'rgba(240,180,41,0.08)',  border: 'rgba(240,180,41,0.2)' },
    green: { text: '#10d4a0', bg: 'rgba(16,212,160,0.08)',  border: 'rgba(16,212,160,0.2)' },
    red:   { text: '#ff5c7a', bg: 'rgba(255,92,122,0.08)',  border: 'rgba(255,92,122,0.2)' },
    blue:  { text: '#6c63ff', bg: 'rgba(108,99,255,0.08)',  border: 'rgba(108,99,255,0.2)' },
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

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [itemsRes, evRes] = await Promise.all([
      supabase.from('event_items')
        .select('*,events(title,event_date,client_amount,amount_received,clients(full_name,phone))')
        .order('created_at', { ascending: false }),
      supabase.from('events')
        .select('id,title,event_date,client_amount,amount_received,status,clients(full_name,phone)')
        .order('event_date', { ascending: false })
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
    const val = parseFloat(received)
    if (isNaN(val)) return
    setUpdatingId(eventId)
    const { error } = await supabase.from('events').update({ amount_received: val }).eq('id', eventId)
    setUpdatingId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Payment updated!')
    loadAll()
  }

  const qEvents = events.filter(e => isThisQuarter(new Date(e.event_date)))
  const totalRevenue   = qEvents.reduce((s,e) => s + (e.client_amount   || 0), 0)
  const totalCollected = qEvents.reduce((s,e) => s + (e.amount_received  || 0), 0)
  const totalPending   = totalRevenue - totalCollected
  const totalStaffDue  = eventItems.filter(i => i.payment_status !== 'paid').reduce((s,i) => s + ((i.cost||0)-(i.amount_paid||0)), 0)

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <PayStat label="Total Billed"       icon="💼" value={fmtRs(totalRevenue)}   color="gold"  sub="This quarter" />
        <PayStat label="Collected"          icon="✅" value={fmtRs(totalCollected)} color="green" sub="From clients" />
        <PayStat label="Pending Collection" icon="⏳" value={fmtRs(totalPending)}   color="red"   sub="Outstanding" />
        <PayStat label="Staff Dues"         icon="👷" value={fmtRs(totalStaffDue)}  color="blue"  sub="To pay out" />
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
            const pct      = billed > 0 ? Math.min(100, Math.round((received / billed) * 100)) : 0

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
                      fontSize: '1.1rem', fontWeight: 800, color: '#f0b429',
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

                {/* Editable received amount */}
                {billed > 0 && pending > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>Update received:</span>
                    <input
                      type="number"
                      defaultValue={received}
                      onBlur={e => { if (parseFloat(e.target.value) !== received) updateEventPayment(ev.id, e.target.value) }}
                      style={{
                        flex: 1, maxWidth: 120,
                        background: 'var(--bg-3)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '5px 10px',
                        color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem',
                        fontFamily: '"DM Mono","Courier New",monospace',
                        outline: 'none',
                      }}
                    />
                    {updatingId === ev.id && <Loader2 size={13} className="spin" />}
                  </div>
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
                      {item.item_type === 'supervisor' ? '👷' :
                       item.item_type === 'performer'  ? '🎭' :
                       item.item_type === 'transport'  ? '🚛' :
                       item.item_type === 'machine'    ? '📦' : '👤'}
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
    </div>
  )
}
