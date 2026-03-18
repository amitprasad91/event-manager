import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { APP_VERSION, BUILD_DATE } from '../version.js'
import { CalendarDays, MapPin, Phone, ArrowRight, TrendingUp } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'

// Fix: use tabular-nums so 0 never looks like O
const NUM_STYLE = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }

export default function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ events: 0, people: 0, revenue: 0, pending: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    setLoading(true)
    const [eventsRes, peopleRes, upcomingRes] = await Promise.all([
      supabase.from('events').select('id, client_amount, amount_received, status').eq('status', 'upcoming'),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('events')
        .select('*, clients(full_name, phone), venues(name, address, google_maps_url)')
        .in('status', ['upcoming', 'ongoing'])
        .order('event_date', { ascending: true })
        .limit(6)
    ])
    const evs = eventsRes.data || []
    setStats({
      events: evs.length,
      people: peopleRes.count || 0,
      revenue: evs.reduce((s, e) => s + (e.amount_received || 0), 0),
      pending: evs.reduce((s, e) => s + ((e.client_amount || 0) - (e.amount_received || 0)), 0),
    })
    setUpcoming(upcomingRes.data || [])
    setLoading(false)
  }

  function dateLabel(dateStr) {
    const d = new Date(dateStr)
    if (isToday(d)) return { label: 'Today', cls: 'badge-green' }
    if (isTomorrow(d)) return { label: 'Tomorrow', cls: 'badge-orange' }
    return { label: format(d, 'dd MMM'), cls: 'badge-gray' }
  }

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Format rupee amount with tabular nums
  const fmt = (n) => n >= 1000
    ? `₹${(n / 1000).toFixed(1)}k`
    : `₹${n}`

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            {greet()}, {profile?.full_name?.split(' ')[0] || 'Boss'} 👋
          </div>
          <div className="page-subtitle">Here's your event business at a glance</div>
        </div>
        {/* Version badge on dashboard top right */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '5px 10px',
          fontSize: '0.72rem', color: 'var(--text-3)',
        }}>
          <TrendingUp size={11} style={{ color: 'var(--green)' }} />
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>LIVE</span>
          · v{APP_VERSION} · {BUILD_DATE}
        </div>
      </div>

      {/* Stats — FIX: tabular nums so 0 looks like 0 not O */}
      <div className="stat-grid">
        {[
          { label: 'Upcoming Events', value: stats.events.toString(), sub: 'Active bookings', color: 'gold' },
          { label: 'Amount Received', value: fmt(stats.revenue), sub: 'This quarter', color: 'green' },
          { label: 'Pending Collection', value: fmt(stats.pending), sub: 'From clients', color: 'red' },
          { label: 'Team Members', value: stats.people.toString(), sub: 'Staff & drivers', color: 'blue' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={NUM_STYLE}>{loading ? '—' : s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Upcoming Events</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.875rem' }}>
            Loading…
          </div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={40} className="empty-state-icon" />
            <h3>No upcoming events</h3>
            <p>Create your first event to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(ev => {
              const dl = dateLabel(ev.event_date)
              return (
                <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: 'var(--bg-3)',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {ev.venues && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--text-3)' }}>
                          <MapPin size={10} /> {ev.venues.name}
                        </span>
                      )}
                      {ev.clients && (
                        <a href={`tel:${ev.clients.phone}`}
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--blue)' }}>
                          <Phone size={10} /> {ev.clients.full_name}
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                    <span className={`badge ${dl.cls}`}>{dl.label}</span>
                    {ev.client_amount > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 700, ...NUM_STYLE }}>
                        ₹{ev.client_amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {ev.venues?.google_maps_url && (
                    <a href={ev.venues.google_maps_url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="btn btn-ghost btn-icon btn-sm" title="Open in Maps"
                      style={{ flexShrink: 0 }}>
                      <MapPin size={13} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
