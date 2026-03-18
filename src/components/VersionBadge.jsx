import { APP_VERSION, BUILD_DATE, BUILD_NOTES } from '../version.js'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { format } from 'date-fns'

export default function VersionBadge() {
  const { lastLogin } = useAuth()
  const [show, setShow] = useState(false)

  const lastLoginStr = lastLogin
    ? format(lastLogin, 'dd MMM yyyy, hh:mm a')
    : null

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShow(v => !v)} className="version-badge-btn">
        v{APP_VERSION} · {BUILD_DATE}
      </button>

      {show && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 8, right: 8,
          background: '#0e1420', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '12px 14px',
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999,
        }}>
          <div style={{ fontWeight: 700, color: '#f0b429', fontFamily: 'Syne', marginBottom: 6 }}>
            v{APP_VERSION}
          </div>
          <div style={{ marginBottom: 8 }}>{BUILD_NOTES}</div>
          {lastLoginStr && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: 8, marginTop: 4,
              color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem',
            }}>
              🕐 Last login: {lastLoginStr}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
