import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { APP_VERSION, BUILD_DATE } from '../version.js'
import { CalendarDays, MapPin, Phone, ArrowRight, Zap } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'

// Format number — always use digits, never letters
function fmt(n) {
  if (n === 0 || n === undefined || n === null) return '0'
  if (n >= 100000) return `${(n/100000).toFixed(1)}L`
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`
  return `${n}`
}
function fmtRs(n) {
  if (n === 0 || n === undefined || n === null) return '₹0'
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n/1000).toFixed(1)}k`
  return `₹${n}`
}

// Stat card — horizontal layout, big number right
function StatCard({ label, value, sub, color, icon, prefix = '' }) {
  const colors = {
    gold:  { accent: '#f0b429', glow: 'rgba(240,180,41,0.15)',  bar: 'linear-gradient(90deg,#f0b429,#ff8c42)' },
    green: { accent: '#10d4a0', glow: 'rgba(16,212,160,0.12)',  bar: 'linear-gradient(90deg,#10d4a0,#00e5cc)' },
    red:   { accent: '#ff5c7a', glow: 'rgba(255,92,122,0.12)',  bar: 'linear-gradient(90deg,#ff5c7a,#ff8c42)' },
    blue:  { accent: '#6c63ff', glow: 'rgba(108,99,255,0.12)',  bar: 'linear-gradient(90deg,#6c63ff,#3b9eff)' },
  }
  const c = colors[color]
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, border-color 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = c.accent + '44' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.bar }} />

      {/* Glow blob top right */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: c.glow, pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em',
            color: 'var(--text-3)', fontFamily: 'Syne, sans-serif', fontWeight: 700,
            marginBottom: 10,
          }}>{label}</div>
          <div style={{
            fontSize: '2rem', fontWeight: 800, lineHeight: 1,
            color: c.accent,
            fontFamily: '"DM Mono", "Courier New", monospace',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}>
            {value}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 8 }}>{sub}</div>
        </div>
        {/* Large faded icon */}
        <div style={{ fontSize: '2.2rem', opacity: 0.15, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { profile, lastLogin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ events: 0, people: 0, revenue: 0, pending: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    setLoading(true)
    const [eventsRes, peopleRes, upcomingRes] = await Promise.all([
      supabase.from('events').select('id,client_amount,amount_received,status').eq('status','upcoming'),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('events')
        .select('*,clients(full_name,phone),venues(name,address,google_maps_url)')
        .in('status', ['upcoming','ongoing'])
        .order('event_date', { ascending: true })
        .limit(6)
    ])
    const evs = eventsRes.data || []
    setStats({
      events:  evs.length,
      people:  peopleRes.count || 0,
      revenue: evs.reduce((s,e) => s + (e.amount_received || 0), 0),
      pending: evs.reduce((s,e) => s + ((e.client_amount||0)-(e.amount_received||0)), 0),
    })
    setUpcoming(upcomingRes.data || [])
    setLoading(false)
  }

  function dateLabel(dateStr) {
    const d = new Date(dateStr)
    if (isToday(d))    return { label: 'Today',    cls: 'badge-green' }
    if (isTomorrow(d)) return { label: 'Tomorrow', cls: 'badge-orange' }
    return { label: format(d, 'dd MMM'), cls: 'badge-gray' }
  }

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
              {greet()}, {profile?.full_name?.split(' ')[0] || 'Boss'} 👋
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Here's your event business at a glance</p>
          {lastLogin && (
            <p style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🕐</span> Last login: {format(lastLogin, 'dd MMM yyyy, hh:mm a')}
            </p>
          )}
          </div>
          {/* Live version pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 100, padding: '5px 12px',
            fontSize: '0.7rem', color: 'var(--text-3)',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10d4a0', boxShadow: '0 0 6px #10d4a0', display: 'inline-block' }} />
            <span style={{ color: '#10d4a0', fontWeight: 600 }}>LIVE</span>
            · v{APP_VERSION}
          </div>
        </div>
      </div>

      {/* Stats grid — custom cards, not generic */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard
          label="Upcoming Events" icon="🎪"
          value={loading ? '—' : fmt(stats.events)}
          sub="Active bookings" color="gold"
        />
        <StatCard
          label="Amount Received" icon="💰"
          value={loading ? '—' : fmtRs(stats.revenue)}
          sub="This quarter" color="green"
        />
        <StatCard
          label="Pending Collection" icon="⏳"
          value={loading ? '—' : fmtRs(stats.pending)}
          sub="From clients" color="red"
        />
        <StatCard
          label="Team Members" icon="👥"
          value={loading ? '—' : fmt(stats.people)}
          sub="Staff & drivers" color="blue"
        />
      </div>

      {/* Upcoming events */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Upcoming Events</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading…</div>
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
                    background: 'var(--bg-3)', borderRadius: 12,
                    border: '1px solid var(--border)', cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.background = 'var(--bg-4)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-3)' }}
                >
                  {/* Event type icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(108,99,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    {ev.event_type === 'wedding' ? '💍' : ev.event_type === 'birthday' ? '🎂' : ev.event_type === 'office' ? '🏢' : '🎪'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {ev.venues && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'var(--text-3)' }}>
                          <MapPin size={10} /> {ev.venues.name}
                        </span>
                      )}
                      {ev.clients && (
                        <a href={`tel:${ev.clients.phone}`} onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'var(--blue)' }}>
                          <Phone size={10} /> {ev.clients.full_name}
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                    <span className={`badge ${dl.cls}`}>{dl.label}</span>
                    {ev.client_amount > 0 && (
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700, color: '#f0b429',
                        fontFamily: '"DM Mono", monospace',
                      }}>
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
