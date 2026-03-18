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

          {/* User pill — includes logout icon on right */}
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{profile?.full_name || 'User'}</div>
              <div className="user-role">{profile?.role || 'staff'}</div>
            </div>
            {/* Logout inside user pill */}
            <button
              onClick={signOut}
              title="Sign out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', padding: '4px',
                borderRadius: 6, transition: 'color 0.15s',
                display: 'flex', alignItems: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff5c7a'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <LogOut size={14} />
            </button>
          </div>

          <div className="sidebar-divider" />

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="sidebar-action">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* PWA Install */}
          <PWAInstallButton />

          <div className="sidebar-divider" />

          {/* Version */}
          <VersionBadge />
        </div>
      </aside>

      <div className="main-content">
        {/* Mobile header — menu button NOT hidden by footer */}
        <header className="mobile-header">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(v => !v)}
            style={{ zIndex: 201, position: 'relative' }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Text-only brand */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem',
              background: 'linear-gradient(135deg, #f0b429, #ff8c42)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>All Solutions</div>
            <div style={{
              fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>Kolkata</div>
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
