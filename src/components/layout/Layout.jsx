import { useState } from 'react'
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import PWAInstallButton from '../PWAInstall'
import VersionBadge from '../VersionBadge'
import { getNavForRole, canAccessPage } from '../../lib/permissions'
import {
  LayoutDashboard, CalendarDays, Users, UserCircle,
  Package, CreditCard, Menu, X, LogOut, Sun, Moon,
  MapPin, Mic2, Truck, Users2, PieChart
} from 'lucide-react'

const ICON_MAP = {
  'Dashboard':        LayoutDashboard,
  'Events':           CalendarDays,
  'People & Staff':   Users,
  'Clients':          UserCircle,
  'Performers':       Mic2,
  'Venues':           MapPin,
  'Machines & Items': Package,
  'Transport':        Truck,
  'Payments':         CreditCard,
  'Co-Owners':        Users2,
  'Profit Split':     PieChart,
}

const ROUTE_MAP = {
  'Dashboard':        '/dashboard',
  'Events':           '/events',
  'People & Staff':   '/people',
  'Clients':          '/clients',
  'Performers':       '/performers',
  'Venues':           '/venues',
  'Machines & Items': '/machines',
  'Transport':        '/transport',
  'Payments':         '/payments',
  'Co-Owners':        '/co-owners',
  'Profit Split':     '/profit-split',
}

export function BrandName({ fontSize = '1.05rem', showSub = true }) {
  return (
    <div>
      <div style={{
        fontFamily: '"Cinzel","Playfair Display",serif',
        fontWeight: 800, fontSize,
        letterSpacing: '0.04em', lineHeight: 1,
        background: 'linear-gradient(135deg,#c8860a 0%,#f0b429 40%,#ffd060 60%,#f0b429 80%,#c8860a 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', animation: 'shimmerText 4s linear infinite',
      }}>All Solutions</div>
      {showSub && (
        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2, fontFamily: '"DM Sans",sans-serif' }}>
          Kolkata
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const role    = profile?.role || 'staff'
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'
  const navSections = getNavForRole(role)

  // Fix #17: Redirect to dashboard if trying to access unauthorized page
  if (!canAccessPage(role, location.pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand-mark">
            <div className="brand-icon">🎪</div>
            <BrandName fontSize="1.05rem" showSub={true} />
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Fix #17: Only show nav items allowed for this role */}
          {Object.entries(navSections).map(([section, items]) => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(label => {
                const Icon = ICON_MAP[label]
                const to   = ROUTE_MAP[label]
                if (!Icon || !to) return null
                return (
                  <NavLink key={to} to={to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}>
                    <Icon size={16} />
                    {label}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Fix #17: Show role badge in sidebar footer */}
          <div style={{
            fontSize: '0.65rem', textAlign: 'center', marginBottom: 8,
            color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: 'Syne', fontWeight: 700,
          }}>
            {role === 'admin' ? '👑 Admin' : role === 'supervisor' ? '👷 Supervisor' : role === 'driver' ? '🚛 Driver' : '👤 Staff'}
          </div>

          <button onClick={toggleTheme} className="sidebar-action">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <PWAInstallButton />
          <div className="sidebar-divider" />
          <VersionBadge />
          <div className="sidebar-divider" />
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

      <div className="main-content">
        <header className="mobile-header">
          <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>
            <button className="hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          <div style={{ textAlign: 'center' }}><BrandName fontSize="1rem" showSub={true} /></div>
          <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button onClick={toggleTheme} className="btn btn-ghost btn-icon btn-sm">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
