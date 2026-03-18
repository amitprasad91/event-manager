import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // shows install prompt instead of auto-update silently
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'EventMgr - Event Business Manager',
        short_name: 'EventMgr',
        description: 'Manage your event business — bookings, staff, payments',
        theme_color: '#0c0c0a',
        background_color: '#0c0c0a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-api', networkTimeoutSeconds: 10 }
          }
        ]
      },
      devOptions: { enabled: true } // test PWA in dev mode too
    })
  ],
})
