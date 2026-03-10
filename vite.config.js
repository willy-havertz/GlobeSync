import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "GlobeSync AI — Cybersecurity Dashboard",
        short_name: "GlobeSync AI",
        description: "Real-time cybersecurity intelligence dashboard with live 3D globe attack map and threat feeds.",
        theme_color: "#02040a",
        background_color: "#02040a",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache app shell and static assets
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Don't cache API / WebSocket — they need live data
        navigateFallbackDenylist: [/^\/api/, /^\/ws/],
        runtimeCaching: [
          {
            // GeoJSON + topology files (large, rarely change)
            urlPattern: /\.(?:json|geojson)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "geo-data",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-3d": ["three", "globe.gl"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
  server: {
    proxy: {
      // REST — forwards /api/* to FastAPI on :8000
      "/api": {
        target:       "http://localhost:8000",
        changeOrigin: true,
      },
      // WebSocket — forwards /ws/* to FastAPI on :8000
      "/ws": {
        target:  "ws://localhost:8000",
        ws:      true,
        changeOrigin: true,
      },
    },
  },
});
