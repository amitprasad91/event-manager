import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock } from 'lucide-react'
import { APP_VERSION, BUILD_DATE } from '../version.js'

export default function LoginPage() {
  const { signIn }  = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

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

  return (
    <>
      <style>{`
        @keyframes floatDiya {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50%      { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes riseUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes twinkle {
          0%,100% { opacity:.15; transform:scale(.8); }
          50%     { opacity:.8;  transform:scale(1.2); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 24px rgba(240,140,20,.2), inset 0 1px 0 rgba(240,180,41,.15); }
          50%     { box-shadow: 0 0 48px rgba(240,140,20,.35), inset 0 1px 0 rgba(240,180,41,.3); }
        }
        .login-wrap { animation: riseUp .5s ease forwards; }
        .shimmer-gold {
          background: linear-gradient(90deg,#c8860a 0%,#f0b429 25%,#ffd060 50%,#f0b429 75%,#c8860a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 3s linear infinite;
        }
        .login-card-anim { animation: glowPulse 3s ease-in-out infinite; }
        .diya { animation: floatDiya 3s ease-in-out infinite; font-size:1.3rem; line-height:1; position:absolute; z-index:4; pointer-events:none; }
        .star { animation: twinkle 2s ease-in-out infinite; position:absolute; z-index:4; pointer-events:none; font-size:.75rem; color:rgba(240,180,41,.5); }
        /* right panel hidden on mobile */
        @media (max-width:768px) { .login-right-panel { display:none !important; } }
      `}</style>

      {/* ── Page shell ── */}
      <div style={{
        minHeight:'100vh', display:'flex',
        background:'#0d0818', overflow:'hidden', position:'relative',
      }}>

        {/* Background radial glows */}
        <div style={{
          position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
          background:`
            radial-gradient(ellipse 80% 60% at 20% 0%,   rgba(108,63,255,.22)  0%,transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 85%,  rgba(240,120,10,.18)  0%,transparent 55%),
            radial-gradient(ellipse 50% 70% at 0%  55%,  rgba(180,20,80,.15)   0%,transparent 55%),
            radial-gradient(ellipse 40% 40% at 60% 40%,  rgba(30,100,220,.12)  0%,transparent 50%)
          `,
        }}/>

        {/* Top garland bar */}
        <div style={{
          position:'absolute',top:0,left:0,right:0,height:3,zIndex:5,
          background:'linear-gradient(90deg,transparent,#c8860a 15%,#f0b429 35%,#ff8c42 50%,#f0b429 65%,#c8860a 85%,transparent)',
          opacity:.7,
        }}/>
        {/* Bottom bar */}
        <div style={{
          position:'absolute',bottom:0,left:0,right:0,height:2,zIndex:5,
          background:'linear-gradient(90deg,transparent,#8b1a1a 30%,#c8860a 50%,#8b1a1a 70%,transparent)',
          opacity:.45,
        }}/>

        {/* Decorative circles */}
        {[['-100px','-100px','350px'],['auto','-80px','280px','100px']].map(([t,r,s,b],i)=>
          <div key={i} style={{
            position:'absolute',top:t,right:r,bottom:b,width:s,height:s,
            borderRadius:'50%',border:'1px solid rgba(240,180,41,.05)',zIndex:1,pointerEvents:'none',
          }}/>
        )}

        {/* Floating diyas */}
        <span className="diya" style={{top:'7%', left:'5%',  animationDelay:'0s'  }}>🪔</span>
        <span className="diya" style={{top:'12%',right:'6%', animationDelay:'1s'  }}>🪔</span>
        <span className="diya" style={{bottom:'10%',left:'4%',animationDelay:'2s' }}>🪔</span>
        <span className="diya" style={{bottom:'7%', right:'5%',animationDelay:'.5s'}}>🪔</span>

        {/* Twinkling stars */}
        <span className="star" style={{top:'5%', left:'18%', animationDelay:'0s'  }}>✦</span>
        <span className="star" style={{top:'22%',right:'10%',animationDelay:'.7s' }}>✦</span>
        <span className="star" style={{bottom:'18%',left:'12%',animationDelay:'1.4s'}}>✦</span>
        <span className="star" style={{bottom:'30%',right:'8%',animationDelay:'.3s'}}>✦</span>

        {/* ════════════════ LEFT — Login card ════════════════ */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'32px 20px', zIndex:10, position:'relative',
          minWidth:0, /* CRITICAL for mobile */
        }}>
          <div className="login-wrap" style={{ width:'100%', maxWidth:400 }}>

            <div className="login-card-anim" style={{
              background:'rgba(13,8,26,.95)',
              border:'1px solid rgba(240,180,41,.25)',
              borderRadius:20,
              padding:'32px 28px 24px',
              backdropFilter:'blur(20px)',
              position:'relative', overflow:'hidden',
            }}>

              {/* Card top shimmer line */}
              <div style={{
                position:'absolute',top:0,left:28,right:28,height:1,
                background:'linear-gradient(90deg,transparent,rgba(240,180,41,.65),rgba(255,140,66,.4),transparent)',
              }}/>

              {/* Corner sparkles */}
              {[{top:8,left:10},{top:8,right:10},{bottom:8,left:10},{bottom:8,right:10}].map((pos,i)=>(
                <span key={i} style={{
                  position:'absolute', fontSize:'.65rem', opacity:.35,
                  animation:`twinkle ${1.4+i*.25}s ease-in-out infinite`,
                  animationDelay:`${i*.2}s`, ...pos,
                }}>✦</span>
              ))}

              {/* ── Brand ── */}
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ fontSize:'.8rem', letterSpacing:'.3em', color:'rgba(240,180,41,.35)', marginBottom:8 }}>
                  ❧ ✦ ❧
                </div>
                <div style={{
                  fontFamily:'"Cinzel","Playfair Display",serif',
                  fontWeight: 800,
                  fontSize: '1.85rem',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                  background: 'linear-gradient(135deg,#c8860a 0%,#f0b429 40%,#ffd060 60%,#f0b429 80%,#c8860a 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmerText 4s linear infinite',
                }}>
                  All Solutions
                </div>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:5, marginTop:8,
                  background:'rgba(240,180,41,.06)', border:'1px solid rgba(240,180,41,.14)',
                  borderRadius:100, padding:'3px 12px',
                  fontSize:'.58rem', color:'rgba(255,255,255,.35)',
                  letterSpacing:'.2em', textTransform:'uppercase',
                  fontFamily:'DM Sans,sans-serif',
                }}>
                  <span style={{width:4,height:4,borderRadius:'50%',background:'#f0b429',display:'inline-block',boxShadow:'0 0 5px #f0b429'}}/>
                  Kolkata
                </div>
                <div style={{ fontSize:'.65rem', color:'rgba(255,255,255,.18)', marginTop:7, fontStyle:'italic' }}>
                  Event Management & Rentals
                </div>
                <div style={{ fontSize:'.65rem', color:'rgba(240,180,41,.25)', marginTop:8, letterSpacing:'.2em' }}>
                  ── ✦ ──
                </div>
              </div>

              {/* ── Welcome ── */}
              <div style={{ marginBottom:18 }}>
                <h1 style={{
                  fontFamily:'"Cormorant Garamond","Garamond","Georgia",serif',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '0.01em',
                  color: '#f0f4ff',
                  marginBottom: 3,
                  lineHeight: 1.4,
                  paddingBottom: '0.1em',
                }}>Welcome back</h1>
                <p style={{ color:'rgba(200,215,240,.55)', fontSize:'.78rem' }}>
                  Sign in to manage your events
                </p>
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} noValidate>

                {/* Email */}
                <div style={{ marginBottom:12 }}>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:500, color:'rgba(255,255,255,.55)', marginBottom:4 }}>
                    Email Address
                  </label>
                  <div style={{ position:'relative' }}>
                    <Mail size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.22)',pointerEvents:'none' }}/>
                    <input type="email"
                      style={{
                        width:'100%', padding:'9px 11px 9px 32px',
                        background:'rgba(255,255,255,.07)',
                        border:`1px solid ${errors.email?'#ff5c7a':'rgba(240,180,41,.18)'}`,
                        borderRadius:9, color:'#f0f4ff',
                        fontSize:'.875rem', outline:'none',
                        fontFamily:'DM Sans,sans-serif',
                      }}
                      onFocus={e=>e.target.style.borderColor='rgba(240,180,41,.5)'}
                      onBlur={e=>e.target.style.borderColor=errors.email?'#ff5c7a':'rgba(240,180,41,.14)'}
                      placeholder="you@example.com"
                      value={email}
                      onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:''}))}}
                      autoFocus
                    />
                  </div>
                  {errors.email && <div style={{color:'#ff5c7a',fontSize:'.7rem',marginTop:3}}>{errors.email}</div>}
                </div>

                {/* Password */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:500, color:'rgba(255,255,255,.55)', marginBottom:4 }}>
                    Password
                  </label>
                  <div style={{ position:'relative' }}>
                    <Lock size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.22)',pointerEvents:'none' }}/>
                    <input type="password"
                      style={{
                        width:'100%', padding:'9px 11px 9px 32px',
                        background:'rgba(255,255,255,.07)',
                        border:`1px solid ${errors.password?'#ff5c7a':'rgba(240,180,41,.18)'}`,
                        borderRadius:9, color:'#f0f4ff',
                        fontSize:'.875rem', outline:'none',
                        fontFamily:'DM Sans,sans-serif',
                      }}
                      onFocus={e=>e.target.style.borderColor='rgba(240,180,41,.5)'}
                      onBlur={e=>e.target.style.borderColor=errors.password?'#ff5c7a':'rgba(240,180,41,.14)'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e=>{setPassword(e.target.value);setErrors(p=>({...p,password:''}))}}
                    />
                  </div>
                  {errors.password && <div style={{color:'#ff5c7a',fontSize:'.7rem',marginTop:3}}>{errors.password}</div>}
                </div>

                {errors.form && (
                  <div style={{
                    background:'rgba(255,92,122,.08)', border:'1px solid rgba(255,92,122,.25)',
                    borderRadius:8, padding:'7px 11px', color:'#ff5c7a',
                    fontSize:'.76rem', marginBottom:12,
                  }}>{errors.form}</div>
                )}

                {/* Sign In */}
                <button type="submit" disabled={loading} style={{
                  width:'100%', padding:'13px 11px',
                  background:loading?'rgba(240,180,41,.25)':'linear-gradient(135deg,#b87008 0%,#f0b429 45%,#ff8c42 100%)',
                  border:'none', borderRadius:10,
                  color:loading?'rgba(255,255,255,.4)':'#1a0800',
                  fontFamily:'Syne,sans-serif', fontWeight:800,
                  fontSize:'.88rem', letterSpacing:'.05em',
                  lineHeight:1.6,
                  minHeight: 46,
                  cursor:loading?'not-allowed':'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                  boxShadow:loading?'none':'0 6px 20px rgba(240,140,20,.3)',
                  transition:'opacity .2s',
                }}>
                  {loading ? <><Loader2 size={14} className="spin"/> Signing in…</> : '✦ Sign In'}
                </button>
              </form>

              {/* Footer */}
              <p style={{ textAlign:'center', marginTop:16, fontSize:'.68rem', color:'rgba(255,255,255,.18)' }}>
                Contact your admin to get access
              </p>
              <p style={{ textAlign:'center', marginTop:5, fontSize:'.58rem', color:'rgba(255,255,255,.1)', letterSpacing:'.04em' }}>
                v{APP_VERSION} · {BUILD_DATE}
              </p>
            </div>

            {/* Below card */}
            <div style={{
              textAlign:'center', marginTop:16,
              fontSize:'.62rem', color:'rgba(255,255,255,.1)',
              letterSpacing:'.12em', textTransform:'uppercase',
            }}>
              🎊 Weddings · Birthdays · Corporate Events 🎊
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT — Decorative panel (desktop only) ════════════════ */}
        <div className="login-right-panel" style={{
          width:360,
          background:'rgba(10,6,22,.85)',
          borderLeft:'1px solid rgba(108,99,255,.12)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'40px 32px', position:'relative', overflow:'hidden', zIndex:5,
        }}>
          {/* Glow spots */}
          <div style={{position:'absolute',top:-50,left:'50%',transform:'translateX(-50%)',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(160,20,20,.18) 0%,transparent 70%)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-50,right:-50,width:240,height:240,borderRadius:'50%',background:'radial-gradient(circle,rgba(220,120,10,.12) 0%,transparent 70%)',pointerEvents:'none'}}/>

          <div style={{ position:'relative', zIndex:1, textAlign:'center', width:'100%' }}>
            <div style={{ fontSize:'.75rem', letterSpacing:'.25em', color:'rgba(240,180,41,.3)', marginBottom:14 }}>❧ ✦ ❧</div>

            {/* Event icons */}
            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:18, fontSize:'1.8rem' }}>
              {['💍','🎂','🏢','🎭'].map((e,i)=>(
                <span key={i} style={{ display:'inline-block', animation:`floatDiya ${2+i*.4}s ease-in-out infinite`, animationDelay:`${i*.3}s` }}>{e}</span>
              ))}
            </div>

            <div style={{ marginBottom:10 }}>
              <div className="shimmer-gold" style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:'1.4rem', letterSpacing:'-.02em', lineHeight:1.2 }}>
                Your Events,
              </div>
              <div style={{ color:'rgba(255,255,255,.6)', fontSize:'1.1rem', fontFamily:'Syne,sans-serif', fontWeight:700, marginTop:4 }}>
                Perfectly Managed
              </div>
            </div>

            <p style={{ color:'rgba(255,255,255,.22)', fontSize:'.78rem', lineHeight:1.7, maxWidth:260, margin:'0 auto 20px' }}>
              From grand weddings to birthday celebrations — track every booking, staff, machine and payment.
            </p>

            {[['💍','Weddings & Receptions'],['🎂','Birthday Parties'],['🏢','Corporate Events'],['🎪','Entertainment & Machines'],['💰','Payment Tracking']].map(([icon,label])=>(
              <div key={label} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'7px 12px', marginBottom:6,
                background:'rgba(255,255,255,.025)',
                border:'1px solid rgba(255,255,255,.04)',
                borderRadius:8, textAlign:'left',
              }}>
                <span style={{ fontSize:'.85rem' }}>{icon}</span>
                <span style={{ fontSize:'.75rem', color:'rgba(255,255,255,.35)' }}>{label}</span>
              </div>
            ))}

            <div style={{ marginTop:20, fontSize:'.62rem', color:'rgba(240,180,41,.18)', letterSpacing:'.18em' }}>
              ── All Solutions · Kolkata ──
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
