import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to console in dev — could send to monitoring in prod
    console.error('App error caught by ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 24,
      }}>
        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid rgba(255,92,122,0.3)',
          borderRadius: 20,
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: 'var(--text)',
            marginBottom: 10,
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: 'var(--text-2)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            marginBottom: 24,
          }}>
            An unexpected error occurred. Please refresh the page to continue.
            If the problem persists, contact your admin.
          </p>
          {this.state.error?.message && (
            <div style={{
              background: 'rgba(255,92,122,0.08)',
              border: '1px solid rgba(255,92,122,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 24,
              fontSize: '0.75rem',
              color: 'var(--red)',
              textAlign: 'left',
              fontFamily: 'monospace',
              wordBreak: 'break-word',
            }}>
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 28px',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              width: '100%',
            }}>
            🔄 Refresh Page
          </button>
        </div>
      </div>
    )
  }
}
