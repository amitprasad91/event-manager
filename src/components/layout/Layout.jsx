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

// Reusable brand component — Cinzel for "All Solutions"
export function BrandName({ fontSize = '1.05rem', showSub = true }) {
  return (
    <div>
      <div style={{
        fontFamily: '"Cinzel", "Playfair Display", serif',
        fontWeight: 800,
        fontSize,
        letterSpacing: '0.04em',
        lineHeight: 1,
        background: 'linear-gradient(135deg, #c8860a 0%, #f0b429 40%, #ffd060 60%, #f0b429 80%, #c8860a 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmerText 4s linear infinite',
      }}>
        All Solutions
      </div>
      {showSub && (
        <div style={{
          fontSize: '0.55rem',
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: 2,
          fontFamily: '"DM Sans", sans-serif',
        }}>
          Kolkata
        </div>
      )}
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
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand-mark">
            <div className="brand-icon">🎪</div>
            <BrandName fontSize="1.05rem" showSub={true} />
          </div>
        </div>

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

        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="sidebar-action">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <PWAInstallButton />
          <div className="sidebar-divider" />
          <VersionBadge />
          <div className="sidebar-divider" />

          {/* User + Sign Out — full width at bottom */}
          <button onClick={signOut} className="user-signout-btn">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{profile?.full_name || 'User'}</div>
              <div className="user-role">{profile?.role || 'staff'}</div>
            </div>
            <LogOut size={14} className="logout-icon" />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">

        {/* Mobile header — FIXED: brand centred, not hidden */}
        <header className="mobile-header">
          {/* Left: hamburger — fixed width so brand stays centred */}
          <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>
            <button className="hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Centre: brand — absolutely centred */}
          <div style={{ textAlign: 'center' }}>
            <BrandName fontSize="1rem" showSub={true} />
          </div>

          {/* Right: theme toggle — fixed width */}
          <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button onClick={toggleTheme} className="btn btn-ghost btn-icon btn-sm">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
