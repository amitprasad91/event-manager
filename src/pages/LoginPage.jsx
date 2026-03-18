import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock } from 'lucide-react'
import { APP_VERSION, BUILD_DATE } from '../version.js'

// Floating decoration element
function Diya({ style }) {
  return <div style={{ fontSize: '1.4rem', lineHeight: 1, animation: 'floatDiya 3s ease-in-out infinite', ...style }}>🪔</div>
}
function Flower({ char = '🌸', style }) {
  return <div style={{ fontSize: '1rem', lineHeight: 1, animation: 'spinSlow 8s linear infinite', opacity: 0.6, ...style }}>{char}</div>
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  function validate() {
    const e = {}
    if (!email.trim())                              e.email    = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password)                                  e.password = 'Password is required'
    else if (password.length < 6)                   e.password = 'Minimum 6 characters'
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

  return (
    <>
      {/* ── Keyframes injected inline ── */}
      <style>{`
        @keyframes floatDiya {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1; transform: scale(1.2); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(240,180,41,0.2), 0 0 60px rgba(240,100,40,0.1); }
          50%       { box-shadow: 0 0 40px rgba(240,180,41,0.4), 0 0 80px rgba(240,100,40,0.2); }
        }
        .login-card-glow { animation: borderGlow 3s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #f0b429 0%, #ffd700 25%, #ff8c42 50%, #ffd700 75%, #f0b429 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#0a0508',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* ── Deep background texture ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(180,30,30,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(240,140,20,0.10) 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 10% 50%, rgba(120,20,80,0.12) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        }} />

        {/* ── Decorative mandala ring top-right ── */}
        <div style={{
          position: 'absolute', top: -120, right: -120, zIndex: 1,
          width: 400, height: 400,
          border: '1px solid rgba(240,180,41,0.08)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -80, right: -80, zIndex: 1,
          width: 320, height: 320,
          border: '1px solid rgba(240,180,41,0.05)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* ── Floating diyas ── */}
        <Diya style={{ position: 'absolute', top: '8%',  left: '6%',  zIndex: 2, animationDelay: '0s' }} />
        <Diya style={{ position: 'absolute', top: '15%', right: '8%', zIndex: 2, animationDelay: '1s' }} />
        <Diya style={{ position: 'absolute', bottom: '12%', left: '4%', zIndex: 2, animationDelay: '2s' }} />
        <Diya style={{ position: 'absolute', bottom: '8%', right: '5%', zIndex: 2, animationDelay: '0.5s' }} />

        {/* ── Floating flowers ── */}
        <Flower char="🌸" style={{ position: 'absolute', top: '5%',  left: '20%', zIndex: 2 }} />
        <Flower char="🌺" style={{ position: 'absolute', top: '25%', right: '12%', zIndex: 2, animationDelay: '2s', fontSize: '0.8rem' }} />
        <Flower char="✨" style={{ position: 'absolute', bottom: '20%', left: '15%', zIndex: 2, animationDelay: '1s',
          animation: 'twinkle 2s ease-in-out infinite' }} />
        <Flower char="✨" style={{ position: 'absolute', top: '40%', right: '6%', zIndex: 2, animationDelay: '0.5s',
          animation: 'twinkle 2s ease-in-out infinite' }} />

        {/* ── Horizontal string of dots (simulating marigold garland) ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent 0%, #f0b429 20%, #ff8c42 40%, #e84c1e 60%, #ff8c42 80%, transparent 100%)',
          opacity: 0.5, zIndex: 3,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #c0392b 30%, #f0b429 50%, #c0392b 70%, transparent 100%)',
          opacity: 0.35, zIndex: 3,
        }} />

        {/* ── Main content ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px', zIndex: 10, position: 'relative',
        }}>
          <div style={{
            width: '100%', maxWidth: 420,
            animation: 'rise 0.6s ease forwards',
          }}>

            {/* ── Card ── */}
            <div className="login-card-glow" style={{
              background: 'rgba(12,8,6,0.92)',
              border: '1px solid rgba(240,180,41,0.25)',
              borderRadius: 20,
              padding: '36px 36px 28px',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
            }}>

              {/* Inner top shimmer line */}
              <div style={{
                position: 'absolute', top: 0, left: 32, right: 32, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(240,180,41,0.7), rgba(255,140,66,0.5), transparent)',
              }} />

              {/* Corner ornaments */}
              {[
                { top: 10, left: 12 },
                { top: 10, right: 12 },
                { bottom: 10, left: 12 },
                { bottom: 10, right: 12 },
              ].map((pos, i) => (
                <div key={i} style={{
                  position: 'absolute', fontSize: '0.75rem', opacity: 0.4,
                  animation: `twinkle ${1.5 + i * 0.3}s ease-in-out infinite`,
                  ...pos,
                }}>✦</div>
              ))}

              {/* ── Brand ── */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                {/* Decorative top ornament */}
                <div style={{
                  fontSize: '0.9rem', letterSpacing: '0.3em',
                  color: 'rgba(240,180,41,0.4)', marginBottom: 8,
                }}>
                  ❧ ✦ ❧
                </div>

                {/* Company name */}
                <div className="shimmer-text" style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 900,
                  fontSize: '2rem', letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  All Solutions
                </div>

                {/* Kolkata pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 8,
                  background: 'rgba(240,180,41,0.07)',
                  border: '1px solid rgba(240,180,41,0.15)',
                  borderRadius: 100, padding: '3px 12px',
                  fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  <span style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#f0b429', display: 'inline-block',
                    boxShadow: '0 0 6px #f0b429',
                  }} />
                  Kolkata
                </div>

                {/* Tagline */}
                <div style={{
                  fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)',
                  marginTop: 8, letterSpacing: '0.08em',
                  fontStyle: 'italic',
                }}>
                  Event Management & Rentals
                </div>

                {/* Bottom ornament */}
                <div style={{
                  fontSize: '0.7rem', letterSpacing: '0.3em',
                  color: 'rgba(240,180,41,0.3)', marginTop: 10,
                }}>
                  ── ✦ ──
                </div>
              </div>

              {/* ── Welcome ── */}
              <div style={{ marginBottom: 20 }}>
                <h1 style={{
                  fontFamily: 'Syne, sans-serif', fontSize: '1.3rem',
                  fontWeight: 800, letterSpacing: '-0.02em',
                  color: '#fff', marginBottom: 4,
                }}>Welcome back</h1>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                  Sign in to manage your events
                </p>
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.2)', pointerEvents: 'none',
                    }} />
                    <input type="email"
                      style={{
                        width: '100%', padding: '10px 12px 10px 34px',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${errors.email ? '#ff5c7a' : 'rgba(240,180,41,0.15)'}`,
                        borderRadius: 10, color: '#fff',
                        fontSize: '0.875rem', outline: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(240,180,41,0.5)'}
                      onBlur={e => e.target.style.borderColor = errors.email ? '#ff5c7a' : 'rgba(240,180,41,0.15)'}
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
                      autoFocus
                    />
                  </div>
                  {errors.email && <div style={{ color: '#ff5c7a', fontSize: '0.72rem', marginTop: 4 }}>{errors.email}</div>}
                </div>

                {/* Password */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={13} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.2)', pointerEvents: 'none',
                    }} />
                    <input type="password"
                      style={{
                        width: '100%', padding: '10px 12px 10px 34px',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${errors.password ? '#ff5c7a' : 'rgba(240,180,41,0.15)'}`,
                        borderRadius: 10, color: '#fff',
                        fontSize: '0.875rem', outline: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(240,180,41,0.5)'}
                      onBlur={e => e.target.style.borderColor = errors.password ? '#ff5c7a' : 'rgba(240,180,41,0.15)'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
                    />
                  </div>
                  {errors.password && <div style={{ color: '#ff5c7a', fontSize: '0.72rem', marginTop: 4 }}>{errors.password}</div>}
                </div>

                {errors.form && (
                  <div style={{
                    background: 'rgba(255,92,122,0.08)', border: '1px solid rgba(255,92,122,0.25)',
                    borderRadius: 8, padding: '8px 12px', color: '#ff5c7a',
                    fontSize: '0.78rem', marginBottom: 14,
                  }}>{errors.form}</div>
                )}

                {/* Sign In button */}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px',
                  background: loading
                    ? 'rgba(240,180,41,0.3)'
                    : 'linear-gradient(135deg, #d4860a 0%, #f0b429 40%, #ff8c42 100%)',
                  border: 'none', borderRadius: 10,
                  color: loading ? 'rgba(255,255,255,0.5)' : '#1a0a00',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '0.9rem', letterSpacing: '0.05em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s, transform 0.1s',
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(240,140,20,0.35)',
                }}
                  onMouseEnter={e => !loading && (e.target.style.opacity = '0.9')}
                  onMouseLeave={e => !loading && (e.target.style.opacity = '1')}
                >
                  {loading ? <><Loader2 size={15} className="spin" /> Signing in…</> : '✦ Sign In'}
                </button>
              </form>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)' }}>
                  Contact your admin to get access
                </p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.1)', marginTop: 6, letterSpacing: '0.04em' }}>
                  v{APP_VERSION} · {BUILD_DATE}
                </p>
              </div>
            </div>

            {/* Below card — decorative text */}
            <div style={{
              textAlign: 'center', marginTop: 20,
              fontSize: '0.68rem', color: 'rgba(255,255,255,0.1)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
              🎊 Weddings · Birthdays · Corporate Events 🎊
            </div>
          </div>
        </div>

        {/* ── Right panel — decorative (desktop only) ── */}
        <div style={{
          width: 380, background: 'rgba(10,5,3,0.7)',
          borderLeft: '1px solid rgba(240,180,41,0.08)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 40, position: 'relative', overflow: 'hidden',
          zIndex: 5,
        }} className="login-right">

          {/* Radial glow effects */}
          <div style={{
            position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(180,30,30,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, right: -60,
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240,140,20,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* Decorative top */}
            <div style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'rgba(240,180,41,0.3)', marginBottom: 16 }}>
              ❧ ✦ ❧
            </div>

            {/* Event type icons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20, fontSize: '2rem' }}>
              {['💍','🎂','🏢','🎭'].map((e,i) => (
                <div key={i} style={{
                  animation: `floatDiya ${2 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}>{e}</div>
              ))}
            </div>

            {/* Heading */}
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 900,
              fontSize: '1.5rem', lineHeight: 1.2,
              letterSpacing: '-0.02em', marginBottom: 12,
            }}>
              <span className="shimmer-text">Your Events,</span>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>Perfectly Managed</span>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', lineHeight: 1.7, maxWidth: 280, margin: '0 auto 24px' }}>
              From grand weddings to birthday celebrations — track every booking, staff member, machine, and payment in one place.
            </p>

            {/* Feature list */}
            {[
              ['💍', 'Weddings & Receptions'],
              ['🎂', 'Birthday Parties'],
              ['🏢', 'Corporate Events'],
              ['🎪', 'Entertainment & Machines'],
              ['💰', 'Payment Tracking'],
            ].map(([icon, label]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 12px', marginBottom: 6,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8, textAlign: 'left',
              }}>
                <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
              </div>
            ))}

            {/* Bottom ornament */}
            <div style={{ marginTop: 24, fontSize: '0.7rem', color: 'rgba(240,180,41,0.2)', letterSpacing: '0.2em' }}>
              ── All Solutions · Kolkata ──
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
