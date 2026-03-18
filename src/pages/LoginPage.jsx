import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, CalendarDays, Users, CreditCard, Package } from 'lucide-react'
import { APP_VERSION, BUILD_DATE } from '../version.js'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error(error.message || 'Invalid credentials')
      setErrors({ form: error.message })
    } else {
      navigate('/dashboard')
    }
  }

  const features = [
    { icon: <CalendarDays size={13} />, text: 'Manage events & bookings' },
    { icon: <Users size={13} />, text: 'Track staff & supervisors' },
    { icon: <CreditCard size={13} />, text: 'Payment collection tracker' },
    { icon: <Package size={13} />, text: 'Machine & godown status' },
  ]

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-card">

          {/* ── Brand ── */}
          <div className="login-brand">
            {/* Gradient icon badge */}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #f0b429 0%, #ff8c42 50%, #ff5c7a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', marginBottom: 14,
              boxShadow: '0 6px 24px rgba(240,180,41,0.35)',
            }}>
              🎪
            </div>
            {/* Brand name — gradient text */}
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.75rem',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #f0b429 0%, #ff8c42 60%, #ff5c7a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 6,
            }}>
              All Solutions
            </div>
            {/* Kolkata — pill badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 100,
              padding: '3px 10px',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f0b429', display: 'inline-block', boxShadow: '0 0 6px #f0b429' }} />
              Kolkata
            </div>
          </div>

          {/* ── Welcome ── */}
          <div className="login-welcome">
            <h1>Welcome back</h1>
            <p>Sign in to manage your events business</p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
                }} />
                <input type="email" className="form-input"
                  style={{ paddingLeft: 36, borderColor: errors.email ? 'var(--red)' : undefined }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
                  autoFocus
                />
              </div>
              {errors.email && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
                }} />
                <input type="password" className="form-input"
                  style={{ paddingLeft: 36, borderColor: errors.password ? 'var(--red)' : undefined }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
                />
              </div>
              {errors.password && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.password}</div>}
            </div>

            {errors.form && (
              <div style={{
                background: 'rgba(255,92,122,0.1)',
                border: '1px solid rgba(255,92,122,0.3)',
                borderRadius: 8, padding: '8px 12px',
                color: '#ff5c7a', fontSize: '0.8rem', marginBottom: 12,
              }}>
                {errors.form}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '11px', marginTop: 4 }}
              disabled={loading}>
              {loading ? <><Loader2 size={14} className="spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* ── Footer ── */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
            Contact your admin to get access
          </p>

          {/* ── Version badge ── */}
          <p style={{
            textAlign: 'center', marginTop: 8,
            fontSize: '0.62rem', color: 'rgba(255,255,255,0.12)',
            letterSpacing: '0.04em', fontFamily: 'DM Sans, sans-serif',
          }}>
            v{APP_VERSION} · {BUILD_DATE}
          </p>

        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="login-right">
        <div className="login-right-content">
          <div className="login-right-icon">🎪</div>
          <h2>Run your events business smarter</h2>
          <p>Everything in one place — from booking to payment collection to staff management.</p>
          <div className="login-features">
            {features.map((f, i) => (
              <div key={i} className="login-feature">
                <div className="login-feature-dot" />
                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', marginRight: 4 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 28, paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)',
            textAlign: 'center',
          }}>
            All Solutions · Kolkata
          </div>
        </div>
      </div>
    </div>
  )
}
