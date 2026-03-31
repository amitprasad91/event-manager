import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, CalendarDays, Users, CreditCard, BarChart3 } from 'lucide-react'
import { APP_VERSION, BUILD_DATE } from '../version.js'

const FEATURES = [
  { icon: CalendarDays, label: 'Event Scheduling',   desc: 'Plan and track every event detail' },
  { icon: Users,        label: 'Team & Staff',        desc: 'Manage people, roles and assignments' },
  { icon: CreditCard,   label: 'Payment Tracking',    desc: 'Monitor revenue and outstanding dues' },
  { icon: BarChart3,    label: 'Profit & Analytics',  desc: 'Split profits and view performance' },
]

export default function LoginPage() {
  const { signIn }  = useAuth()
  const { theme }   = useTheme()
  const navigate    = useNavigate()
  const isDark      = theme === 'dark'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [focusedField, setFocusedField] = useState(null)

  function validate() {
    const e = {}
    if (!email.trim())                                   e.email    = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email    = 'Enter a valid email'
    if (!password)                                       e.password = 'Password is required'
    else if (password.length < 6)                        e.password = 'Minimum 6 characters'
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

  /* ── color tokens per theme ── */
  const c = isDark ? {
    pageBg:       '#111827',
    panelBg:      'linear-gradient(160deg, #0f172a 0%, #1a1040 50%, #0d1f2d 100%)',
    cardBg:       '#1e2a3a',
    cardBorder:   'rgba(255,255,255,0.08)',
    cardShadow:   '0 24px 60px rgba(0,0,0,0.5)',
    inputBg:      '#111827',
    inputBorder:  'rgba(255,255,255,0.12)',
    inputFocus:   '#6c63ff',
    inputColor:   '#eef2ff',
    placeholder:  'rgba(255,255,255,0.28)',
    labelColor:   'rgba(255,255,255,0.55)',
    headingColor: '#f0f4ff',
    subColor:     'rgba(200,215,240,0.5)',
    rightBg:      'linear-gradient(160deg, #1a0f38 0%, #0f1a30 60%, #1a1040 100%)',
    rightBorder:  'rgba(108,99,255,0.2)',
    featureBg:    'rgba(255,255,255,0.04)',
    featureBorder:'rgba(255,255,255,0.06)',
    featureText:  'rgba(255,255,255,0.7)',
    featureDesc:  'rgba(255,255,255,0.3)',
    footerColor:  'rgba(255,255,255,0.22)',
    versionColor: 'rgba(255,255,255,0.12)',
    divider:      'rgba(255,255,255,0.06)',
    errorBg:      'rgba(255,92,122,0.08)',
    errorBorder:  'rgba(255,92,122,0.25)',
    errorText:    '#ff5c7a',
    iconColor:    'rgba(255,255,255,0.22)',
  } : {
    pageBg:       '#f6f4ef',
    panelBg:      'linear-gradient(160deg, #f6f4ef 0%, #ede8df 100%)',
    cardBg:       '#ffffff',
    cardBorder:   'rgba(0,0,0,0.08)',
    cardShadow:   '0 8px 40px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
    inputBg:      '#f6f4ef',
    inputBorder:  '#d8d2c6',
    inputFocus:   '#5c54ee',
    inputColor:   '#1c1916',
    placeholder:  '#b0a89e',
    labelColor:   '#534e47',
    headingColor: '#1c1916',
    subColor:     '#978f86',
    rightBg:      'linear-gradient(160deg, #1a1040 0%, #0f1a30 100%)',
    rightBorder:  'rgba(108,99,255,0.15)',
    featureBg:    'rgba(255,255,255,0.06)',
    featureBorder:'rgba(255,255,255,0.08)',
    featureText:  'rgba(255,255,255,0.75)',
    featureDesc:  'rgba(255,255,255,0.35)',
    footerColor:  '#c4bdb0',
    versionColor: '#d8d2c6',
    divider:      '#e8e3da',
    errorBg:      'rgba(220,36,82,0.06)',
    errorBorder:  'rgba(220,36,82,0.2)',
    errorText:    '#dc2452',
    iconColor:    '#c4bdb0',
  }

  function inputStyle(field, hasError) {
    const focused = focusedField === field
    return {
      width: '100%',
      padding: '11px 12px 11px 38px',
      background: c.inputBg,
      border: `1.5px solid ${hasError ? c.errorText : focused ? c.inputFocus : c.inputBorder}`,
      borderRadius: 10,
      color: c.inputColor,
      fontSize: '0.9rem',
      outline: 'none',
      fontFamily: 'DM Sans, sans-serif',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: focused ? `0 0 0 3px ${isDark ? 'rgba(108,99,255,0.18)' : 'rgba(92,84,238,0.12)'}` : 'none',
    }
  }

  return (
    <>
      <style>{`
        @keyframes riseUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .login-card-wrap { animation: riseUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .login-right-content { animation: fadeSlide 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .shimmer-brand {
          background: linear-gradient(90deg, #c8860a 0%, #f0b429 30%, #ffd060 50%, #f0b429 70%, #c8860a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 4s linear infinite;
        }
        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(240,140,20,0.4) !important;
        }
        .login-submit-btn:active:not(:disabled) { transform: translateY(0); }
        @media (max-width: 768px) {
          .login-right-panel { display: none !important; }
          .login-left-panel  { padding: 24px 16px !important; }
        }
        @media (max-width: 400px) {
          .login-card-wrap { padding: 24px 18px !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: c.pageBg,
        fontFamily: 'DM Sans, sans-serif',
      }}>

        {/* ── LEFT — Form panel ── */}
        <div className="login-left-panel" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          background: c.panelBg,
          position: 'relative',
          minWidth: 0,
        }}>
          {/* Subtle ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(108,99,255,0.10) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(184,120,16,0.07) 0%, transparent 65%)',
          }}/>

          <div className="login-card-wrap" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

            {/* ── Card ── */}
            <div style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 20,
              padding: '36px 32px 28px',
              boxShadow: c.cardShadow,
              position: 'relative',
              overflow: 'hidden',
            }}>

              {/* Gold accent top bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #b87008, #f0b429 40%, #ff8c42 70%, #f0b429)',
                borderRadius: '20px 20px 0 0',
              }}/>

              {/* ── Brand ── */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #f0b429, #ff8c42)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.15rem',
                    boxShadow: '0 4px 14px rgba(240,180,41,0.35)',
                  }}>🎪</div>
                  <div>
                    <div className="shimmer-brand" style={{
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      letterSpacing: '0.04em',
                      lineHeight: 1.1,
                    }}>
                      All Solutions
                    </div>
                    <div style={{
                      fontSize: '0.65rem',
                      color: isDark ? 'rgba(255,255,255,0.28)' : '#b0a89e',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      marginTop: 2,
                      fontFamily: 'DM Sans, sans-serif',
                    }}>
                      Kolkata · Event Management
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Heading ── */}
              <div style={{ marginBottom: 24 }}>
                <h1 style={{
                  fontFamily: '"Cormorant Garamond", "Georgia", serif',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: c.headingColor,
                  margin: 0,
                  lineHeight: 1.2,
                }}>
                  Welcome back
                </h1>
                <p style={{ color: c.subColor, fontSize: '0.85rem', marginTop: 6 }}>
                  Sign in to manage your events
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: c.divider, marginBottom: 22 }}/>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} noValidate>

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: c.labelColor,
                    marginBottom: 6,
                    letterSpacing: '0.02em',
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      color: focusedField === 'email' ? c.inputFocus : c.iconColor,
                      pointerEvents: 'none',
                      transition: 'color 0.15s',
                    }}/>
                    <input
                      type="email"
                      style={inputStyle('email', !!errors.email)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <div style={{ color: c.errorText, fontSize: '0.72rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: c.labelColor,
                    marginBottom: 6,
                    letterSpacing: '0.02em',
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      color: focusedField === 'password' ? c.inputFocus : c.iconColor,
                      pointerEvents: 'none',
                      transition: 'color 0.15s',
                    }}/>
                    <input
                      type="password"
                      style={inputStyle('password', !!errors.password)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                    />
                  </div>
                  {errors.password && (
                    <div style={{ color: c.errorText, fontSize: '0.72rem', marginTop: 4 }}>
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Form error */}
                {errors.form && (
                  <div style={{
                    background: c.errorBg,
                    border: `1px solid ${c.errorBorder}`,
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: c.errorText,
                    fontSize: '0.8rem',
                    marginBottom: 16,
                  }}>
                    {errors.form}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: loading
                      ? (isDark ? 'rgba(240,180,41,0.2)' : '#e8e3da')
                      : 'linear-gradient(135deg, #b87008 0%, #f0b429 45%, #ff8c42 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: loading ? (isDark ? 'rgba(255,255,255,0.3)' : '#978f86') : '#1a0800',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    letterSpacing: '0.04em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    minHeight: 48,
                    boxShadow: loading ? 'none' : '0 6px 20px rgba(240,140,20,0.3)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                >
                  {loading
                    ? <><Loader2 size={16} className="spin" /> Signing in…</>
                    : 'Sign In'
                  }
                </button>
              </form>

              {/* Footer */}
              <p style={{
                textAlign: 'center',
                marginTop: 20,
                fontSize: '0.72rem',
                color: c.footerColor,
                lineHeight: 1.5,
              }}>
                Don't have access? Contact your admin.
              </p>
            </div>

            {/* Below card */}
            <p style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: '0.65rem',
              color: c.versionColor,
              letterSpacing: '0.08em',
            }}>
              v{APP_VERSION} · {BUILD_DATE}
            </p>
          </div>
        </div>

        {/* ── RIGHT — Brand panel (desktop only) ── */}
        <div className="login-right-panel" style={{
          width: 380,
          background: c.rightBg,
          borderLeft: `1px solid ${c.rightBorder}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 36px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,99,255,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 100%, rgba(240,120,10,0.12) 0%, transparent 55%)
            `,
          }}/>

          <div className="login-right-content" style={{ position: 'relative', zIndex: 1, width: '100%' }}>

            {/* Brand headline */}
            <div style={{ marginBottom: 36, textAlign: 'center' }}>
              <div style={{
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                color: 'rgba(240,180,41,0.5)',
                textTransform: 'uppercase',
                marginBottom: 14,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                All Solutions · Kolkata
              </div>
              <div style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: '1.6rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                color: '#ffffff',
                marginBottom: 10,
              }}>
                Your Events,<br/>
                <span style={{
                  background: 'linear-gradient(90deg, #f0b429, #ff8c42)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Perfectly Managed
                </span>
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.38)',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                maxWidth: 280,
                margin: '0 auto',
              }}>
                From grand weddings to corporate events — everything tracked in one place.
              </p>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: c.featureBg,
                  border: `1px solid ${c.featureBorder}`,
                  borderRadius: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(108,99,255,0.15)',
                    border: '1px solid rgba(108,99,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color="rgba(139,133,255,0.9)" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: c.featureText, fontFamily: 'Syne, sans-serif' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: c.featureDesc, marginTop: 1 }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Event types */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              marginTop: 28,
              fontSize: '1.4rem',
            }}>
              {['💍', '🎂', '🏢', '🎭', '🎪'].map((e, i) => (
                <span key={i} style={{ opacity: 0.7 }}>{e}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
