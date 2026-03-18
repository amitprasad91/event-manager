import { APP_VERSION, BUILD_DATE, BUILD_NOTES } from '../version.js'
import { useState } from 'react'

export default function VersionBadge() {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShow(v => !v)} className="version-badge-btn">
        v{APP_VERSION} · {BUILD_DATE}
      </button>
      {show && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 8, right: 8,
          background: '#0e1420', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '10px 12px',
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999,
        }}>
          <div style={{ fontWeight: 700, color: '#f0b429', fontFamily: 'Syne', marginBottom: 4 }}>
            v{APP_VERSION}
          </div>
          {BUILD_NOTES}
        </div>
      )}
    </div>
  )
}
