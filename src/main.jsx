import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

// ── Suppress browser-extension-caused async message channel errors ──
// This error originates from browser extensions (LastPass, Grammarly, etc.)
// intercepting service worker messages. It's not an app bug.
const _origError = console.error.bind(console)
console.error = (...args) => {
  const msg = args[0]?.toString?.() || ''
  if (
    msg.includes('message channel closed') ||
    msg.includes('listener indicated an asynchronous response') ||
    msg.includes('asynchronous response')
  ) return // suppress safely
  _origError(...args)
}

// Also suppress at window level
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || event.reason?.toString() || ''
  if (
    msg.includes('message channel closed') ||
    msg.includes('asynchronous response') ||
    msg.includes('listener indicated')
  ) {
    event.preventDefault() // suppress
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
          <App />
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.875rem',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
