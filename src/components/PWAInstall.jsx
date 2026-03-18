import { useState, useEffect } from 'react'
import { Download, Check } from 'lucide-react'

export default function PWAInstallButton() {
  const [prompt, setPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [showIOSTip, setShowIOSTip] = useState(false)

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // iOS detection
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    // Android / Desktop — capture prompt
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (isIOS) {
      setShowIOSTip(v => !v)
      return
    }
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
  }

  if (installed) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 12px', borderRadius: 10,
        background: 'var(--green-dim)', color: 'var(--green)',
        fontSize: '0.8rem', fontWeight: 500, marginBottom: 8,
      }}>
        <Check size={13} /> App Installed
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <button
        onClick={handleInstall}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '9px 12px', borderRadius: 10,
          background: 'var(--gold-dim)',
          border: '1px solid rgba(201,168,76,0.25)',
          color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'DM Sans',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.18)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--gold-dim)'}
      >
        <Download size={13} />
        Install App
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.7, fontWeight: 400 }}>
          {isIOS ? 'iOS' : 'Desktop/Android'}
        </span>
      </button>

      {/* iOS tip tooltip */}
      {showIOSTip && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, right: 0,
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 12px',
          fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.6,
          boxShadow: 'var(--shadow)', zIndex: 999,
        }}>
          📱 Tap <strong>Share</strong> (bottom bar) → <strong>"Add to Home Screen"</strong>
        </div>
      )}
    </div>
  )
}
