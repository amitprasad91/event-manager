import { APP_VERSION, BUILD_DATE, BUILD_NOTES } from '../version.js'
import { useState } from 'react'

export default function VersionBadge() {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShow(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 5, width: '100%', background: 'none', border: 'none',
          color: 'var(--text-3)', fontSize: '0.65rem', cursor: 'pointer',
          padding: '4px 12px', fontFamily: 'DM Sans',
          letterSpacing: '0.03em',
        }}
      >
        v{APP_VERSION} · {BUILD_DATE}
      </button>

      {show && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 8, right: 8,
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 12px',
          fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.5,
          boxShadow: 'var(--shadow)', zIndex: 999,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'Syne', marginBottom: 4 }}>
            v{APP_VERSION}
          </div>
          {BUILD_NOTES}
        </div>
      )}
    </div>
  )
}
