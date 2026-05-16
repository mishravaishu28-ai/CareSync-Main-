import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CareSync Emergency App',
        short_name: 'CareSync',
        description: 'PWA for Emergency Medical Assistance',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Must be in the 'public' folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Must be in the 'public' folder
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});