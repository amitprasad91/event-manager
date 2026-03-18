import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f5f5f0',
              border: '1px solid #2a2a2a',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
