import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages: Projektseite unter https://gossen.github.io/WeldingerWebApp/
const base = '/WeldingerWebApp/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'WELDINGER Schweiß-Assistent',
        short_name: 'Schweiß-Assistent',
        lang: 'de',
        start_url: `${base}?source=pwa`,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#EFEFEA',
        theme_color: '#16181B',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icons/icon-512-maskable.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,webmanifest}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  test: { include: ['src/**/*.test.ts'] },
})
