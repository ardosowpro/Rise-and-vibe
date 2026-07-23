import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script",
      includeAssets: ["favicon.svg", "icons/icon-192.png"],
      manifest: {
        name: "Rise and Vibe",
        short_name: "Rise & Vibe",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0f",
        lang: "fr",
        scope: "/",
        description:
          "Studio d'enregistrement à Dakar - réservez une session, masterclass et rencontres artistes.",
        theme_color: "#0a0a0f",
        orientation: "portrait",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Ne jamais mettre l'API en cache
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:4001",
    },
  },
});
