import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, Plus, X, CheckCircle, TrendingUp, GitBranch } from 'lucide-react'
import { SPLIT_METHODS, fmtRs, calcProfit, getQuarterRange } from '../lib/constants'
import { format } from 'date-fns'

export default function ProfitSplitPage() {
  const [events, setEvents]     = useState([])
  const [owners, setOwners]     = useState([])
  const [splits, setSplits]     = useState([])
  const [items, setItems]       = useState([])
  const [transport, setTransport] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [splitMethod, setSplitMethod] = useState('equal')
  const [ownerInputs, setOwnerInputs] = useState({})

  useEffect(() => { loadAll() }, [])
  useEffect(() => { if (owners.length) initInputs() }, [owners, splitMethod, selectedEvent])

  async function loadAll() {
    setLoading(true)
    const [evRes, ownRes, splRes, itemsRes, tripRes] = await Promise.all([
      supabase.from('events').select('id, title, event_date, client_amount, amount_received, status').in('status', ['completed','ongoing']).order('event_date', { ascending: false }),
      supabase.from('co_owners').select('*').order('full_name'),
      supabase.from('profit_splits').select('*'),
      supabase.from('event_items').select('event_id, cost'),
      supabase.from('transport_trips').select('event_id, amount'),
    ])
    setEvents(evRes.data || [])
    setOwners(ownRes.data || [])
    setSplits(splRes.data || [])
    setItems(itemsRes.data || [])
    setTransport(tripRes.data || [])
    setLoading(false)
  }

  function initInputs() {
    const init = {}
    owners.forEach(o => { init[o.id] = { percent: '', investment: '' } })
    setOwnerInputs(init)
  }

  function getEventCost(eventId) {
    const itemCosts = items.filter(i => i.event_id === eventId).reduce((s, i) => s + (i.cost || 0), 0)
    const tripCosts = transport.filter(t => t.event_id === eventId).reduce((s, t) => s + (t.amount || 0), 0)
    return itemCosts + tripCosts
  }

  function getEventSplits(eventId) {
    return splits.filter(s => s.event_id === eventId)
  }

  function calcSplitAmounts(profit) {
    if (owners.length === 0) return {}
    const result = {}

    if (splitMethod === 'equal') {
      const share = profit / owners.length
      owners.forEach(o => result[o.id] = share)

    } else if (splitMethod === 'fixed_percent' || splitMethod === 'custom_percent') {
      const totalPct = owners.reduce((s, o) => s + (parseFloat(ownerInputs[o.id]?.percent) || 0), 0)
      owners.forEach(o => {
        const pct = parseFloat(ownerInputs[o.id]?.percent) || 0
        result[o.id] = totalPct > 0 ? (pct / totalPct) * profit : 0
      })

    } else if (splitMethod === 'investment_based') {
      const totalInv = owners.reduce((s, o) => s + (parseFloat(ownerInputs[o.id]?.investment) || 0), 0)
      owners.forEach(o => {
        const inv = parseFloat(ownerInputs[o.id]?.investment) || 0
        result[o.id] = totalInv > 0 ? (inv / totalInv) * profit : 0
      })
    }
    return result
  }

  async function saveSplit() {
    if (!selectedEvent) { toast.error('Please select an event'); return }
    const ev = events.find(e => e.id === selectedEvent)
    if (!ev) return
    const cost   = getEventCost(selectedEvent)
    const profit = calcProfit(ev.amount_received || ev.client_amount, cost)
    const amounts = calcSplitAmounts(profit)

    // Delete existing splits for this event
    await supabase.from('profit_splits').delete().eq('event_id', selectedEvent)

    // Insert new splits
    const rows = owners.map(o => ({
      event_id:          selectedEvent,
      co_owner_id:       o.id,
      split_method:      splitMethod,
      percent:           parseFloat(ownerInputs[o.id]?.percent) || null,
      investment_amount: parseFloat(ownerInputs[o.id]?.investment) || null,
      calculated_amount: Math.round(amounts[o.id] || 0),
      paid:              false,
    }))

    setSaving(true)
    const { error } = await supabase.from('profit_splits').insert(rows)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Profit split saved!')
    loadAll()
  }

  async function markPaid(splitId) {
    const { error } = await supabase.from('profit_splits').update({ paid: true }).eq('id', splitId)
    if (error) { toast.error(error.message); return }
    toast.success('Marked as paid!')
    loadAll()
  }

  // Selected event info
  const selectedEv   = events.find(e => e.id === selectedEvent)
  const eventCost    = selectedEvent ? getEventCost(selectedEvent) : 0
  const eventProfit  = selectedEv ? calcProfit(selectedEv.amount_received || selectedEv.client_amount, eventCost) : 0
  const splitAmounts = selectedEvent ? calcSplitAmounts(eventProfit) : {}
  const existingSplits = selectedEvent ? getEventSplits(selectedEvent) : []

  // Quarter summary
  const { start, end, label: qLabel } = getQuarterRange()
  const qSplits = splits.filter(s => {
    const ev = events.find(e => e.id === s.event_id)
    if (!ev) return false
    const d = new Date(ev.event_date)
    return d >= start && d <= end
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profit Split</div>
          <div className="page-subtitle">Divide profits per event among co-owners</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={24} className="spin" style={{ color: 'var(--text-3)' }} /></div>
      ) : owners.length === 0 ? (
        <div className="empty-state">
          <GitBranch size={40} className="empty-state-icon" />
          <h3>No co-owners set up</h3>
          <p>Add co-owners first from the Co-Owners page</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── LEFT: Split Calculator ── */}
          <div>
            <div className="card">
              <div className="card-header"><span className="card-title">💰 Calculate Split</span></div>

              {/* Event selector */}
              <div className="form-group">
                <label className="form-label">Select Event</label>
                <select className="form-select" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
                  <option value="">Choose completed event…</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} — {format(new Date(ev.event_date), 'dd MMM')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Split method */}
              <div className="form-group">
                <label className="form-label">Split Method</label>
                <select className="form-select" value={splitMethod} onChange={e => setSplitMethod(e.target.value)}>
                  {SPLIT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              {/* Event financials */}
              {selectedEv && (
                <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Revenue', value: fmtRs(selectedEv.amount_received || selectedEv.client_amount), color: 'var(--gold)' },
                      { label: 'Costs', value: fmtRs(eventCost), color: 'var(--red)' },
                      { label: 'Net Profit', value: fmtRs(eventProfit), color: eventProfit >= 0 ? 'var(--green)' : 'var(--red)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne', fontWeight: 700, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color, fontSize: '0.9rem' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner inputs */}
              {owners.map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: '0.7rem', color: '#fff', flexShrink: 0 }}>
                    {o.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{o.full_name}</div>

                  {(splitMethod === 'fixed_percent' || splitMethod === 'custom_percent') && (
                    <input type="number" className="form-input" style={{ width: 80 }}
                      placeholder="%" value={ownerInputs[o.id]?.percent || ''}
                      onChange={e => setOwnerInputs(p => ({ ...p, [o.id]: { ...p[o.id], percent: e.target.value } }))} />
                  )}
                  {splitMethod === 'investment_based' && (
                    <input type="number" className="form-input" style={{ width: 100 }}
                      placeholder="₹ invest" value={ownerInputs[o.id]?.investment || ''}
                      onChange={e => setOwnerInputs(p => ({ ...p, [o.id]: { ...p[o.id], investment: e.target.value } }))} />
                  )}

                  {selectedEvent && (
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--green)', fontSize: '0.875rem', minWidth: 70, textAlign: 'right' }}>
                      {fmtRs(Math.round(splitAmounts[o.id] || 0))}
                    </div>
                  )}
                </div>
              ))}

              <button onClick={saveSplit} className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={saving || !selectedEvent}>
                {saving ? <Loader2 size={14} className="spin" /> : <><Plus size={14} /> Save Split</>}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Existing splits + Quarter summary ── */}
          <div>
            {/* Existing splits for selected event */}
            {existingSplits.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><span className="card-title">📋 Saved Splits</span></div>
                {existingSplits.map(s => {
                  const owner = owners.find(o => o.id === s.co_owner_id)
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ flex: 1, fontSize: '0.875rem' }}>{owner?.full_name || '—'}</div>
                      <span className={`badge ${s.paid ? 'badge-green' : 'badge-red'}`}>{s.paid ? 'Paid' : 'Pending'}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold)', fontSize: '0.875rem' }}>{fmtRs(s.calculated_amount)}</span>
                      {!s.paid && (
                        <button onClick={() => markPaid(s.id)} className="btn btn-sm" style={{ background: 'rgba(16,212,160,0.1)', border: '1px solid rgba(16,212,160,0.25)', color: 'var(--green)' }}>
                          <CheckCircle size={11} /> Pay
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quarter earnings summary */}
            <div className="card">
              <div className="card-header"><span className="card-title">📊 {qLabel} Earnings</span></div>
              {owners.map(o => {
                const ownerQSplits = qSplits.filter(s => s.co_owner_id === o.id)
                const total   = ownerQSplits.reduce((s, x) => s + (x.calculated_amount || 0), 0)
                const paid    = ownerQSplits.filter(s => s.paid).reduce((s, x) => s + (x.calculated_amount || 0), 0)
                const pending = total - paid
                return (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: '0.7rem', color: '#fff', flexShrink: 0 }}>
                      {o.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.full_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2 }}>
                        {ownerQSplits.length} events · {fmtRs(paid)} paid
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>{fmtRs(total)}</div>
                      {pending > 0 && <div style={{ fontSize: '0.68rem', color: 'var(--red)' }}>{fmtRs(pending)} pending</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
