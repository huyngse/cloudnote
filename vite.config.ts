import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'cloudnote-favicon-32x32.png'], 
    manifest: {
      name: 'cloudnote',
      short_name: 'cloudnote',
      description: 'a whimsical browser-based note board for text and images. drag, rotate, decorate, and never lose a thought again.',
      theme_color: '#f1f5f9',
      icons: [
        {
          src: 'pwa-icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
