import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import PWAInstallButton from '../PWAInstall'
import VersionBadge from '../VersionBadge'
import {
  LayoutDashboard, CalendarDays, Users, UserCircle,
  Package, CreditCard, Menu, LogOut, Sun, Moon, Download
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard',      to: '/dashboard', icon: LayoutDashboard },
  { label: 'Events',         to: '/events',    icon: CalendarDays },
  { label: 'People',         to: '/people',    icon: Users },
  { label: 'Clients',        to: '/clients',   icon: UserCircle },
  { label: 'Machines & Items', to: '/machines', icon: Package },
  { label: 'Payments',       to: '/payments',  icon: CreditCard },
]

// Brand — used in sidebar + mobile header
export function Brand() {
  return (
    <div className="brand-mark">
      <div className="brand-icon">🎪</div>
      <div>
        <div className="brand-text-main">All Solutions</div>
        <div className="brand-text-sub">Kolkata</div>
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

        {/* Footer — all actions look like nav items */}
        <div className="sidebar-footer">

          {/* User info */}
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{profile?.full_name || 'User'}</div>
              <div className="user-role">{profile?.role || 'staff'}</div>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Theme toggle — nav style */}
          <button onClick={toggleTheme} className="sidebar-action">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* PWA Install — nav style, gold */}
          <PWAInstallButton />

          {/* Logout — nav style, red */}
          <button onClick={signOut} className="sidebar-action logout">
            <LogOut size={15} />
            Sign Out
          </button>

          <div className="sidebar-divider" />

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
          <Brand />
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
