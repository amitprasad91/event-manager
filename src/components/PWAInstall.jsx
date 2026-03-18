import { useState, useEffect, useRef } from 'react'
import { Download, Check, Smartphone, Monitor } from 'lucide-react'

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled]           = useState(false)
  const [showIOSTip, setShowIOSTip]         = useState(false)
  const [deviceType, setDeviceType]         = useState('desktop') // 'ios' | 'android' | 'desktop'
  const tipRef = useRef(null)

  useEffect(() => {
    // ── Detect device ──────────────────────────────────────
    const ua = navigator.userAgent.toLowerCase()
    const isIOS     = /iphone|ipad|ipod/.test(ua) && !/crios/.test(ua) // iOS Safari only
    const isAndroid = /android/.test(ua)

    if (isIOS)     setDeviceType('ios')
    else if (isAndroid) setDeviceType('android')
    else           setDeviceType('desktop')

    // ── Already installed as standalone ────────────────────
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true // iOS standalone
    if (isStandalone) { setInstalled(true); return }

    // ── Android/Desktop: capture beforeinstallprompt ───────
    const handlePrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
    }
  }, [])

  // Close iOS tip when clicking outside
  useEffect(() => {
    if (!showIOSTip) return
    const handler = (e) => {
      if (tipRef.current && !tipRef.current.contains(e.target)) {
        setShowIOSTip(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showIOSTip])

  async function handleInstall() {
    if (deviceType === 'ios') {
      setShowIOSTip(v => !v)
      return
    }
    if (deferredPrompt) {
      // Show native install prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferredPrompt(null)
      return
    }
    // Desktop Chrome: no prompt captured yet — guide user
    setShowIOSTip(v => !v)
  }

  // ── Labels & icons per device ──────────────────────────
  const config = {
    ios:     { icon: <Smartphone size={14} />, label: 'Install App', badge: 'iPhone / iPad' },
    android: { icon: <Smartphone size={14} />, label: 'Install App', badge: 'Android' },
    desktop: { icon: <Monitor size={14} />,    label: 'Install App', badge: 'Desktop' },
  }[deviceType]

  // ── Tip text per device ────────────────────────────────
  const tipContent = {
    ios: (
      <div>
        <div style={{ fontWeight: 600, color: '#f0b429', marginBottom: 6, fontSize: '0.78rem' }}>Install on iPhone/iPad</div>
        <div>1. Tap the <strong style={{ color: '#fff' }}>Share</strong> button <span style={{ fontSize: '1rem' }}>⬆</span> at the bottom of Safari</div>
        <div style={{ marginTop: 4 }}>2. Scroll down → tap <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong></div>
        <div style={{ marginTop: 4 }}>3. Tap <strong style={{ color: '#fff' }}>"Add"</strong> — done! 🎉</div>
      </div>
    ),
    android: (
      <div>
        <div style={{ fontWeight: 600, color: '#f0b429', marginBottom: 6, fontSize: '0.78rem' }}>Install on Android</div>
        <div>Tap the <strong style={{ color: '#fff' }}>"Install"</strong> button that appears in Chrome</div>
        <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
          If no prompt appears: Chrome menu (⋮) → <strong style={{ color: '#fff' }}>"Add to Home screen"</strong>
        </div>
      </div>
    ),
    desktop: (
      <div>
        <div style={{ fontWeight: 600, color: '#f0b429', marginBottom: 6, fontSize: '0.78rem' }}>Install on Desktop</div>
        <div>Look for the <strong style={{ color: '#fff' }}>⊕</strong> install icon in Chrome's address bar</div>
        <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
          Or: Chrome menu (⋮) → <strong style={{ color: '#fff' }}>"Install All Solutions..."</strong>
        </div>
      </div>
    ),
  }[deviceType]

  // Already installed
  if (installed) {
    return (
      <div className="sidebar-action" style={{ color: 'rgba(16,212,160,0.8)', cursor: 'default' }}>
        <Check size={14} />
        App Installed
        <span className="action-badge" style={{ color: 'rgba(16,212,160,0.5)' }}>✓</span>
      </div>
    )
  }

  return (
    <div ref={tipRef} style={{ position: 'relative' }}>
      <button onClick={handleInstall} className="sidebar-action install">
        {config.icon}
        {config.label}
        <span className="action-badge">{config.badge}</span>
      </button>

      {/* Tooltip */}
      {showIOSTip && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: 0, right: 0,
          background: '#0e1420',
          border: '1px solid rgba(240,180,41,0.2)',
          borderRadius: 12,
          padding: '14px 14px',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.7,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
          zIndex: 999,
          animation: 'slideUp 0.2s ease',
        }}>
          {tipContent}
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: -7, left: '50%',
            transform: 'translateX(-50%)',
            width: 12, height: 12,
            background: '#0e1420',
            border: '1px solid rgba(240,180,41,0.2)',
            borderTop: 'none', borderLeft: 'none',
            transform: 'translateX(-50%) rotate(45deg)',
          }} />
        </div>
      )}
    </div>
  )
}
