import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, CalendarDays, Users, CreditCard, Package } from 'lucide-react'

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
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
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
      toast.error(error.message || 'Invalid login credentials')
      setErrors({ form: error.message })
    } else {
      navigate('/dashboard')
    }
  }

  const features = [
    { icon: <CalendarDays size={14} />, text: 'Manage events & bookings' },
    { icon: <Users size={14} />, text: 'Track staff & supervisors' },
    { icon: <CreditCard size={14} />, text: 'Payment collection tracker' },
    { icon: <Package size={14} />, text: 'Machine & godown status' },
  ]

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-card">
          <div className="login-brand">
            <div className="mark">⚡ EventMgr</div>
            <div className="tagline">Event Business Manager</div>
          </div>
          <div className="login-welcome">
            <h1>Welcome back</h1>
            <p>Sign in to manage your events business</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 36, borderColor: errors.email ? 'var(--red)' : undefined }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
                  autoFocus
                />
              </div>
              {errors.email && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 4 }}>{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 36, borderColor: errors.password ? 'var(--red)' : undefined }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
                />
              </div>
              {errors.password && <div style={{ color: 'var(--red)', fontSize: '0.78rem', marginTop: 4 }}>{errors.password}</div>}
            </div>

            {errors.form && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '8px 12px', color: 'var(--red)', fontSize: '0.8rem', marginBottom: 12 }}>
                {errors.form}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '11px', marginTop: 4 }} disabled={loading}>
              {loading ? <><Loader2 size={15} className="spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--text-3)' }}>
            Contact your admin to get access
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-content">
          <div className="login-right-icon">🎪</div>
          <h2>Run your events business smarter</h2>
          <p>Everything in one place — from booking to payment collection to staff management.</p>
          <div className="login-features">
            {features.map((f, i) => (
              <div key={i} className="login-feature">
                <div className="login-feature-dot" />
                <span style={{ color: 'var(--text-3)', marginRight: 6 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
