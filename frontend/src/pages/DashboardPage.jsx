import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CalendarDays, Users, TrendingUp, Clock, ArrowRight, MapPin, Phone } from 'lucide-react'
import { format, isToday, isTomorrow, isThisQuarter } from 'date-fns'

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
        .limit(5)
    ])

    const evs = eventsRes.data || []
    const totalRevenue = evs.reduce((s, e) => s + (e.amount_received || 0), 0)
    const totalPending = evs.reduce((s, e) => s + ((e.client_amount || 0) - (e.amount_received || 0)), 0)

    setStats({
      events: evs.length,
      people: peopleRes.count || 0,
      revenue: totalRevenue,
      pending: totalPending,
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

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{greet()}, {profile?.full_name?.split(' ')[0] || 'Boss'} 👋</div>
          <div className="page-subtitle">Here's what's happening with your events</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card gold">
          <div className="stat-label">Upcoming Events</div>
          <div className="stat-value">{stats.events}</div>
          <div className="stat-sub">Active bookings</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Amount Received</div>
          <div className="stat-value">₹{(stats.revenue / 1000).toFixed(1)}k</div>
          <div className="stat-sub">This quarter</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Pending Collection</div>
          <div className="stat-value">₹{(stats.pending / 1000).toFixed(1)}k</div>
          <div className="stat-sub">From clients</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Team Members</div>
          <div className="stat-value">{stats.people}</div>
          <div className="stat-sub">Staff & drivers</div>
        </div>
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
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state">
            <CalendarDays className="empty-state-icon" />
            <h3>No upcoming events</h3>
            <p>Create your first event to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map(ev => {
              const dl = dateLabel(ev.event_date)
              return (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/events/${ev.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px',
                    background: 'var(--bg-3)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)44'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{ev.title}</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      {ev.venues && (
                        <span className="flex items-center gap-2 text-sm text-muted">
                          <MapPin size={11} /> {ev.venues.name}
                        </span>
                      )}
                      {ev.clients && (
                        <span className="flex items-center gap-2 text-sm text-muted">
                          <Phone size={11} />
                          <a href={`tel:${ev.clients.phone}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--text-3)' }}>
                            {ev.clients.full_name}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className={`badge ${dl.cls}`}>{dl.label}</span>
                    {ev.client_amount > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>
                        ₹{ev.client_amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {ev.venues?.google_maps_url && (
                    <a
                      href={ev.venues.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Open in Google Maps"
                    >
                      <MapPin size={14} />
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
