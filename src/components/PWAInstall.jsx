import { useState, useEffect } from 'react'
import { Download, Check } from 'lucide-react'

export default function PWAInstallButton() {
  const [prompt, setPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [showIOSTip, setShowIOSTip] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true); return
    }
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)
    const handler = (e) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (isIOS) { setShowIOSTip(v => !v); return }
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
  }

  if (installed) {
    return (
      <div className="sidebar-action" style={{ color: 'rgba(16,212,160,0.7)', cursor: 'default' }}>
        <Check size={15} /> App Installed
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleInstall} className="sidebar-action install">
        <Download size={15} />
        Install App
        <span className="action-badge">{isIOS ? 'iOS' : 'Desktop'}</span>
      </button>
      {showIOSTip && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, right: 0,
          background: '#0e1420', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '10px 12px',
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999,
        }}>
          📱 Tap <strong style={{color:'#fff'}}>Share</strong> → <strong style={{color:'#fff'}}>Add to Home Screen</strong>
        </div>
      )}
    </div>
  )
}
