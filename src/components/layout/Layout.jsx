import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, CalendarDays, Users, UserCircle,
  Package, CreditCard, Menu, X, LogOut, Sparkles
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Events', to: '/events', icon: CalendarDays },
  { label: 'People', to: '/people', icon: Users },
  { label: 'Clients', to: '/clients', icon: UserCircle },
  { label: 'Machines & Items', to: '/machines', icon: Package },
  { label: 'Payments', to: '/payments', icon: CreditCard },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/events': 'Events',
    '/people': 'People & Staff',
    '/clients': 'Clients',
    '/machines': 'Machines & Items',
    '/payments': 'Payments',
  }
  const title = pageTitles[location.pathname] || 'Event Manager'
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">⚡ EventMgr</div>
          <div className="logo-sub">Business Manager</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{profile?.full_name || 'User'}</div>
              <div className="user-role">{profile?.role || 'staff'}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={signOut} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--gold)' }}>⚡ EventMgr</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={signOut}>
            <LogOut size={16} />
          </button>
        </header>

        {/* Desktop top bar */}
        <header className="top-bar" style={{ display: 'none' }}>
          <span className="top-bar-title">{title}</span>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
