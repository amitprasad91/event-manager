import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import PWAInstallButton from '../PWAInstall'
import VersionBadge from '../VersionBadge'
import {
  LayoutDashboard, CalendarDays, Users, UserCircle,
  Package, CreditCard, Menu, LogOut, Sun, Moon
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Events', to: '/events', icon: CalendarDays },
  { label: 'People', to: '/people', icon: Users },
  { label: 'Clients', to: '/clients', icon: UserCircle },
  { label: 'Machines & Items', to: '/machines', icon: Package },
  { label: 'Payments', to: '/payments', icon: CreditCard },
]

// Brand component — reused in sidebar + mobile header
export function Brand({ size = 'md' }) {
  const isLg = size === 'lg'
  return (
    <div>
      <div style={{
        fontFamily: 'Syne', fontWeight: 800,
        fontSize: isLg ? '1.25rem' : '1.1rem',
        color: 'var(--gold)', letterSpacing: '-0.03em',
        lineHeight: 1.1,
      }}>
        All Solutions
      </div>
      <div style={{
        fontSize: isLg ? '0.72rem' : '0.65rem',
        color: 'var(--text-3)',
        letterSpacing: '0.08em',
        marginTop: 2,
      }}>
        Kolkata
      </div>
    </div>
  )
}

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-logo">
          <Brand />
        </div>

        {/* Nav links */}
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
          {/* Theme toggle */}
          <button onClick={toggleTheme} className="theme-toggle"
            style={{ width: '100%', marginBottom: 8, justifyContent: 'center' }}>
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User pill */}
          <div className="user-pill" style={{ marginBottom: 10 }}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{profile?.full_name || 'User'}</div>
              <div className="user-role">{profile?.role || 'staff'}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={signOut} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>

          {/* PWA Install button — always visible */}
          <PWAInstallButton />

          {/* Version — very bottom */}
          <VersionBadge />
        </div>
      </aside>

      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          {/* Brand in mobile header */}
          <Brand size="md" />
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
