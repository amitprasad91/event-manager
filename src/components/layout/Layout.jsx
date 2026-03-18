import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import PWAInstallButton from '../PWAInstall'
import VersionBadge from '../VersionBadge'
import {
  LayoutDashboard, CalendarDays, Users, UserCircle,
  Package, CreditCard, Menu, X, LogOut, Sun, Moon
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard',        to: '/dashboard', icon: LayoutDashboard },
  { label: 'Events',           to: '/events',    icon: CalendarDays },
  { label: 'People',           to: '/people',    icon: Users },
  { label: 'Clients',          to: '/clients',   icon: UserCircle },
  { label: 'Machines & Items', to: '/machines',  icon: Package },
  { label: 'Payments',         to: '/payments',  icon: CreditCard },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-logo">
          <div className="brand-mark">
            <div className="brand-icon">🎪</div>
            <div>
              <div className="brand-text-main">All Solutions</div>
              <div className="brand-text-sub">Kolkata</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">

          {/* Theme + Install */}
          <button onClick={toggleTheme} className="sidebar-action">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <PWAInstallButton />

          <div className="sidebar-divider" />

          {/* Version */}
          <VersionBadge />

          <div className="sidebar-divider" />

          {/* ── User + Sign Out — full width button at very bottom ── */}
          <button
            onClick={signOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,92,122,0.10)'
              e.currentTarget.style.borderColor = 'rgba(255,92,122,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg,#f0b429,#ff8c42)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne,sans-serif', fontSize: '0.72rem',
              fontWeight: 800, color: '#1a0800',
              boxShadow: '0 2px 8px rgba(240,180,41,0.25)',
            }}>
              {initials}
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.82rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {profile?.full_name || 'User'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>
                {profile?.role || 'staff'}
              </div>
            </div>

            {/* Sign out icon */}
            <LogOut size={14} style={{ color: 'rgba(255,92,122,0.7)', flexShrink: 0 }} />
          </button>
        </div>
      </aside>

      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1rem',
              background: 'linear-gradient(135deg,#f0b429,#ff8c42)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-.02em', lineHeight: 1.1,
            }}>All Solutions</div>
            <div style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.25)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
              Kolkata
            </div>
          </div>

          <button onClick={toggleTheme} className="btn btn-ghost btn-icon btn-sm">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
