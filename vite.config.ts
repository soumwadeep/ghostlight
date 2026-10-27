import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'demo/ruma.jpg'],
      manifest: {
        name: 'Ghostlight — a remembrance studio',
        short_name: 'Ghostlight',
        description:
          'A local-first remembrance studio. Gemma 2 runs in your browser; your memories never leave your device.',
        theme_color: '#08070b',
        background_color: '#08070b',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['lifestyle', 'books', 'education'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff2}'],
        globIgnores: ['**/lib-*.js', '**/*.woff', '**/og.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }: { request: Request; sameOrigin: boolean }) =>
              sameOrigin && request.destination === 'script',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ghostlight-scripts',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 6500,
    target: 'es2022',
  },
})
